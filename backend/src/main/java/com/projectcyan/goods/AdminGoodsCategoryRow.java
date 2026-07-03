package com.projectcyan.goods;

public record AdminGoodsCategoryRow(
	Long categoryId,
	String categoryName,
	String fulfillmentType,
	String fulfillmentLabel,
	long goodsCount
) {
	static AdminGoodsCategoryRow from(GoodsCategory category, long goodsCount) {
		GoodsFulfillmentType fulfillmentType = category.getFulfillmentType();
		return new AdminGoodsCategoryRow(
			category.getCategoryId(),
			category.getCategoryName(),
			fulfillmentType.name(),
			fulfillmentType.label(),
			goodsCount
		);
	}
}
