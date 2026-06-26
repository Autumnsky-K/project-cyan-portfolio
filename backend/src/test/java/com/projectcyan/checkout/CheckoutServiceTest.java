package com.projectcyan.checkout;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Constructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import com.projectcyan.common.ApiErrorException;
import com.projectcyan.goods.Goods;
import com.projectcyan.goods.GoodsRepository;
import com.projectcyan.goods.GoodsStock;
import com.projectcyan.goods.GoodsStockRepository;
import com.projectcyan.member.Member;
import com.projectcyan.member.MemberRepository;

class CheckoutServiceTest {

	private MemberRepository memberRepository;
	private GoodsRepository goodsRepository;
	private GoodsStockRepository goodsStockRepository;
	private StoreOrderRepository storeOrderRepository;
	private OrderItemRepository orderItemRepository;
	private PaymentRepository paymentRepository;
	private PaymentAttemptRepository paymentAttemptRepository;
	private CheckoutService checkoutService;
	private StoreOrder savedOrder;
	private Payment savedPayment;
	private PaymentAttempt savedPaymentAttempt;

	@BeforeEach
	void setUp() {
		memberRepository = mock(MemberRepository.class);
		goodsRepository = mock(GoodsRepository.class);
		goodsStockRepository = mock(GoodsStockRepository.class);
		storeOrderRepository = mock(StoreOrderRepository.class);
		orderItemRepository = mock(OrderItemRepository.class);
		paymentRepository = mock(PaymentRepository.class);
		paymentAttemptRepository = mock(PaymentAttemptRepository.class);
		checkoutService = new CheckoutService(
			memberRepository,
			goodsRepository,
			goodsStockRepository,
			storeOrderRepository,
			orderItemRepository,
			paymentRepository,
			paymentAttemptRepository
		);

		when(storeOrderRepository.existsByOrderNo(any())).thenReturn(false);
		when(storeOrderRepository.save(any(StoreOrder.class))).thenAnswer(invocation -> {
			StoreOrder order = invocation.getArgument(0);
			ReflectionTestUtils.setField(order, "orderId", 123L);
			savedOrder = order;
			return order;
		});
		when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
			Payment payment = invocation.getArgument(0);
			ReflectionTestUtils.setField(payment, "paymentId", 456L);
			savedPayment = payment;
			return payment;
		});
		when(paymentAttemptRepository.save(any(PaymentAttempt.class))).thenAnswer(invocation -> {
			PaymentAttempt paymentAttempt = invocation.getArgument(0);
			ReflectionTestUtils.setField(paymentAttempt, "paymentAttemptId", 789L);
			savedPaymentAttempt = paymentAttempt;
			return paymentAttempt;
		});
	}

	@Test
	void preparesCheckoutWithAuthenticatedMemberUuid() {
		Member member = member();
		Goods goods = goods(1001L, "Test Goods", 35000, "ON_SALE");
		when(memberRepository.findByMemberUuid(member.getMemberUuid())).thenReturn(Optional.of(member));
		when(goodsRepository.findAllById(Set.of(1001L))).thenReturn(List.of(goods));
		when(goodsStockRepository.findByGoodsIdIn(Set.of(1001L))).thenReturn(List.of(stock(goods, 10)));

		CheckoutPrepareResponse response = checkoutService.prepare(member.getMemberUuid(), request(item(1001L, 1)));

		assertThat(response.orderId()).isEqualTo(123L);
		assertThat(response.paymentId()).isEqualTo(456L);
		assertThat(response.orderNo()).matches("[A-Z0-9_-]{6,64}");
		assertThat(response.amount()).isEqualByComparingTo(BigDecimal.valueOf(35000));
		assertThat(response.orderName()).isEqualTo("Test Goods");
		assertThat(response.customerKey()).isEqualTo("member-" + member.getMemberUuid());
		assertThat(ReflectionTestUtils.getField(savedOrder, "orderStatus")).isEqualTo("PENDING");
		assertThat(ReflectionTestUtils.getField(savedPayment, "paymentMethod")).isNull();
		assertThat(ReflectionTestUtils.getField(savedPayment, "provider")).isEqualTo("TOSS");
		assertThat(ReflectionTestUtils.getField(savedPayment, "paymentStatus")).isEqualTo("READY");
		assertThat(ReflectionTestUtils.getField(savedPayment, "providerOrderId")).isEqualTo(response.orderNo());
		assertThat(ReflectionTestUtils.getField(savedPayment, "providerPaymentKey")).isNull();
		assertThat(ReflectionTestUtils.getField(savedPaymentAttempt, "paymentMethod")).isNull();
		assertThat(ReflectionTestUtils.getField(savedPaymentAttempt, "provider")).isEqualTo("TOSS");
		assertThat(ReflectionTestUtils.getField(savedPaymentAttempt, "attemptStatus")).isEqualTo("READY");
		assertThat(ReflectionTestUtils.getField(savedPaymentAttempt, "providerOrderId")).isEqualTo(response.orderNo());
		assertThat(ReflectionTestUtils.getField(savedPaymentAttempt, "tid")).isNull();
		assertThat(ReflectionTestUtils.getField(savedPaymentAttempt, "partnerOrderId")).isNull();
		assertThat(ReflectionTestUtils.getField(savedPaymentAttempt, "partnerUserId")).isNull();
		verify(memberRepository).findByMemberUuid(member.getMemberUuid());
		verify(memberRepository, never()).findById(any());
	}

	@Test
	void requestBodyCannotSelectAnotherMember() {
		assertThat(CheckoutPrepareRequest.class.getRecordComponents())
			.extracting(java.lang.reflect.RecordComponent::getName)
			.doesNotContain("memberId");
	}

	@Test
	void rejectsNullItems() {
		Member member = member();
		when(memberRepository.findByMemberUuid(member.getMemberUuid())).thenReturn(Optional.of(member));

		assertError("INVALID_ORDER_ITEMS", () -> checkoutService.prepare(member.getMemberUuid(), requestWithItems(null)));
	}

	@Test
	void rejectsEmptyItems() {
		Member member = member();
		when(memberRepository.findByMemberUuid(member.getMemberUuid())).thenReturn(Optional.of(member));

		assertError("INVALID_ORDER_ITEMS", () -> checkoutService.prepare(member.getMemberUuid(), requestWithItems(List.of())));
	}

	@Test
	void rejectsMissingAuthenticatedMember() {
		UUID memberUuid = UUID.randomUUID();
		when(memberRepository.findByMemberUuid(memberUuid)).thenReturn(Optional.empty());

		assertError("MEMBER_NOT_FOUND", () -> checkoutService.prepare(memberUuid, request(item(1001L, 1))));
	}

	@Test
	void rejectsMissingGoods() {
		Member member = member();
		when(memberRepository.findByMemberUuid(member.getMemberUuid())).thenReturn(Optional.of(member));
		when(goodsRepository.findAllById(Set.of(999L))).thenReturn(List.of());

		assertError("GOODS_NOT_FOUND", () -> checkoutService.prepare(member.getMemberUuid(), request(item(999L, 1))));
	}

	@Test
	void rejectsStoppedGoods() {
		Member member = member();
		Goods goods = goods(1001L, "Hidden Goods", 10000, "HIDDEN");
		when(memberRepository.findByMemberUuid(member.getMemberUuid())).thenReturn(Optional.of(member));
		when(goodsRepository.findAllById(Set.of(1001L))).thenReturn(List.of(goods));

		assertError("GOODS_NOT_SALE", () -> checkoutService.prepare(member.getMemberUuid(), request(item(1001L, 1))));
	}

	@Test
	void rejectsZeroQuantity() {
		Member member = member();
		when(memberRepository.findByMemberUuid(member.getMemberUuid())).thenReturn(Optional.of(member));

		assertError("INVALID_QUANTITY", () -> checkoutService.prepare(member.getMemberUuid(), request(item(1001L, 0))));
	}

	@Test
	void rejectsMaxPurchaseQuantityExceeded() {
		Member member = member();
		when(memberRepository.findByMemberUuid(member.getMemberUuid())).thenReturn(Optional.of(member));

		assertError(
			"MAX_PURCHASE_QUANTITY_EXCEEDED",
			() -> checkoutService.prepare(member.getMemberUuid(), request(item(1001L, 100)))
		);
	}

	@Test
	void rejectsOutOfStock() {
		Member member = member();
		Goods goods = goods(1001L, "Low Stock Goods", 10000, "ON_SALE");
		when(memberRepository.findByMemberUuid(member.getMemberUuid())).thenReturn(Optional.of(member));
		when(goodsRepository.findAllById(Set.of(1001L))).thenReturn(List.of(goods));
		when(goodsStockRepository.findByGoodsIdIn(Set.of(1001L))).thenReturn(List.of(stock(goods, 1)));

		assertError("OUT_OF_STOCK", () -> checkoutService.prepare(member.getMemberUuid(), request(item(1001L, 2))));
	}

	@Test
	void calculatesTotalAmountFromMultipleDbGoods() {
		Member member = member();
		Goods goodsA = goods(1001L, "Goods A", 10000, "ON_SALE");
		Goods goodsB = goods(1002L, "Goods B", 7500, "ON_SALE");
		when(memberRepository.findByMemberUuid(member.getMemberUuid())).thenReturn(Optional.of(member));
		when(goodsRepository.findAllById(Set.of(1001L, 1002L))).thenReturn(List.of(goodsA, goodsB));
		when(goodsStockRepository.findByGoodsIdIn(Set.of(1001L, 1002L))).thenReturn(List.of(
			stock(goodsA, 10),
			stock(goodsB, 10)
		));

		CheckoutPrepareResponse response = checkoutService.prepare(
			member.getMemberUuid(),
			request(item(1001L, 2), item(1002L, 3))
		);

		assertThat(response.amount()).isEqualByComparingTo(BigDecimal.valueOf(42500));
		assertThat(response.orderName()).startsWith("Goods A");
	}

	@Test
	void wrapsUnexpectedFailureAndDoesNotContinueSaving() {
		Member member = member();
		Goods goods = goods(1001L, "Test Goods", 35000, "ON_SALE");
		when(memberRepository.findByMemberUuid(member.getMemberUuid())).thenReturn(Optional.of(member));
		when(goodsRepository.findAllById(Set.of(1001L))).thenReturn(List.of(goods));
		when(goodsStockRepository.findByGoodsIdIn(Set.of(1001L))).thenReturn(List.of(stock(goods, 10)));
		when(storeOrderRepository.save(any(StoreOrder.class))).thenThrow(new IllegalStateException("boom"));

		assertError(
			"CHECKOUT_PREPARE_FAILED",
			() -> checkoutService.prepare(member.getMemberUuid(), request(item(1001L, 1)))
		);
		verify(orderItemRepository, never()).saveAll(any());
		verify(paymentRepository, never()).save(any());
		verify(paymentAttemptRepository, never()).save(any());
	}

	@Test
	void prepareIsTransactional() throws NoSuchMethodException {
		Transactional transactional = CheckoutService.class
			.getMethod("prepare", UUID.class, CheckoutPrepareRequest.class)
			.getAnnotation(Transactional.class);

		assertThat(transactional).isNotNull();
	}

	private CheckoutPrepareRequest request(CheckoutItemRequest... items) {
		return requestWithItems(List.of(items));
	}

	private CheckoutPrepareRequest requestWithItems(List<CheckoutItemRequest> items) {
		return new CheckoutPrepareRequest(
			items,
			new ShippingAddressRequest(
				"Hong Gil-dong",
				"01012345678",
				"01234",
				"Seoul ...",
				"101",
				"Leave at the door"
			),
			"TOSS"
		);
	}

	private CheckoutItemRequest item(Long goodsId, Integer quantity) {
		return new CheckoutItemRequest(goodsId, quantity);
	}

	private Member member() {
		Member member = Member.emailMember(UUID.randomUUID(), "test@example.com", "Tester", "01012345678");
		ReflectionTestUtils.setField(member, "memberId", 1L);
		return member;
	}

	private Goods goods(Long goodsId, String goodsName, int price, String salesStatus) {
		Goods goods = newInstance(Goods.class, new Class<?>[] {Long.class}, goodsId);
		ReflectionTestUtils.setField(goods, "goodsName", goodsName);
		ReflectionTestUtils.setField(goods, "price", price);
		ReflectionTestUtils.setField(goods, "salesStatus", salesStatus);
		ReflectionTestUtils.setField(goods, "mainImageUrl", "https://example.test/goods.png");
		return goods;
	}

	private GoodsStock stock(Goods goods, int currentStock) {
		return newInstance(GoodsStock.class, new Class<?>[] {Goods.class, Integer.class}, goods, currentStock);
	}

	private void assertError(String expectedCode, ThrowingRunnable runnable) {
		assertThatThrownBy(runnable::run)
			.isInstanceOf(ApiErrorException.class)
			.extracting("code")
			.isEqualTo(expectedCode);
	}

	@FunctionalInterface
	private interface ThrowingRunnable {
		void run();
	}

	private <T> T newInstance(Class<T> type, Class<?>[] parameterTypes, Object... args) {
		try {
			Constructor<T> constructor = type.getDeclaredConstructor(parameterTypes);
			constructor.setAccessible(true);
			return constructor.newInstance(args);
		} catch (ReflectiveOperationException exception) {
			throw new AssertionError(exception);
		}
	}
}
