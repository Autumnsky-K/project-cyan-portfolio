package com.projectcyan.goods;

public record GoodsReviewRequest(
	Integer rating,
	String content,
	String optionLabel
) {
}
