package com.projectcyan.checkout;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projectcyan.common.ApiErrorException;
import com.projectcyan.goods.Goods;
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

	private final MemberRepository memberRepository;
	private final GoodsRepository goodsRepository;
	private final GoodsStockRepository goodsStockRepository;
	private final StoreOrderRepository storeOrderRepository;
	private final OrderItemRepository orderItemRepository;
	private final PaymentRepository paymentRepository;
	private final PaymentAttemptRepository paymentAttemptRepository;

	public CheckoutService(
		MemberRepository memberRepository,
		GoodsRepository goodsRepository,
		GoodsStockRepository goodsStockRepository,
		StoreOrderRepository storeOrderRepository,
		OrderItemRepository orderItemRepository,
		PaymentRepository paymentRepository,
		PaymentAttemptRepository paymentAttemptRepository
	) {
		this.memberRepository = memberRepository;
		this.goodsRepository = goodsRepository;
		this.goodsStockRepository = goodsStockRepository;
		this.storeOrderRepository = storeOrderRepository;
		this.orderItemRepository = orderItemRepository;
		this.paymentRepository = paymentRepository;
		this.paymentAttemptRepository = paymentAttemptRepository;
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

	private CheckoutPrepareResponse prepareInternal(UUID memberUuid, CheckoutPrepareRequest request) {
		if (memberUuid == null || request == null) {
			throw error("MEMBER_NOT_FOUND", "Member not found.", HttpStatus.NOT_FOUND);
		}
		if (!"TOSS".equalsIgnoreCase(String.valueOf(request.paymentProvider()))) {
			throw error("CHECKOUT_PREPARE_FAILED", "Unsupported payment provider.", HttpStatus.BAD_REQUEST);
		}

		Member member = memberRepository.findByMemberUuid(memberUuid)
			.orElseThrow(() -> error("MEMBER_NOT_FOUND", "Member not found.", HttpStatus.NOT_FOUND));
		Map<Long, Integer> requestedItems = normalizeItems(request.items());
		validateShippingAddress(request.shippingAddress());
		List<Goods> goodsList = goodsRepository.findAllById(requestedItems.keySet());
		Map<Long, Goods> goodsById = goodsList.stream()
			.collect(Collectors.toMap(Goods::getGoodsId, Function.identity()));
		validateAllGoodsFound(requestedItems.keySet(), goodsById);
		validateGoods(goodsById.values(), requestedItems);
		validateStocks(requestedItems);

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
			request.shippingAddress()
		));
		List<OrderItem> orderItems = orderedGoods.stream()
			.map(goods -> OrderItem.snapshot(order, goods, requestedItems.get(goods.getGoodsId())))
			.toList();
		orderItemRepository.saveAll(orderItems);
		Payment payment = paymentRepository.save(Payment.readyForToss(order));
		paymentAttemptRepository.save(PaymentAttempt.readyForToss(order, payment));

		return new CheckoutPrepareResponse(
			order.getOrderId(),
			order.getOrderNo(),
			payment.getPaymentId(),
			totalAmount,
			orderName(orderedGoods),
			"member-" + member.getMemberUuid()
		);
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

	private void validateStocks(Map<Long, Integer> requestedItems) {
		Map<Long, GoodsStock> stocksByGoodsId = goodsStockRepository.findByGoodsIdIn(requestedItems.keySet()).stream()
			.collect(Collectors.toMap(GoodsStock::getGoodsId, Function.identity()));
		for (Map.Entry<Long, Integer> entry : requestedItems.entrySet()) {
			GoodsStock stock = stocksByGoodsId.get(entry.getKey());
			if (stock == null || stock.getCurrentStock() == null) {
				continue;
			}
			if (stock.getCurrentStock() < entry.getValue()) {
				throw error("OUT_OF_STOCK", "Not enough stock.", HttpStatus.BAD_REQUEST);
			}
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
		return firstName + " 외 " + (orderedGoods.size() - 1) + "건";
	}

	private ApiErrorException error(String code, String message, HttpStatus status) {
		return new ApiErrorException(code, message, status);
	}

	private boolean isBlank(String value) {
		return value == null || value.isBlank();
	}
}
