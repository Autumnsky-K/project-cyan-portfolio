package com.projectcyan.member.auth;

import java.util.Optional;

import com.projectcyan.member.Member;
import com.projectcyan.member.MemberRepository;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

@Component
public class OptionalAuthenticatedMemberResolver {

	private final SupabaseJwtVerifier jwtVerifier;
	private final MemberRepository memberRepository;

	public OptionalAuthenticatedMemberResolver(SupabaseJwtVerifier jwtVerifier, MemberRepository memberRepository) {
		this.jwtVerifier = jwtVerifier;
		this.memberRepository = memberRepository;
	}

	public Optional<AuthenticatedMember> resolve(HttpServletRequest request) {
		String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (authorization == null || !authorization.startsWith("Bearer ")) {
			return Optional.empty();
		}

		String token = authorization.substring("Bearer ".length()).trim();
		if (token.isBlank()) {
			return Optional.empty();
		}

		try {
			VerifiedSupabaseJwt verifiedJwt = jwtVerifier.verify(token);
			return memberRepository.findByMemberUuid(verifiedJwt.userId())
				.filter(Member::isActive)
				.map(AuthenticatedMember::from);
		} catch (SupabaseJwtException exception) {
			return Optional.empty();
		}
	}
}
