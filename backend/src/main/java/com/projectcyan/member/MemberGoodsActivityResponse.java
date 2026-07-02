package com.projectcyan.member;

import java.util.List;

public record MemberGoodsActivityResponse(
	List<MemberGoodsActivityItemResponse> likedGoods,
	List<MemberGoodsActivityItemResponse> recentlyViewedGoods
) {
}
