package com.projectcyan.storage;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.projectcyan.admin.SupabaseUsageCounter;

@Service
public class SupabaseStorageService {

	private static final String FOLDER_PLACEHOLDER_FILE = ".keep";

	private final SupabaseStorageProperties properties;
	private final RestClient restClient;
	private final SupabaseUsageCounter supabaseUsageCounter;

	public SupabaseStorageService(SupabaseStorageProperties properties, SupabaseUsageCounter supabaseUsageCounter) {
		this.properties = properties;
		this.supabaseUsageCounter = supabaseUsageCounter;
		this.restClient = RestClient.create();
	}

	public List<SupabaseStorageBucket> listBuckets() {
		validateConfigured();
		try {
			List<SupabaseStorageBucket> buckets = restClient.get()
				.uri(storageUrl("/bucket"))
				.headers(this::applyAuthHeaders)
				.retrieve()
				.body(new ParameterizedTypeReference<>() {
				});
			if (buckets == null) {
				return List.of();
			}
			return buckets.stream()
				.sorted(Comparator.comparing(bucket -> bucket.name() == null ? "" : bucket.name()))
				.toList();
		} catch (RestClientResponseException exception) {
			throw storageException("Bucket list request failed.", exception);
		}
	}

	public String createBucket(String bucketName, boolean publicBucket) {
		validateConfigured();
		String normalizedBucketName = normalizeBucketName(bucketName);
		try {
			restClient.post()
				.uri(storageUrl("/bucket"))
				.headers(headers -> {
					applyAuthHeaders(headers);
					headers.setContentType(MediaType.APPLICATION_JSON);
				})
				.body(Map.of(
					"id", normalizedBucketName,
					"name", normalizedBucketName,
					"public", publicBucket
				))
				.retrieve()
				.toBodilessEntity();
			supabaseUsageCounter.recordWrite("스토리지 버킷 생성");
			return normalizedBucketName;
		} catch (RestClientResponseException exception) {
			if (exception.getStatusCode().value() == 409) {
				throw new SupabaseStorageException("Bucket already exists.");
			}
			throw storageException("Bucket create request failed.", exception);
		}
	}

	public String createFolderPath(String bucketName, String path) {
		validateConfigured();
		String normalizedBucketName = normalizeBucketName(bucketName);
		String normalizedPath = normalizeFolderPath(path);
		try {
			restClient.post()
				.uri(storageUrl("/object/" + encodeObjectPath(normalizedBucketName, normalizedPath, FOLDER_PLACEHOLDER_FILE)))
				.headers(headers -> {
					applyAuthHeaders(headers);
					headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
					headers.set("x-upsert", "true");
				})
				.body(new byte[0])
				.retrieve()
				.toBodilessEntity();
			supabaseUsageCounter.recordWrite("스토리지 경로 생성");
			return normalizedPath;
		} catch (RestClientResponseException exception) {
			throw storageException("Path create request failed.", exception);
		}
	}

	private void validateConfigured() {
		if (!StringUtils.hasText(properties.getProjectUrl()) || !StringUtils.hasText(properties.getServiceRoleKey())) {
			throw new SupabaseStorageException("Supabase storage is not configured.");
		}
	}

	private String normalizeBucketName(String bucketName) {
		if (!StringUtils.hasText(bucketName)) {
			throw new SupabaseStorageException("Bucket name is required.");
		}
		return bucketName.trim().toLowerCase();
	}

	private String normalizeFolderPath(String path) {
		if (!StringUtils.hasText(path)) {
			throw new SupabaseStorageException("Path is required.");
		}
		if (path.contains("\\")) {
			throw new SupabaseStorageException("Path cannot contain backslashes.");
		}

		String normalizedPath = path.trim().replaceAll("^/+", "").replaceAll("/+$", "");
		if (!StringUtils.hasText(normalizedPath)) {
			throw new SupabaseStorageException("Path is required.");
		}

		for (String segment : normalizedPath.split("/", -1)) {
			if (!StringUtils.hasText(segment)) {
				throw new SupabaseStorageException("Path cannot contain empty segments.");
			}
			if ("..".equals(segment)) {
				throw new SupabaseStorageException("Path cannot contain parent directory segments.");
			}
		}
		return normalizedPath;
	}

	private void applyAuthHeaders(org.springframework.http.HttpHeaders headers) {
		headers.setBearerAuth(properties.getServiceRoleKey());
		headers.set("apikey", properties.getServiceRoleKey());
	}

	private SupabaseStorageException storageException(String fallbackMessage, RestClientResponseException exception) {
		String responseBody = exception.getResponseBodyAsString();
		String message = StringUtils.hasText(responseBody) ? responseBody : fallbackMessage;
		return new SupabaseStorageException(message, exception);
	}

	private String encodeObjectPath(String bucketName, String path, String fileName) {
		return encodeSegment(bucketName) + "/" + pathSegments(path) + "/" + encodeSegment(fileName);
	}

	private String pathSegments(String path) {
		return List.of(path.split("/")).stream()
			.map(this::encodeSegment)
			.reduce((left, right) -> left + "/" + right)
			.orElse("");
	}

	private String encodeSegment(String segment) {
		return URLEncoder.encode(segment, StandardCharsets.UTF_8).replace("+", "%20");
	}

	private String storageUrl(String path) {
		return properties.getProjectUrl().replaceAll("/+$", "") + "/storage/v1" + path;
	}
}
