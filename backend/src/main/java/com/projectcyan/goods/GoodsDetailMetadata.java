package com.projectcyan.goods;

import java.time.Instant;
import java.util.List;

public record GoodsDetailMetadata(
	String saleType,
	Instant saleStartAt,
	Instant saleEndAt,
	GoodsShippingResponse shipping,
	GoodsNoticesResponse notices,
	List<GoodsOptionGroupResponse> optionGroups,
	List<GoodsVariantResponse> variants
) {
}
