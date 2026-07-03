package com.projectcyan.member;

import java.time.Instant;
import java.util.List;

public record DigitalLibraryItemResponse(
	Long entitlementId,
	Long goodsId,
	String name,
	String artistName,
	String categoryName,
	Integer price,
	String imageUrl,
	Instant grantedAt,
	Instant lastDownloadedAt,
	Instant nextDownloadAvailableAt,
	boolean downloadAvailable,
	Integer downloadsRemaining,
	Integer downloadLimitPerPeriod,
	Integer downloadPeriodDays,
	List<DigitalLibraryAssetResponse> assets
) {
}
