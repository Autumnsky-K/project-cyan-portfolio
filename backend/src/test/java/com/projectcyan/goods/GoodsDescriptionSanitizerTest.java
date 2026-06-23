package com.projectcyan.goods;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class GoodsDescriptionSanitizerTest {

	private final GoodsDescriptionSanitizer sanitizer = new GoodsDescriptionSanitizer();

	@Test
	void removesScriptsAndUnsafeAttributes() {
		String sanitized = sanitizer.sanitize("<p onclick=\"alert(1)\">Safe</p><script>alert(1)</script>");

		assertThat(sanitized).contains("Safe");
		assertThat(sanitized).doesNotContain("onclick");
		assertThat(sanitized).doesNotContain("script");
	}

	@Test
	void keepsBasicQuillFormatting() {
		String sanitized = sanitizer.sanitize("<h2>Title</h2><p><strong>Bold</strong> <a href=\"https://example.com\">Link</a></p><ul><li>Item</li></ul>");

		assertThat(sanitized).contains("<h2>Title</h2>");
		assertThat(sanitized).contains("<strong>Bold</strong>");
		assertThat(sanitized).contains("<a href=\"https://example.com\"");
		assertThat(sanitized).contains("<ul><li>Item</li></ul>");
	}

	@Test
	void returnsNullForBlankContent() {
		assertThat(sanitizer.sanitize("   ")).isNull();
	}
}
