package com.projectcyan.goods;

public record GoodsShippingResponse(
	Integer fee,
	String carrier,
	String scope,
	String note
) {
}
