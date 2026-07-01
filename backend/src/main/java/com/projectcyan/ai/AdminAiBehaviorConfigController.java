package com.projectcyan.ai;

import com.projectcyan.ai.AiBehaviorRuntimeConfigService.PublishRuntimeConfigRequest;
import com.projectcyan.ai.AiBehaviorRuntimeConfigService.RuntimeConfigResponse;
import com.projectcyan.ai.AiLlmConnectionService.ModelConnectionReference;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/ai/behavior/config")
public class AdminAiBehaviorConfigController {

	private final AiBehaviorRuntimeConfigService configService;
	private final AiLlmConnectionService connectionService;
	private final AdminAiSensitiveActionService sensitiveActionService;

	public AdminAiBehaviorConfigController(
		AiBehaviorRuntimeConfigService configService,
		AiLlmConnectionService connectionService,
		AdminAiSensitiveActionService sensitiveActionService
	) {
		this.configService = configService;
		this.connectionService = connectionService;
		this.sensitiveActionService = sensitiveActionService;
	}

	@PostMapping("/publish")
	public RuntimeConfigResponse publish(
		@RequestBody BehaviorPublishRequest request,
		@RequestHeader(AdminAiSensitiveActionService.CSRF_HEADER) String csrfToken,
		@RequestHeader(AdminAiSensitiveActionService.APPROVAL_HEADER) String approvalToken,
		HttpServletRequest servletRequest
	) {
		sensitiveActionService.requireApproval(servletRequest, csrfToken, approvalToken);
		ModelConnectionReference reference = null;
		if (request.modelConnectionProfileId() != null) {
			reference = connectionService.validatePublication(
				request.modelConnectionProfileId(),
				Boolean.TRUE.equals(request.oauthWarningAcknowledged())
			);
		}
		RuntimeConfigResponse response = configService.publish(
			new PublishRuntimeConfigRequest(request.logicFunctions(), request.adminSettings(), request.motionList(), request.pipelineMode()),
			reference
		);
		if (reference != null) {
			connectionService.recordPublication(
				reference,
				response.configVersion(),
				Boolean.TRUE.equals(request.oauthWarningAcknowledged()),
				servletRequest.getRemoteAddr()
			);
		}
		return response;
	}

	public record BehaviorPublishRequest(
		String logicFunctions,
		String adminSettings,
		String motionList,
		String pipelineMode,
		Long modelConnectionProfileId,
		Boolean oauthWarningAcknowledged
	) { }
}
