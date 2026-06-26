package com.projectcyan.checkout;

import com.projectcyan.member.auth.AuthenticatedMember;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
}
