package com.projectcyan.checkout;

import java.util.List;

public record CheckoutPrepareRequest(
	List<CheckoutItemRequest> items,
	ShippingAddressRequest shippingAddress,
	String paymentProvider
) {
}
