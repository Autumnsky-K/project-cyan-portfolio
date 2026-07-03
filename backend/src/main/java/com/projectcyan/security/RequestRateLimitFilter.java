package com.projectcyan.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class RequestRateLimitFilter extends OncePerRequestFilter {

	private static final Duration WINDOW = Duration.ofMinutes(1);
	private static final int MAX_REQUESTS_PER_WINDOW = 120;
	private static final int TOO_MANY_REQUESTS = 429;

	private final SecurityMonitoringService monitoringService;
	private final ConcurrentMap<String, RequestWindow> requestWindows = new ConcurrentHashMap<>();

	public RequestRateLimitFilter(SecurityMonitoringService monitoringService) {
		this.monitoringService = monitoringService;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		return !SecurityMonitoringFilter.isTrackedPath(SecurityMonitoringFilter.requestPath(request));
	}

	@Override
	protected void doFilterInternal(
		HttpServletRequest request,
		HttpServletResponse response,
		FilterChain filterChain
	) throws ServletException, IOException {
		String path = SecurityMonitoringFilter.requestPath(request);
		String key = monitoringService.clientIp(request) + "|" + request.getMethod() + "|" + path;
		Instant now = Instant.now();
		RequestWindow window = requestWindows.computeIfAbsent(key, ignored -> new RequestWindow(now));

		if (!window.allow(now)) {
			response.setStatus(TOO_MANY_REQUESTS);
			response.setHeader("Retry-After", Long.toString(WINDOW.toSeconds()));
			response.setContentType(MediaType.APPLICATION_JSON_VALUE);
			response.setCharacterEncoding(StandardCharsets.UTF_8.name());
			response.getWriter().write("{\"message\":\"Too many requests. Please retry after 60 seconds.\"}");
			monitoringService.recordAccess(
				request,
				request.getMethod(),
				path,
				TOO_MANY_REQUESTS,
				0,
				SecurityMonitoringFilter.fingerprintHash(request),
				true,
				new SecurityMonitoringService.AccessLogContext(
					"RATE_LIMIT_BLOCK",
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					false,
					SecurityMonitoringFilter.sessionHash(request)
				)
			);
			monitoringService.recordSecurityEvent(
				request,
				"RATE_LIMIT_BLOCK",
				"WARN",
				path,
				"1분 동안 동일 IP/메서드/경로 요청이 " + MAX_REQUESTS_PER_WINDOW + "회를 초과했습니다."
			);
			return;
		}

		filterChain.doFilter(request, response);
	}

	private static class RequestWindow {
		private Instant startedAt;
		private int count;

		private RequestWindow(Instant startedAt) {
			this.startedAt = startedAt;
			this.count = 0;
		}

		private synchronized boolean allow(Instant now) {
			if (Duration.between(startedAt, now).compareTo(WINDOW) >= 0) {
				startedAt = now;
				count = 0;
			}
			count++;
			return count <= MAX_REQUESTS_PER_WINDOW;
		}
	}
}
