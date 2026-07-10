package com.projectcyan.member;

import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class SupabaseAuthClient {

	private final SupabaseAuthProperties properties;
	private final RestClient restClient;

	public SupabaseAuthClient(SupabaseAuthProperties properties) {
		this.properties = properties;
		this.restClient = RestClient.create();
	}

	public SupabaseAuthUser createUser(SignupRequest request) {
		validateConfigured();
		try {
			Map<?, ?> response = restClient.post()
				.uri(authUrl("/admin/users"))
				.headers(headers -> {
					applyAuthHeaders(headers);
					headers.setContentType(MediaType.APPLICATION_JSON);
				})
				.body(Map.of(
					"email", request.email(),
					"password", request.password(),
					"email_confirm", true,
					"user_metadata", Map.of(
						"name", request.name(),
						"phone", request.phone()
					)
				))
				.retrieve()
				.body(Map.class);

			if (response == null || response.get("id") == null) {
				throw new SupabaseAuthException("Supabase Auth user id was not returned.", 502);
			}

			return new SupabaseAuthUser(
				UUID.fromString(response.get("id").toString()),
				response.get("email") == null ? request.email() : response.get("email").toString()
			);
		} catch (RestClientResponseException exception) {
			throw authException(exception);
		}
	}

	public void deleteUser(UUID userId) {
		validateConfigured();
		try {
			restClient.delete()
				.uri(authUrl("/admin/users/" + userId))
				.headers(this::applyAuthHeaders)
				.retrieve()
				.toBodilessEntity();
		} catch (RestClientResponseException exception) {
			throw authException(exception);
		}
	}

	public void updateUserPassword(UUID userId, String password) {
		validateConfigured();
		try {
			restClient.put()
				.uri(authUrl("/admin/users/" + userId))
				.headers(headers -> {
					applyAuthHeaders(headers);
					headers.setContentType(MediaType.APPLICATION_JSON);
				})
				.body(Map.of("password", password))
				.retrieve()
				.toBodilessEntity();
		} catch (RestClientResponseException exception) {
			throw authException(exception);
		}
	}

	private void validateConfigured() {
		if (!StringUtils.hasText(properties.getProjectUrl()) || !StringUtils.hasText(properties.getServiceRoleKey())) {
			throw new SupabaseAuthException("Supabase Auth is not configured.", 500);
		}
	}

	private void applyAuthHeaders(org.springframework.http.HttpHeaders headers) {
		headers.setBearerAuth(properties.getServiceRoleKey());
		headers.set("apikey", properties.getServiceRoleKey());
	}

	private String authUrl(String path) {
		return properties.getProjectUrl().replaceAll("/+$", "") + "/auth/v1" + path;
	}

	private SupabaseAuthException authException(RestClientResponseException exception) {
		String responseBody = exception.getResponseBodyAsString();
		return new SupabaseAuthException(
			authErrorMessage(responseBody),
			exception.getStatusCode().value(),
			responseBody
		);
	}

	private String authErrorMessage(String responseBody) {
		if (!StringUtils.hasText(responseBody)) {
			return "Supabase Auth request failed.";
		}
		try {
			String message = jsonStringValue(responseBody, "msg");
			if (!StringUtils.hasText(message)) {
				message = jsonStringValue(responseBody, "message");
			}
			return StringUtils.hasText(message) ? message : responseBody;
		} catch (Exception ignored) {
			return responseBody;
		}
	}

	private String jsonStringValue(String json, String key) {
		Matcher matcher = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"([^\"]*)\"").matcher(json);
		return matcher.find() ? matcher.group(1) : "";
	}
}
