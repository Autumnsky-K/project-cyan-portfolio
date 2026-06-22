package com.projectcyan.goods;

import java.time.Instant;

public record GoodsReviewResponse(
	Long reviewId,
	Integer rating,
	String authorName,
	String optionLabel,
	String content,
	Instant createdAt
) {
}
