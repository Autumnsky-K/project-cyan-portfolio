package com.projectcyan.cart;

import java.time.Instant;

import com.projectcyan.goods.Goods;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
	name = "cart_item",
	uniqueConstraints = @UniqueConstraint(
		name = "cart_item_cart_goods_unique",
		columnNames = {"cart_id", "goods_id"}
	)
)
public class CartItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "cart_item_id")
	private Long cartItemId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "cart_id", nullable = false)
	private Cart cart;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "goods_id", nullable = false)
	private Goods goods;

	@Column(name = "quantity", nullable = false)
	private Integer quantity;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected CartItem() {
	}

	CartItem(Cart cart, Goods goods, Integer quantity, Instant createdAt) {
		this.cart = cart;
		this.goods = goods;
		this.quantity = quantity;
		this.createdAt = createdAt;
		this.updatedAt = createdAt;
	}

	public Long getCartItemId() {
		return cartItemId;
	}

	public Cart getCart() {
		return cart;
	}

	public Goods getGoods() {
		return goods;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	void updateQuantity(Integer quantity, Instant updatedAt) {
		this.quantity = quantity;
		this.updatedAt = updatedAt;
		this.cart.touch(updatedAt);
	}
}
