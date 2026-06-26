package com.projectcyan.checkout;

import java.math.BigDecimal;

public record CheckoutPrepareResponse(
	Long orderId,
	String orderNo,
	Long paymentId,
	BigDecimal amount,
	String orderName,
	String customerKey
) {
}
