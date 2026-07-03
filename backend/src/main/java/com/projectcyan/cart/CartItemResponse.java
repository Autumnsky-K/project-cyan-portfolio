package com.projectcyan.cart;

import java.util.List;

import com.projectcyan.goods.Goods;
import com.projectcyan.goods.Tag;

public record CartItemResponse(
	Long cartItemId,
	Long goodsId,
	String name,
	Integer price,
	String imageUrl,
	List<String> tags,
	Long artistId,
	String artistName,
	Long categoryId,
	String categoryName,
	String fulfillmentType,
	String salesStatus,
	Integer stockCount,
	Integer quantity,
	Integer subtotal,
	String purchaseState,
	String purchaseMessage
) {
	static CartItemResponse from(CartItem cartItem, Integer stockCount, PurchaseAvailability availability) {
		Goods goods = cartItem.getGoods();
		Integer price = goods.getPrice() == null ? 0 : goods.getPrice();
		Integer quantity = cartItem.getQuantity() == null ? 0 : cartItem.getQuantity();
		return new CartItemResponse(
			cartItem.getCartItemId(),
			goods.getGoodsId(),
			goods.getGoodsName(),
			goods.getPrice(),
			goods.getMainImageUrl(),
			goods.getTags().stream().map(Tag::getTagName).toList(),
			goods.getArtist() == null ? null : goods.getArtist().getArtistId(),
			goods.getArtist() == null ? null : goods.getArtist().getArtistName(),
			goods.getCategory() == null ? null : goods.getCategory().getCategoryId(),
			goods.getCategory() == null ? null : goods.getCategory().getCategoryName(),
			goods.getCategory() == null ? null : goods.getCategory().getFulfillmentType().name(),
			goods.getSalesStatus(),
			stockCount,
			quantity,
			price * quantity,
			availability.state(),
			availability.message()
		);
	}
}
