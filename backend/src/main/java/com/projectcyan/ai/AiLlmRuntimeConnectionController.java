package com.projectcyan.ai;

import com.projectcyan.ai.AiLlmConnectionService.RuntimeConnection;
import com.projectcyan.common.ApiErrorException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/internal/model-connections")
public class AiLlmRuntimeConnectionController {

	private final AiLlmConnectionService connectionService;
	private final AdminAiOAuthService oauthService;
	private final String serviceToken;

	public AiLlmRuntimeConnectionController(
		AiLlmConnectionService connectionService,
		AdminAiOAuthService oauthService,
		@Value("${project-cyan.ai-service.internal-token:}") String serviceToken
	) {
		this.connectionService = connectionService;
		this.oauthService = oauthService;
		this.serviceToken = serviceToken;
	}

	@PostMapping("/resolve")
	public ResponseEntity<RuntimeConnection> resolve(
		@RequestBody ResolveRequest request,
		@RequestHeader(value = "X-Project-Cyan-Service-Token", required = false) String requestToken
	) {
		requireServiceToken(requestToken);
		RuntimeConnection resolved = request.profileVersion() == null
			? connectionService.resolveDraft(request.profileId())
			: connectionService.resolve(request.profileId(), request.profileVersion());
		if ("CODEX_OAUTH".equals(resolved.provider())) {
			Map<String, Object> fresh = oauthService.getFreshCredential(resolved.credentialId(), resolved.credential());
			resolved = new RuntimeConnection(
				resolved.profileId(), resolved.profileVersion(), resolved.provider(), resolved.connectionType(),
				resolved.baseUrl(), resolved.model(), resolved.credentialId(), new LinkedHashMap<>(fresh)
			);
		}
		return ResponseEntity.ok()
			.cacheControl(CacheControl.noStore())
			.header("Pragma", "no-cache")
			.body(resolved);
	}

	private void requireServiceToken(String requestToken) {
		if (serviceToken.isBlank() || !serviceToken.equals(requestToken)) {
			throw new ApiErrorException("AI_SERVICE_UNAUTHORIZED", "AI 서비스 인증이 필요합니다.", HttpStatus.UNAUTHORIZED);
		}
	}

	public record ResolveRequest(Long profileId, Long profileVersion) { }
}
