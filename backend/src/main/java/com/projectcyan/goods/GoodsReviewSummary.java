package com.projectcyan.goods;

public record GoodsReviewSummary(
	Double averageRating,
	Long reviewCount,
	Long ratingFiveCount,
	Long ratingFourCount,
	Long ratingThreeCount,
	Long ratingTwoCount,
	Long ratingOneCount
) {
	public static GoodsReviewSummary empty() {
		return new GoodsReviewSummary(0.0, 0L, 0L, 0L, 0L, 0L, 0L);
	}
}
