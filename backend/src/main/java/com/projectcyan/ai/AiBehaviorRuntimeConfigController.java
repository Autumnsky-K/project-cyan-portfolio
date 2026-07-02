package com.projectcyan.ai;

import com.projectcyan.ai.AiBehaviorRuntimeConfigService.RuntimeConfigResponse;
import com.projectcyan.common.ApiErrorException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/runtime-config")
public class AiBehaviorRuntimeConfigController {

	private final AiBehaviorRuntimeConfigService configService;
	private final String serviceToken;

	public AiBehaviorRuntimeConfigController(
		AiBehaviorRuntimeConfigService configService,
		@Value("${project-cyan.ai-service.internal-token:}") String serviceToken
	) {
		this.configService = configService;
		this.serviceToken = serviceToken;
	}

	@GetMapping
	public RuntimeConfigResponse findPublished(
		@RequestHeader(value = "X-Project-Cyan-Service-Token", required = false) String requestToken
	) {
		if (!serviceToken.isBlank() && !serviceToken.equals(requestToken)) {
			throw new ApiErrorException("AI_SERVICE_UNAUTHORIZED", "AI 서비스 인증이 필요합니다.", HttpStatus.UNAUTHORIZED);
		}
		return configService.findPublished();
	}
}
