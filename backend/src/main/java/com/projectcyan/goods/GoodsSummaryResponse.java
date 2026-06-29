package com.projectcyan.goods;

import java.util.List;

public record GoodsSummaryResponse(
	Long goodsId,
	String name,
	Integer price,
	String imageUrl,
	List<String> tags,
	Long artistId,
	String artistName,
	Long categoryId,
	String categoryName,
	String salesStatus,
	Boolean isBestSeller,
	Boolean aiPickDefault,
	Double averageRating,
	Long reviewCount,
	Long favoriteCount
) {
	public static GoodsSummaryResponse from(Goods goods) {
		return from(goods, GoodsReviewSummary.empty(), 0L);
	}

	public static GoodsSummaryResponse from(Goods goods, GoodsReviewSummary reviewSummary) {
		return from(goods, reviewSummary, 0L);
	}

	public static GoodsSummaryResponse from(Goods goods, GoodsReviewSummary reviewSummary, Long favoriteCount) {
		return new GoodsSummaryResponse(
			goods.getGoodsId(),
			goods.getGoodsName(),
			goods.getPrice(),
			goods.getMainImageUrl(),
			goods.getTags().stream().map(Tag::getTagName).toList(),
			goods.getArtist() == null ? null : goods.getArtist().getArtistId(),
			goods.getArtist() == null ? null : goods.getArtist().getArtistName(),
			goods.getCategory() == null ? null : goods.getCategory().getCategoryId(),
			goods.getCategory() == null ? null : goods.getCategory().getCategoryName(),
			goods.getSalesStatus(),
			goods.getBestSeller(),
			goods.getAiPickDefault(),
			reviewSummary.averageRating(),
			reviewSummary.reviewCount(),
			favoriteCount == null ? 0L : favoriteCount
		);
	}
}
