package com.projectcyan.virtualchat;

public record VirtualRecommendationRequest(
	Long goodsId,
	String requestText,
	String recommendationReason,
	Integer rankOrder
) {
}
