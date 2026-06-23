package com.projectcyan.checkout;

import java.util.List;

public record CheckoutPrepareRequest(
	Long memberId,
	List<CheckoutItemRequest> items,
	ShippingAddressRequest shippingAddress,
	String paymentProvider
) {
}
