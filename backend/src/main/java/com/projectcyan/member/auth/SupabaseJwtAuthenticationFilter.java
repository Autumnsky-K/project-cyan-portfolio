package com.projectcyan.member.auth;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import com.projectcyan.member.Member;
import com.projectcyan.member.MemberRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class SupabaseJwtAuthenticationFilter extends OncePerRequestFilter {

	public static final String AUTHENTICATED_MEMBER_ATTRIBUTE = "projectCyan.authenticatedMember";

	private final SupabaseJwtVerifier jwtVerifier;
	private final MemberRepository memberRepository;

	public SupabaseJwtAuthenticationFilter(SupabaseJwtVerifier jwtVerifier, MemberRepository memberRepository) {
		this.jwtVerifier = jwtVerifier;
		this.memberRepository = memberRepository;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		return !requiresAuthentication(request);
	}

	@Override
	protected void doFilterInternal(
		HttpServletRequest request,
		HttpServletResponse response,
		FilterChain filterChain
	) throws ServletException, IOException {
		String token = bearerToken(request);
		if (token.isBlank()) {
			writeError(response, "AUTH_UNAUTHORIZED", "로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
			return;
		}

		VerifiedSupabaseJwt verifiedJwt;
		try {
			verifiedJwt = jwtVerifier.verify(token);
		} catch (SupabaseJwtException exception) {
			writeError(response, "AUTH_UNAUTHORIZED", "로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
			return;
		}

		Optional<Member> member = memberRepository.findByMemberUuid(verifiedJwt.userId());
		if (member.isEmpty()) {
			writeError(response, "MEMBER_NOT_REGISTERED", "회원 정보가 등록되어 있지 않습니다.", HttpStatus.FORBIDDEN);
			return;
		}
		if (!member.get().isActive()) {
			writeError(response, "MEMBER_WITHDRAWN", "계정을 찾을 수 없습니다. 먼저 회원가입을 진행해 주세요.", HttpStatus.FORBIDDEN);
			return;
		}

		request.setAttribute(AUTHENTICATED_MEMBER_ATTRIBUTE, AuthenticatedMember.from(member.get()));
		filterChain.doFilter(request, response);
	}

	private boolean requiresAuthentication(HttpServletRequest request) {
		String path = request.getRequestURI();
		String method = request.getMethod();

		if (HttpMethod.OPTIONS.matches(method) || !path.startsWith("/api/")) {
			return false;
		}
		if (HttpMethod.POST.matches(method) && "/api/members/signup".equals(path)) {
			return false;
		}
		if (HttpMethod.POST.matches(method) && "/api/members/signup/availability".equals(path)) {
			return false;
		}
		if (HttpMethod.POST.matches(method) && "/api/members/password-reset/eligibility".equals(path)) {
			return false;
		}
		if (HttpMethod.POST.matches(method) && "/api/members/password-reset/request".equals(path)) {
			return false;
		}
		if (HttpMethod.POST.matches(method) && "/api/members/password-reset/confirm".equals(path)) {
			return false;
		}
		if (HttpMethod.GET.matches(method) && "/api/goods/favorites".equals(path)) {
			return true;
		}
		if ((HttpMethod.POST.matches(method) || HttpMethod.DELETE.matches(method))
			&& path.matches("/api/goods/\\d+/favorites")) {
			return true;
		}
		if (HttpMethod.GET.matches(method) && path.matches("/api/goods/\\d+/likes/my")) {
			return true;
		}
		if ((HttpMethod.POST.matches(method) || HttpMethod.DELETE.matches(method))
			&& path.matches("/api/goods/\\d+/likes")) {
			return true;
		}
		if (HttpMethod.POST.matches(method) && path.matches("/api/goods/\\d+/views")) {
			return true;
		}
		if (HttpMethod.GET.matches(method) && path.matches("/api/goods/\\d+/reviews/my")) {
			return true;
		}
		if (HttpMethod.POST.matches(method) && path.matches("/api/goods/\\d+/reviews")) {
			return true;
		}
		if ((HttpMethod.PATCH.matches(method) || HttpMethod.DELETE.matches(method))
			&& path.matches("/api/goods/\\d+/reviews/\\d+")) {
			return true;
		}
		if (HttpMethod.POST.matches(method) && path.matches("/api/goods/\\d+/inquiries")) {
			return true;
		}
		if (HttpMethod.GET.matches(method) && (path.equals("/api/goods") || path.startsWith("/api/goods/"))) {
			return false;
		}
		if (HttpMethod.GET.matches(method) && path.startsWith("/api/cms/")) {
			return false;
		}
		if (path.startsWith("/api/admin/")) {
			return false;
		}
		if (HttpMethod.GET.matches(method) && "/api/ai/personalization-context".equals(path)) {
			return true;
		}

		return path.startsWith("/api/cart")
			|| path.startsWith("/api/checkout")
			|| path.startsWith("/api/orders")
			|| path.startsWith("/api/payments")
			|| path.startsWith("/api/members")
			|| path.startsWith("/api/virtual-chat")
			|| path.startsWith("/api/inquiries");
	}

	private String bearerToken(HttpServletRequest request) {
		String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (authorization == null || !authorization.startsWith("Bearer ")) {
			return "";
		}
		return authorization.substring("Bearer ".length()).trim();
	}

	private void writeError(HttpServletResponse response, String code, String message, HttpStatus status) throws IOException {
		response.setStatus(status.value());
		response.setCharacterEncoding(StandardCharsets.UTF_8.name());
		response.setContentType("application/json; charset=utf-8");
		response.getWriter().write("""
			{"code":"%s","message":"%s","status":%d}
			""".formatted(code, message, status.value()).trim());
	}
}
