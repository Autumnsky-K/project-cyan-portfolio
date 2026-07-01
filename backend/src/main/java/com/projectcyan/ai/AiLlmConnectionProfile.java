package com.projectcyan.ai;

import java.time.Instant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "ai_llm_connection_profile")
public class AiLlmConnectionProfile {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "profile_id")
	private Long profileId;

	@Column(name = "profile_name", nullable = false, length = 100)
	private String profileName;

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

	@Column(name = "profile_version", nullable = false)
	private long profileVersion;

	@Column(name = "last_tested_version")
	private Long lastTestedVersion;

	@Column(name = "last_tested_at")
	private Instant lastTestedAt;

	@Column(name = "last_test_status", length = 20)
	private String lastTestStatus;

	@Column(name = "last_test_message", length = 1000)
	private String lastTestMessage;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected AiLlmConnectionProfile() {
	}

	public static AiLlmConnectionProfile create(String name, String provider, String type, String baseUrl, String model) {
		AiLlmConnectionProfile value = new AiLlmConnectionProfile();
		value.profileVersion = 1;
		value.update(name, provider, type, baseUrl, model);
		return value;
	}

	static AiLlmConnectionProfile publicationSnapshot(
		Long profileId,
		long profileVersion,
		String provider,
		String connectionType,
		String baseUrl,
		String model,
		Long credentialId
	) {
		AiLlmConnectionProfile value = new AiLlmConnectionProfile();
		value.profileId = profileId;
		value.profileName = "rollback";
		value.profileVersion = profileVersion;
		value.provider = provider;
		value.connectionType = connectionType;
		value.baseUrl = baseUrl;
		value.model = model;
		value.credentialId = credentialId;
		return value;
	}

	public void update(String name, String provider, String type, String baseUrl, String model) {
		boolean changed = profileName != null && (!profileName.equals(name)
			|| !this.provider.equals(provider)
			|| !this.connectionType.equals(type)
			|| !java.util.Objects.equals(this.baseUrl, baseUrl)
			|| !this.model.equals(model));
		this.profileName = name;
		this.provider = provider;
		this.connectionType = type;
		this.baseUrl = baseUrl;
		this.model = model;
		if (changed) {
			this.profileVersion++;
			invalidateTest();
		}
	}

	public void attachCredential(Long credentialId) {
		this.credentialId = credentialId;
		this.profileVersion++;
		invalidateTest();
	}

	public void clearCredential() {
		this.credentialId = null;
		this.profileVersion++;
		invalidateTest();
	}

	public void recordTest(boolean success, String message) {
		this.lastTestedVersion = profileVersion;
		this.lastTestedAt = Instant.now();
		this.lastTestStatus = success ? "SUCCESS" : "FAILED";
		this.lastTestMessage = message == null ? "" : message.substring(0, Math.min(1000, message.length()));
	}

	public boolean isCurrentVersionTested() {
		return "SUCCESS".equals(lastTestStatus) && lastTestedVersion != null && lastTestedVersion == profileVersion;
	}

	private void invalidateTest() {
		this.lastTestedVersion = null;
		this.lastTestStatus = null;
		this.lastTestMessage = null;
	}

	@PrePersist
	void createTimestamps() {
		Instant now = Instant.now();
		this.createdAt = now;
		this.updatedAt = now;
	}

	@PreUpdate
	void updateTimestamp() { this.updatedAt = Instant.now(); }

	public Long getProfileId() { return profileId; }
	public String getProfileName() { return profileName; }
	public String getProvider() { return provider; }
	public String getConnectionType() { return connectionType; }
	public String getBaseUrl() { return baseUrl; }
	public String getModel() { return model; }
	public Long getCredentialId() { return credentialId; }
	public long getProfileVersion() { return profileVersion; }
	public Long getLastTestedVersion() { return lastTestedVersion; }
	public Instant getLastTestedAt() { return lastTestedAt; }
	public String getLastTestStatus() { return lastTestStatus; }
	public String getLastTestMessage() { return lastTestMessage; }
	public Instant getCreatedAt() { return createdAt; }
	public Instant getUpdatedAt() { return updatedAt; }
}
