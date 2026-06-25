package com.projectcyan.payment;

import org.springframework.stereotype.Service;

@Service
public class PaymentService {

	public PaymentOperationResult confirm(PaymentConfirmCommand command) {
		return notReady("결제 승인 confirm 로직은 아직 연결되지 않았습니다.");
	}

	public PaymentOperationResult cancel(PaymentCancelCommand command) {
		return notReady("결제 취소 로직은 아직 연결되지 않았습니다.");
	}

	public PaymentOperationResult refund(PaymentRefundCommand command) {
		return notReady("환불 처리 로직은 아직 연결되지 않았습니다.");
	}

	public PaymentOperationResult reconcile(String orderId) {
		return notReady("PG 상태 재조회와 DB 대사 로직은 아직 연결되지 않았습니다.");
	}

	private PaymentOperationResult notReady(String message) {
		return new PaymentOperationResult(false, "NOT_READY", message);
	}

	public record PaymentConfirmCommand(
		String orderId,
		String paymentKey,
		Integer amount
	) {
	}

	public record PaymentCancelCommand(
		String orderId,
		String paymentKey,
		String reason
	) {
	}

	public record PaymentRefundCommand(
		String orderId,
		String paymentKey,
		Integer refundAmount,
		String reason
	) {
	}

	public record PaymentOperationResult(
		boolean success,
		String code,
		String message
	) {
	}
}
