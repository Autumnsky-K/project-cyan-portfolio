package com.projectcyan.goods;

import java.util.List;

public record GoodsHomeDiscoveryResponse(
	List<GoodsSummaryResponse> physicalGoods,
	List<GoodsSummaryResponse> digitalGoods,
	List<GoodsHomeDiscoveryGroupResponse> artists,
	List<GoodsHomeDiscoveryGroupResponse> categories,
	List<GoodsHomeDiscoveryGroupResponse> physicalCategories,
	List<GoodsHomeDiscoveryGroupResponse> digitalCategories,
	List<GoodsHomeDiscoveryGroupResponse> digitalTags,
	long totalGoods,
	long physicalGoodsCount,
	long digitalGoodsCount
) {
}
