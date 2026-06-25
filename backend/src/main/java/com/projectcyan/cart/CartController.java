package com.projectcyan.cart;

import com.projectcyan.member.auth.AuthenticatedMember;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

	private final CartService cartService;

	public CartController(CartService cartService) {
		this.cartService = cartService;
	}

	@GetMapping
	public CartResponse findCart(AuthenticatedMember currentMember) {
		return cartService.findCart(currentMember.memberId());
	}

	@PostMapping("/items")
	public CartResponse addItem(
		@RequestBody CartItemRequest request,
		AuthenticatedMember currentMember
	) {
		return cartService.addItem(currentMember.memberId(), request);
	}

	@PatchMapping("/items/{cartItemId}")
	public CartResponse updateItemQuantity(
		@PathVariable Long cartItemId,
		@RequestBody CartItemQuantityRequest request,
		AuthenticatedMember currentMember
	) {
		return cartService.updateItemQuantity(currentMember.memberId(), cartItemId, request);
	}

	@DeleteMapping("/items/{cartItemId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void removeItem(
		@PathVariable Long cartItemId,
		AuthenticatedMember currentMember
	) {
		cartService.removeItem(currentMember.memberId(), cartItemId);
	}

	@DeleteMapping("/items")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void clearCart(AuthenticatedMember currentMember) {
		cartService.clearCart(currentMember.memberId());
	}
}
