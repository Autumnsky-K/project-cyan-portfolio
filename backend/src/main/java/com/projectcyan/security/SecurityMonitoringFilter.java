package com.projectcyan.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class SecurityMonitoringFilter extends OncePerRequestFilter {

	private static final String FINGERPRINT_HEADER = "X-Project-Cyan-Fingerprint";
	private static final String SESSION_HEADER = "X-Project-Cyan-Session";

	private final SecurityMonitoringService monitoringService;

	public SecurityMonitoringFilter(SecurityMonitoringService monitoringService) {
		this.monitoringService = monitoringService;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String path = requestPath(request);
		return !isTrackedPath(path) || "/api/security/page-views".equals(path);
	}

	@Override
	protected void doFilterInternal(
		HttpServletRequest request,
		HttpServletResponse response,
		FilterChain filterChain
	) throws ServletException, IOException {
		long startedAt = System.nanoTime();
		try {
			filterChain.doFilter(request, response);
		} finally {
			int durationMs = (int) ((System.nanoTime() - startedAt) / 1_000_000L);
			monitoringService.recordAccess(
				request,
				request.getMethod(),
				requestPath(request),
				response.getStatus(),
				durationMs,
				fingerprintHash(request),
				false
			);
		}
	}

	static boolean isTrackedPath(String path) {
		return (path.startsWith("/api/") || path.startsWith("/admin/") || "/admin".equals(path)) && !isStaticAsset(path);
	}

	static String requestPath(HttpServletRequest request) {
		String uri = request.getRequestURI();
		String contextPath = request.getContextPath();
		if (contextPath != null && !contextPath.isBlank() && uri.startsWith(contextPath)) {
			return uri.substring(contextPath.length());
		}
		return uri == null || uri.isBlank() ? "/" : uri;
	}

	static String fingerprintHash(HttpServletRequest request) {
		return headerHash(request, FINGERPRINT_HEADER);
	}

	static String sessionHash(HttpServletRequest request) {
		return headerHash(request, SESSION_HEADER);
	}

	private static String headerHash(HttpServletRequest request, String headerName) {
		String rawValue = request.getHeader(headerName);
		if (rawValue == null || rawValue.isBlank()) {
			return null;
		}
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hash = digest.digest(rawValue.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(hash);
		} catch (Exception exception) {
			return null;
		}
	}

	private static boolean isStaticAsset(String path) {
		String lowerPath = path.toLowerCase();
		return lowerPath.endsWith(".css")
			|| lowerPath.endsWith(".js")
			|| lowerPath.endsWith(".png")
			|| lowerPath.endsWith(".jpg")
			|| lowerPath.endsWith(".jpeg")
			|| lowerPath.endsWith(".webp")
			|| lowerPath.endsWith(".svg")
			|| lowerPath.endsWith(".ico")
			|| lowerPath.endsWith(".map")
			|| lowerPath.endsWith(".woff")
			|| lowerPath.endsWith(".woff2");
	}
}
