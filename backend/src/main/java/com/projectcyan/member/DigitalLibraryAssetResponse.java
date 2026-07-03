package com.projectcyan.member;

public record DigitalLibraryAssetResponse(
	Long assetId,
	String displayName,
	String originalFileName,
	String contentType,
	Long fileSizeBytes
) {
}
