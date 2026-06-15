package com.projectcyan.goods;

import java.util.List;

public record GoodsFiltersResponse(
	List<GoodsFilterOptionResponse> artists,
	List<GoodsFilterOptionResponse> categories,
	List<GoodsFilterOptionResponse> tags
) {
}
