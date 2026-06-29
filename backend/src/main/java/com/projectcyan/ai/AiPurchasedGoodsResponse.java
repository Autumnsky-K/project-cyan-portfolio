package com.projectcyan.ai;

import java.time.Instant;

public record AiPurchasedGoodsResponse(
	Long goodsId,
	String name,
	String artistName,
	Integer price,
	Integer quantity,
	String orderStatus,
	Instant purchasedAt
) {
}
