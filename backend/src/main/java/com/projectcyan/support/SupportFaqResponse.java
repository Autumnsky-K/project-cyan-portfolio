package com.projectcyan.support;

public record SupportFaqResponse(
	Long faqId,
	String category,
	String question,
	String answer,
	int sortOrder,
	boolean visible
) {
	static SupportFaqResponse from(SupportFaq faq) {
		return new SupportFaqResponse(
			faq.getFaqId(),
			faq.getCategory(),
			faq.getQuestion(),
			faq.getAnswer(),
			faq.getSortOrder(),
			faq.isVisible()
		);
	}
}
