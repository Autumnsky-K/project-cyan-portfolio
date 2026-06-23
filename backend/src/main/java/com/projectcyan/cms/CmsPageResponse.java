package com.projectcyan.cms;

public record CmsPageResponse(
	String pageKey,
	String eyebrow,
	String title,
	String summaryTitle,
	String summaryBody,
	String primaryColor,
	String accentColor,
	String backgroundColor,
	String heroImageUrl
) {
}
