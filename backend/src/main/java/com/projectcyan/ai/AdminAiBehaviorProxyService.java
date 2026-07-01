package com.projectcyan.ai;

import com.projectcyan.ai.AdminAiBehaviorRunService.BehaviorRunRequest;
import java.net.http.HttpClient;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
public class AdminAiBehaviorProxyService {

	private final RestClient restClient;
	private final String aiBaseUrl;
	private final String serviceToken;

	public AdminAiBehaviorProxyService(
		@Value("${project-cyan.ai-service.base-url:http://127.0.0.1:8000}") String aiBaseUrl,
		@Value("${project-cyan.ai-service.internal-token:}") String serviceToken
	) {
		HttpClient httpClient = HttpClient.newBuilder()
			.version(HttpClient.Version.HTTP_1_1)
			.build();
		this.restClient = RestClient.builder()
			.requestFactory(new JdkClientHttpRequestFactory(httpClient))
			.build();
		this.aiBaseUrl = aiBaseUrl.replaceAll("/+$", "");
		this.serviceToken = serviceToken;
	}

	public Map<String, Object> run(BehaviorRunRequest request) {
		try {
			Map<String, Object> response = restClient.post()
				.uri(aiBaseUrl + "/internal/admin/behavior/trace")
				.contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_JSON)
				.headers(headers -> {
					if (StringUtils.hasText(serviceToken)) {
						headers.set("X-Project-Cyan-Service-Token", serviceToken);
					}
				})
				.body(request)
				.retrieve()
				.body(new ParameterizedTypeReference<>() {
				});
			if (response == null) {
				throw new IllegalStateException("FastAPI behavior trace response is empty.");
			}
			return response;
		} catch (RestClientResponseException exception) {
			throw new IllegalStateException("FastAPI behavior trace failed: " + exception.getResponseBodyAsString(), exception);
		}
	}

	public Map<String, Object> testConnection(Long profileId) {
		try {
			Map<String, Object> response = restClient.post()
				.uri(aiBaseUrl + "/internal/admin/model-connections/test")
				.contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_JSON)
				.headers(headers -> {
					if (StringUtils.hasText(serviceToken)) {
						headers.set("X-Project-Cyan-Service-Token", serviceToken);
					}
				})
				.body(Map.of("profileId", profileId))
				.retrieve()
				.body(new ParameterizedTypeReference<>() { });
			if (response == null) {
				throw new IllegalStateException("FastAPI connection test response is empty.");
			}
			return response;
		} catch (RestClientResponseException exception) {
			throw new IllegalStateException("FastAPI connection test failed: " + exception.getResponseBodyAsString(), exception);
		}
	}
}
