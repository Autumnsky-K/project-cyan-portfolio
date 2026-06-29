package com.projectcyan.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.security.SecureRandom;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

class OAuthTokenProtectServiceTest {

	private static final String DIGIT_KEY = "3.1415926535897932384626433832795";
	private static final String WRONG_DIGIT_KEY = "2.1415926535897932384626433832795";

	private final OAuthTokenProtectService service = new OAuthTokenProtectService(new SecureRandom());

	@Test
	void protectsTokenStoreWithoutPersistingSchemeOrKeyMask() {
		Map<String, Object> raw = sampleTokenStore();

		Map<String, Object> protectedStore = service.protect(raw, DIGIT_KEY);

		assertThat(protectedStore)
				.containsEntry("protected", true)
				.containsKeys("salt", "nonce", "ciphertext", "tag")
				.doesNotContainKeys("scheme", "key_mask");
		assertThat(protectedStore.get("ciphertext")).isNotEqualTo(raw.get("access"));
		assertThat(service.unprotect(protectedStore, DIGIT_KEY)).isEqualTo(raw);
	}

	@Test
	void rejectsWrongDigitKey() {
		Map<String, Object> protectedStore = service.protect(sampleTokenStore(), DIGIT_KEY);

		assertThatThrownBy(() -> service.unprotect(protectedStore, WRONG_DIGIT_KEY))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("password mismatch");
	}

	@Test
	void validatesDigitKeyShape() {
		assertThatThrownBy(() -> service.validateDigitKey("3.14"))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("length mismatch");
		assertThatThrownBy(() -> service.validateDigitKey("31415926535897932384626433832795"))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("length mismatch");
		assertThatThrownBy(() -> service.validateDigitKey("3x1415926535897932384626433832795"))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("decimal point mismatch");
	}

	@Test
	void readsLegacyPythonProtectedPayloadWithSchemeAndKeyMask() {
		Map<String, Object> legacyPayload = new LinkedHashMap<>();
		legacyPayload.put("protected", true);
		legacyPayload.put("scheme", "digit-key-xor-sha256-hmac-v1");
		legacyPayload.put("key_mask", "0.0000000000000000000000000000000");
		legacyPayload.put("salt", "TF3EXhY0-WbYE6PlASWrBw");
		legacyPayload.put("nonce", "8qx8KJ_xgjeUcUH0HDXcAQ");
		legacyPayload.put(
				"ciphertext",
				"LBKHiYmhZqReKEX8WaDxW2sZ0mx3XeXl3eHIGsgLtAo9TEvCtonwZQMIlsw2Je-usK2XheM35U9q9LYKONMh5bbyJ7RvcO4gNfyMhx1WfjGs_Ui_WX44zf925xEQuKRV6x5jyC2Z_UUEncp9qsnttCPTehblOLuTAik1y5afOgGozwViMm2YNGIAVw");
		legacyPayload.put("tag", "eD2IEHCWvO1REs-UHUsBTgJZ_mV2wqc_WubgWya8f34");

		assertThat(service.unprotect(legacyPayload, DIGIT_KEY)).isEqualTo(sampleTokenStore());
	}

	private Map<String, Object> sampleTokenStore() {
		Map<String, Object> raw = new LinkedHashMap<>();
		raw.put("access", "access-token-test");
		raw.put("refresh", "refresh-token-test");
		raw.put("expires", 1783239770);
		raw.put("account_id", "account-test");
		raw.put("email", "hyena@example.test");
		return raw;
	}
}
