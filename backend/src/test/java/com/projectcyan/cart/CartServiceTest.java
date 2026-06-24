package com.projectcyan.cart;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.projectcyan.goods.Goods;
import com.projectcyan.goods.GoodsRepository;
import com.projectcyan.goods.GoodsStock;
import com.projectcyan.goods.GoodsStockRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class CartServiceTest {

	private static final Instant NOW = Instant.parse("2026-06-24T04:00:00Z");

	private CartRepository cartRepository;
	private CartItemRepository cartItemRepository;
	private GoodsRepository goodsRepository;
	private GoodsStockRepository goodsStockRepository;
	private CartService service;

	@BeforeEach
	void setUp() {
		cartRepository = mock(CartRepository.class);
		cartItemRepository = mock(CartItemRepository.class);
		goodsRepository = mock(GoodsRepository.class);
		goodsStockRepository = mock(GoodsStockRepository.class);
		service = new CartService(
			cartRepository,
			cartItemRepository,
			goodsRepository,
			goodsStockRepository,
			Clock.fixed(NOW, ZoneOffset.UTC)
		);
	}

	@Test
	void returnsEmptyCartWhenMemberHasNoCart() {
		when(cartItemRepository.findByCartMemberIdOrderByCreatedAtAscCartItemIdAsc(7L)).thenReturn(List.of());
		when(cartRepository.findByMemberId(7L)).thenReturn(Optional.empty());

		CartResponse response = service.findCart(7L);

		assertThat(response.cartId()).isNull();
		assertThat(response.items()).isEmpty();
		assertThat(response.totalQuantity()).isZero();
		assertThat(response.totalPrice()).isZero();
	}

	@Test
	void addsNewCartItem() {
		Goods goods = goods(1001L, "Test goods", "ON_SALE");
		GoodsStock stock = stock(1001L, 5);
		Cart cart = new Cart(7L, NOW);
		when(goodsRepository.findById(1001L)).thenReturn(Optional.of(goods));
		when(goodsStockRepository.findById(1001L)).thenReturn(Optional.of(stock));
		when(cartRepository.findByMemberId(7L)).thenReturn(Optional.empty());
		when(cartRepository.save(any(Cart.class))).thenReturn(cart);
		when(cartItemRepository.findByCartCartIdAndGoodsGoodsId(cart.getCartId(), 1001L)).thenReturn(Optional.empty());
		when(cartItemRepository.findByCartMemberIdOrderByCreatedAtAscCartItemIdAsc(7L)).thenReturn(List.of());

		service.addItem(7L, new CartItemRequest(1001L, 2));

		verify(cartRepository).save(any(Cart.class));
		verify(cartItemRepository).save(any(CartItem.class));
	}

	@Test
	void rejectsQuantityGreaterThanStock() {
		Goods goods = goods(1001L, "Test goods", "ON_SALE");
		GoodsStock stock = stock(1001L, 1);
		when(goodsRepository.findById(1001L)).thenReturn(Optional.of(goods));
		when(goodsStockRepository.findById(1001L)).thenReturn(Optional.of(stock));

		assertThatThrownBy(() -> service.addItem(7L, new CartItemRequest(1001L, 2)))
			.isInstanceOf(ResponseStatusException.class)
			.extracting(exception -> ((ResponseStatusException) exception).getStatusCode().value())
			.isEqualTo(400);
	}

	@Test
	void updatesItemQuantity() {
		Goods goods = goods(1001L, "Test goods", "ON_SALE");
		GoodsStock stock = stock(1001L, 5);
		CartItem cartItem = new CartItem(new Cart(7L, NOW), goods, 1, NOW);
		when(cartItemRepository.findByCartMemberIdAndCartItemId(7L, 10L)).thenReturn(Optional.of(cartItem));
		when(goodsStockRepository.findById(1001L)).thenReturn(Optional.of(stock));
		when(cartItemRepository.findByCartMemberIdOrderByCreatedAtAscCartItemIdAsc(7L)).thenReturn(List.of(cartItem));
		when(goodsStockRepository.findByGoodsIdIn(List.of(1001L))).thenReturn(List.of(stock));

		CartResponse response = service.updateItemQuantity(7L, 10L, new CartItemQuantityRequest(3));

		assertThat(cartItem.getQuantity()).isEqualTo(3);
		assertThat(response.totalQuantity()).isEqualTo(3);
	}

	@Test
	void removesCartItem() {
		CartItem cartItem = new CartItem(new Cart(7L, NOW), goods(1001L, "Test goods", "ON_SALE"), 1, NOW);
		when(cartItemRepository.findByCartMemberIdAndCartItemId(7L, 10L)).thenReturn(Optional.of(cartItem));

		service.removeItem(7L, 10L);

		verify(cartItemRepository).delete(cartItem);
	}

	private Goods goods(Long goodsId, String name, String salesStatus) {
		Goods goods = mock(Goods.class);
		when(goods.getGoodsId()).thenReturn(goodsId);
		when(goods.getGoodsName()).thenReturn(name);
		when(goods.getPrice()).thenReturn(1000);
		when(goods.getSalesStatus()).thenReturn(salesStatus);
		when(goods.getTags()).thenReturn(Set.of());
		return goods;
	}

	private GoodsStock stock(Long goodsId, Integer currentStock) {
		GoodsStock stock = mock(GoodsStock.class);
		when(stock.getGoodsId()).thenReturn(goodsId);
		when(stock.getCurrentStock()).thenReturn(currentStock);
		return stock;
	}
}
