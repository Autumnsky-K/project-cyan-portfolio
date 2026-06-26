package com.projectcyan.checkout;

public record CheckoutItemRequest(
	Long goodsId,
	Integer quantity
) {
}
