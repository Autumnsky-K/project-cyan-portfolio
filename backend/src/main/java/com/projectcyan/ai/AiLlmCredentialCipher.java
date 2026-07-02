package com.projectcyan.ai;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AiLlmCredentialCipher {

	private static final String ALGORITHM = "AES/GCM/NoPadding";
	private static final byte[] AAD = "project-cyan-ai-credential-v1".getBytes(StandardCharsets.UTF_8);
	private static final int NONCE_LENGTH = 12;
	private static final int TAG_LENGTH_BITS = 128;

	private final String encodedMasterKey;
	private final SecureRandom secureRandom;

	@Autowired
	public AiLlmCredentialCipher(@Value("${project-cyan.ai-credentials.master-key:}") String encodedMasterKey) {
		this(encodedMasterKey, new SecureRandom());
	}

	AiLlmCredentialCipher(String encodedMasterKey, SecureRandom secureRandom) {
		this.encodedMasterKey = encodedMasterKey == null ? "" : encodedMasterKey.trim();
		this.secureRandom = secureRandom;
	}

	public EncryptedValue encrypt(String plaintext) {
		if (plaintext == null || plaintext.isBlank()) {
			throw new IllegalArgumentException("Credential plaintext must not be blank.");
		}
		try {
			byte[] nonce = new byte[NONCE_LENGTH];
			secureRandom.nextBytes(nonce);
			Cipher cipher = Cipher.getInstance(ALGORITHM);
			cipher.init(Cipher.ENCRYPT_MODE, masterKey(), new GCMParameterSpec(TAG_LENGTH_BITS, nonce));
			cipher.updateAAD(AAD);
			byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
			return new EncryptedValue(
				Base64.getEncoder().encodeToString(ciphertext),
				Base64.getEncoder().encodeToString(nonce),
				"aes-256-gcm-v1"
			);
		} catch (IllegalArgumentException exception) {
			throw exception;
		} catch (IllegalStateException exception) {
			throw exception;
		} catch (Exception exception) {
			throw new IllegalStateException("Failed to encrypt AI credential.", exception);
		}
	}

	public String decrypt(String ciphertext, String nonce) {
		try {
			Cipher cipher = Cipher.getInstance(ALGORITHM);
			cipher.init(
				Cipher.DECRYPT_MODE,
				masterKey(),
				new GCMParameterSpec(TAG_LENGTH_BITS, Base64.getDecoder().decode(nonce))
			);
			cipher.updateAAD(AAD);
			byte[] plaintext = cipher.doFinal(Base64.getDecoder().decode(ciphertext));
			return new String(plaintext, StandardCharsets.UTF_8);
		} catch (IllegalArgumentException exception) {
			throw exception;
		} catch (IllegalStateException exception) {
			throw exception;
		} catch (Exception exception) {
			throw new IllegalStateException("AI credential authentication failed.", exception);
		}
	}

	private SecretKeySpec masterKey() {
		if (encodedMasterKey.isBlank()) {
			throw new IllegalStateException("PROJECT_CYAN_CREDENTIAL_MASTER_KEY is required for AI credentials.");
		}
		byte[] key;
		try {
			key = Base64.getDecoder().decode(encodedMasterKey);
		} catch (IllegalArgumentException exception) {
			throw new IllegalStateException("PROJECT_CYAN_CREDENTIAL_MASTER_KEY must be Base64 encoded.", exception);
		}
		if (key.length != 32) {
			throw new IllegalStateException("PROJECT_CYAN_CREDENTIAL_MASTER_KEY must decode to 32 bytes.");
		}
		return new SecretKeySpec(key, "AES");
	}

	public record EncryptedValue(String ciphertext, String nonce, String keyVersion) {
	}
}
