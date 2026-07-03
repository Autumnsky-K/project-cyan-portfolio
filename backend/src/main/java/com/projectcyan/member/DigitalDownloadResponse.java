package com.projectcyan.member;

import java.time.Instant;

public record DigitalDownloadResponse(
	Long requestId,
	Long assetId,
	String signedUrl,
	Instant expiresAt,
	String fileName,
	String contentType
) {
}
