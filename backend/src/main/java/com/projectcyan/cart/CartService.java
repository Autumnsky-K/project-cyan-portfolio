package com.projectcyan.cart;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import com.projectcyan.goods.Goods;
import com.projectcyan.goods.GoodsRepository;
import com.projectcyan.goods.GoodsStock;
import com.projectcyan.goods.GoodsStockRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CartService {

	private final CartRepository cartRepository;
	private final CartItemRepository cartItemRepository;
	private final GoodsRepository goodsRepository;
	private final GoodsStockRepository goodsStockRepository;
	private final Clock clock;

	@Autowired
	public CartService(
		CartRepository cartRepository,
		CartItemRepository cartItemRepository,
		GoodsRepository goodsRepository,
		GoodsStockRepository goodsStockRepository
	) {
		this(cartRepository, cartItemRepository, goodsRepository, goodsStockRepository, Clock.systemUTC());
	}

	CartService(
		CartRepository cartRepository,
		CartItemRepository cartItemRepository,
		GoodsRepository goodsRepository,
		GoodsStockRepository goodsStockRepository,
		Clock clock
	) {
		this.cartRepository = cartRepository;
		this.cartItemRepository = cartItemRepository;
		this.goodsRepository = goodsRepository;
		this.goodsStockRepository = goodsStockRepository;
		this.clock = clock;
	}

	@Transactional(readOnly = true)
	public CartResponse findCart(Long memberId) {
		List<CartItem> cartItems = cartItemRepository.findByCartMemberIdOrderByCreatedAtAscCartItemIdAsc(memberId);
		if (cartItems.isEmpty()) {
			return cartRepository.findByMemberId(memberId)
				.map(cart -> new CartResponse(cart.getCartId(), List.of(), 0, 0))
				.orElseGet(CartResponse::empty);
		}

		Long cartId = cartItems.getFirst().getCart().getCartId();
		return CartResponse.from(cartId, toResponses(cartItems));
	}

	@Transactional
	public CartResponse addItem(Long memberId, CartItemRequest request) {
		Long goodsId = request == null ? null : request.goodsId();
		int quantity = normalizeQuantity(request == null ? null : request.quantity());
		Goods goods = goodsRepository.findById(goodsId == null ? -1L : goodsId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found."));
		int stockCount = stockCount(goods.getGoodsId());
		PurchaseAvailability availability = purchaseAvailability(goods, stockCount);
		if (!"AVAILABLE".equals(availability.state())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Goods cannot be added to cart.");
		}
		validateStock(quantity, stockCount);

		Instant now = clock.instant();
		Cart cart = cartRepository.findByMemberId(memberId)
			.orElseGet(() -> cartRepository.save(new Cart(memberId, now)));
		CartItem cartItem = cartItemRepository.findByCartCartIdAndGoodsGoodsId(cart.getCartId(), goods.getGoodsId())
			.orElseGet(() -> new CartItem(cart, goods, 0, now));
		int nextQuantity = cartItem.getQuantity() + quantity;
		validateStock(nextQuantity, stockCount);
		cartItem.updateQuantity(nextQuantity, now);
		cartItemRepository.save(cartItem);

		return findCart(memberId);
	}

	@Transactional
	public CartResponse updateItemQuantity(Long memberId, Long cartItemId, CartItemQuantityRequest request) {
		int quantity = normalizeQuantity(request == null ? null : request.quantity());
		CartItem cartItem = cartItemRepository.findByCartMemberIdAndCartItemId(memberId, cartItemId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found."));
		int stockCount = stockCount(cartItem.getGoods().getGoodsId());
		PurchaseAvailability availability = purchaseAvailability(cartItem.getGoods(), stockCount);
		if (!"AVAILABLE".equals(availability.state())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Goods cannot be purchased.");
		}
		validateStock(quantity, stockCount);
		cartItem.updateQuantity(quantity, clock.instant());

		return findCart(memberId);
	}

	@Transactional
	public void removeItem(Long memberId, Long cartItemId) {
		CartItem cartItem = cartItemRepository.findByCartMemberIdAndCartItemId(memberId, cartItemId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found."));
		cartItem.getCart().touch(clock.instant());
		cartItemRepository.delete(cartItem);
	}

	@Transactional
	public void clearCart(Long memberId) {
		cartRepository.findByMemberId(memberId).ifPresent(cart -> cart.touch(clock.instant()));
		cartItemRepository.deleteByCartMemberId(memberId);
	}

	private List<CartItemResponse> toResponses(List<CartItem> cartItems) {
		Map<Long, Integer> stockCounts = stockCounts(cartItems);
		return cartItems.stream()
			.map(cartItem -> {
				Integer stockCount = stockCounts.getOrDefault(cartItem.getGoods().getGoodsId(), 0);
				return CartItemResponse.from(
					cartItem,
					stockCount,
					purchaseAvailability(cartItem.getGoods(), stockCount)
				);
			})
			.toList();
	}

	private Map<Long, Integer> stockCounts(List<CartItem> cartItems) {
		List<Long> goodsIds = cartItems.stream()
			.map(cartItem -> cartItem.getGoods().getGoodsId())
			.toList();
		return goodsStockRepository.findByGoodsIdIn(goodsIds).stream()
			.collect(Collectors.toMap(GoodsStock::getGoodsId, stock -> stock.getCurrentStock() == null ? 0 : stock.getCurrentStock()));
	}

	private int stockCount(Long goodsId) {
		return goodsStockRepository.findById(goodsId)
			.map(stock -> stock.getCurrentStock() == null ? 0 : stock.getCurrentStock())
			.orElse(0);
	}

	private int normalizeQuantity(Integer quantity) {
		if (quantity == null || quantity < 1) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than zero.");
		}
		return quantity;
	}

	private void validateStock(int quantity, int stockCount) {
		if (quantity > stockCount) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity exceeds current stock.");
		}
	}

	private PurchaseAvailability purchaseAvailability(Goods goods, int stockCount) {
		String salesStatus = goods.getSalesStatus() == null
			? ""
			: goods.getSalesStatus().trim().toUpperCase(Locale.ROOT);
		if ("UPCOMING".equals(salesStatus)) {
			return new PurchaseAvailability("UPCOMING", "판매 시작 전입니다.");
		}
		if ("ENDED".equals(salesStatus) || "DISCONTINUED".equals(salesStatus) || "HIDDEN".equals(salesStatus)) {
			return new PurchaseAvailability("UNAVAILABLE", "현재 구매할 수 없는 상품입니다.");
		}
		if ("SOLD_OUT".equals(salesStatus)) {
			return new PurchaseAvailability("SOLD_OUT", "품절된 상품입니다.");
		}
		if (stockCount < 1) {
			return new PurchaseAvailability("SOLD_OUT", "품절된 상품입니다.");
		}
		return new PurchaseAvailability("AVAILABLE", "구매 가능한 상품입니다.");
	}
}
