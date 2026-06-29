package com.projectcyan.goods;

public record GoodsLikeResponse(
	boolean liked,
	Long likeCount
) {
}
