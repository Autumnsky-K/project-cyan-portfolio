package com.projectcyan.checkout;

public record ShippingAddressRequest(
	String recipientName,
	String recipientPhone,
	String postalCode,
	String address,
	String addressDetail,
	String deliveryRequest
) {
}
