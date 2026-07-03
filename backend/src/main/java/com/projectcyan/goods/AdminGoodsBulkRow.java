package com.projectcyan.goods;

public record AdminGoodsBulkRow(
	Long goodsId,
	String name,
	Integer price,
	Long artistId,
	String artistLabel,
	Long categoryId,
	String categoryLabel,
	String fulfillmentType,
	String salesStatus,
	String salesStatusLabel,
	Integer stockCount,
	String imageUrl,
	String tagsText,
	Integer activeDigitalAssetCount
) {
	public boolean digital() {
		return "DIGITAL".equals(fulfillmentType);
	}

	public boolean missingActiveDigitalAsset() {
		return digital() && (activeDigitalAssetCount == null || activeDigitalAssetCount <= 0);
	}
}
