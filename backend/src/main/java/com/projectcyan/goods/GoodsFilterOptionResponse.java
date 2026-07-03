package com.projectcyan.goods;

public record GoodsFilterOptionResponse(
	String label,
	String value,
	String fulfillmentType
) {
	public GoodsFilterOptionResponse(String label, String value) {
		this(label, value, null);
	}
}
