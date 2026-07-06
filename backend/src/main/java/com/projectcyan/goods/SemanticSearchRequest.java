package com.projectcyan.goods;

import java.util.List;

public record SemanticSearchRequest(
	List<Float> queryEmbedding,
	String categoryName,
	String artistName,
	Integer maxPrice,
	List<Long> excludeGoodsIds,
	List<Long> preferredArtistIds,
	Integer size
) {
}
