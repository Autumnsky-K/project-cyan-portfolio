package com.projectcyan.goods;

import java.util.Map;

public record GoodsVariantResponse(
	Long variantId,
	String sku,
	Integer additionalPrice,
	Integer stockCount,
	Boolean active,
	Map<String, String> selections
) {
}
