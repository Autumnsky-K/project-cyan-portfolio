package com.projectcyan.goods;

public record GoodsDetailResponse(
	Long goodsId,
	String name,
	Integer price,
	String imageUrl,
	java.util.List<String> tags,
	String description,
	Long artistId,
	Integer stockCount,
	String artistName,
	String categoryName,
	String salesStatus,
	Boolean isBestSeller,
	Boolean aiPickDefault
) {
	public static GoodsDetailResponse from(Goods goods) {
		return from(goods, goods.getDescription());
	}

	public static GoodsDetailResponse from(Goods goods, String description) {
		return new GoodsDetailResponse(
			goods.getGoodsId(),
			goods.getGoodsName(),
			goods.getPrice(),
			goods.getMainImageUrl(),
			goods.getTags().stream().map(Tag::getTagName).toList(),
			description,
			goods.getArtist() == null ? null : goods.getArtist().getArtistId(),
			goods.getStockCount(),
			goods.getArtist() == null ? null : goods.getArtist().getArtistName(),
			goods.getCategory() == null ? null : goods.getCategory().getCategoryName(),
			goods.getSalesStatus(),
			goods.getBestSeller(),
			goods.getAiPickDefault()
		);
	}
}
