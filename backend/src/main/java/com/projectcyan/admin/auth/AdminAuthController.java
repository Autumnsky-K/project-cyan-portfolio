package com.projectcyan.admin.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AdminAuthController {

	private final AdminAuthService adminAuthService;

	public AdminAuthController(AdminAuthService adminAuthService) {
		this.adminAuthService = adminAuthService;
	}

	@GetMapping("/admin/login")
	public String loginPage(
		@RequestParam(required = false) String next,
		Model model,
		HttpServletRequest request,
		HttpServletResponse response
	) {
		String safeNext = safeNextPath(next);
		adminAuthService.ensureAuthenticated(request, response);
		if (adminAuthService.isAuthenticated(request.getSession(false))) {
			return "redirect:" + safeNext;
		}
		model.addAttribute("next", safeNext);
		return "admin/login";
	}

	@GetMapping("/admin/auth/status")
	public ResponseEntity<AdminAuthService.AdminLoginStatus> status(
		HttpServletRequest request,
		HttpServletResponse response
	) {
		return ResponseEntity.ok(adminAuthService.status(request, response));
	}

	@PostMapping("/admin/auth/login")
	public ResponseEntity<AdminAuthService.AdminLoginStatus> login(
		@RequestBody(required = false) AdminAuthService.AdminLoginRequest loginRequest,
		HttpServletRequest request,
		HttpServletResponse response
	) {
		AdminAuthService.AdminLoginStatus status = adminAuthService.login(request, response, loginRequest);
		if (status.authenticated()) {
			return ResponseEntity.ok(status);
		}
		HttpStatus responseStatus = status.lock().locked() ? HttpStatus.LOCKED : HttpStatus.UNAUTHORIZED;
		return ResponseEntity.status(responseStatus).body(status);
	}

	@PostMapping("/admin/auth/logout")
	public String logout(HttpServletRequest request, HttpServletResponse response) {
		adminAuthService.logout(request, response);
		return "redirect:/admin/login";
	}

	private String safeNextPath(String next) {
		if (next == null || next.isBlank()) {
			return "/admin";
		}
		return next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
	}
}
