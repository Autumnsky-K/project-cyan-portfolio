package com.projectcyan.checkout;

import java.math.BigDecimal;

public record PaymentResultResponse(
	Long orderId,
	String orderNo,
	Long paymentId,
	String paymentStatus,
	String orderStatus,
	BigDecimal amount,
	String provider,
	String providerPaymentKey,
	String reason
) {
	static PaymentResultResponse from(Payment payment, String reason) {
		StoreOrder order = payment.getOrder();

		return new PaymentResultResponse(
			order.getOrderId(),
			order.getOrderNo(),
			payment.getPaymentId(),
			payment.getPaymentStatus(),
			order.getOrderStatus(),
			payment.getPaymentAmount(),
			payment.getProvider(),
			payment.getProviderPaymentKey(),
			reason
		);
	}
}
