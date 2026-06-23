package com.projectcyan.admin.auth;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

	private final AdminAuthService adminAuthService;

	public AdminAuthInterceptor(AdminAuthService adminAuthService) {
		this.adminAuthService = adminAuthService;
	}

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
		adminAuthService.ensureAuthenticated(request, response);
		if (adminAuthService.isAuthenticated(request.getSession(false))) {
			return true;
		}

		String path = request.getRequestURI().substring(request.getContextPath().length());
		if (path.startsWith("/api/admin/")) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.setContentType(MediaType.APPLICATION_JSON_VALUE);
			response.getWriter().write("{\"message\":\"관리자 로그인이 필요합니다.\"}");
			return false;
		}

		String next = path + (request.getQueryString() == null ? "" : "?" + request.getQueryString());
		response.sendRedirect(request.getContextPath() + "/admin/login?next=" + URLEncoder.encode(next, StandardCharsets.UTF_8));
		return false;
	}
}
