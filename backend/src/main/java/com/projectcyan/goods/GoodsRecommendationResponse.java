package com.projectcyan.goods;

import java.util.List;

public record GoodsRecommendationResponse(
	Long goodsId,
	String name,
	Integer price,
	String imageUrl,
	List<String> tags,
	String artistName,
	String categoryName,
	String salesStatus,
	Integer stockCount,
	String recommendationReason,
	List<String> matchedFields
) {
}
