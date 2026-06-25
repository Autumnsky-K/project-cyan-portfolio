package com.projectcyan.member.auth;

import java.net.URI;
import java.text.ParseException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.ECDSAVerifier;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jose.jwk.ECKey;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SupabaseJwtVerifier {

	private static final Duration JWKS_CACHE_TTL = Duration.ofMinutes(10);
	private static final Duration CLOCK_SKEW = Duration.ofSeconds(30);

	private final SupabaseJwtProperties properties;
	private final Clock clock;

	private JWKSet cachedJwks;
	private Instant cachedJwksExpiresAt = Instant.EPOCH;

	@Autowired
	public SupabaseJwtVerifier(SupabaseJwtProperties properties) {
		this(properties, Clock.systemUTC());
	}

	SupabaseJwtVerifier(SupabaseJwtProperties properties, Clock clock) {
		this.properties = properties;
		this.clock = clock;
	}

	public VerifiedSupabaseJwt verify(String token) {
		if (!properties.isConfigured()) {
			throw new SupabaseJwtException("Supabase JWT verification is not configured.");
		}

		try {
			SignedJWT jwt = SignedJWT.parse(token);
			validateAlgorithm(jwt);
			JWK jwk = findJwk(jwt);
			if (!jwt.verify(verifierFor(jwk))) {
				throw new SupabaseJwtException("JWT signature is invalid.");
			}

			JWTClaimsSet claims = jwt.getJWTClaimsSet();
			validateClaims(claims);
			return new VerifiedSupabaseJwt(UUID.fromString(claims.getSubject()));
		} catch (ParseException | JOSEException | IllegalArgumentException exception) {
			throw new SupabaseJwtException("JWT verification failed.", exception);
		}
	}

	private void validateAlgorithm(SignedJWT jwt) {
		JWSAlgorithm algorithm = jwt.getHeader().getAlgorithm();
		if (!JWSAlgorithm.RS256.equals(algorithm) && !JWSAlgorithm.ES256.equals(algorithm)) {
			throw new SupabaseJwtException("JWT signing algorithm is not supported.");
		}
	}

	private JWK findJwk(SignedJWT jwt) throws ParseException {
		String keyId = jwt.getHeader().getKeyID();
		if (keyId == null || keyId.isBlank()) {
			throw new SupabaseJwtException("JWT key id is missing.");
		}

		JWK jwk = loadJwks().getKeyByKeyId(keyId);
		if (jwk == null) {
			refreshJwks();
			jwk = cachedJwks.getKeyByKeyId(keyId);
		}
		if (jwk == null) {
			throw new SupabaseJwtException("JWT signing key is not trusted.");
		}
		return jwk;
	}

	private JWSVerifier verifierFor(JWK jwk) throws JOSEException {
		if (jwk instanceof RSAKey rsaKey) {
			return new RSASSAVerifier(rsaKey.toRSAPublicKey());
		}
		if (jwk instanceof ECKey ecKey) {
			return new ECDSAVerifier(ecKey.toECPublicKey());
		}
		throw new SupabaseJwtException("JWT signing key type is not supported.");
	}

	private void validateClaims(JWTClaimsSet claims) {
		if (!properties.getIssuer().equals(claims.getIssuer())) {
			throw new SupabaseJwtException("JWT issuer is invalid.");
		}

		List<String> audience = claims.getAudience();
		if (audience == null || !audience.contains(properties.getAudience())) {
			throw new SupabaseJwtException("JWT audience is invalid.");
		}

		Date expirationTime = claims.getExpirationTime();
		if (expirationTime == null || expirationTime.toInstant().plus(CLOCK_SKEW).isBefore(clock.instant())) {
			throw new SupabaseJwtException("JWT is expired.");
		}

		String subject = claims.getSubject();
		if (subject == null || subject.isBlank()) {
			throw new SupabaseJwtException("JWT subject is missing.");
		}
	}

	private JWKSet loadJwks() throws ParseException {
		if (cachedJwks == null || !cachedJwksExpiresAt.isAfter(clock.instant())) {
			refreshJwks();
		}
		return cachedJwks;
	}

	private void refreshJwks() throws ParseException {
		try {
			cachedJwks = JWKSet.load(URI.create(properties.getJwksUrl()).toURL());
			cachedJwksExpiresAt = clock.instant().plus(JWKS_CACHE_TTL);
		} catch (Exception exception) {
			throw new SupabaseJwtException("Supabase JWKS could not be loaded.", exception);
		}
	}
}
