package com.projectcyan.ai;

import com.projectcyan.ai.AiLlmConnectionService.ApiKeyRequest;
import com.projectcyan.ai.AiLlmConnectionService.ConnectionConsoleResponse;
import com.projectcyan.ai.AiLlmConnectionService.ProfileResponse;
import com.projectcyan.ai.AiLlmConnectionService.ProfileSaveRequest;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/ai/model-connections")
public class AdminAiLlmConnectionController {

	private final AiLlmConnectionService connectionService;
	private final AdminAiSensitiveActionService sensitiveActionService;
	private final AdminAiBehaviorProxyService behaviorProxyService;
	private final AiBehaviorRuntimeConfigService runtimeConfigService;

	public AdminAiLlmConnectionController(
		AiLlmConnectionService connectionService,
		AdminAiSensitiveActionService sensitiveActionService,
		AdminAiBehaviorProxyService behaviorProxyService,
		AiBehaviorRuntimeConfigService runtimeConfigService
	) {
		this.connectionService = connectionService;
		this.sensitiveActionService = sensitiveActionService;
		this.behaviorProxyService = behaviorProxyService;
		this.runtimeConfigService = runtimeConfigService;
	}

	@PostMapping("/rollback/{publicationId}")
	public Map<String, Object> rollback(
		@PathVariable Long publicationId,
		@RequestHeader(AdminAiSensitiveActionService.CSRF_HEADER) String csrfToken,
		@RequestHeader(AdminAiSensitiveActionService.APPROVAL_HEADER) String approvalToken,
		HttpServletRequest request
	) {
		sensitiveActionService.requireApproval(request, csrfToken, approvalToken);
		var reference = connectionService.rollbackReference(publicationId);
		var runtimeConfig = runtimeConfigService.switchModelConnection(reference);
		connectionService.recordRollback(publicationId, runtimeConfig.configVersion(), request.getRemoteAddr());
		return Map.of("ok", true, "runtimeConfig", runtimeConfig);
	}

	@GetMapping
	public ConnectionConsoleResponse console(HttpServletRequest request) {
		return connectionService.console(sensitiveActionService.csrfToken(request));
	}

	@GetMapping("/security")
	public ResponseEntity<Map<String, String>> security(HttpServletRequest request) {
		return ResponseEntity.ok()
			.cacheControl(CacheControl.noStore())
			.header("Pragma", "no-cache")
			.body(Map.of("csrfToken", sensitiveActionService.csrfToken(request)));
	}

	@PostMapping("/reauth")
	public AdminAiSensitiveActionService.Approval reauthenticate(
		@RequestBody ReauthRequest body,
		@RequestHeader(AdminAiSensitiveActionService.CSRF_HEADER) String csrfToken,
		HttpServletRequest request
	) {
		return sensitiveActionService.reauthenticate(request, csrfToken, body.password());
	}

	@PostMapping
	public ProfileResponse save(
		@RequestBody ProfileSaveRequest body,
		@RequestHeader(AdminAiSensitiveActionService.CSRF_HEADER) String csrfToken,
		HttpServletRequest request
	) {
		sensitiveActionService.requireCsrf(request, csrfToken);
		return connectionService.save(body, request.getRemoteAddr());
	}

	@PostMapping("/{profileId}/credential")
	public ProfileResponse saveCredential(
		@PathVariable Long profileId,
		@RequestBody ApiKeyRequest body,
		@RequestHeader(AdminAiSensitiveActionService.CSRF_HEADER) String csrfToken,
		@RequestHeader(AdminAiSensitiveActionService.APPROVAL_HEADER) String approvalToken,
		HttpServletRequest request
	) {
		sensitiveActionService.requireApproval(request, csrfToken, approvalToken);
		return connectionService.saveApiKey(profileId, body.apiKey(), request.getRemoteAddr());
	}

	@PostMapping("/{profileId}/test")
	public Map<String, Object> test(
		@PathVariable Long profileId,
		@RequestHeader(AdminAiSensitiveActionService.CSRF_HEADER) String csrfToken,
		HttpServletRequest request
	) {
		sensitiveActionService.requireCsrf(request, csrfToken);
		try {
			Map<String, Object> result = behaviorProxyService.testConnection(profileId);
			ProfileResponse profile = connectionService.recordTest(profileId, true, "FastAPI provider connection succeeded.", request.getRemoteAddr());
			return Map.of("ok", true, "profile", profile, "result", result);
		} catch (RuntimeException exception) {
			connectionService.recordTest(profileId, false, exception.getMessage(), request.getRemoteAddr());
			throw exception;
		}
	}

	public record ReauthRequest(String password) { }
}
