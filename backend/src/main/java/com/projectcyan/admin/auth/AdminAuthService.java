package com.projectcyan.admin.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

	public static final String SESSION_AUTHENTICATED = "projectCyanAdminAuthenticated";

	private static final String SESSION_AUTHENTICATED_AT = "projectCyanAdminAuthenticatedAt";
	private static final String SESSION_CLIENT_IP = "projectCyanAdminClientIp";
	private static final String REMEMBER_COOKIE = "projectCyanAdminRemember";
	private static final String HMAC_ALGORITHM = "HmacSHA256";

	private static final int MAX_FAILURES = 3;
	private static final int MAX_ATTEMPTS = 100;
	private static final Duration ADMIN_IDLE_TIMEOUT = Duration.ofHours(1);
	private static final int SESSION_TIMEOUT_SECONDS = (int) ADMIN_IDLE_TIMEOUT.toSeconds();
	private static final Duration LOCK_DURATION = Duration.ofMinutes(30);
	private static final Duration REMEMBER_DURATION = ADMIN_IDLE_TIMEOUT;

	private final String adminUsername;
	private final String adminPassword;
	private final ConcurrentMap<String, IpFailureState> ipStates = new ConcurrentHashMap<>();
	private final List<AdminLoginAttempt> attempts = new ArrayList<>();
	private final Object attemptsLock = new Object();

	public AdminAuthService(
		@Value("${admin.auth.username}") String adminUsername,
		@Value("${admin.auth.password}") String adminPassword
	) {
		this.adminUsername = nullToBlank(adminUsername).trim();
		this.adminPassword = nullToBlank(adminPassword);
	}

	public AdminLoginStatus status(HttpServletRequest request) {
		return status(request, null);
	}

	public AdminLoginStatus status(HttpServletRequest request, HttpServletResponse response) {
		boolean restored = ensureAuthenticated(request, response);
		boolean authenticated = isAuthenticated(request.getSession(false));
		String clientIp = clientIp(request);
		HttpSession session = request.getSession(false);
		return new AdminLoginStatus(
			authenticated,
			clientIp,
			lockState(clientIp, Instant.now()),
			authenticated ? attempts() : List.of(),
			authenticated ? "Authenticated." : "Login required.",
			restored,
			sessionExpiresAt(session),
			rememberedUntil(request)
		);
	}

	public AdminLoginStatus login(
		HttpServletRequest request,
		HttpServletResponse response,
		AdminLoginRequest loginRequest
	) {
		String clientIp = clientIp(request);
		String username = loginRequest == null ? "" : nullToBlank(loginRequest.username()).trim();
		String password = loginRequest == null ? "" : nullToBlank(loginRequest.password());
		Instant now = Instant.now();
		IpFailureState state = ipStates.computeIfAbsent(clientIp, ignored -> new IpFailureState());

		synchronized (state) {
			clearExpiredLock(state, now);
			if (state.lockedUntil != null && state.lockedUntil.isAfter(now)) {
				recordAttempt(new AdminLoginAttempt(
					now,
					clientIp,
					username,
					"locked",
					"Locked for 30 minutes.",
					state.failureCount,
					state.lockedUntil
				));
				return status(request, response);
			}

			if (hasConfiguredCredentials() && adminUsername.equals(username) && adminPassword.equals(password)) {
				state.failureCount = 0;
				state.lockedUntil = null;
				authenticateSession(request, clientIp, now);
				issueRememberCookie(request, response, clientIp, now.plus(REMEMBER_DURATION));
				recordAttempt(new AdminLoginAttempt(now, clientIp, username, "success", "Login success.", 0, null));
				return status(request, response);
			}

			state.failureCount++;
			if (state.failureCount >= MAX_FAILURES) {
				state.lockedUntil = now.plus(LOCK_DURATION);
				recordAttempt(new AdminLoginAttempt(
					now,
					clientIp,
					username,
					"locked",
					"3 failures; locked for 30 minutes.",
					state.failureCount,
					state.lockedUntil
				));
			} else {
				recordAttempt(new AdminLoginAttempt(
					now,
					clientIp,
					username,
					"failure",
					"Username or password mismatch.",
					state.failureCount,
					null
				));
			}
			return status(request, response);
		}
	}

	public void logout(HttpServletRequest request, HttpServletResponse response) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.invalidate();
		}
		clearRememberCookie(request, response);
	}

	public boolean ensureAuthenticated(HttpServletRequest request, HttpServletResponse response) {
		if (isAuthenticated(request.getSession(false))) {
			issueRememberCookie(request, response, clientIp(request), Instant.now().plus(REMEMBER_DURATION));
			return false;
		}
		return restoreRememberedSession(request, response);
	}

	public boolean isAuthenticated(HttpSession session) {
		return session != null && Boolean.TRUE.equals(session.getAttribute(SESSION_AUTHENTICATED));
	}

	public boolean verifyPassword(String password) {
		return hasConfiguredCredentials() && constantTimeEquals(adminPassword, nullToBlank(password));
	}

	public String clientIp(HttpServletRequest request) {
		String forwardedFor = request.getHeader("X-Forwarded-For");
		if (forwardedFor != null && !forwardedFor.isBlank()) {
			return forwardedFor.split(",", 2)[0].trim();
		}
		String realIp = request.getHeader("X-Real-IP");
		if (realIp != null && !realIp.isBlank()) {
			return realIp.trim();
		}
		return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
	}

	private void authenticateSession(HttpServletRequest request, String clientIp, Instant now) {
		HttpSession session = request.getSession(true);
		request.changeSessionId();
		session.setMaxInactiveInterval(SESSION_TIMEOUT_SECONDS);
		session.setAttribute(SESSION_AUTHENTICATED, Boolean.TRUE);
		session.setAttribute(SESSION_AUTHENTICATED_AT, now);
		session.setAttribute(SESSION_CLIENT_IP, clientIp);
	}

	private boolean restoreRememberedSession(HttpServletRequest request, HttpServletResponse response) {
		RememberToken token = readRememberToken(request);
		if (token == null) {
			return false;
		}

		Instant now = Instant.now();
		if (!token.expiresAt().isAfter(now)) {
			clearRememberCookie(request, response);
			return false;
		}

		String clientIp = clientIp(request);
		authenticateSession(request, clientIp, now);
		issueRememberCookie(request, response, clientIp, now.plus(REMEMBER_DURATION));
		recordAttempt(new AdminLoginAttempt(
			now,
			clientIp,
			adminUsername,
			"remember",
			"Remembered admin session restored.",
			0,
			null
		));
		return true;
	}

	private RememberToken readRememberToken(HttpServletRequest request) {
		String cookieValue = rememberCookieValue(request);
		if (cookieValue == null || cookieValue.isBlank() || !hasConfiguredCredentials()) {
			return null;
		}

		String[] tokenParts = cookieValue.split("\\.", 2);
		if (tokenParts.length != 2 || tokenParts[0].isBlank() || tokenParts[1].isBlank()) {
			return null;
		}

		String expectedSignature = hmacBase64(tokenParts[0]);
		if (!constantTimeEquals(expectedSignature, tokenParts[1])) {
			return null;
		}

		try {
			String payload = base64UrlDecode(tokenParts[0]);
			String[] fields = payload.split("\\|", -1);
			if (fields.length != 5 || !"v1".equals(fields[0])) {
				return null;
			}

			Instant expiresAt = Instant.ofEpochMilli(Long.parseLong(fields[1]));
			String username = base64UrlDecode(fields[2]);
			String userAgentHash = fields[3];
			if (!adminUsername.equals(username) || !constantTimeEquals(userAgentHash, userAgentHash(request))) {
				return null;
			}

			return new RememberToken(expiresAt);
		} catch (IllegalArgumentException exception) {
			return null;
		}
	}

	private void issueRememberCookie(
		HttpServletRequest request,
		HttpServletResponse response,
		String clientIp,
		Instant expiresAt
	) {
		if (response == null || !hasConfiguredCredentials()) {
			return;
		}

		String payload = String.join(
			"|",
			"v1",
			Long.toString(expiresAt.toEpochMilli()),
			base64UrlEncode(adminUsername),
			userAgentHash(request),
			base64UrlEncode(clientIp)
		);
		String encodedPayload = base64UrlEncode(payload);
		String token = encodedPayload + "." + hmacBase64(encodedPayload);
		ResponseCookie cookie = ResponseCookie.from(REMEMBER_COOKIE, token)
			.path("/")
			.httpOnly(true)
			.secure(request.isSecure())
			.sameSite("Lax")
			.maxAge(REMEMBER_DURATION)
			.build();
		response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
	}

	private void clearRememberCookie(HttpServletRequest request, HttpServletResponse response) {
		if (response == null) {
			return;
		}
		ResponseCookie cookie = ResponseCookie.from(REMEMBER_COOKIE, "")
			.path("/")
			.httpOnly(true)
			.secure(request.isSecure())
			.sameSite("Lax")
			.maxAge(Duration.ZERO)
			.build();
		response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
	}

	private Instant sessionExpiresAt(HttpSession session) {
		if (session == null || session.getMaxInactiveInterval() <= 0) {
			return null;
		}
		return Instant.ofEpochMilli(session.getLastAccessedTime())
			.plusSeconds(session.getMaxInactiveInterval());
	}

	private Instant rememberedUntil(HttpServletRequest request) {
		RememberToken token = readRememberToken(request);
		return token == null ? null : token.expiresAt();
	}

	private String rememberCookieValue(HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		if (cookies == null) {
			return null;
		}
		for (Cookie cookie : cookies) {
			if (REMEMBER_COOKIE.equals(cookie.getName())) {
				return cookie.getValue();
			}
		}
		return null;
	}

	private String userAgentHash(HttpServletRequest request) {
		return hmacBase64(nullToBlank(request.getHeader("User-Agent")));
	}

	private String hmacBase64(String value) {
		try {
			Mac mac = Mac.getInstance(HMAC_ALGORITHM);
			mac.init(new SecretKeySpec(rememberSigningKey().getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
			return Base64.getUrlEncoder().withoutPadding()
				.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
		} catch (Exception exception) {
			throw new IllegalStateException("Failed to sign admin remember token.", exception);
		}
	}

	private String rememberSigningKey() {
		return adminUsername + "\n" + adminPassword + "\nproject-cyan-admin-remember-v1";
	}

	private String base64UrlEncode(String value) {
		return Base64.getUrlEncoder().withoutPadding()
			.encodeToString(value.getBytes(StandardCharsets.UTF_8));
	}

	private String base64UrlDecode(String value) {
		return new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
	}

	private boolean constantTimeEquals(String left, String right) {
		if (left == null || right == null) {
			return false;
		}
		return MessageDigest.isEqual(
			left.getBytes(StandardCharsets.UTF_8),
			right.getBytes(StandardCharsets.UTF_8)
		);
	}

	private AdminLockState lockState(String clientIp, Instant now) {
		IpFailureState state = ipStates.computeIfAbsent(clientIp, ignored -> new IpFailureState());
		synchronized (state) {
			clearExpiredLock(state, now);
			if (state.lockedUntil == null || !state.lockedUntil.isAfter(now)) {
				return new AdminLockState(false, 0, null);
			}
			return new AdminLockState(true, Duration.between(now, state.lockedUntil).toMillis(), state.lockedUntil);
		}
	}

	private void clearExpiredLock(IpFailureState state, Instant now) {
		if (state.lockedUntil != null && !state.lockedUntil.isAfter(now)) {
			state.failureCount = 0;
			state.lockedUntil = null;
		}
	}

	private void recordAttempt(AdminLoginAttempt attempt) {
		synchronized (attemptsLock) {
			attempts.add(attempt);
			attempts.sort(Comparator.comparing(AdminLoginAttempt::at).reversed());
			while (attempts.size() > MAX_ATTEMPTS) {
				attempts.remove(attempts.size() - 1);
			}
		}
	}

	private List<AdminLoginAttempt> attempts() {
		synchronized (attemptsLock) {
			return List.copyOf(attempts);
		}
	}

	private String nullToBlank(String value) {
		return value == null ? "" : value;
	}

	private boolean hasConfiguredCredentials() {
		return !adminUsername.isBlank() && !adminPassword.isBlank();
	}

	private static class IpFailureState {
		private int failureCount;
		private Instant lockedUntil;
	}

	public record AdminLoginRequest(
		String username,
		String password
	) {
	}

	public record AdminLoginStatus(
		boolean authenticated,
		String clientIp,
		AdminLockState lock,
		List<AdminLoginAttempt> attempts,
		String message,
		boolean restored,
		Instant sessionExpiresAt,
		Instant rememberedUntil
	) {
	}

	public record AdminLockState(
		boolean locked,
		long remainingMs,
		Instant lockedUntil
	) {
	}

	public record AdminLoginAttempt(
		Instant at,
		String ip,
		String username,
		String result,
		String reason,
		int failureCount,
		Instant lockedUntil
	) {
	}

	private record RememberToken(
		Instant expiresAt
	) {
	}
}
