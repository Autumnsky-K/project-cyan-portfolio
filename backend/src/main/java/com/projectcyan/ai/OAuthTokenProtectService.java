package com.projectcyan.ai;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

@Service
public class OAuthTokenProtectService {

	static final String KEY_MASK = "0.0000000000000000000000000000000";
	private static final String INTERNAL_SCHEME = "digit-key-xor-sha256-hmac-v1";
	private static final String KEY_DERIVATION_PREFIX = "digit-token-store-v1:";
	private static final int PBKDF2_ITERATIONS = 200_000;
	private static final int DERIVED_KEY_LENGTH = 64;
	private static final int RANDOM_LENGTH = 16;

	private final SecureRandom secureRandom;

	public OAuthTokenProtectService() {
		this(new SecureRandom());
	}

	OAuthTokenProtectService(SecureRandom secureRandom) {
		this.secureRandom = secureRandom;
	}

	public Map<String, Object> protect(Map<String, Object> rawTokenStore, String digitKey) {
		String normalizedKey = validateDigitKey(digitKey);
		byte[] salt = randomBytes();
		byte[] nonce = randomBytes();
		byte[] derived = deriveKeys(normalizedKey, salt, KEY_MASK);
		byte[] encKey = Arrays.copyOfRange(derived, 0, 32);
		byte[] macKey = Arrays.copyOfRange(derived, 32, 64);
		byte[] plaintext = toJsonBytes(rawTokenStore);
		byte[] ciphertext = xorWithSha256Stream(plaintext, encKey, nonce);
		byte[] tag = hmacSha256(macKey, signedBytes(salt, nonce, ciphertext));

		Map<String, Object> protectedStore = new LinkedHashMap<>();
		protectedStore.put("protected", true);
		protectedStore.put("salt", base64UrlEncode(salt));
		protectedStore.put("nonce", base64UrlEncode(nonce));
		protectedStore.put("ciphertext", base64UrlEncode(ciphertext));
		protectedStore.put("tag", base64UrlEncode(tag));
		return protectedStore;
	}

	public Map<String, Object> unprotect(Map<String, Object> tokenStore, String digitKey) {
		if (!Boolean.TRUE.equals(tokenStore.get("protected"))) {
			return tokenStore;
		}

		String normalizedKey = validateDigitKey(digitKey);
		String mask = stringValue(tokenStore.get("key_mask"));
		if (mask.isBlank()) {
			mask = KEY_MASK;
		}

		byte[] salt = base64UrlDecode(requiredString(tokenStore, "salt"));
		byte[] nonce = base64UrlDecode(requiredString(tokenStore, "nonce"));
		byte[] ciphertext = base64UrlDecode(requiredString(tokenStore, "ciphertext"));
		byte[] expectedTag = base64UrlDecode(requiredString(tokenStore, "tag"));
		byte[] derived = deriveKeys(normalizedKey, salt, mask);
		byte[] encKey = Arrays.copyOfRange(derived, 0, 32);
		byte[] macKey = Arrays.copyOfRange(derived, 32, 64);
		byte[] actualTag = hmacSha256(macKey, signedBytes(salt, nonce, ciphertext));
		if (!MessageDigest.isEqual(actualTag, expectedTag)) {
			throw new IllegalArgumentException("Protected OAuth token store password mismatch");
		}

		byte[] plaintext = xorWithSha256Stream(ciphertext, encKey, nonce);
		return fromJsonBytes(plaintext);
	}

	public String validateDigitKey(String digitKey) {
		String value = stringValue(digitKey).trim();
		if (value.length() != KEY_MASK.length()) {
			throw new IllegalArgumentException(
					"OAUTH_TOKEN_DIGIT_KEY length mismatch: expected " + KEY_MASK.length() + ", got " + value.length());
		}
		for (int index = 0; index < KEY_MASK.length(); index++) {
			char maskChar = KEY_MASK.charAt(index);
			char valueChar = value.charAt(index);
			if (maskChar == '.') {
				if (valueChar != '.') {
					throw new IllegalArgumentException("OAUTH_TOKEN_DIGIT_KEY decimal point mismatch at " + index);
				}
			} else if (!Character.isDigit(valueChar)) {
				throw new IllegalArgumentException("OAUTH_TOKEN_DIGIT_KEY must contain only digits except decimal point");
			}
		}
		return value;
	}

	private byte[] randomBytes() {
		byte[] value = new byte[RANDOM_LENGTH];
		secureRandom.nextBytes(value);
		return value;
	}

	private byte[] deriveKeys(String digitKey, byte[] salt, String mask) {
		validateDigitKeyAgainstMask(digitKey, mask);
		byte[] password = (KEY_DERIVATION_PREFIX + digitKey).getBytes(StandardCharsets.UTF_8);
		return pbkdf2HmacSha256(password, salt, PBKDF2_ITERATIONS, DERIVED_KEY_LENGTH);
	}

	private void validateDigitKeyAgainstMask(String digitKey, String mask) {
		if (digitKey.length() != mask.length()) {
			throw new IllegalArgumentException(
					"OAUTH_TOKEN_DIGIT_KEY length mismatch: expected " + mask.length() + ", got " + digitKey.length());
		}
		for (int index = 0; index < mask.length(); index++) {
			char maskChar = mask.charAt(index);
			char valueChar = digitKey.charAt(index);
			if (maskChar == '.') {
				if (valueChar != '.') {
					throw new IllegalArgumentException("OAUTH_TOKEN_DIGIT_KEY decimal point mismatch at " + index);
				}
			} else if (!Character.isDigit(valueChar)) {
				throw new IllegalArgumentException("OAUTH_TOKEN_DIGIT_KEY must contain only digits except decimal point");
			}
		}
	}

	private byte[] pbkdf2HmacSha256(byte[] password, byte[] salt, int iterations, int dkLen) {
		try {
			Mac mac = Mac.getInstance("HmacSHA256");
			mac.init(new SecretKeySpec(password, "HmacSHA256"));
			int hLen = mac.getMacLength();
			int blockCount = (int) Math.ceil((double) dkLen / hLen);
			byte[] derived = new byte[blockCount * hLen];
			int offset = 0;
			for (int blockIndex = 1; blockIndex <= blockCount; blockIndex++) {
				byte[] block = pbkdf2Block(mac, salt, iterations, blockIndex);
				System.arraycopy(block, 0, derived, offset, block.length);
				offset += block.length;
			}
			return Arrays.copyOf(derived, dkLen);
		} catch (Exception ex) {
			throw new IllegalStateException("Failed to derive OAuth token store key", ex);
		}
	}

	private byte[] pbkdf2Block(Mac mac, byte[] salt, int iterations, int blockIndex) {
		byte[] saltAndIndex = ByteBuffer.allocate(salt.length + 4)
				.put(salt)
				.putInt(blockIndex)
				.array();
		byte[] u = mac.doFinal(saltAndIndex);
		byte[] output = Arrays.copyOf(u, u.length);
		for (int iteration = 1; iteration < iterations; iteration++) {
			u = mac.doFinal(u);
			for (int index = 0; index < output.length; index++) {
				output[index] ^= u[index];
			}
		}
		return output;
	}

	private byte[] xorWithSha256Stream(byte[] data, byte[] encKey, byte[] nonce) {
		byte[] output = new byte[data.length];
		int offset = 0;
		long counter = 0;
		while (offset < data.length) {
			byte[] block = sha256(concat(encKey, nonce, ByteBuffer.allocate(8).putLong(counter).array()));
			int length = Math.min(block.length, data.length - offset);
			for (int index = 0; index < length; index++) {
				output[offset + index] = (byte) (data[offset + index] ^ block[index]);
			}
			offset += length;
			counter++;
		}
		return output;
	}

	private byte[] signedBytes(byte[] salt, byte[] nonce, byte[] ciphertext) {
		return concat(INTERNAL_SCHEME.getBytes(StandardCharsets.UTF_8), salt, nonce, ciphertext);
	}

	private byte[] hmacSha256(byte[] key, byte[] data) {
		try {
			Mac mac = Mac.getInstance("HmacSHA256");
			mac.init(new SecretKeySpec(key, "HmacSHA256"));
			return mac.doFinal(data);
		} catch (Exception ex) {
			throw new IllegalStateException("Failed to sign OAuth token store", ex);
		}
	}

	private byte[] sha256(byte[] data) {
		try {
			return MessageDigest.getInstance("SHA-256").digest(data);
		} catch (Exception ex) {
			throw new IllegalStateException("Failed to hash OAuth token store stream", ex);
		}
	}

	private byte[] toJsonBytes(Map<String, Object> rawTokenStore) {
		return toJson(rawTokenStore).getBytes(StandardCharsets.UTF_8);
	}

	private Map<String, Object> fromJsonBytes(byte[] plaintext) {
		return new JsonObjectParser(new String(plaintext, StandardCharsets.UTF_8)).parse();
	}

	private String toJson(Map<String, Object> source) {
		StringBuilder builder = new StringBuilder("{");
		boolean first = true;
		for (Map.Entry<String, Object> entry : source.entrySet()) {
			if (!first) {
				builder.append(',');
			}
			builder.append('"').append(escapeJson(entry.getKey())).append('"').append(':');
			appendJsonValue(builder, entry.getValue());
			first = false;
		}
		return builder.append('}').toString();
	}

	private void appendJsonValue(StringBuilder builder, Object value) {
		if (value == null) {
			builder.append("null");
		} else if (value instanceof Number || value instanceof Boolean) {
			builder.append(value);
		} else {
			builder.append('"').append(escapeJson(String.valueOf(value))).append('"');
		}
	}

	private String escapeJson(String value) {
		StringBuilder builder = new StringBuilder();
		for (int index = 0; index < value.length(); index++) {
			char ch = value.charAt(index);
			switch (ch) {
				case '"' -> builder.append("\\\"");
				case '\\' -> builder.append("\\\\");
				case '\b' -> builder.append("\\b");
				case '\f' -> builder.append("\\f");
				case '\n' -> builder.append("\\n");
				case '\r' -> builder.append("\\r");
				case '\t' -> builder.append("\\t");
				default -> {
					if (ch < 0x20) {
						builder.append(String.format("\\u%04x", (int) ch));
					} else {
						builder.append(ch);
					}
				}
			}
		}
		return builder.toString();
	}

	private static byte[] concat(byte[]... chunks) {
		int length = 0;
		for (byte[] chunk : chunks) {
			length += chunk.length;
		}
		byte[] output = new byte[length];
		int offset = 0;
		for (byte[] chunk : chunks) {
			System.arraycopy(chunk, 0, output, offset, chunk.length);
			offset += chunk.length;
		}
		return output;
	}

	private static String base64UrlEncode(byte[] value) {
		return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(value);
	}

	private static byte[] base64UrlDecode(String value) {
		return java.util.Base64.getUrlDecoder().decode(value);
	}

	private static String requiredString(Map<String, Object> source, String key) {
		String value = stringValue(source.get(key));
		if (value.isBlank()) {
			throw new IllegalArgumentException("Protected OAuth token store is missing " + key);
		}
		return value;
	}

	private static String stringValue(Object value) {
		return value == null ? "" : String.valueOf(value);
	}

	private static final class JsonObjectParser {
		private final String text;
		private int index;

		private JsonObjectParser(String text) {
			this.text = text;
		}

		private Map<String, Object> parse() {
			skipWhitespace();
			expect('{');
			Map<String, Object> output = new LinkedHashMap<>();
			skipWhitespace();
			if (peek('}')) {
				index++;
				return output;
			}
			while (true) {
				skipWhitespace();
				String key = parseString();
				skipWhitespace();
				expect(':');
				skipWhitespace();
				output.put(key, parseValue());
				skipWhitespace();
				if (peek('}')) {
					index++;
					break;
				}
				expect(',');
			}
			skipWhitespace();
			if (index != text.length()) {
				throw new IllegalArgumentException("Protected OAuth token store plaintext has trailing JSON data");
			}
			return output;
		}

		private Object parseValue() {
			if (peek('"')) {
				return parseString();
			}
			if (match("true")) {
				return true;
			}
			if (match("false")) {
				return false;
			}
			if (match("null")) {
				return null;
			}
			return parseNumber();
		}

		private String parseString() {
			expect('"');
			StringBuilder builder = new StringBuilder();
			while (index < text.length()) {
				char ch = text.charAt(index++);
				if (ch == '"') {
					return builder.toString();
				}
				if (ch != '\\') {
					builder.append(ch);
					continue;
				}
				if (index >= text.length()) {
					throw new IllegalArgumentException("Invalid JSON escape");
				}
				char escape = text.charAt(index++);
				switch (escape) {
					case '"' -> builder.append('"');
					case '\\' -> builder.append('\\');
					case '/' -> builder.append('/');
					case 'b' -> builder.append('\b');
					case 'f' -> builder.append('\f');
					case 'n' -> builder.append('\n');
					case 'r' -> builder.append('\r');
					case 't' -> builder.append('\t');
					case 'u' -> builder.append(parseUnicodeEscape());
					default -> throw new IllegalArgumentException("Invalid JSON escape: " + escape);
				}
			}
			throw new IllegalArgumentException("Unterminated JSON string");
		}

		private char parseUnicodeEscape() {
			if (index + 4 > text.length()) {
				throw new IllegalArgumentException("Invalid JSON unicode escape");
			}
			String hex = text.substring(index, index + 4);
			index += 4;
			return (char) Integer.parseInt(hex, 16);
		}

		private Number parseNumber() {
			int start = index;
			if (peek('-')) {
				index++;
			}
			while (index < text.length() && Character.isDigit(text.charAt(index))) {
				index++;
			}
			if (start == index || (start + 1 == index && text.charAt(start) == '-')) {
				throw new IllegalArgumentException("Invalid JSON value");
			}
			String value = text.substring(start, index);
			long parsed = Long.parseLong(value);
			if (parsed >= Integer.MIN_VALUE && parsed <= Integer.MAX_VALUE) {
				return (int) parsed;
			}
			return parsed;
		}

		private boolean match(String value) {
			if (!text.startsWith(value, index)) {
				return false;
			}
			index += value.length();
			return true;
		}

		private void skipWhitespace() {
			while (index < text.length() && Character.isWhitespace(text.charAt(index))) {
				index++;
			}
		}

		private void expect(char expected) {
			if (!peek(expected)) {
				throw new IllegalArgumentException("Expected JSON character: " + expected);
			}
			index++;
		}

		private boolean peek(char expected) {
			return index < text.length() && text.charAt(index) == expected;
		}
	}
}
