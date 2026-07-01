package com.projectcyan.ai;

import java.time.Instant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ai_llm_connection_publication")
public class AiLlmConnectionPublication {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "publication_id")
	private Long publicationId;

	@Column(name = "config_version", nullable = false, unique = true)
	private long configVersion;

	@Column(name = "profile_id", nullable = false)
	private Long profileId;

	@Column(name = "profile_version", nullable = false)
	private long profileVersion;

	@Column(name = "provider", nullable = false, length = 30)
	private String provider;

	@Column(name = "connection_type", nullable = false, length = 30)
	private String connectionType;

	@Column(name = "base_url", length = 1000)
	private String baseUrl;

	@Column(name = "model", nullable = false, length = 200)
	private String model;

	@Column(name = "credential_id")
	private Long credentialId;

	@Column(name = "oauth_warning_acknowledged", nullable = false)
	private boolean oauthWarningAcknowledged;

	@Column(name = "rollback_from_publication_id")
	private Long rollbackFromPublicationId;

	@Column(name = "published_at", nullable = false)
	private Instant publishedAt;

	@Column(name = "published_by", nullable = false, length = 100)
	private String publishedBy;

	protected AiLlmConnectionPublication() {
	}

	public static AiLlmConnectionPublication create(
		long configVersion,
		AiLlmConnectionProfile profile,
		boolean warningAcknowledged,
		Long rollbackFromPublicationId,
		String publishedBy
	) {
		AiLlmConnectionPublication value = new AiLlmConnectionPublication();
		value.configVersion = configVersion;
		value.profileId = profile.getProfileId();
		value.profileVersion = profile.getProfileVersion();
		value.provider = profile.getProvider();
		value.connectionType = profile.getConnectionType();
		value.baseUrl = profile.getBaseUrl();
		value.model = profile.getModel();
		value.credentialId = profile.getCredentialId();
		value.oauthWarningAcknowledged = warningAcknowledged;
		value.rollbackFromPublicationId = rollbackFromPublicationId;
		value.publishedAt = Instant.now();
		value.publishedBy = publishedBy;
		return value;
	}

	public Long getPublicationId() { return publicationId; }
	public long getConfigVersion() { return configVersion; }
	public Long getProfileId() { return profileId; }
	public long getProfileVersion() { return profileVersion; }
	public String getProvider() { return provider; }
	public String getConnectionType() { return connectionType; }
	public String getBaseUrl() { return baseUrl; }
	public String getModel() { return model; }
	public Long getCredentialId() { return credentialId; }
	public boolean isOauthWarningAcknowledged() { return oauthWarningAcknowledged; }
	public Long getRollbackFromPublicationId() { return rollbackFromPublicationId; }
	public Instant getPublishedAt() { return publishedAt; }
	public String getPublishedBy() { return publishedBy; }
}
