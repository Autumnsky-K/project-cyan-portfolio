package com.projectcyan.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.security.SecureRandom;
import java.util.Base64;
import org.junit.jupiter.api.Test;

class AiLlmCredentialCipherTest {

	private static final String MASTER_KEY = Base64.getEncoder().encodeToString(new byte[32]);

	@Test
	void encryptsAndAuthenticatesCredentialWithoutStoringPlaintext() {
		AiLlmCredentialCipher cipher = new AiLlmCredentialCipher(MASTER_KEY, new SecureRandom());

		AiLlmCredentialCipher.EncryptedValue encrypted = cipher.encrypt("sk-secret-value");

		assertThat(encrypted.ciphertext()).doesNotContain("sk-secret-value");
		assertThat(cipher.decrypt(encrypted.ciphertext(), encrypted.nonce())).isEqualTo("sk-secret-value");
	}

	@Test
	void rejectsTamperedCiphertextAndInvalidMasterKey() {
		AiLlmCredentialCipher cipher = new AiLlmCredentialCipher(MASTER_KEY, new SecureRandom());
		AiLlmCredentialCipher.EncryptedValue encrypted = cipher.encrypt("oauth-token");
		byte[] tampered = Base64.getDecoder().decode(encrypted.ciphertext());
		tampered[0] ^= 1;

		assertThatThrownBy(() -> cipher.decrypt(Base64.getEncoder().encodeToString(tampered), encrypted.nonce()))
			.isInstanceOf(IllegalStateException.class)
			.hasMessageContaining("authentication failed");
		assertThatThrownBy(() -> new AiLlmCredentialCipher("", new SecureRandom()).encrypt("secret"))
			.isInstanceOf(IllegalStateException.class)
			.hasMessageContaining("PROJECT_CYAN_CREDENTIAL_MASTER_KEY");
	}
}
