package com.projectcyan.goods;

import java.util.List;

public record GoodsDetailResponse(
	Long goodsId,
	String name,
	Integer price,
	String imageUrl,
	List<String> tags,
	String description,
	Long artistId,
	Integer stockCount,
	String artistName,
	String categoryName,
	String fulfillmentType,
	String salesStatus,
	Boolean isBestSeller,
	Boolean aiPickDefault,
	String purchaseState,
	String purchaseMessage,
	Double averageRating,
	Long reviewCount,
	Long likeCount,
	List<GoodsExtraImageResponse> extraImages
) {
	public static GoodsDetailResponse from(Goods goods) {
		return from(goods, List.of());
	}

	public static GoodsDetailResponse from(Goods goods, List<GoodsExtraImageResponse> extraImages) {
		return from(
			goods,
			goods.getStockCount() != null && goods.getStockCount() > 0 ? "AVAILABLE" : "SOLD_OUT",
			goods.getStockCount() != null && goods.getStockCount() > 0
				? "구매 가능한 상품입니다."
				: "품절된 상품입니다.",
			GoodsReviewSummary.empty(),
			0L,
			extraImages
		);
	}

	public static GoodsDetailResponse from(
		Goods goods,
		String purchaseState,
		String purchaseMessage,
		GoodsReviewSummary reviewSummary,
		Long likeCount,
		List<GoodsExtraImageResponse> extraImages
	) {
		return new GoodsDetailResponse(
			goods.getGoodsId(),
			goods.getGoodsName(),
			goods.getPrice(),
			goods.getMainImageUrl(),
			goods.getTags().stream().map(Tag::getTagName).toList(),
			goods.getDescription(),
			goods.getArtist() == null ? null : goods.getArtist().getArtistId(),
			goods.getStockCount(),
			goods.getArtist() == null ? null : goods.getArtist().getArtistName(),
			goods.getCategory() == null ? null : goods.getCategory().getCategoryName(),
			goods.getCategory() == null ? null : goods.getCategory().getFulfillmentType().name(),
			goods.getSalesStatus(),
			goods.getBestSeller(),
			goods.getAiPickDefault(),
			purchaseState,
			purchaseMessage,
			reviewSummary.averageRating(),
			reviewSummary.reviewCount(),
			likeCount == null ? 0L : likeCount,
			extraImages == null ? List.of() : extraImages
		);
	}
}
