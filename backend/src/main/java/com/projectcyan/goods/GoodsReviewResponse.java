package com.projectcyan.goods;

import java.time.Instant;

public record GoodsReviewResponse(
	Long reviewId,
	Long memberId,
	Integer rating,
	String authorName,
	String optionLabel,
	String content,
	Instant createdAt,
	Instant updatedAt,
	Boolean ownedByCurrentMember
) {
}
