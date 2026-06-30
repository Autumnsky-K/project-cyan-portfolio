package com.projectcyan.ai;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AdminAiOAuthController {

	private final AdminAiOAuthService oauthService;

	public AdminAiOAuthController(AdminAiOAuthService oauthService) {
		this.oauthService = oauthService;
	}

	@GetMapping("/oauth/status")
	public Map<String, Object> status() {
		return ok("status", oauthService.status());
	}

	@PostMapping("/oauth/key")
	public Map<String, Object> setKey(@RequestBody Map<String, Object> request) {
		return ok("status", oauthService.setDigitKey(String.valueOf(request.getOrDefault("digitKey", ""))));
	}

	@PostMapping("/oauth/start")
	public Map<String, Object> start() {
		Map<String, Object> started = oauthService.startLogin();
		return Map.of(
				"ok", true,
				"authorization_url", started.get("authorization_url"),
				"callback_active", started.get("callback_active"),
				"status", started.get("status"));
	}

	@GetMapping("/oauth/poll")
	public Map<String, Object> poll() {
		Map<String, Object> polled = oauthService.poll();
		return Map.of(
				"ok", true,
				"completed", polled.get("completed"),
				"status", polled.get("status"));
	}

	@PostMapping("/oauth/clear")
	public Map<String, Object> clear() {
		return ok("status", oauthService.clear());
	}

	@PostMapping("/chat")
	public Map<String, Object> chat(@RequestBody Map<String, Object> request) {
		String message = String.valueOf(request.getOrDefault("message", "")).trim();
		if (message.isBlank()) {
			throw new AiOAuthRequestException("message is required");
		}
		return Map.of("ok", true, "reply", oauthService.chat(message));
	}

	private Map<String, Object> ok(String key, Object value) {
		return Map.of("ok", true, key, value);
	}

	@ResponseStatus(HttpStatus.BAD_REQUEST)
	private static class AiOAuthRequestException extends RuntimeException {
		private AiOAuthRequestException(String message) {
			super(message);
		}
	}
}
