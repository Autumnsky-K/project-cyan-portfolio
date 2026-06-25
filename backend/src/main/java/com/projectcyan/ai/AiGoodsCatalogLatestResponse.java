package com.projectcyan.ai;

import java.time.Instant;

public record AiGoodsCatalogLatestResponse(
	String catalogUrl,
	Instant generatedAt,
	Instant urlExpiresAt,
	Integer itemCount,
	Long fileSizeBytes,
	String storageBucket,
	String storagePath
) {
	public static AiGoodsCatalogLatestResponse from(AiGoodsCatalogSnapshot snapshot) {
		return new AiGoodsCatalogLatestResponse(
			snapshot.getCatalogUrl(),
			snapshot.getGeneratedAt(),
			snapshot.getUrlExpiresAt(),
			snapshot.getItemCount(),
			snapshot.getFileSizeBytes(),
			snapshot.getStorageBucket(),
			snapshot.getStoragePath()
		);
	}
}
