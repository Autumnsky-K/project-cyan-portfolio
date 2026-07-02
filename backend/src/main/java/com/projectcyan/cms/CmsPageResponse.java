package com.projectcyan.cms;

import java.util.Map;

public record CmsPageResponse(
	String pageKey,
	String eyebrow,
	String title,
	String summaryTitle,
	String summaryBody,
	String primaryColor,
	String accentColor,
	String backgroundColor,
	String heroImageUrl,
	Map<String, String> copySettings
) {
}
