package com.projectcyan.member;

import java.time.Instant;

public record MemberGoodsActivityItemResponse(
	Long goodsId,
	String name,
	Integer price,
	String imageUrl,
	String description,
	Instant activityAt
) {
}
