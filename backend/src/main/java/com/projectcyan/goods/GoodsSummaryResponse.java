package com.projectcyan.goods;

import java.util.List;

public record GoodsSummaryResponse(
	Long goodsId,
	String name,
	Integer price,
	String imageUrl,
	List<String> tags,
	String artistName,
	String categoryName,
	String salesStatus,
	Boolean isBestSeller,
	Boolean aiPickDefault
) {
	public static GoodsSummaryResponse from(Goods goods) {
		return new GoodsSummaryResponse(
			goods.getGoodsId(),
			goods.getGoodsName(),
			goods.getPrice(),
			goods.getMainImageUrl(),
			goods.getTags().stream().map(Tag::getTagName).toList(),
			goods.getArtist() == null ? null : goods.getArtist().getArtistName(),
			goods.getCategory() == null ? null : goods.getCategory().getCategoryName(),
			goods.getSalesStatus(),
			goods.getBestSeller(),
			goods.getAiPickDefault()
		);
	}
}
