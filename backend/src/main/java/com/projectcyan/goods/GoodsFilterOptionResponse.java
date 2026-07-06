package com.projectcyan.goods;

public record GoodsFilterOptionResponse(
	String label,
	String value,
	String fulfillmentType,
	String groupName,
	String groupValue
) {
	public GoodsFilterOptionResponse(String label, String value) {
		this(label, value, null, null, null);
	}

	public GoodsFilterOptionResponse(String label, String value, String fulfillmentType) {
		this(label, value, fulfillmentType, null, null);
	}

	public static GoodsFilterOptionResponse artist(String label, String value, String groupName, String groupValue) {
		return new GoodsFilterOptionResponse(label, value, null, groupName, groupValue);
	}
}
