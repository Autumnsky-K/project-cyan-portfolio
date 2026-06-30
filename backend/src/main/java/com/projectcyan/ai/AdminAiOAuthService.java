package com.projectcyan.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.Executors;
import org.springframework.stereotype.Service;

@Service
public class AdminAiOAuthService {

	private static final String CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";
	private static final String AUTHORIZE_URL = "https://auth.openai.com/oauth/authorize";
	private static final String TOKEN_URL = "https://auth.openai.com/oauth/token";
	private static final String CODEX_RESPONSES_URL = "https://chatgpt.com/backend-api/codex/responses";
	private static final String REDIRECT_URI = "http://localhost:1455/auth/callback";
	private static final String SCOPE = "openid profile email offline_access";
	private static final String TOKEN_KEY_ENV = "OAUTH_TOKEN_DIGIT_KEY";
	private static final String TOKEN_KEY_MASK_ENV = "OAUTH_TOKEN_DIGIT_KEY_MASK";
	private static final String JWT_AUTH_CLAIM = "https://api.openai.com/auth";
	private static final String JWT_EMAIL_CLAIM = "https://api.openai.com/profile.email";
	private static final int TOKEN_REFRESH_SKEW_SECONDS = 300;

	private final OAuthTokenProtectService tokenProtectService;
	private final ObjectMapper objectMapper;
	private final HttpClient httpClient;
	private final SecureRandom secureRandom = new SecureRandom();
	private final Object lock = new Object();
	private final Path tokenStorePath;
	private final Path digitKeyStorePath;
	private final Path bootstrapSettingsPath;

	private String runtimeDigitKey = "";
	private PendingFlow pendingFlow;
	private HttpServer callbackServer;
	private String callbackCode = "";
	private String callbackError = "";

	public AdminAiOAuthService(OAuthTokenProtectService tokenProtectService) {
		this.tokenProtectService = tokenProtectService;
		this.objectMapper = new ObjectMapper();
		this.httpClient = HttpClient.newBuilder()
				.connectTimeout(Duration.ofSeconds(20))
				.build();
		Path workspaceRoot = resolveWorkspaceRoot();
		Path runtimeRoot = workspaceRoot.resolve(".oauth-llm-chat-runtime");
		this.tokenStorePath = runtimeRoot.resolve("codex_oauth_tokens.json");
		this.digitKeyStorePath = runtimeRoot.resolve("oauth_digit_key.txt");
		this.bootstrapSettingsPath = Path.of(System.getProperty("user.home"), "pypy-orchestrator", "data", "settings.json");
	}

	public Map<String, Object> setDigitKey(String digitKey) {
		synchronized (lock) {
			runtimeDigitKey = tokenProtectService.validateDigitKey(digitKey);
			saveDigitKey(runtimeDigitKey);
			return status();
		}
	}

	public Map<String, Object> status() {
		synchronized (lock) {
			Map<String, Object> output = baseStatus();
			String digitKey = digitKeyOrBlank();
			output.put("keyRequired", digitKey.isBlank());
			output.put("keyMask", OAuthTokenProtectService.KEY_MASK);
			output.put("hasPendingFlow", pendingFlow != null);
			output.put("callbackActive", callbackServer != null);
			if (digitKey.isBlank()) {
				output.put("error", TOKEN_KEY_ENV + " is required before OAuth token store access");
				return output;
			}
			try {
				CodexCredentials credentials = loadCredentials(digitKey);
				output.put("logged_in", credentials != null);
				output.put("token_valid", credentials != null && !credentials.isExpired());
				if (credentials != null) {
					output.put("account_id", credentials.accountId());
					output.put("email", credentials.email());
					output.put("expires", credentials.expires());
				}
			} catch (RuntimeException ex) {
				output.put("logged_in", false);
				output.put("token_valid", false);
				output.put("token_store_mismatch", ex.getMessage().contains("password mismatch"));
				output.put("error", ex.getMessage());
			}
			return output;
		}
	}

	public Map<String, Object> startLogin() {
		synchronized (lock) {
			requireDigitKey();
			PendingFlow flow = createAuthorizationFlow();
			pendingFlow = flow;
			callbackCode = "";
			callbackError = "";
			startCallbackServer(flow.state());
			return Map.of(
					"authorization_url", flow.url(),
					"callback_active", callbackServer != null,
					"status", status());
		}
	}

	public Map<String, Object> poll() {
		synchronized (lock) {
			requireDigitKey();
			boolean completed = false;
			if (!callbackError.isBlank()) {
				String message = callbackError;
				callbackError = "";
				throw new IllegalStateException(message);
			}
			if (pendingFlow != null && !callbackCode.isBlank()) {
				CodexCredentials credentials = exchangeAuthorizationCode(callbackCode, pendingFlow.verifier());
				saveCredentials(credentials, requireDigitKey());
				stopCallbackServer();
				pendingFlow = null;
				callbackCode = "";
				completed = true;
			}
			return Map.of("completed", completed, "status", status());
		}
	}

	public Map<String, Object> clear() {
		synchronized (lock) {
			stopCallbackServer();
			pendingFlow = null;
			callbackCode = "";
			callbackError = "";
			try {
				Files.deleteIfExists(tokenStorePath);
			} catch (IOException ex) {
				throw new IllegalStateException("Failed to delete OAuth token store", ex);
			}
			return status();
		}
	}

	public String chat(String message) {
		CodexCredentials credentials;
		synchronized (lock) {
			credentials = getFreshCredentials(requireDigitKey());
		}
		return callCodexResponse(credentials, message);
	}

	private Map<String, Object> baseStatus() {
		Map<String, Object> output = new LinkedHashMap<>();
		output.put("authorize_url", AUTHORIZE_URL);
		output.put("token_url", TOKEN_URL);
		output.put("redirect_uri", REDIRECT_URI);
		output.put("client_id", CLIENT_ID);
		output.put("token_store_path", tokenStorePath.toString());
		output.put("digit_key_store_path", digitKeyStorePath.toString());
		output.put("bootstrap_settings_path", bootstrapSettingsPath.toString());
		output.put("logged_in", false);
		output.put("token_valid", false);
		output.put("account_id", "");
		output.put("email", "");
		output.put("expires", 0);
		return output;
	}

	private CodexCredentials getFreshCredentials(String digitKey) {
		CodexCredentials credentials = loadCredentials(digitKey);
		if (credentials == null) {
			throw new IllegalStateException("No valid OAuth credentials are available. Start OAuth login first.");
		}
		if (!credentials.isExpired()) {
			return credentials;
		}
		CodexCredentials refreshed = refreshCredentials(credentials);
		saveCredentials(refreshed, digitKey);
		return refreshed;
	}

	private CodexCredentials loadCredentials(String digitKey) {
		try {
			if (Files.isRegularFile(tokenStorePath)) {
				Map<String, Object> stored = objectMapper.readValue(
						tokenStorePath.toFile(),
						new TypeReference<>() {
						});
				Map<String, Object> raw = tokenProtectService.unprotect(stored, digitKey);
				CodexCredentials credentials = CodexCredentials.from(raw);
				if (credentials != null) {
					if (!Boolean.TRUE.equals(stored.get("protected"))) {
						saveCredentials(credentials, digitKey);
					}
					return credentials;
				}
			}
			CodexCredentials bootstrapCredentials = loadBootstrapCredentials();
			if (bootstrapCredentials != null) {
				saveCredentials(bootstrapCredentials, digitKey);
			}
			return bootstrapCredentials;
		} catch (IOException ex) {
			throw new IllegalStateException("Failed to read OAuth token store", ex);
		}
	}

	private CodexCredentials loadBootstrapCredentials() {
		if (!Files.isRegularFile(bootstrapSettingsPath)) {
			return null;
		}
		try {
			Map<String, Object> settings = objectMapper.readValue(
					bootstrapSettingsPath.toFile(),
					new TypeReference<>() {
					});
			Object raw = settings.get("codex_oauth");
			if (raw instanceof Map<?, ?> map) {
				return CodexCredentials.from(toStringObjectMap(map));
			}
			return null;
		} catch (IOException ex) {
			return null;
		}
	}

	private void saveCredentials(CodexCredentials credentials, String digitKey) {
		try {
			Files.createDirectories(tokenStorePath.getParent());
			Map<String, Object> protectedStore = tokenProtectService.protect(credentials.toMap(), digitKey);
			objectMapper.writerWithDefaultPrettyPrinter().writeValue(tokenStorePath.toFile(), protectedStore);
		} catch (IOException ex) {
			throw new IllegalStateException("Failed to save OAuth token store", ex);
		}
	}

	private CodexCredentials exchangeAuthorizationCode(String code, String verifier) {
		Map<String, Object> payload = postForm(TOKEN_URL, Map.of(
				"grant_type", "authorization_code",
				"client_id", CLIENT_ID,
				"code", code,
				"code_verifier", verifier,
				"redirect_uri", REDIRECT_URI));
		String access = stringValue(payload.get("access_token"));
		String refresh = stringValue(payload.get("refresh_token"));
		int expiresIn = intValue(payload.get("expires_in"));
		if (access.isBlank() || refresh.isBlank() || expiresIn <= 0) {
			throw new IllegalStateException("Token exchange failed: missing fields in response");
		}
		return new CodexCredentials(
				access,
				refresh,
				Instant.now().getEpochSecond() + expiresIn,
				extractAccountId(access),
				extractEmail(access));
	}

	private CodexCredentials refreshCredentials(CodexCredentials credentials) {
		Map<String, Object> payload = postForm(TOKEN_URL, Map.of(
				"grant_type", "refresh_token",
				"refresh_token", credentials.refresh(),
				"client_id", CLIENT_ID));
		String access = stringValue(payload.get("access_token"));
		String refresh = stringValue(payload.getOrDefault("refresh_token", credentials.refresh()));
		int expiresIn = intValue(payload.get("expires_in"));
		if (access.isBlank() || refresh.isBlank() || expiresIn <= 0) {
			throw new IllegalStateException("Token refresh failed: missing fields in response");
		}
		return new CodexCredentials(
				access,
				refresh,
				Instant.now().getEpochSecond() + expiresIn,
				extractAccountId(access),
				firstNonBlank(extractEmail(access), credentials.email()));
	}

	private Map<String, Object> postForm(String url, Map<String, String> fields) {
		String body = formEncode(fields);
		HttpRequest request = HttpRequest.newBuilder(URI.create(url))
				.timeout(Duration.ofSeconds(40))
				.header("Content-Type", "application/x-www-form-urlencoded")
				.POST(HttpRequest.BodyPublishers.ofString(body))
				.build();
		try {
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new IllegalStateException("OAuth HTTP " + response.statusCode() + ": " + response.body());
			}
			return objectMapper.readValue(
					response.body(),
					new TypeReference<>() {
					});
		} catch (IOException ex) {
			throw new IllegalStateException("Failed to parse OAuth response", ex);
		} catch (InterruptedException ex) {
			Thread.currentThread().interrupt();
			throw new IllegalStateException("OAuth request interrupted", ex);
		}
	}

	private String callCodexResponse(CodexCredentials credentials, String message) {
		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("model", "gpt-5.4");
		payload.put("store", false);
		payload.put("stream", true);
		payload.put("input", List.of(Map.of(
				"role", "user",
				"content", List.of(Map.of("type", "input_text", "text", message)))));
		payload.put("text", Map.of("verbosity", "medium"));
		payload.put("tool_choice", "auto");
		payload.put("parallel_tool_calls", true);
		try {
			String requestBody = objectMapper.writeValueAsString(payload);
			HttpRequest request = HttpRequest.newBuilder(URI.create(CODEX_RESPONSES_URL))
					.timeout(Duration.ofSeconds(100))
					.header("Content-Type", "application/json")
					.header("Authorization", "Bearer " + credentials.access())
					.header("chatgpt-account-id", credentials.accountId())
					.header("originator", "pi")
					.header("OpenAI-Beta", "responses=experimental")
					.header("accept", "text/event-stream")
					.header("User-Agent", "ProjectCyanAdminOAuth/1.0")
					.POST(HttpRequest.BodyPublishers.ofString(requestBody))
					.build();
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new IllegalStateException("Codex HTTP " + response.statusCode() + ": " + response.body());
			}
			String text = parseSseText(response.body());
			return text.isBlank() ? "(empty response)" : text;
		} catch (IOException ex) {
			throw new IllegalStateException("Failed to call Codex response API", ex);
		} catch (InterruptedException ex) {
			Thread.currentThread().interrupt();
			throw new IllegalStateException("Codex request interrupted", ex);
		}
	}

	private String parseSseText(String body) throws IOException {
		StringBuilder output = new StringBuilder();
		JsonNode finalResponse = null;
		String eventType = "";
		for (String line : body.split("\\R")) {
			if (line.isBlank()) {
				eventType = "";
				continue;
			}
			if (line.startsWith("event:")) {
				eventType = line.substring(6).trim();
				continue;
			}
			if (!line.startsWith("data:")) {
				continue;
			}
			String dataText = line.substring(5).trim();
			if (dataText.isBlank() || "[DONE]".equals(dataText)) {
				continue;
			}
			JsonNode data = objectMapper.readTree(dataText);
			String kind = firstNonBlank(data.path("type").asText(""), eventType);
			if ("response.output_text.delta".equals(kind) || "response.refusal.delta".equals(kind)) {
				output.append(data.path("delta").asText(""));
				continue;
			}
			if ("error".equals(kind)) {
				throw new IllegalStateException("Codex error: " + dataText);
			}
			if ("response.failed".equals(kind)) {
				throw new IllegalStateException("Codex response failed: " + dataText);
			}
			if ("response.completed".equals(kind) || "response.done".equals(kind) || "response.incomplete".equals(kind)) {
				finalResponse = data.path("response");
			}
		}
		if (output.isEmpty() && finalResponse != null && finalResponse.isObject()) {
			for (JsonNode item : finalResponse.path("output")) {
				if (!"message".equals(item.path("type").asText())) {
					continue;
				}
				for (JsonNode content : item.path("content")) {
					if ("output_text".equals(content.path("type").asText())) {
						output.append(content.path("text").asText(""));
					} else if ("refusal".equals(content.path("type").asText())) {
						output.append(content.path("refusal").asText(""));
					}
				}
			}
		}
		return output.toString().trim();
	}

	private PendingFlow createAuthorizationFlow() {
		String verifier = randomUrlToken(32);
		String challenge = base64Url(sha256(verifier.getBytes(StandardCharsets.UTF_8)));
		String state = randomHex(16);
		String url = AUTHORIZE_URL + "?" + formEncode(Map.of(
				"response_type", "code",
				"client_id", CLIENT_ID,
				"redirect_uri", REDIRECT_URI,
				"scope", SCOPE,
				"code_challenge", challenge,
				"code_challenge_method", "S256",
				"state", state,
				"id_token_add_organizations", "true",
				"codex_cli_simplified_flow", "true",
				"originator", "pi"));
		return new PendingFlow(verifier, state, url);
	}

	private void startCallbackServer(String expectedState) {
		stopCallbackServer();
		try {
			HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 1455), 0);
			server.createContext("/auth/callback", exchange -> {
				String html;
				int status = 200;
				try {
					Map<String, String> query = parseQuery(exchange.getRequestURI().getRawQuery());
					String state = stringValue(query.get("state"));
					String code = stringValue(query.get("code"));
					String error = stringValue(query.get("error"));
					synchronized (lock) {
						if (!error.isBlank()) {
							callbackError = "OAuth error: " + error;
							status = 400;
							html = "<h3>Authentication failed.</h3>";
						} else if (!Objects.equals(expectedState, state)) {
							callbackError = "OAuth state mismatch";
							status = 400;
							html = "<h3>OAuth state mismatch.</h3>";
						} else if (code.isBlank()) {
							callbackError = "Missing authorization code";
							status = 400;
							html = "<h3>Missing authorization code.</h3>";
						} else {
							callbackCode = code;
							html = "<h3>OpenAI authentication completed. You can close this window.</h3>";
						}
					}
				} catch (Exception ex) {
					synchronized (lock) {
						callbackError = ex.getMessage();
					}
					status = 500;
					html = "<h3>OAuth callback failed.</h3>";
				}
				byte[] response = html.getBytes(StandardCharsets.UTF_8);
				exchange.getResponseHeaders().add("Content-Type", "text/html; charset=utf-8");
				exchange.sendResponseHeaders(status, response.length);
				try (OutputStream body = exchange.getResponseBody()) {
					body.write(response);
				}
			});
			server.setExecutor(Executors.newSingleThreadExecutor());
			server.start();
			callbackServer = server;
		} catch (IOException ex) {
			callbackServer = null;
			throw new IllegalStateException("Failed to start OAuth callback server on " + REDIRECT_URI, ex);
		}
	}

	private void stopCallbackServer() {
		if (callbackServer != null) {
			callbackServer.stop(0);
			callbackServer = null;
		}
	}

	private String requireDigitKey() {
		String digitKey = digitKeyOrBlank();
		if (digitKey.isBlank()) {
			throw new IllegalStateException(TOKEN_KEY_ENV + " is required before OAuth token store access");
		}
		return digitKey;
	}

	private String digitKeyOrBlank() {
		String candidate = firstNonBlank(runtimeDigitKey, System.getenv(TOKEN_KEY_ENV), loadStoredDigitKey());
		if (candidate.isBlank()) {
			return "";
		}
		String validated = tokenProtectService.validateDigitKey(candidate);
		if (runtimeDigitKey.isBlank()) {
			runtimeDigitKey = validated;
		}
		return validated;
	}

	private void saveDigitKey(String digitKey) {
		try {
			Files.createDirectories(digitKeyStorePath.getParent());
			Files.writeString(digitKeyStorePath, digitKey, StandardCharsets.UTF_8);
		} catch (IOException ex) {
			throw new IllegalStateException("Failed to save OAuth digit key", ex);
		}
	}

	private String loadStoredDigitKey() {
		try {
			if (!Files.isRegularFile(digitKeyStorePath)) {
				return "";
			}
			return Files.readString(digitKeyStorePath, StandardCharsets.UTF_8).trim();
		} catch (IOException ex) {
			throw new IllegalStateException("Failed to read OAuth digit key", ex);
		}
	}

	private Path resolveWorkspaceRoot() {
		Path userDir = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
		Path current = userDir;
		while (current != null) {
			if (Files.isDirectory(current.resolve("project-cyan")) && Files.isDirectory(current.resolve("individual"))) {
				return current;
			}
			if ("project-cyan".equalsIgnoreCase(String.valueOf(current.getFileName())) && current.getParent() != null) {
				return current.getParent();
			}
			current = current.getParent();
		}
		return userDir;
	}

	private String formEncode(Map<String, String> fields) {
		List<String> parts = new ArrayList<>();
		for (Map.Entry<String, String> entry : fields.entrySet()) {
			parts.add(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8)
					+ "="
					+ URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
		}
		return String.join("&", parts);
	}

	private Map<String, String> parseQuery(String rawQuery) {
		Map<String, String> output = new LinkedHashMap<>();
		if (rawQuery == null || rawQuery.isBlank()) {
			return output;
		}
		for (String part : rawQuery.split("&")) {
			String[] pieces = part.split("=", 2);
			String key = URLDecoder.decode(pieces[0], StandardCharsets.UTF_8);
			String value = pieces.length > 1 ? URLDecoder.decode(pieces[1], StandardCharsets.UTF_8) : "";
			output.put(key, value);
		}
		return output;
	}

	private String extractAccountId(String accessToken) {
		Map<String, Object> payload = decodeJwtPayload(accessToken);
		Object auth = payload.get(JWT_AUTH_CLAIM);
		if (auth instanceof Map<?, ?> map) {
			String accountId = stringValue(map.get("chatgpt_account_id"));
			if (!accountId.isBlank()) {
				return accountId;
			}
		}
		throw new IllegalStateException("Failed to extract accountId from token");
	}

	private String extractEmail(String accessToken) {
		Map<String, Object> payload = decodeJwtPayload(accessToken);
		return stringValue(payload.get(JWT_EMAIL_CLAIM)).trim();
	}

	private Map<String, Object> decodeJwtPayload(String token) {
		String[] parts = token.split("\\.");
		if (parts.length != 3) {
			return Map.of();
		}
		try {
			byte[] decoded = Base64.getUrlDecoder().decode(parts[1] + "=".repeat((4 - parts[1].length() % 4) % 4));
			return objectMapper.readValue(
					new String(decoded, StandardCharsets.UTF_8),
					new TypeReference<>() {
					});
		} catch (IOException | IllegalArgumentException ex) {
			return Map.of();
		}
	}

	private String randomUrlToken(int byteLength) {
		byte[] bytes = new byte[byteLength];
		secureRandom.nextBytes(bytes);
		return base64Url(bytes);
	}

	private String randomHex(int byteLength) {
		byte[] bytes = new byte[byteLength];
		secureRandom.nextBytes(bytes);
		StringBuilder builder = new StringBuilder(byteLength * 2);
		for (byte b : bytes) {
			builder.append(String.format("%02x", b));
		}
		return builder.toString();
	}

	private byte[] sha256(byte[] value) {
		try {
			return MessageDigest.getInstance("SHA-256").digest(value);
		} catch (Exception ex) {
			throw new IllegalStateException("Failed to hash OAuth verifier", ex);
		}
	}

	private String base64Url(byte[] value) {
		return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
	}

	private Map<String, Object> toStringObjectMap(Map<?, ?> source) {
		Map<String, Object> output = new LinkedHashMap<>();
		for (Map.Entry<?, ?> entry : source.entrySet()) {
			output.put(String.valueOf(entry.getKey()), entry.getValue());
		}
		return output;
	}

	private static String firstNonBlank(String... values) {
		for (String value : values) {
			if (value != null && !value.isBlank()) {
				return value;
			}
		}
		return "";
	}

	private static String stringValue(Object value) {
		return value == null ? "" : String.valueOf(value);
	}

	private static int intValue(Object value) {
		if (value instanceof Number number) {
			return number.intValue();
		}
		try {
			return Integer.parseInt(stringValue(value));
		} catch (NumberFormatException ex) {
			return 0;
		}
	}

	private record PendingFlow(String verifier, String state, String url) {
	}

	private record CodexCredentials(String access, String refresh, long expires, String accountId, String email) {

		private boolean isExpired() {
			return expires <= Instant.now().getEpochSecond() + TOKEN_REFRESH_SKEW_SECONDS;
		}

		private Map<String, Object> toMap() {
			Map<String, Object> output = new LinkedHashMap<>();
			output.put("access", access);
			output.put("refresh", refresh);
			output.put("expires", expires);
			output.put("account_id", accountId);
			output.put("email", email);
			return output;
		}

		private static CodexCredentials from(Map<String, Object> source) {
			String access = stringValue(source.get("access")).trim();
			String refresh = stringValue(source.get("refresh")).trim();
			String accountId = stringValue(source.get("account_id")).trim();
			if (access.isBlank() || refresh.isBlank() || accountId.isBlank()) {
				return null;
			}
			long expires;
			try {
				expires = Long.parseLong(stringValue(source.get("expires")));
			} catch (NumberFormatException ex) {
				return null;
			}
			return new CodexCredentials(access, refresh, expires, accountId, stringValue(source.get("email")).trim());
		}
	}
}
