package com.projectcyan.checkout;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.projectcyan.member.auth.AuthenticatedMember;

import org.junit.jupiter.api.Test;

class CheckoutControllerTest {

	@Test
	void passesAuthenticatedMemberUuidToService() {
		CheckoutService checkoutService = mock(CheckoutService.class);
		CheckoutController controller = new CheckoutController(checkoutService);
		UUID memberUuid = UUID.randomUUID();
		AuthenticatedMember currentMember = new AuthenticatedMember(7L, memberUuid, "buyer@example.com", "Buyer", "010-1234-5678", "BASIC");
		CheckoutPrepareRequest request = new CheckoutPrepareRequest(
			List.of(new CheckoutItemRequest(1001L, 1)),
			new ShippingAddressRequest("Buyer", "01012345678", "01234", "Seoul", "101", "Door"),
			"TOSS"
		);
		when(checkoutService.prepare(memberUuid, request)).thenReturn(new CheckoutPrepareResponse(
			1L,
			"ORD_1",
			2L,
			BigDecimal.valueOf(1000),
			"Goods",
			"member-" + memberUuid
		));

		controller.prepare(request, currentMember);

		verify(checkoutService).prepare(memberUuid, request);
	}
}
