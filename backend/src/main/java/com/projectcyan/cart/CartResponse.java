package com.projectcyan.cart;

import java.util.List;

public record CartResponse(
	Long cartId,
	List<CartItemResponse> items,
	Integer totalQuantity,
	Integer totalPrice
) {
	static CartResponse empty() {
		return new CartResponse(null, List.of(), 0, 0);
	}

	static CartResponse from(Long cartId, List<CartItemResponse> items) {
		int totalQuantity = items.stream()
			.map(CartItemResponse::quantity)
			.mapToInt(quantity -> quantity == null ? 0 : quantity)
			.sum();
		int totalPrice = items.stream()
			.map(CartItemResponse::subtotal)
			.mapToInt(subtotal -> subtotal == null ? 0 : subtotal)
			.sum();

		return new CartResponse(cartId, items, totalQuantity, totalPrice);
	}
}
