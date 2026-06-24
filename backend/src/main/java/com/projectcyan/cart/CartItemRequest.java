package com.projectcyan.cart;

public record CartItemRequest(
	Long goodsId,
	Integer quantity
) {
}
