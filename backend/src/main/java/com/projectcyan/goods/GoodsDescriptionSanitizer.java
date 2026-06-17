package com.projectcyan.goods;

import java.util.regex.Pattern;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;
import org.springframework.stereotype.Component;

@Component
public class GoodsDescriptionSanitizer {

	private static final Pattern QUILL_ALIGN_CLASS = Pattern.compile("ql-align-(center|right|justify)");

	private final PolicyFactory policy = Sanitizers.FORMATTING
		.and(Sanitizers.BLOCKS)
		.and(Sanitizers.LINKS)
		.and(new HtmlPolicyBuilder()
			.allowElements("h1", "h2", "h3", "ol", "ul", "li", "blockquote", "pre", "code")
			.allowAttributes("class").matching(QUILL_ALIGN_CLASS).onElements("p", "h1", "h2", "h3")
			.toFactory());

	public String sanitize(String rawHtml) {
		if (rawHtml == null || rawHtml.isBlank()) {
			return null;
		}

		String sanitized = policy.sanitize(rawHtml).trim();
		return sanitized.isBlank() ? null : sanitized;
	}
}
