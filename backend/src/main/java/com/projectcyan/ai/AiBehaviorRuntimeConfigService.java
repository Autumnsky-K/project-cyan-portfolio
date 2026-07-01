package com.projectcyan.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectcyan.common.ApiErrorException;
import com.projectcyan.storage.SupabaseStorageObject;
import com.projectcyan.storage.SupabaseStorageService;
import com.projectcyan.ai.AiLlmConnectionService.ModelConnectionReference;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AiBehaviorRuntimeConfigService {

	private static final MediaType TSV_MEDIA_TYPE = new MediaType("text", "tab-separated-values", StandardCharsets.UTF_8);
	private static final String ROOT = "behavior/published";
	private static final String MANIFEST_FILE = "runtime-config.json";
	private static final String LOGIC_FILE = "logic-functions.tsv";
	private static final String SETTINGS_FILE = "admin-settings.tsv";
	private static final String MOTION_FILE = "motion-list.tsv";
	private static final Set<String> PIPELINE_MODES = Set.of("faithful18", "optimized");
	private static final Set<String> REQUIRED_MOTIONS = Set.of("idle", "wave", "point", "nod", "shake-head");

	private final SupabaseStorageService storageService;
	private final AiGoodsCatalogProperties catalogProperties;
	private final ObjectMapper objectMapper;

	public AiBehaviorRuntimeConfigService(
		SupabaseStorageService storageService,
		AiGoodsCatalogProperties catalogProperties
	) {
		this.storageService = storageService;
		this.catalogProperties = catalogProperties;
		this.objectMapper = new ObjectMapper();
	}

	public RuntimeConfigResponse publish(PublishRuntimeConfigRequest request) {
		return publish(request, currentModelConnection());
	}

	public RuntimeConfigResponse publish(PublishRuntimeConfigRequest request, ModelConnectionReference modelConnection) {
		validate(request);
		long configVersion = Instant.now().toEpochMilli();
		String publishedAt = Instant.now().toString();
		Map<String, String> paths = Map.of(
			"logicFunctions", objectPath(LOGIC_FILE),
			"adminSettings", objectPath(SETTINGS_FILE),
			"motionList", objectPath(MOTION_FILE)
		);
		Map<String, String> checksums = Map.of(
			"logicFunctions", sha256(request.logicFunctions()),
			"adminSettings", sha256(request.adminSettings()),
			"motionList", sha256(request.motionList())
		);

		upload(LOGIC_FILE, request.logicFunctions(), TSV_MEDIA_TYPE);
		upload(SETTINGS_FILE, request.adminSettings(), TSV_MEDIA_TYPE);
		upload(MOTION_FILE, request.motionList(), TSV_MEDIA_TYPE);
		PublishedDescriptor descriptor = new PublishedDescriptor(
			configVersion,
			request.pipelineMode(),
			publishedAt,
			paths,
			checksums,
			modelConnection
		);
		try {
			upload(MANIFEST_FILE, objectMapper.writeValueAsString(descriptor), MediaType.APPLICATION_JSON);
		} catch (JsonProcessingException exception) {
			throw new IllegalStateException("AI runtime config manifest serialization failed.", exception);
		}
		return response(descriptor);
	}

	public RuntimeConfigResponse switchModelConnection(ModelConnectionReference modelConnection) {
		try {
			String manifest = storageService.downloadTextObject(catalogProperties.getBucket(), objectPath(MANIFEST_FILE));
			PublishedDescriptor current = objectMapper.readValue(manifest, PublishedDescriptor.class);
			PublishedDescriptor updated = new PublishedDescriptor(
				Instant.now().toEpochMilli(), current.pipelineMode(), Instant.now().toString(), current.objectPaths(),
				current.checksums(), modelConnection
			);
			upload(MANIFEST_FILE, objectMapper.writeValueAsString(updated), MediaType.APPLICATION_JSON);
			return response(updated);
		} catch (JsonProcessingException exception) {
			throw new ApiErrorException("AI_RUNTIME_CONFIG_INVALID", "발행된 AI 설정 manifest를 갱신할 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public RuntimeConfigResponse findPublished() {
		try {
			String manifest = storageService.downloadTextObject(catalogProperties.getBucket(), objectPath(MANIFEST_FILE));
			PublishedDescriptor descriptor = objectMapper.readValue(manifest, PublishedDescriptor.class);
			return response(descriptor);
		} catch (JsonProcessingException exception) {
			throw new ApiErrorException("AI_RUNTIME_CONFIG_INVALID", "발행된 AI 설정 manifest를 읽을 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	private RuntimeConfigResponse response(PublishedDescriptor descriptor) {
		Map<String, String> urls = new LinkedHashMap<>();
		urls.put("logicFunctionsUrl", signedUrl(descriptor.objectPaths().get("logicFunctions")));
		urls.put("adminSettingsUrl", signedUrl(descriptor.objectPaths().get("adminSettings")));
		urls.put("motionListUrl", signedUrl(descriptor.objectPaths().get("motionList")));
		return new RuntimeConfigResponse(
			descriptor.configVersion(),
			descriptor.pipelineMode(),
			descriptor.publishedAt(),
			urls,
			descriptor.checksums(),
			descriptor.modelConnection()
		);
	}

	private ModelConnectionReference currentModelConnection() {
		try {
			String manifest = storageService.downloadTextObject(catalogProperties.getBucket(), objectPath(MANIFEST_FILE));
			return objectMapper.readValue(manifest, PublishedDescriptor.class).modelConnection();
		} catch (RuntimeException | JsonProcessingException exception) {
			return null;
		}
	}

	private void validate(PublishRuntimeConfigRequest request) {
		if (request == null || !PIPELINE_MODES.contains(request.pipelineMode())) {
			throw invalid("pipelineMode must be faithful18 or optimized.");
		}
		requireHeader(request.logicFunctions(), "step", "logic-functions.tsv");
		for (int step = 1; step <= 18; step++) {
			String expected = String.format("%02d", step);
			boolean found = Arrays.stream(request.logicFunctions().split("\\R"))
				.skip(1)
				.anyMatch(line -> line.startsWith(expected + "\t"));
			if (!found) {
				throw invalid("logic-functions.tsv is missing step " + expected + ".");
			}
		}
		requireHeader(request.adminSettings(), "section\tkey\tvalue\tnote", "admin-settings.tsv");
		if (Arrays.stream(request.adminSettings().split("\\R"))
			.anyMatch(line -> line.startsWith("inputHook\t") || line.startsWith("outputHook\t"))) {
			throw invalid("Hook rows must be managed through ai_hook_policy, not admin-settings.tsv.");
		}
		requireHeader(request.motionList(), "motionKey", "motion-list.tsv");
		for (String motion : REQUIRED_MOTIONS) {
			boolean found = Arrays.stream(request.motionList().split("\\R"))
				.skip(1)
				.anyMatch(line -> line.startsWith(motion + "\t"));
			if (!found) {
				throw invalid("motion-list.tsv is missing motionKey " + motion + ".");
			}
		}
		validateNoSecrets(request.logicFunctions());
		validateNoSecrets(request.adminSettings());
		validateNoSecrets(request.motionList());
	}

	private void validateNoSecrets(String content) {
		String normalized = content.toLowerCase(java.util.Locale.ROOT);
		for (String marker : Set.of("service_role", "access_token", "api_key", "bearer ", "sk-")) {
			if (normalized.contains(marker)) {
				throw invalid("Runtime config must not contain credentials or tokens.");
			}
		}
	}

	private void requireHeader(String text, String prefix, String fileName) {
		if (!StringUtils.hasText(text) || !text.strip().startsWith(prefix)) {
			throw invalid(fileName + " has an invalid header.");
		}
	}

	private void upload(String fileName, String content, MediaType mediaType) {
		storageService.uploadTextObject(
			catalogProperties.getBucket(),
			joinPath(catalogProperties.getPath(), ROOT),
			fileName,
			content,
			mediaType,
			true
		);
	}

	private String signedUrl(String objectPath) {
		return storageService.createSignedObjectUrl(
			catalogProperties.getBucket(),
			objectPath,
			catalogProperties.getSignedUrlTtlSeconds()
		);
	}

	private String objectPath(String fileName) {
		return joinPath(joinPath(catalogProperties.getPath(), ROOT), fileName);
	}

	private String joinPath(String left, String right) {
		String normalizedLeft = left == null ? "" : left.replaceAll("^/+", "").replaceAll("/+$", "");
		String normalizedRight = right == null ? "" : right.replaceAll("^/+", "").replaceAll("/+$", "");
		return normalizedLeft.isBlank() ? normalizedRight : normalizedLeft + "/" + normalizedRight;
	}

	private String sha256(String content) {
		try {
			byte[] digest = MessageDigest.getInstance("SHA-256").digest(content.getBytes(StandardCharsets.UTF_8));
			return java.util.HexFormat.of().formatHex(digest);
		} catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException(exception);
		}
	}

	private ApiErrorException invalid(String message) {
		return new ApiErrorException("AI_RUNTIME_CONFIG_INVALID", message, HttpStatus.BAD_REQUEST);
	}

	public record PublishRuntimeConfigRequest(
		String logicFunctions,
		String adminSettings,
		String motionList,
		String pipelineMode
	) {
	}

	public record RuntimeConfigResponse(
		long configVersion,
		String pipelineMode,
		String publishedAt,
		Map<String, String> files,
		Map<String, String> checksums,
		ModelConnectionReference modelConnection
	) {
	}

	private record PublishedDescriptor(
		long configVersion,
		String pipelineMode,
		String publishedAt,
		Map<String, String> objectPaths,
		Map<String, String> checksums,
		ModelConnectionReference modelConnection
	) {
	}
}
