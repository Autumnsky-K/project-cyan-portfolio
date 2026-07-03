package com.projectcyan.checkout;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.projectcyan.common.ApiErrorException;
import com.projectcyan.goods.DigitalGoodsEntitlementGrantService;
import com.projectcyan.goods.Goods;
import com.projectcyan.goods.GoodsFulfillmentType;
import com.projectcyan.goods.GoodsRepository;
import com.projectcyan.goods.GoodsStock;
import com.projectcyan.goods.GoodsStockRepository;
import com.projectcyan.member.Member;
import com.projectcyan.member.MemberRepository;

@Service
public class CheckoutService {

	// Temporary purchase limit until the goods schema exposes a per-item max purchase quantity.
	private static final int MAX_QUANTITY_PER_ITEM = 99;
	private static final int ORDER_NO_RANDOM_BYTES = 8;
	private static final Set<String> SALEABLE_STATUSES = Set.of("ON_SALE", "AVAILABLE", "SALE");
	private static final SecureRandom RANDOM = new SecureRandom();
	private static final String TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

	private final MemberRepository memberRepository;
	private final GoodsRepository goodsRepository;
	private final GoodsStockRepository goodsStockRepository;
	private final StoreOrderRepository storeOrderRepository;
	private final OrderItemRepository orderItemRepository;
	private final PaymentRepository paymentRepository;
	private final PaymentAttemptRepository paymentAttemptRepository;
	private final DigitalGoodsEntitlementGrantService digitalGoodsEntitlementGrantService;
	private final RestClient tossRestClient = RestClient.create();

	@Value("${toss.payments.secret-key:}")
	private String tossPaymentsSecretKey;

	public CheckoutService(
		MemberRepository memberRepository,
		GoodsRepository goodsRepository,
		GoodsStockRepository goodsStockRepository,
		StoreOrderRepository storeOrderRepository,
		OrderItemRepository orderItemRepository,
		PaymentRepository paymentRepository,
		PaymentAttemptRepository paymentAttemptRepository,
		DigitalGoodsEntitlementGrantService digitalGoodsEntitlementGrantService
	) {
		this.memberRepository = memberRepository;
		this.goodsRepository = goodsRepository;
		this.goodsStockRepository = goodsStockRepository;
		this.storeOrderRepository = storeOrderRepository;
		this.orderItemRepository = orderItemRepository;
		this.paymentRepository = paymentRepository;
		this.paymentAttemptRepository = paymentAttemptRepository;
		this.digitalGoodsEntitlementGrantService = digitalGoodsEntitlementGrantService;
	}

	@Transactional
	public CheckoutPrepareResponse prepare(UUID memberUuid, CheckoutPrepareRequest request) {
		try {
			return prepareInternal(memberUuid, request);
		} catch (ApiErrorException exception) {
			throw exception;
		} catch (RuntimeException exception) {
			throw new ApiErrorException(
				"CHECKOUT_PREPARE_FAILED",
				"Failed to prepare checkout.",
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	@Transactional
	public PaymentResultResponse approvePayment(UUID memberUuid, PaymentResultRequest request) {
		Payment payment = findPayment(memberUuid, request);
		validateAmount(payment, request);
		confirmTossPayment(payment, request);

		if (!payment.isApproved() && !payment.getOrder().isPaid()) {
			decreaseStockForApprovedOrder(payment.getOrder());
		}
		payment.markApproved(request.providerPaymentKey(), request.paymentMethod());
		payment.getOrder().markPaid();
		digitalGoodsEntitlementGrantService.grantForOrder(payment.getOrder().getOrderId());

		return PaymentResultResponse.from(payment, request.reason());
	}

	@Transactional(readOnly = true)
	public PaymentAttemptRecoveryResponse recoverKakaoPaymentAttempt(UUID memberUuid, String orderId) {
		if (memberUuid == null || orderId == null || orderId.isBlank()) {
			throw error("PAYMENT_ATTEMPT_NOT_FOUND", "Payment attempt not found.", HttpStatus.NOT_FOUND);
		}

		PaymentAttempt attempt = findAttemptByOrderKey(orderId)
			.orElseThrow(() -> error("PAYMENT_ATTEMPT_NOT_FOUND", "Payment attempt not found.", HttpStatus.NOT_FOUND));

		if (!attempt.getOrder().isOwnedBy(memberUuid)) {
			throw error("PAYMENT_FORBIDDEN", "Payment does not belong to the current member.", HttpStatus.FORBIDDEN);
		}
		if (!"KAKAO".equals(attempt.getProvider())) {
			throw error("PAYMENT_ATTEMPT_NOT_FOUND", "KakaoPay payment attempt not found.", HttpStatus.NOT_FOUND);
		}

		return PaymentAttemptRecoveryResponse.from(attempt);
	}

	@Transactional
	public PaymentResultResponse cancelPayment(UUID memberUuid, PaymentResultRequest request) {
		Payment payment = findPayment(memberUuid, request);

		payment.markCanceled();
		payment.getOrder().markCanceled();

		return PaymentResultResponse.from(payment, request.reason());
	}

	@Transactional
	public PaymentResultResponse failPayment(UUID memberUuid, PaymentResultRequest request) {
		Payment payment = findPayment(memberUuid, request);

		payment.markFailed();
		payment.getOrder().markPaymentFailed();

		return PaymentResultResponse.from(payment, request.reason());
	}

	private CheckoutPrepareResponse prepareInternal(UUID memberUuid, CheckoutPrepareRequest request) {
		if (memberUuid == null || request == null) {
			throw error("MEMBER_NOT_FOUND", "Member not found.", HttpStatus.NOT_FOUND);
		}
		String provider = normalizePaymentProvider(request.paymentProvider());
		if (provider == null) {
			throw error(
				"CHECKOUT_PREPARE_FAILED",
				"Unsupported payment provider: " + String.valueOf(request.paymentProvider()),
				HttpStatus.BAD_REQUEST
			);
		}

		Member member = memberRepository.findByMemberUuid(memberUuid)
			.orElseThrow(() -> error("MEMBER_NOT_FOUND", "Member not found.", HttpStatus.NOT_FOUND));
		Map<Long, Integer> requestedItems = normalizeItems(request.items());
		List<Goods> goodsList = goodsRepository.findAllById(requestedItems.keySet());
		Map<Long, Goods> goodsById = goodsList.stream()
			.collect(Collectors.toMap(Goods::getGoodsId, Function.identity()));
		validateAllGoodsFound(requestedItems.keySet(), goodsById);
		validateGoods(goodsById.values(), requestedItems);
		validateDigitalGoodsPurchaseRules(member.getMemberId(), goodsById.values(), requestedItems);
		validateStocks(requestedItems, goodsById);
		boolean requiresShipping = goodsById.values().stream().anyMatch(goods -> !isDigitalGoods(goods));
		if (requiresShipping) {
			validateShippingAddress(request.shippingAddress());
		}

		List<Goods> orderedGoods = new ArrayList<>(goodsById.values());
		orderedGoods.sort(Comparator.comparing(Goods::getGoodsId));
		BigDecimal subtotal = calculateSubtotal(orderedGoods, requestedItems);
		BigDecimal shippingAmount = BigDecimal.ZERO;
		BigDecimal totalAmount = subtotal.add(shippingAmount);
		String orderNo = generateOrderNo();

		StoreOrder order = storeOrderRepository.save(StoreOrder.pending(
			orderNo,
			member,
			subtotal,
			shippingAmount,
			totalAmount,
			requiresShipping ? request.shippingAddress() : null
		));
		List<OrderItem> orderItems = orderedGoods.stream()
			.map(goods -> OrderItem.snapshot(order, goods, requestedItems.get(goods.getGoodsId())))
			.toList();
		orderItemRepository.saveAll(orderItems);
		Payment payment = paymentRepository.save(Payment.readyForProvider(order, provider));
		paymentAttemptRepository.save(PaymentAttempt.readyForProvider(order, payment, provider));

		return new CheckoutPrepareResponse(
			order.getOrderId(),
			order.getOrderNo(),
			payment.getPaymentId(),
			totalAmount,
			orderName(orderedGoods),
			"member-" + member.getMemberUuid()
		);
	}

	private Payment findPayment(UUID memberUuid, PaymentResultRequest request) {
		if (memberUuid == null || request == null) {
			throw error("PAYMENT_RESULT_FAILED", "Payment result request is invalid.", HttpStatus.BAD_REQUEST);
		}

		Payment payment = findPaymentByRequest(request);
		if (!payment.getOrder().isOwnedBy(memberUuid)) {
			throw error("PAYMENT_FORBIDDEN", "Payment does not belong to the current member.", HttpStatus.FORBIDDEN);
		}

		return payment;
	}

	private Payment findPaymentByRequest(PaymentResultRequest request) {
		if (request.paymentId() != null) {
			return paymentRepository.findById(request.paymentId())
				.orElseThrow(() -> error("PAYMENT_NOT_FOUND", "Payment not found.", HttpStatus.NOT_FOUND));
		}
		if (request.orderId() != null) {
			return paymentRepository.findByOrder_OrderId(request.orderId())
				.orElseThrow(() -> error("PAYMENT_NOT_FOUND", "Payment not found.", HttpStatus.NOT_FOUND));
		}
		if (!isBlank(request.orderNo())) {
			return paymentRepository.findByProviderOrderId(request.orderNo())
				.orElseThrow(() -> error("PAYMENT_NOT_FOUND", "Payment not found.", HttpStatus.NOT_FOUND));
		}

		throw error("PAYMENT_RESULT_FAILED", "orderId, orderNo, or paymentId is required.", HttpStatus.BAD_REQUEST);
	}

	private Optional<PaymentAttempt> findAttemptByOrderKey(String orderKey) {
		if (orderKey == null || orderKey.isBlank()) {
			return Optional.empty();
		}
		try {
			Long numericOrderId = Long.valueOf(orderKey);
			Optional<PaymentAttempt> attempt =
				paymentAttemptRepository.findFirstByOrder_OrderIdOrderByRequestedAtDesc(numericOrderId);
			if (attempt.isPresent()) {
				return attempt;
			}
		} catch (NumberFormatException ignored) {
			// Kakao callback orderId may be the merchant order number.
		}

		return paymentAttemptRepository.findFirstByOrder_OrderNoOrderByRequestedAtDesc(orderKey);
	}

	private void validateAmount(Payment payment, PaymentResultRequest request) {
		if (request.amount() == null) {
			return;
		}
		if (payment.getPaymentAmount().compareTo(request.amount()) != 0) {
			throw error("PAYMENT_AMOUNT_MISMATCH", "Payment amount does not match the order.", HttpStatus.BAD_REQUEST);
		}
	}

	private void confirmTossPayment(Payment payment, PaymentResultRequest request) {
		if (!"TOSS".equalsIgnoreCase(String.valueOf(payment.getProvider()))) {
			return;
		}
		if (isBlank(tossPaymentsSecretKey)) {
			throw error("PAYMENT_CONFIRM_FAILED", "Toss Payments secret key is not configured.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
		if (isBlank(request.providerPaymentKey())) {
			throw error("PAYMENT_CONFIRM_FAILED", "paymentKey is required.", HttpStatus.BAD_REQUEST);
		}

		try {
			tossRestClient.post()
				.uri(TOSS_CONFIRM_URL)
				.header("Authorization", tossAuthorizationHeader())
				.body(new TossConfirmRequest(
					request.providerPaymentKey(),
					payment.getProviderOrderId(),
					payment.getPaymentAmount()
				))
				.retrieve()
				.toBodilessEntity();
		} catch (RestClientResponseException exception) {
			throw error(
				"PAYMENT_CONFIRM_FAILED",
				"Toss Payments confirmation failed.",
				HttpStatus.valueOf(exception.getStatusCode().value())
			);
		}
	}

	private String normalizePaymentProvider(String provider) {
		String normalized = String.valueOf(provider).trim().toUpperCase(Locale.ROOT);
		if ("TOSS".equals(normalized)) {
			return "TOSS";
		}
		if ("KAKAO".equals(normalized) || "KAKAO_PAY".equals(normalized) || "KAKAOPAY".equals(normalized)) {
			return "KAKAO";
		}
		return null;
	}

	private String tossAuthorizationHeader() {
		String credentials = tossPaymentsSecretKey + ":";
		String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
		return "Basic " + encoded;
	}

	private Map<Long, Integer> normalizeItems(List<CheckoutItemRequest> items) {
		if (items == null || items.isEmpty()) {
			throw error("INVALID_ORDER_ITEMS", "Order items are required.", HttpStatus.BAD_REQUEST);
		}
		Map<Long, Integer> normalized = new LinkedHashMap<>();
		for (CheckoutItemRequest item : items) {
			if (item == null || item.goodsId() == null || item.quantity() == null) {
				throw error("INVALID_ORDER_ITEMS", "Order items are invalid.", HttpStatus.BAD_REQUEST);
			}
			if (item.quantity() < 1) {
				throw error("INVALID_QUANTITY", "Quantity must be greater than zero.", HttpStatus.BAD_REQUEST);
			}
			normalized.merge(item.goodsId(), item.quantity(), Integer::sum);
		}
		if (normalized.isEmpty()) {
			throw error("INVALID_ORDER_ITEMS", "Order items are required.", HttpStatus.BAD_REQUEST);
		}
		normalized.forEach((goodsId, quantity) -> {
			if (quantity > MAX_QUANTITY_PER_ITEM) {
				throw error(
					"MAX_PURCHASE_QUANTITY_EXCEEDED",
					"Quantity exceeds the maximum purchase quantity.",
					HttpStatus.BAD_REQUEST
				);
			}
		});
		return normalized;
	}

	private void validateAllGoodsFound(Collection<Long> goodsIds, Map<Long, Goods> goodsById) {
		if (goodsById.size() != goodsIds.size()) {
			throw error("GOODS_NOT_FOUND", "Goods not found.", HttpStatus.NOT_FOUND);
		}
	}

	private void validateShippingAddress(ShippingAddressRequest shippingAddress) {
		if (shippingAddress == null
			|| isBlank(shippingAddress.recipientName())
			|| isBlank(shippingAddress.recipientPhone())
			|| isBlank(shippingAddress.address())
			|| isBlank(shippingAddress.addressDetail())) {
			throw error("CHECKOUT_PREPARE_FAILED", "Shipping address is required.", HttpStatus.BAD_REQUEST);
		}
	}

	private void validateGoods(Collection<Goods> goodsList, Map<Long, Integer> requestedItems) {
		for (Goods goods : goodsList) {
			String salesStatus = goods.getSalesStatus() == null
				? ""
				: goods.getSalesStatus().trim().toUpperCase(Locale.ROOT);
			if (!SALEABLE_STATUSES.contains(salesStatus) || goods.getPrice() == null || goods.getPrice() < 0) {
				throw error("GOODS_NOT_SALE", "Goods is not on sale.", HttpStatus.BAD_REQUEST);
			}
			Integer quantity = requestedItems.get(goods.getGoodsId());
			if (quantity == null || quantity < 1) {
				throw error("INVALID_QUANTITY", "Quantity must be greater than zero.", HttpStatus.BAD_REQUEST);
			}
		}
	}

	private void validateDigitalGoodsPurchaseRules(
		Long memberId,
		Collection<Goods> goodsList,
		Map<Long, Integer> requestedItems
	) {
		for (Goods goods : goodsList) {
			if (!isDigitalGoods(goods)) {
				continue;
			}
			Integer quantity = requestedItems.get(goods.getGoodsId());
			if (quantity != null && quantity > 1) {
				throw error(
					"DIGITAL_GOODS_SINGLE_PURCHASE_ONLY",
					"Digital goods can only be purchased one at a time.",
					HttpStatus.BAD_REQUEST
				);
			}
			if (digitalGoodsEntitlementGrantService.hasActiveEntitlement(memberId, goods.getGoodsId())) {
				throw error(
					"DIGITAL_GOODS_ALREADY_OWNED",
					"이미 구매한 디지털 상품입니다. 마이페이지의 디지털 제품 저장소에서 다운로드해 주세요.",
					HttpStatus.CONFLICT
				);
			}
		}
	}

	private void validateStocks(Map<Long, Integer> requestedItems, Map<Long, Goods> goodsById) {
		Set<Long> physicalGoodsIds = requestedItems.keySet().stream()
			.filter(goodsId -> !isDigitalGoods(goodsById.get(goodsId)))
			.collect(Collectors.toSet());
		if (physicalGoodsIds.isEmpty()) {
			return;
		}
		Map<Long, GoodsStock> stocksByGoodsId = goodsStockRepository.findByGoodsIdIn(physicalGoodsIds).stream()
			.collect(Collectors.toMap(GoodsStock::getGoodsId, Function.identity()));
		for (Map.Entry<Long, Integer> entry : requestedItems.entrySet()) {
			if (isDigitalGoods(goodsById.get(entry.getKey()))) {
				continue;
			}
			GoodsStock stock = stocksByGoodsId.get(entry.getKey());
			if (stock == null || stock.getCurrentStock() == null) {
				continue;
			}
			if (stock.getCurrentStock() < entry.getValue()) {
				throw error("OUT_OF_STOCK", "Not enough stock.", HttpStatus.BAD_REQUEST);
			}
		}
	}

	private boolean isDigitalGoods(Goods goods) {
		return goods != null
			&& goods.getCategory() != null
			&& goods.getCategory().getFulfillmentType() == GoodsFulfillmentType.DIGITAL;
	}

	private void decreaseStockForApprovedOrder(StoreOrder order) {
		Map<Long, Integer> orderedItems = orderItemRepository.findByOrder_OrderId(order.getOrderId()).stream()
			.filter(item -> !isDigitalGoods(item.getGoods()))
			.filter(item -> item.getGoodsId() != null && item.getQuantity() != null && item.getQuantity() > 0)
			.collect(Collectors.toMap(OrderItem::getGoodsId, OrderItem::getQuantity, Integer::sum));
		if (orderedItems.isEmpty()) {
			return;
		}

		Map<Long, GoodsStock> stocksByGoodsId = goodsStockRepository.findByGoodsIdInForUpdate(orderedItems.keySet()).stream()
			.collect(Collectors.toMap(GoodsStock::getGoodsId, Function.identity()));
		for (Map.Entry<Long, Integer> entry : orderedItems.entrySet()) {
			GoodsStock stock = stocksByGoodsId.get(entry.getKey());
			if (stock == null || stock.getCurrentStock() == null) {
				continue;
			}
			if (stock.getCurrentStock() < entry.getValue()) {
				throw error("OUT_OF_STOCK", "Not enough stock.", HttpStatus.BAD_REQUEST);
			}
			stock.decreaseCurrentStock(entry.getValue());
		}
	}

	private BigDecimal calculateSubtotal(List<Goods> orderedGoods, Map<Long, Integer> requestedItems) {
		return orderedGoods.stream()
			.map(goods -> BigDecimal.valueOf(goods.getPrice())
				.multiply(BigDecimal.valueOf(requestedItems.get(goods.getGoodsId()))))
			.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	private String generateOrderNo() {
		for (int attempt = 0; attempt < 5; attempt++) {
			byte[] bytes = new byte[ORDER_NO_RANDOM_BYTES];
			RANDOM.nextBytes(bytes);
			StringBuilder builder = new StringBuilder("ORD_")
				.append(Long.toString(System.currentTimeMillis(), 36).toUpperCase(Locale.ROOT))
				.append("_");
			for (byte value : bytes) {
				builder.append(String.format("%02X", value));
			}
			String orderNo = builder.toString();
			if (!storeOrderRepository.existsByOrderNo(orderNo)) {
				return orderNo;
			}
		}
		throw error("CHECKOUT_PREPARE_FAILED", "Failed to generate order number.", HttpStatus.INTERNAL_SERVER_ERROR);
	}

	private String orderName(List<Goods> orderedGoods) {
		String firstName = orderedGoods.get(0).getGoodsName();
		if (orderedGoods.size() == 1) {
			return firstName;
		}
		return firstName + " plus " + (orderedGoods.size() - 1) + " more";
	}

	private ApiErrorException error(String code, String message, HttpStatus status) {
		return new ApiErrorException(code, message, status);
	}

	private boolean isBlank(String value) {
		return value == null || value.isBlank();
	}

	private record TossConfirmRequest(
		String paymentKey,
		String orderId,
		BigDecimal amount
	) {
	}
}
