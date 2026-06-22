package com.projectcyan.admin.auth;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

	public static final String SESSION_AUTHENTICATED = "projectCyanAdminAuthenticated";

	private static final int MAX_FAILURES = 3;
	private static final int MAX_ATTEMPTS = 100;
	private static final Duration LOCK_DURATION = Duration.ofMinutes(30);

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
		boolean authenticated = isAuthenticated(request.getSession(false));
		String clientIp = clientIp(request);
		return new AdminLoginStatus(
			authenticated,
			clientIp,
			lockState(clientIp, Instant.now()),
			authenticated ? attempts() : List.of(),
			authenticated ? "로그인되어 있습니다." : "로그인이 필요합니다."
		);
	}

	public AdminLoginStatus login(HttpServletRequest request, AdminLoginRequest loginRequest) {
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
					"30분 정지 중",
					state.failureCount,
					state.lockedUntil
				));
				return status(request);
			}

			if (hasConfiguredCredentials() && adminUsername.equals(username) && adminPassword.equals(password)) {
				state.failureCount = 0;
				state.lockedUntil = null;
				HttpSession session = request.getSession(true);
				request.changeSessionId();
				session.setAttribute(SESSION_AUTHENTICATED, Boolean.TRUE);
				recordAttempt(new AdminLoginAttempt(now, clientIp, username, "success", "로그인 성공", 0, null));
				return status(request);
			}

			state.failureCount++;
			if (state.failureCount >= MAX_FAILURES) {
				state.lockedUntil = now.plus(LOCK_DURATION);
				recordAttempt(new AdminLoginAttempt(
					now,
					clientIp,
					username,
					"locked",
					"3회 실패로 30분 정지",
					state.failureCount,
					state.lockedUntil
				));
			} else {
				recordAttempt(new AdminLoginAttempt(
					now,
					clientIp,
					username,
					"failure",
					"아이디 또는 비밀번호 불일치",
					state.failureCount,
					null
				));
			}
			return status(request);
		}
	}

	public void logout(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.invalidate();
		}
	}

	public boolean isAuthenticated(HttpSession session) {
		return session != null && Boolean.TRUE.equals(session.getAttribute(SESSION_AUTHENTICATED));
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
		String message
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
}
