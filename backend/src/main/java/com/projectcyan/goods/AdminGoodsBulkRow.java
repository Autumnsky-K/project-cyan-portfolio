package com.projectcyan.goods;

public record AdminGoodsBulkRow(
	Long goodsId,
	String name,
	Integer price,
	Long artistId,
	String artistLabel,
	Long categoryId,
	String categoryLabel,
	String salesStatus,
	String salesStatusLabel,
	Integer stockCount,
	String imageUrl,
	String tagsText
) {
}
