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
@Table(name = "ai_llm_credential")
public class AiLlmCredential {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "credential_id")
	private Long credentialId;

	@Column(name = "credential_kind", nullable = false, length = 30)
	private String credentialKind;

	@Column(name = "ciphertext", nullable = false, columnDefinition = "text")
	private String ciphertext;

	@Column(name = "nonce", nullable = false, length = 100)
	private String nonce;

	@Column(name = "key_version", nullable = false, length = 40)
	private String keyVersion;

	@Column(name = "masked_hint", nullable = false, length = 100)
	private String maskedHint;

	@Column(name = "expires_at")
	private Instant expiresAt;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected AiLlmCredential() {
	}

	public static AiLlmCredential create(
		String kind,
		AiLlmCredentialCipher.EncryptedValue encrypted,
		String maskedHint,
		Instant expiresAt
	) {
		AiLlmCredential value = new AiLlmCredential();
		value.replace(kind, encrypted, maskedHint, expiresAt);
		return value;
	}

	public void replace(
		String kind,
		AiLlmCredentialCipher.EncryptedValue encrypted,
		String maskedHint,
		Instant expiresAt
	) {
		this.credentialKind = kind;
		this.ciphertext = encrypted.ciphertext();
		this.nonce = encrypted.nonce();
		this.keyVersion = encrypted.keyVersion();
		this.maskedHint = maskedHint;
		this.expiresAt = expiresAt;
	}

	@PrePersist
	void createTimestamps() {
		Instant now = Instant.now();
		this.createdAt = now;
		this.updatedAt = now;
	}

	@PreUpdate
	void updateTimestamp() {
		this.updatedAt = Instant.now();
	}

	public Long getCredentialId() { return credentialId; }
	public String getCredentialKind() { return credentialKind; }
	public String getCiphertext() { return ciphertext; }
	public String getNonce() { return nonce; }
	public String getKeyVersion() { return keyVersion; }
	public String getMaskedHint() { return maskedHint; }
	public Instant getExpiresAt() { return expiresAt; }
	public Instant getCreatedAt() { return createdAt; }
	public Instant getUpdatedAt() { return updatedAt; }
}
