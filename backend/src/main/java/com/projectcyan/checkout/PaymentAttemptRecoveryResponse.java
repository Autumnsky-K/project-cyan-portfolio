package com.projectcyan.checkout;

import java.math.BigDecimal;

public record PaymentAttemptRecoveryResponse(
	Long orderId,
	String orderNo,
	Long paymentId,
	String paymentStatus,
	String orderStatus,
	BigDecimal amount,
	String provider,
	String paymentMethod,
	String providerPaymentKey,
	String providerOrderId,
	String tid,
	String partnerOrderId,
	String partnerUserId,
	String attemptStatus
) {
	static PaymentAttemptRecoveryResponse from(PaymentAttempt attempt) {
		StoreOrder order = attempt.getOrder();
		Payment payment = attempt.getPayment();

		return new PaymentAttemptRecoveryResponse(
			order.getOrderId(),
			order.getOrderNo(),
			payment.getPaymentId(),
			payment.getPaymentStatus(),
			order.getOrderStatus(),
			payment.getPaymentAmount(),
			payment.getProvider(),
			attempt.getPaymentMethod(),
			payment.getProviderPaymentKey(),
			payment.getProviderOrderId(),
			attempt.getTid(),
			attempt.getPartnerOrderId(),
			attempt.getPartnerUserId(),
			attempt.getAttemptStatus()
		);
	}
}
