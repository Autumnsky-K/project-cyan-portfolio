package com.projectcyan.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectcyan.common.ApiErrorException;
import java.net.URI;
import java.net.InetAddress;
import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AiLlmConnectionService {

	private static final Set<String> PROVIDERS = Set.of("OPENAI", "CLAUDE", "CODEX_OAUTH", "MOCK");
	private static final String CODEX_URL = "https://chatgpt.com/backend-api/codex/responses";

	private final AiLlmConnectionProfileRepository profileRepository;
	private final AiLlmCredentialRepository credentialRepository;
	private final AiLlmConnectionPublicationRepository publicationRepository;
	private final AiLlmAuditLogRepository auditRepository;
	private final AiLlmCredentialCipher credentialCipher;
	private final ObjectMapper objectMapper = new ObjectMapper();
	private final Set<String> allowedHosts;

	public AiLlmConnectionService(
		AiLlmConnectionProfileRepository profileRepository,
		AiLlmCredentialRepository credentialRepository,
		AiLlmConnectionPublicationRepository publicationRepository,
		AiLlmAuditLogRepository auditRepository,
		AiLlmCredentialCipher credentialCipher,
		@Value("${project-cyan.ai-credentials.allowed-hosts:api.openai.com,api.anthropic.com,chatgpt.com}") String allowedHosts
	) {
		this.profileRepository = profileRepository;
		this.credentialRepository = credentialRepository;
		this.publicationRepository = publicationRepository;
		this.auditRepository = auditRepository;
		this.credentialCipher = credentialCipher;
		this.allowedHosts = parseHosts(allowedHosts);
	}

	@Transactional(readOnly = true)
	public ConnectionConsoleResponse console(String csrfToken) {
		List<ProfileResponse> profiles = profileRepository.findAll().stream()
			.sorted(Comparator.comparing(AiLlmConnectionProfile::getProfileId))
			.map(this::response)
			.toList();
		PublicationResponse published = publicationRepository.findTopByOrderByPublicationIdDesc()
			.map(this::publicationResponse)
			.orElse(null);
		List<PublicationResponse> publications = publicationRepository.findTop20ByOrderByPublicationIdDesc().stream()
			.map(this::publicationResponse)
			.toList();
		return new ConnectionConsoleResponse(profiles, published, publications, csrfToken, List.copyOf(PROVIDERS));
	}

	@Transactional
	public ProfileResponse save(ProfileSaveRequest request, String clientIp) {
		String provider = normalizeProvider(request.provider());
		String type = normalizeType(request.connectionType(), provider);
		String name = requireText(request.profileName(), "profileName", 100);
		String model = provider.equals("MOCK") ? "mock" : requireText(request.model(), "model", 200);
		String baseUrl = normalizeBaseUrl(request.baseUrl(), provider);
		AiLlmConnectionProfile profile;
		if (request.profileId() == null) {
			profile = AiLlmConnectionProfile.create(name, provider, type, baseUrl, model);
		} else {
			profile = findProfile(request.profileId());
			profile.update(name, provider, type, baseUrl, model);
		}
		profile = profileRepository.save(profile);
		audit("PROFILE_SAVE", profile.getProfileId(), true, clientIp, provider);
		return response(profile);
	}

	@Transactional
	public ProfileResponse saveApiKey(Long profileId, String apiKey, String clientIp) {
		AiLlmConnectionProfile profile = findProfile(profileId);
		if (!"API_KEY".equals(profile.getConnectionType())) {
			throw invalid("API key can only be stored for API_KEY profiles.");
		}
		String value = requireText(apiKey, "apiKey", 10000);
		AiLlmCredential credential = AiLlmCredential.create(
			"API_KEY",
			credentialCipher.encrypt(value),
			mask(value),
			null
		);
		credentialRepository.save(credential);
		profile.attachCredential(credential.getCredentialId());
		profileRepository.save(profile);
		audit("CREDENTIAL_REPLACE", profileId, true, clientIp, credential.getMaskedHint());
		return response(profile);
	}

	@Transactional
	public void saveOAuthCredential(Long profileId, Map<String, Object> credentialPayload, Instant expiresAt, String clientIp) {
		AiLlmConnectionProfile profile = findProfile(profileId);
		if (!"CODEX_OAUTH".equals(profile.getProvider())) {
			throw invalid("OAuth credential requires a CODEX_OAUTH profile.");
		}
		try {
			String plaintext = objectMapper.writeValueAsString(credentialPayload);
			String email = String.valueOf(credentialPayload.getOrDefault("email", ""));
			AiLlmCredential credential = AiLlmCredential.create(
				"CODEX_OAUTH",
				credentialCipher.encrypt(plaintext),
				email.isBlank() ? "OAuth connected" : email,
				expiresAt
			);
			credentialRepository.save(credential);
			profile.attachCredential(credential.getCredentialId());
			profileRepository.save(profile);
			audit("OAUTH_CONNECT", profileId, true, clientIp, email);
		} catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
			throw new IllegalStateException("Failed to serialize OAuth credential.", exception);
		}
	}

	@Transactional
	public void refreshOAuthCredential(Long profileId, Map<String, Object> credentialPayload, Instant expiresAt) {
		AiLlmConnectionProfile profile = findProfile(profileId);
		if (profile.getCredentialId() == null) {
			throw invalid("OAuth credential is not connected.");
		}
		refreshOAuthCredentialById(profile.getCredentialId(), credentialPayload, expiresAt);
	}

	@Transactional
	public void refreshOAuthCredentialById(Long credentialId, Map<String, Object> credentialPayload, Instant expiresAt) {
		AiLlmCredential credential = credentialRepository.findById(credentialId)
			.orElseThrow(() -> notFound("AI credential not found."));
		try {
			String plaintext = objectMapper.writeValueAsString(credentialPayload);
			String email = String.valueOf(credentialPayload.getOrDefault("email", ""));
			credential.replace("CODEX_OAUTH", credentialCipher.encrypt(plaintext), email.isBlank() ? "OAuth connected" : email, expiresAt);
			credentialRepository.save(credential);
		} catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
			throw new IllegalStateException("Failed to serialize OAuth credential.", exception);
		}
	}

	@Transactional(readOnly = true)
	public Map<String, Object> loadOAuthCredential(Long profileId) {
		AiLlmConnectionProfile profile = findProfile(profileId);
		if (profile.getCredentialId() == null) {
			return Map.of();
		}
		try {
			return objectMapper.readValue(decryptCredential(profile.getCredentialId()), new TypeReference<>() { });
		} catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
			throw new IllegalStateException("Stored OAuth credential is invalid.", exception);
		}
	}

	@Transactional
	public void clearCredential(Long profileId, String clientIp) {
		AiLlmConnectionProfile profile = findProfile(profileId);
		profile.clearCredential();
		profileRepository.save(profile);
		audit("CREDENTIAL_CLEAR", profileId, true, clientIp, "credential detached");
	}

	@Transactional
	public ProfileResponse recordTest(Long profileId, boolean success, String message, String clientIp) {
		AiLlmConnectionProfile profile = findProfile(profileId);
		profile.recordTest(success, safe(message));
		profileRepository.save(profile);
		audit("CONNECTION_TEST", profileId, success, clientIp, safe(message));
		return response(profile);
	}

	@Transactional
	public ModelConnectionReference validatePublication(Long profileId, boolean oauthWarningAcknowledged) {
		AiLlmConnectionProfile profile = findProfile(profileId);
		if (!profile.isCurrentVersionTested()) {
			throw invalid("The current profile version must pass a connection test before publication.");
		}
		if ("CODEX_OAUTH".equals(profile.getProvider()) && !oauthWarningAcknowledged) {
			throw invalid("CODEX_OAUTH publication requires the experimental connection warning acknowledgement.");
		}
		return new ModelConnectionReference(profileId, profile.getProfileVersion());
	}

	@Transactional
	public void recordPublication(
		ModelConnectionReference reference,
		long configVersion,
		boolean oauthWarningAcknowledged,
		String clientIp
	) {
		AiLlmConnectionProfile profile = findProfile(reference.profileId());
		if (profile.getProfileVersion() != reference.profileVersion()) {
			throw invalid("Profile changed while it was being published.");
		}
		AiLlmConnectionPublication publication = publicationRepository.save(AiLlmConnectionPublication.create(
			configVersion, profile, oauthWarningAcknowledged, null, "admin"
		));
		audit("PROFILE_PUBLISH", profile.getProfileId(), true, clientIp, "publicationId=" + publication.getPublicationId());
	}

	@Transactional(readOnly = true)
	public ModelConnectionReference rollbackReference(Long publicationId) {
		AiLlmConnectionPublication target = publicationRepository.findById(publicationId)
			.orElseThrow(() -> notFound("AI connection publication not found."));
		return new ModelConnectionReference(target.getProfileId(), target.getProfileVersion());
	}

	@Transactional
	public void recordRollback(Long publicationId, long configVersion, String clientIp) {
		AiLlmConnectionPublication target = publicationRepository.findById(publicationId)
			.orElseThrow(() -> notFound("AI connection publication not found."));
		AiLlmConnectionPublication rollback = publicationRepository.save(AiLlmConnectionPublication.create(
			configVersion,
			profileSnapshot(target),
			target.isOauthWarningAcknowledged(),
			publicationId,
			"admin"
		));
		audit("PROFILE_ROLLBACK", target.getProfileId(), true, clientIp, "publicationId=" + publicationId);
	}

	@Transactional(readOnly = true)
	public RuntimeConnection resolve(Long profileId, long profileVersion) {
		AiLlmConnectionPublication published = publicationRepository
			.findTopByProfileIdAndProfileVersionOrderByPublicationIdDesc(profileId, profileVersion)
			.orElse(null);
		if (published != null) {
			return runtimeConnection(
				published.getProfileId(), published.getProfileVersion(), published.getProvider(), published.getConnectionType(),
				published.getBaseUrl(), published.getModel(), published.getCredentialId()
			);
		}
		AiLlmConnectionProfile profile = findProfile(profileId);
		if (profile.getProfileVersion() != profileVersion) {
			throw invalid("Requested profile version is no longer available.");
		}
		return runtimeConnection(profileId, profileVersion, profile.getProvider(), profile.getConnectionType(),
			profile.getBaseUrl(), profile.getModel(), profile.getCredentialId());
	}

	@Transactional(readOnly = true)
	public RuntimeConnection resolveDraft(Long profileId) {
		AiLlmConnectionProfile profile = findProfile(profileId);
		return runtimeConnection(profileId, profile.getProfileVersion(), profile.getProvider(), profile.getConnectionType(),
			profile.getBaseUrl(), profile.getModel(), profile.getCredentialId());
	}

	private RuntimeConnection runtimeConnection(Long id, long version, String provider, String type, String baseUrl, String model, Long credentialId) {
		Map<String, Object> credential = new LinkedHashMap<>();
		if (!"MOCK".equals(provider)) {
			if (credentialId == null) {
				throw invalid("The selected profile has no credential.");
			}
			if ("API_KEY".equals(type)) {
				credential.put("apiKey", decryptCredential(credentialId));
			} else {
				try {
					credential.putAll(objectMapper.readValue(decryptCredential(credentialId), new TypeReference<>() { }));
				} catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
					throw new IllegalStateException("Stored OAuth credential is invalid.", exception);
				}
			}
		}
		return new RuntimeConnection(id, version, provider, type, baseUrl, model, credentialId, credential);
	}

	private String decryptCredential(Long credentialId) {
		AiLlmCredential credential = credentialRepository.findById(credentialId)
			.orElseThrow(() -> notFound("AI credential not found."));
		return credentialCipher.decrypt(credential.getCiphertext(), credential.getNonce());
	}

	private AiLlmConnectionProfile profileSnapshot(AiLlmConnectionPublication source) {
		return AiLlmConnectionProfile.publicationSnapshot(
			source.getProfileId(), source.getProfileVersion(), source.getProvider(), source.getConnectionType(),
			source.getBaseUrl(), source.getModel(), source.getCredentialId()
		);
	}

	private AiLlmConnectionProfile findProfile(Long profileId) {
		return profileRepository.findById(profileId).orElseThrow(() -> notFound("AI connection profile not found."));
	}

	private ProfileResponse response(AiLlmConnectionProfile profile) {
		String hint = profile.getCredentialId() == null ? "" : credentialRepository.findById(profile.getCredentialId())
			.map(AiLlmCredential::getMaskedHint).orElse("");
		return new ProfileResponse(
			profile.getProfileId(), profile.getProfileName(), profile.getProvider(), profile.getConnectionType(),
			profile.getBaseUrl(), profile.getModel(), profile.getProfileVersion(), profile.getCredentialId() != null,
			hint, profile.getLastTestStatus(), profile.getLastTestedAt(), profile.isCurrentVersionTested()
		);
	}

	private PublicationResponse publicationResponse(AiLlmConnectionPublication value) {
		return new PublicationResponse(value.getPublicationId(), value.getConfigVersion(), value.getProfileId(),
			value.getProfileVersion(), value.getProvider(), value.getModel(), value.getPublishedAt(),
			value.getRollbackFromPublicationId());
	}

	private String normalizeProvider(String value) {
		String provider = String.valueOf(value == null ? "" : value).trim().toUpperCase(Locale.ROOT);
		if (!PROVIDERS.contains(provider)) {
			throw invalid("provider must be OPENAI, CLAUDE, CODEX_OAUTH, or MOCK.");
		}
		return provider;
	}

	private String normalizeType(String value, String provider) {
		String expected = switch (provider) {
			case "CODEX_OAUTH" -> "OAUTH";
			case "MOCK" -> "NONE";
			default -> "API_KEY";
		};
		String actual = String.valueOf(value == null ? expected : value).trim().toUpperCase(Locale.ROOT);
		if (!expected.equals(actual)) {
			throw invalid(provider + " requires connectionType=" + expected + ".");
		}
		return expected;
	}

	private String normalizeBaseUrl(String value, String provider) {
		if ("MOCK".equals(provider)) return null;
		if ("CODEX_OAUTH".equals(provider)) return CODEX_URL;
		String url = requireText(value, "baseUrl", 1000);
		try {
			URI uri = URI.create(url);
			String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase(Locale.ROOT);
			if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getUserInfo() != null || !allowedHosts.contains(host)) {
				throw invalid("baseUrl must use HTTPS and an allowed host.");
			}
			return uri.toString().replaceAll("/+$", "");
		} catch (IllegalArgumentException exception) {
			throw invalid("baseUrl is invalid.");
		}
	}

	private Set<String> parseHosts(String value) {
		Set<String> output = new java.util.LinkedHashSet<>();
		for (String part : String.valueOf(value).split(",")) {
			String host = part.trim().toLowerCase(Locale.ROOT);
			if (!host.isBlank() && !isForbiddenHost(host)) output.add(host);
		}
		return Set.copyOf(output);
	}

	private boolean isForbiddenHost(String host) {
		if (host.equals("localhost") || host.endsWith(".local")) return true;
		if (!host.matches("[0-9.]+") && !host.contains(":")) return false;
		try {
			InetAddress address = InetAddress.getByName(host);
			return address.isAnyLocalAddress() || address.isLoopbackAddress()
				|| address.isLinkLocalAddress() || address.isSiteLocalAddress();
		} catch (java.net.UnknownHostException exception) {
			return true;
		}
	}

	private String requireText(String value, String name, int maxLength) {
		if (!StringUtils.hasText(value) || value.trim().length() > maxLength) throw invalid(name + " is invalid.");
		return value.trim();
	}

	private String mask(String secret) {
		String suffix = secret.length() <= 4 ? secret : secret.substring(secret.length() - 4);
		return "••••" + suffix;
	}

	private void audit(String action, Long profileId, boolean success, String clientIp, String detail) {
		auditRepository.save(AiLlmAuditLog.create(action, profileId, success, "admin", clientIp, safe(detail)));
	}

	private String safe(String value) {
		if (value == null) return "";
		String sanitized = value.replaceAll("(?i)(bearer|api[_-]?key|access[_-]?token|refresh[_-]?token)\\s*[:=]\\s*\\S+", "$1=[REDACTED]");
		return sanitized.substring(0, Math.min(1000, sanitized.length()));
	}

	private ApiErrorException invalid(String message) { return new ApiErrorException("AI_CONNECTION_INVALID", message, HttpStatus.BAD_REQUEST); }
	private ApiErrorException notFound(String message) { return new ApiErrorException("AI_CONNECTION_NOT_FOUND", message, HttpStatus.NOT_FOUND); }

	public record ProfileSaveRequest(Long profileId, String profileName, String provider, String connectionType, String baseUrl, String model) { }
	public record ApiKeyRequest(String apiKey) { }
	public record ProfileResponse(Long profileId, String profileName, String provider, String connectionType, String baseUrl,
		String model, long profileVersion, boolean credentialConfigured, String credentialHint, String lastTestStatus,
		Instant lastTestedAt, boolean publishable) { }
	public record PublicationResponse(Long publicationId, long configVersion, Long profileId, long profileVersion,
		String provider, String model, Instant publishedAt, Long rollbackFromPublicationId) { }
	public record ConnectionConsoleResponse(List<ProfileResponse> profiles, PublicationResponse published,
		List<PublicationResponse> publications, String csrfToken, List<String> providers) { }
	public record ModelConnectionReference(Long profileId, long profileVersion) { }
	public record RuntimeConnection(Long profileId, long profileVersion, String provider, String connectionType,
		String baseUrl, String model, Long credentialId, Map<String, Object> credential) { }
}
