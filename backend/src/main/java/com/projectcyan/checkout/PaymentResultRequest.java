package com.projectcyan.checkout;

import java.math.BigDecimal;

public record PaymentResultRequest(
	Long orderId,
	String orderNo,
	Long paymentId,
	String provider,
	String providerPaymentKey,
	String paymentMethod,
	BigDecimal amount,
	String reason
) {
}
