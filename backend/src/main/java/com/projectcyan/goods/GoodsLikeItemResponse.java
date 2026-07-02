package com.projectcyan.goods;

public record GoodsLikeItemResponse(
	Long goodsId,
	boolean liked,
	long likeCount
) {
}
