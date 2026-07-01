package com.projectcyan.ai;

import com.projectcyan.admin.auth.AdminAuthService;
import com.projectcyan.common.ApiErrorException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class AdminAiSensitiveActionService {

	public static final String CSRF_HEADER = "X-Project-Cyan-CSRF";
	public static final String APPROVAL_HEADER = "X-Project-Cyan-Reauth";
	private static final String SESSION_CSRF = "projectCyanAiCsrf";
	private static final String SESSION_APPROVAL = "projectCyanAiApproval";
	private static final String SESSION_APPROVAL_EXPIRES = "projectCyanAiApprovalExpires";
	private static final Duration APPROVAL_TTL = Duration.ofMinutes(5);

	private final AdminAuthService adminAuthService;
	private final SecureRandom secureRandom = new SecureRandom();

	public AdminAiSensitiveActionService(AdminAuthService adminAuthService) {
		this.adminAuthService = adminAuthService;
	}

	public String csrfToken(HttpServletRequest request) {
		HttpSession session = request.getSession(true);
		Object existing = session.getAttribute(SESSION_CSRF);
		if (existing instanceof String value && !value.isBlank()) {
			return value;
		}
		String value = randomToken();
		session.setAttribute(SESSION_CSRF, value);
		return value;
	}

	public Approval reauthenticate(HttpServletRequest request, String csrfToken, String password) {
		requireCsrf(request, csrfToken);
		if (!adminAuthService.verifyPassword(password)) {
			throw new ApiErrorException("AI_ADMIN_REAUTH_FAILED", "관리자 비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED);
		}
		String token = randomToken();
		Instant expiresAt = Instant.now().plus(APPROVAL_TTL);
		HttpSession session = request.getSession(true);
		session.setAttribute(SESSION_APPROVAL, token);
		session.setAttribute(SESSION_APPROVAL_EXPIRES, expiresAt);
		return new Approval(token, expiresAt);
	}

	public void requireCsrf(HttpServletRequest request, String csrfToken) {
		Object expected = request.getSession(true).getAttribute(SESSION_CSRF);
		if (!(expected instanceof String expectedValue) || !constantTimeEquals(expectedValue, csrfToken)) {
			throw new ApiErrorException("AI_ADMIN_CSRF_INVALID", "관리자 요청의 CSRF 토큰이 유효하지 않습니다.", HttpStatus.FORBIDDEN);
		}
	}

	public void requireApproval(HttpServletRequest request, String csrfToken, String approvalToken) {
		requireCsrf(request, csrfToken);
		HttpSession session = request.getSession(true);
		Object expected = session.getAttribute(SESSION_APPROVAL);
		Object expires = session.getAttribute(SESSION_APPROVAL_EXPIRES);
		if (!(expected instanceof String expectedValue)
			|| !(expires instanceof Instant expiresAt)
			|| !expiresAt.isAfter(Instant.now())
			|| !constantTimeEquals(expectedValue, approvalToken)) {
			throw new ApiErrorException("AI_ADMIN_REAUTH_REQUIRED", "관리자 비밀번호 재인증이 필요합니다.", HttpStatus.FORBIDDEN);
		}
	}

	private String randomToken() {
		byte[] value = new byte[32];
		secureRandom.nextBytes(value);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
	}

	private boolean constantTimeEquals(String left, String right) {
		if (left == null || right == null) {
			return false;
		}
		return MessageDigest.isEqual(left.getBytes(java.nio.charset.StandardCharsets.UTF_8), right.getBytes(java.nio.charset.StandardCharsets.UTF_8));
	}

	public record Approval(String approvalToken, Instant expiresAt) {
	}
}
