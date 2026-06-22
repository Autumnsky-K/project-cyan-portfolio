package com.projectcyan.goods;

import java.util.List;

public record GoodsOptionGroupResponse(
	Long optionGroupId,
	String key,
	String name,
	List<GoodsOptionValueResponse> values
) {
}
