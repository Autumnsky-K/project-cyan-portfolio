package com.projectcyan.inquiry;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.projectcyan.checkout.StoreOrder;
import com.projectcyan.checkout.StoreOrderRepository;

class InquiryServiceTest {

	private static final Instant NOW = Instant.parse("2026-07-04T03:00:00Z");
	private static final Long MEMBER_ID = 7L;

	private InquiryRepository inquiryRepository;
	private StoreOrderRepository storeOrderRepository;
	private InquiryService service;

	@BeforeEach
	void setUp() {
		inquiryRepository = mock(InquiryRepository.class);
		storeOrderRepository = mock(StoreOrderRepository.class);
		service = new InquiryService(inquiryRepository, storeOrderRepository, Clock.fixed(NOW, ZoneOffset.UTC));

		when(inquiryRepository.save(any(Inquiry.class))).thenAnswer(invocation -> invocation.getArgument(0));
	}

	@Test
	void createSupportInquiryWithoutOrderIdLeavesOrderFieldsEmpty() {
		InquiryResponse response = service.createSupportInquiry(
			MEMBER_ID,
			new InquirySupportRequest("제목", "내용", null)
		);

		assertThat(response.orderId()).isNull();
		assertThat(response.orderNo()).isNull();
		verify(storeOrderRepository, never()).findById(any());
	}

	@Test
	void createSupportInquiryWithOwnedOrderLinksOrder() {
		StoreOrder order = mock(StoreOrder.class);
		when(order.getOrderId()).thenReturn(501L);
		when(order.getOrderNo()).thenReturn("ORD-501");
		when(order.getMemberId()).thenReturn(MEMBER_ID);
		when(storeOrderRepository.findById(501L)).thenReturn(Optional.of(order));

		InquiryResponse response = service.createSupportInquiry(
			MEMBER_ID,
			new InquirySupportRequest("배송 문의", "아직 도착을 안 했어요.", 501L)
		);

		assertThat(response.orderId()).isEqualTo(501L);
		assertThat(response.orderNo()).isEqualTo("ORD-501");
	}

	@Test
	void createSupportInquiryWithOrderOwnedByAnotherMemberIsRejected() {
		StoreOrder order = mock(StoreOrder.class);
		when(order.getMemberId()).thenReturn(999L);
		when(storeOrderRepository.findById(501L)).thenReturn(Optional.of(order));

		assertThatThrownBy(() ->
			service.createSupportInquiry(MEMBER_ID, new InquirySupportRequest("제목", "내용", 501L))
		)
			.isInstanceOf(ResponseStatusException.class)
			.satisfies(exception ->
				assertThat(((ResponseStatusException) exception).getStatusCode())
					.isEqualTo(HttpStatus.FORBIDDEN)
			);

		verify(inquiryRepository, never()).save(any());
	}

	@Test
	void createSupportInquiryWithMissingOrderIsRejected() {
		when(storeOrderRepository.findById(999L)).thenReturn(Optional.empty());

		assertThatThrownBy(() ->
			service.createSupportInquiry(MEMBER_ID, new InquirySupportRequest("제목", "내용", 999L))
		)
			.isInstanceOf(ResponseStatusException.class)
			.satisfies(exception ->
				assertThat(((ResponseStatusException) exception).getStatusCode())
					.isEqualTo(HttpStatus.NOT_FOUND)
			);
	}

	@Test
	void createSupportInquiryWithBlankTitleIsRejected() {
		assertThatThrownBy(() ->
			service.createSupportInquiry(MEMBER_ID, new InquirySupportRequest(" ", "내용", null))
		)
			.isInstanceOf(ResponseStatusException.class)
			.satisfies(exception ->
				assertThat(((ResponseStatusException) exception).getStatusCode())
					.isEqualTo(HttpStatus.BAD_REQUEST)
			);
	}

	@Test
	void findMyInquiriesResolvesOrderNumbersInBatch() {
		Inquiry withOrder = Inquiry.supportInquiry(MEMBER_ID, "제목1", "내용1", 501L, NOW);
		Inquiry withoutOrder = Inquiry.supportInquiry(MEMBER_ID, "제목2", "내용2", null, NOW);

		when(inquiryRepository.findByMemberIdAndInquiryTypeOrderByCreatedAtDesc(
			MEMBER_ID,
			InquiryType.SUPPORT,
			PageRequest.of(0, 20)
		)).thenReturn(new PageImpl<>(List.of(withOrder, withoutOrder)));

		StoreOrder order = mock(StoreOrder.class);
		when(order.getOrderId()).thenReturn(501L);
		when(order.getOrderNo()).thenReturn("ORD-501");
		when(storeOrderRepository.findAllById(List.of(501L))).thenReturn(List.of(order));

		var result = service.findMyInquiries(MEMBER_ID, InquiryType.SUPPORT, 0, 20);

		assertThat(result.content()).hasSize(2);
		assertThat(result.content().get(0).orderNo()).isEqualTo("ORD-501");
		assertThat(result.content().get(1).orderNo()).isNull();
	}

	@Test
	void findMyInquiriesToleratesOrderWithNullOrderNo() {
		Inquiry withOrder = Inquiry.supportInquiry(MEMBER_ID, "제목", "내용", 501L, NOW);

		when(inquiryRepository.findByMemberIdAndInquiryTypeOrderByCreatedAtDesc(
			MEMBER_ID,
			InquiryType.SUPPORT,
			PageRequest.of(0, 20)
		)).thenReturn(new PageImpl<>(List.of(withOrder)));

		StoreOrder order = mock(StoreOrder.class);
		when(order.getOrderId()).thenReturn(501L);
		when(order.getOrderNo()).thenReturn(null);
		when(storeOrderRepository.findAllById(List.of(501L))).thenReturn(List.of(order));

		var result = service.findMyInquiries(MEMBER_ID, InquiryType.SUPPORT, 0, 20);

		assertThat(result.content()).hasSize(1);
		assertThat(result.content().get(0).orderNo()).isNull();
	}

	@Test
	void findMyInquiriesWithNoOrderLinkedAtAllDoesNotThrow() {
		Inquiry first = Inquiry.supportInquiry(MEMBER_ID, "제목1", "내용1", null, NOW);
		Inquiry second = Inquiry.supportInquiry(MEMBER_ID, "제목2", "내용2", null, NOW);

		when(inquiryRepository.findByMemberIdAndInquiryTypeOrderByCreatedAtDesc(
			MEMBER_ID,
			InquiryType.SUPPORT,
			PageRequest.of(0, 20)
		)).thenReturn(new PageImpl<>(List.of(first, second)));

		var result = service.findMyInquiries(MEMBER_ID, InquiryType.SUPPORT, 0, 20);

		assertThat(result.content()).hasSize(2);
		assertThat(result.content().get(0).orderNo()).isNull();
		assertThat(result.content().get(1).orderNo()).isNull();
		verify(storeOrderRepository, never()).findAllById(any());
	}
}
