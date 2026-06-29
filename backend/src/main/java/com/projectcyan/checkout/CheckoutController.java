package com.projectcyan.checkout;

import com.projectcyan.member.auth.AuthenticatedMember;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

	private final CheckoutService checkoutService;

	public CheckoutController(CheckoutService checkoutService) {
		this.checkoutService = checkoutService;
	}

	@PostMapping("/prepare")
	public CheckoutPrepareResponse prepare(
		@RequestBody CheckoutPrepareRequest request,
		AuthenticatedMember currentMember
	) {
		return checkoutService.prepare(currentMember.memberUuid(), request);
	}

	@PostMapping("/payments/approve")
	public PaymentResultResponse approvePayment(
		@RequestBody PaymentResultRequest request,
		AuthenticatedMember currentMember
	) {
		return checkoutService.approvePayment(currentMember.memberUuid(), request);
	}

	@GetMapping("/payments/kakao/attempt")
	public PaymentAttemptRecoveryResponse recoverKakaoPaymentAttempt(
		@RequestParam(name = "orderId", required = false) String orderId,
		AuthenticatedMember currentMember
	) {
		return checkoutService.recoverKakaoPaymentAttempt(currentMember.memberUuid(), orderId);
	}

	@PostMapping("/payments/cancel")
	public PaymentResultResponse cancelPayment(
		@RequestBody PaymentResultRequest request,
		AuthenticatedMember currentMember
	) {
		return checkoutService.cancelPayment(currentMember.memberUuid(), request);
	}

	@PostMapping("/payments/fail")
	public PaymentResultResponse failPayment(
		@RequestBody PaymentResultRequest request,
		AuthenticatedMember currentMember
	) {
		return checkoutService.failPayment(currentMember.memberUuid(), request);
	}
}
