package com.projectcyan.storage;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;

import com.projectcyan.admin.SupabaseUsageCounter;

@Service
public class SupabaseStorageService {

	private static final String FOLDER_PLACEHOLDER_FILE = ".keep";
	private static final int MAX_LIST_DEPTH = 6;
	private static final Set<String> IMAGE_EXTENSIONS = Set.of(
		"avif", "gif", "jpeg", "jpg", "png", "svg", "webp"
	);

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
			throw storageException("Bucket 목록 요청에 실패했습니다.", exception);
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
			supabaseUsageCounter.recordWrite("Storage Bucket 생성");
			return normalizedBucketName;
		} catch (RestClientResponseException exception) {
			if (exception.getStatusCode().value() == 409) {
				throw new SupabaseStorageException("이미 존재하는 Bucket입니다.");
			}
			throw storageException("Bucket 생성 요청에 실패했습니다.", exception);
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
			supabaseUsageCounter.recordWrite("Storage Path 생성");
			return normalizedPath;
		} catch (RestClientResponseException exception) {
			throw storageException("Path 생성 요청에 실패했습니다.", exception);
		}
	}

	public SupabaseStorageObject uploadObject(
		String bucketName,
		String path,
		MultipartFile file,
		boolean upsert
	) {
		return uploadObject(bucketName, path, null, file, upsert);
	}

	public SupabaseStorageObject uploadObject(
		String bucketName,
		String path,
		String relativePath,
		MultipartFile file,
		boolean upsert
	) {
		validateConfigured();
		String normalizedBucketName = normalizeBucketName(bucketName);
		String normalizedPath = normalizeOptionalFolderPath(path);
		String relativeObjectPath = normalizeRelativeObjectPath(relativePath, file);
		String objectPath = joinObjectPath(normalizedPath, relativeObjectPath);
		return uploadObjectToPath(normalizedBucketName, objectPath, file, upsert);
	}

	public SupabaseStorageObject uploadTextObject(
		String bucketName,
		String path,
		String fileName,
		String content,
		MediaType mediaType,
		boolean upsert
	) {
		validateConfigured();
		String normalizedBucketName = normalizeBucketName(bucketName);
		String normalizedPath = normalizeOptionalFolderPath(path);
		String normalizedFileName = normalizeObjectFileName(fileName);
		String objectPath = joinObjectPath(normalizedPath, normalizedFileName);
		try {
			restClient.post()
				.uri(storageUrl("/object/" + encodeObjectPath(normalizedBucketName, objectPath)))
				.headers(headers -> {
					applyAuthHeaders(headers);
					headers.setContentType(mediaType == null ? MediaType.TEXT_PLAIN : mediaType);
					headers.set("cache-control", "300");
					if (upsert) {
						headers.set("x-upsert", "true");
					}
				})
				.body(content == null ? new byte[0] : content.getBytes(StandardCharsets.UTF_8))
				.retrieve()
				.toBodilessEntity();
			supabaseUsageCounter.recordWrite("Storage 텍스트 업로드");
			return new SupabaseStorageObject(
				normalizedBucketName,
				objectPath,
				normalizedFileName,
				publicObjectUrl(normalizedBucketName, objectPath),
				content == null ? 0 : (long) content.getBytes(StandardCharsets.UTF_8).length,
				null
			);
		} catch (RestClientResponseException exception) {
			throw storageException("텍스트 object 업로드 요청에 실패했습니다.", exception);
		}
	}

	public String createSignedObjectUrl(String bucketName, String objectPath, long expiresInSeconds) {
		validateConfigured();
		String normalizedBucketName = normalizeBucketName(bucketName);
		String normalizedObjectPath = normalizeFolderPath(objectPath);
		try {
			Map<String, Object> response = restClient.post()
				.uri(storageUrl("/object/sign/" + encodeObjectPath(normalizedBucketName, normalizedObjectPath)))
				.headers(headers -> {
					applyAuthHeaders(headers);
					headers.setContentType(MediaType.APPLICATION_JSON);
				})
				.body(Map.of("expiresIn", Math.max(1, expiresInSeconds)))
				.retrieve()
				.body(new ParameterizedTypeReference<>() {
				});
			Object signedUrl = response == null ? null : firstPresent(response, "signedURL", "signedUrl", "url");
			if (signedUrl == null || !StringUtils.hasText(signedUrl.toString())) {
				throw new SupabaseStorageException("signed URL 응답이 비어 있습니다.");
			}
			String signedUrlText = signedUrl.toString();
			if (signedUrlText.startsWith("http://") || signedUrlText.startsWith("https://")) {
				return signedUrlText;
			}
			return properties.getProjectUrl().replaceAll("/+$", "") + "/storage/v1" + signedUrlText;
		} catch (RestClientResponseException exception) {
			throw storageException("signed URL 생성 요청에 실패했습니다.", exception);
		}
	}

	public SupabaseStorageObject uploadObjectBySizePolicy(
		String bucketName,
		String path,
		String relativePath,
		MultipartFile file,
		boolean allowSmallerOverwrite
	) {
		validateConfigured();
		String normalizedBucketName = normalizeBucketName(bucketName);
		String normalizedPath = normalizeOptionalFolderPath(path);
		String relativeObjectPath = normalizeRelativeObjectPath(relativePath, file);
		String objectPath = joinObjectPath(normalizedPath, relativeObjectPath);
		SupabaseStorageObject existingObject = findObject(normalizedBucketName, objectPath);

		if (existingObject != null && existingObject.size() != null) {
			long incomingSize = file.getSize();
			long existingSize = existingObject.size();
			if (incomingSize == existingSize) {
				return uploadObjectToPath(normalizedBucketName, objectPath, file, true);
			}
			if (incomingSize > existingSize) {
				String copyPath = nextCopyObjectPath(normalizedBucketName, objectPath);
				return uploadObjectToPath(normalizedBucketName, copyPath, file, false);
			}
			if (!allowSmallerOverwrite) {
				throw new SupabaseStorageConflictException(
					"기존 파일보다 byte 수가 작습니다. 덮어쓸지 확인이 필요합니다.",
					normalizedBucketName,
					objectPath,
					objectFileName(objectPath),
					"SMALLER_THAN_EXISTING",
					existingSize,
					incomingSize
				);
			}
		}

		return uploadObjectToPath(normalizedBucketName, objectPath, file, true);
	}

	private SupabaseStorageObject uploadObjectToPath(
		String normalizedBucketName,
		String objectPath,
		MultipartFile file,
		boolean upsert
	) {
		String objectName = objectFileName(objectPath);
		try {
			restClient.post()
				.uri(storageUrl("/object/" + encodeObjectPath(normalizedBucketName, objectPath)))
				.headers(headers -> {
					applyAuthHeaders(headers);
					headers.setContentType(contentType(file));
					headers.set("cache-control", "3600");
					if (upsert) {
						headers.set("x-upsert", "true");
					}
				})
				.body(file.getBytes())
				.retrieve()
				.toBodilessEntity();
			supabaseUsageCounter.recordWrite("Storage 이미지 업로드");
			return new SupabaseStorageObject(
				normalizedBucketName,
				objectPath,
				objectName,
				publicObjectUrl(normalizedBucketName, objectPath),
				file.getSize(),
				null
			);
		} catch (IOException exception) {
			throw new SupabaseStorageException("업로드 파일을 읽을 수 없습니다.", exception);
		} catch (RestClientResponseException exception) {
			throw storageException("object 업로드 요청에 실패했습니다.", exception);
		}
	}

	private SupabaseStorageObject findObject(String bucketName, String objectPath) {
		String parentPath = parentObjectPath(objectPath);
		String objectName = objectFileName(objectPath);
		return listObjectRows(bucketName, parentPath, 1000).stream()
			.filter(row -> objectName.equals(row.name()))
			.findFirst()
			.map(row -> new SupabaseStorageObject(
				bucketName,
				objectPath,
				row.name(),
				publicObjectUrl(bucketName, objectPath),
				metadataSize(row.metadata()),
				row.updatedAt()
			))
			.orElse(null);
	}

	private String nextCopyObjectPath(String bucketName, String objectPath) {
		for (int index = 2; index < 10000; index++) {
			String candidatePath = copyObjectPath(objectPath, index);
			if (findObject(bucketName, candidatePath) == null) {
				return candidatePath;
			}
		}
		throw new SupabaseStorageException("사용 가능한 중복 파일명을 찾을 수 없습니다.");
	}

	private String copyObjectPath(String objectPath, int index) {
		String parentPath = parentObjectPath(objectPath);
		String objectName = objectFileName(objectPath);
		String extension = StringUtils.getFilenameExtension(objectName);
		String baseName = extension == null
			? objectName
			: objectName.substring(0, objectName.length() - extension.length() - 1);
		String copyName = extension == null
			? baseName + " (" + index + ")"
			: baseName + " (" + index + ")." + extension;
		return StringUtils.hasText(parentPath) ? parentPath + "/" + copyName : copyName;
	}

	public List<SupabaseStorageObject> listImageObjects(String bucketName, String path, int limit) {
		validateConfigured();
		String normalizedBucketName = normalizeBucketName(bucketName);
		String normalizedPath = normalizeOptionalFolderPath(path);
		int safeLimit = Math.max(1, Math.min(limit, 1000));
		try {
			List<SupabaseStorageObject> objects = new ArrayList<>();
			collectImageObjects(normalizedBucketName, normalizedPath, objects, safeLimit, 0);
			return objects;
		} catch (RestClientResponseException exception) {
			throw storageException("object 목록 요청에 실패했습니다.", exception);
		}
	}

	private void collectImageObjects(
		String bucketName,
		String path,
		List<SupabaseStorageObject> objects,
		int limit,
		int depth
	) {
		if (objects.size() >= limit || depth > MAX_LIST_DEPTH) {
			return;
		}

		int remaining = Math.max(1, limit - objects.size());
		for (StorageObjectRow row : listObjectRows(bucketName, path, remaining)) {
			if (objects.size() >= limit || row.name() == null || FOLDER_PLACEHOLDER_FILE.equals(row.name())) {
				continue;
			}

			String objectPath = joinObjectPath(path, row.name());
			if (isImageName(row.name())) {
				objects.add(new SupabaseStorageObject(
					bucketName,
					objectPath,
					row.name(),
					publicObjectUrl(bucketName, objectPath),
					metadataSize(row.metadata()),
					row.updatedAt()
				));
			} else {
				collectImageObjects(bucketName, objectPath, objects, limit, depth + 1);
			}
		}
	}

	private List<StorageObjectRow> listObjectRows(String bucketName, String path, int limit) {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("limit", Math.max(1, Math.min(limit, 1000)));
		body.put("offset", 0);
		body.put("sortBy", Map.of("column", "name", "order", "asc"));
		if (StringUtils.hasText(path)) {
			body.put("prefix", path);
		}

		List<StorageObjectRow> objects = restClient.post()
			.uri(storageUrl("/object/list/" + encodeSegment(bucketName)))
			.headers(headers -> {
				applyAuthHeaders(headers);
				headers.setContentType(MediaType.APPLICATION_JSON);
			})
			.body(body)
			.retrieve()
			.body(new ParameterizedTypeReference<>() {
			});
		return objects == null ? List.of() : objects;
	}

	private void validateConfigured() {
		if (!StringUtils.hasText(properties.getProjectUrl()) || !StringUtils.hasText(properties.getServiceRoleKey())) {
			throw new SupabaseStorageException("Supabase Storage 설정이 없습니다.");
		}
	}

	private String normalizeBucketName(String bucketName) {
		if (!StringUtils.hasText(bucketName)) {
			throw new SupabaseStorageException("Bucket 이름은 필수입니다.");
		}
		return bucketName.trim().toLowerCase();
	}

	private String normalizeFolderPath(String path) {
		if (!StringUtils.hasText(path)) {
			throw new SupabaseStorageException("Path는 필수입니다.");
		}
		if (path.contains("\\")) {
			throw new SupabaseStorageException("Path에는 백슬래시를 사용할 수 없습니다.");
		}

		String normalizedPath = path.trim().replaceAll("^/+", "").replaceAll("/+$", "");
		if (!StringUtils.hasText(normalizedPath)) {
			throw new SupabaseStorageException("Path는 필수입니다.");
		}

		for (String segment : normalizedPath.split("/", -1)) {
			validateObjectPathSegment(segment, "Path");
		}
		return normalizedPath;
	}

	private String normalizeOptionalFolderPath(String path) {
		if (!StringUtils.hasText(path)) {
			return "";
		}
		return normalizeFolderPath(path);
	}

	private String normalizeRelativeObjectPath(String relativePath, MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new SupabaseStorageException("업로드 파일은 필수입니다.");
		}

		String objectPath = StringUtils.hasText(relativePath)
			? relativePath.trim().replace('\\', '/')
			: StringUtils.getFilename(file.getOriginalFilename());
		if (!StringUtils.hasText(objectPath)) {
			throw new SupabaseStorageException("업로드 파일명은 필수입니다.");
		}

		String normalizedPath = objectPath.replaceAll("^/+", "").replaceAll("/+$", "");
		if (!StringUtils.hasText(normalizedPath)) {
			throw new SupabaseStorageException("업로드 파일명은 필수입니다.");
		}

		List<String> normalizedSegments = new ArrayList<>();
		for (String segment : normalizedPath.split("/", -1)) {
			validateObjectPathSegment(segment, "업로드 Path");
			normalizedSegments.add(segment.trim().replaceAll("\\s+", "-"));
		}

		String normalizedObjectPath = String.join("/", normalizedSegments);
		String objectName = objectFileName(normalizedObjectPath);
		if (!isImageName(objectName)) {
			throw new SupabaseStorageException("이미지 파일만 업로드할 수 있습니다.");
		}
		return normalizedObjectPath;
	}

	private String normalizeObjectFileName(String fileName) {
		if (!StringUtils.hasText(fileName)) {
			throw new SupabaseStorageException("업로드 파일명은 필수입니다.");
		}
		String normalizedFileName = fileName.trim().replace('\\', '/').replaceAll("^/+", "").replaceAll("/+$", "");
		if (normalizedFileName.contains("/")) {
			throw new SupabaseStorageException("파일명에는 경로 구분자를 사용할 수 없습니다.");
		}
		validateObjectPathSegment(normalizedFileName, "업로드 파일명");
		return normalizedFileName;
	}

	private void validateObjectPathSegment(String segment, String fieldName) {
		if (!StringUtils.hasText(segment)) {
			throw new SupabaseStorageException(fieldName + "에는 빈 경로 조각을 사용할 수 없습니다.");
		}
		String normalizedSegment = segment.trim();
		if (".".equals(normalizedSegment) || "..".equals(normalizedSegment)) {
			throw new SupabaseStorageException(fieldName + "에는 상대 디렉터리 조각을 사용할 수 없습니다.");
		}
		if (normalizedSegment.contains("\\") || normalizedSegment.contains("\u0000")) {
			throw new SupabaseStorageException(fieldName + "에 사용할 수 없는 문자가 있습니다.");
		}
	}

	private MediaType contentType(MultipartFile file) {
		String contentType = file.getContentType();
		if (!StringUtils.hasText(contentType)) {
			return MediaType.APPLICATION_OCTET_STREAM;
		}
		try {
			return MediaType.parseMediaType(contentType);
		} catch (IllegalArgumentException exception) {
			return MediaType.APPLICATION_OCTET_STREAM;
		}
	}

	private boolean isImageName(String fileName) {
		String extension = StringUtils.getFilenameExtension(fileName);
		return extension != null && IMAGE_EXTENSIONS.contains(extension.toLowerCase());
	}

	private String joinObjectPath(String path, String fileName) {
		return StringUtils.hasText(path) ? path + "/" + fileName : fileName;
	}

	private String objectFileName(String objectPath) {
		int separatorIndex = objectPath.lastIndexOf('/');
		return separatorIndex >= 0 ? objectPath.substring(separatorIndex + 1) : objectPath;
	}

	private String parentObjectPath(String objectPath) {
		int separatorIndex = objectPath.lastIndexOf('/');
		return separatorIndex >= 0 ? objectPath.substring(0, separatorIndex) : "";
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

	private String encodeObjectPath(String bucketName, String objectPath) {
		return encodeSegment(bucketName) + "/" + pathSegments(objectPath);
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

	private String publicObjectUrl(String bucketName, String objectPath) {
		return properties.getProjectUrl().replaceAll("/+$", "")
			+ "/storage/v1/object/public/"
			+ encodeSegment(bucketName)
			+ "/"
			+ pathSegments(objectPath);
	}

	private Long metadataSize(Map<String, Object> metadata) {
		if (metadata == null) {
			return null;
		}
		Object size = metadata.get("size");
		if (size instanceof Number number) {
			return number.longValue();
		}
		if (size instanceof String text && StringUtils.hasText(text)) {
			try {
				return Long.parseLong(text);
			} catch (NumberFormatException ignored) {
				return null;
			}
		}
		return null;
	}

	private Object firstPresent(Map<String, Object> values, String... keys) {
		for (String key : keys) {
			Object value = values.get(key);
			if (value != null) {
				return value;
			}
		}
		return null;
	}

	private record StorageObjectRow(
		String name,
		@JsonProperty("updated_at")
		String updatedAt,
		Map<String, Object> metadata
	) {
	}
}
