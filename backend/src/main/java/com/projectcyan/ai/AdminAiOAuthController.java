package com.projectcyan.ai;

import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/ai/model-connections/{profileId}/oauth")
public class AdminAiOAuthController {

	private final AdminAiOAuthService oauthService;
	private final AdminAiSensitiveActionService sensitiveActionService;

	public AdminAiOAuthController(
		AdminAiOAuthService oauthService,
		AdminAiSensitiveActionService sensitiveActionService
	) {
		this.oauthService = oauthService;
		this.sensitiveActionService = sensitiveActionService;
	}

	@GetMapping("/status")
	public Map<String, Object> status(@PathVariable Long profileId) {
		return Map.of("status", oauthService.status(profileId));
	}

	@PostMapping("/start")
	public Map<String, Object> start(
		@PathVariable Long profileId,
		@RequestHeader(AdminAiSensitiveActionService.CSRF_HEADER) String csrfToken,
		@RequestHeader(AdminAiSensitiveActionService.APPROVAL_HEADER) String approvalToken,
		HttpServletRequest request
	) {
		sensitiveActionService.requireApproval(request, csrfToken, approvalToken);
		return oauthService.startLogin(profileId);
	}

	@PostMapping("/poll")
	public Map<String, Object> poll(
		@RequestHeader(AdminAiSensitiveActionService.CSRF_HEADER) String csrfToken,
		@RequestHeader(AdminAiSensitiveActionService.APPROVAL_HEADER) String approvalToken,
		HttpServletRequest request
	) {
		sensitiveActionService.requireApproval(request, csrfToken, approvalToken);
		return oauthService.poll(request.getRemoteAddr());
	}

	@PostMapping("/clear")
	public Map<String, Object> clear(
		@PathVariable Long profileId,
		@RequestHeader(AdminAiSensitiveActionService.CSRF_HEADER) String csrfToken,
		@RequestHeader(AdminAiSensitiveActionService.APPROVAL_HEADER) String approvalToken,
		HttpServletRequest request
	) {
		sensitiveActionService.requireApproval(request, csrfToken, approvalToken);
		return Map.of("status", oauthService.clear(profileId, request.getRemoteAddr()));
	}
}
