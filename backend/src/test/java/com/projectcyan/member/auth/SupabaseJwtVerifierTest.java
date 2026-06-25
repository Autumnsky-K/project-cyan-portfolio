package com.projectcyan.member.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.net.InetSocketAddress;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.ECDSASigner;
import com.nimbusds.jose.jwk.Curve;
import com.nimbusds.jose.jwk.ECKey;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.gen.ECKeyGenerator;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class SupabaseJwtVerifierTest {

	private static final Instant NOW = Instant.parse("2026-06-23T00:00:00Z");
	private static final String ISSUER = "https://example.supabase.co/auth/v1";
	private static final String AUDIENCE = "authenticated";

	private HttpServer jwksServer;
	private ECKey signingKey;
	private SupabaseJwtVerifier verifier;

	@BeforeEach
	void setUp() throws Exception {
		signingKey = new ECKeyGenerator(Curve.P_256)
			.keyID("test-key")
			.generate();
		jwksServer = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
		jwksServer.createContext("/.well-known/jwks.json", exchange -> {
			byte[] body = new JWKSet(signingKey.toPublicJWK()).toString().getBytes();
			exchange.sendResponseHeaders(200, body.length);
			exchange.getResponseBody().write(body);
			exchange.close();
		});
		jwksServer.start();

		SupabaseJwtProperties properties = new SupabaseJwtProperties();
		properties.setIssuer(ISSUER);
		properties.setAudience(AUDIENCE);
		properties.setJwksUrl("http://127.0.0.1:%d/.well-known/jwks.json".formatted(jwksServer.getAddress().getPort()));
		verifier = new SupabaseJwtVerifier(properties, Clock.fixed(NOW, ZoneOffset.UTC));
	}

	@AfterEach
	void tearDown() {
		if (jwksServer != null) {
			jwksServer.stop(0);
		}
	}

	@Test
	void verifiesValidSupabaseJwt() throws Exception {
		UUID userId = UUID.randomUUID();

		VerifiedSupabaseJwt verifiedJwt = verifier.verify(token(userId, ISSUER, AUDIENCE, NOW.plusSeconds(60), signingKey));

		assertThat(verifiedJwt.userId()).isEqualTo(userId);
	}

	@Test
	void rejectsExpiredJwt() throws Exception {
		String token = token(UUID.randomUUID(), ISSUER, AUDIENCE, NOW.minusSeconds(60), signingKey);

		assertThatThrownBy(() -> verifier.verify(token))
			.isInstanceOf(SupabaseJwtException.class);
	}

	@Test
	void rejectsInvalidIssuer() throws Exception {
		String token = token(UUID.randomUUID(), "https://other.example/auth/v1", AUDIENCE, NOW.plusSeconds(60), signingKey);

		assertThatThrownBy(() -> verifier.verify(token))
			.isInstanceOf(SupabaseJwtException.class);
	}

	@Test
	void rejectsInvalidAudience() throws Exception {
		String token = token(UUID.randomUUID(), ISSUER, "anon", NOW.plusSeconds(60), signingKey);

		assertThatThrownBy(() -> verifier.verify(token))
			.isInstanceOf(SupabaseJwtException.class);
	}

	@Test
	void rejectsInvalidSignature() throws Exception {
		ECKey otherKey = new ECKeyGenerator(Curve.P_256)
			.keyID("test-key")
			.generate();
		String token = token(UUID.randomUUID(), ISSUER, AUDIENCE, NOW.plusSeconds(60), otherKey);

		assertThatThrownBy(() -> verifier.verify(token))
			.isInstanceOf(SupabaseJwtException.class);
	}

	private String token(UUID userId, String issuer, String audience, Instant expiresAt, ECKey key) throws Exception {
		SignedJWT jwt = new SignedJWT(
			new JWSHeader.Builder(JWSAlgorithm.ES256)
				.keyID(key.getKeyID())
				.build(),
			new JWTClaimsSet.Builder()
				.subject(userId.toString())
				.issuer(issuer)
				.audience(List.of(audience))
				.expirationTime(Date.from(expiresAt))
				.build()
		);
		jwt.sign(new ECDSASigner(key));
		return jwt.serialize();
	}
}
