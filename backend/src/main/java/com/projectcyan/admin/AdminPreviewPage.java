package com.projectcyan.admin;

public record AdminPreviewPage(
	String key,
	String title,
	String purpose,
	String route,
	String previewUrl,
	boolean implemented,
	boolean autoDetected
) {
}
