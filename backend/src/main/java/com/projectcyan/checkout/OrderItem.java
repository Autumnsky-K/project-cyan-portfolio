package com.projectcyan.checkout;

import java.math.BigDecimal;

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

@Entity
@Table(name = "order_item")
public class OrderItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "order_item_id")
	private Long orderItemId;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "order_id", nullable = false)
	private StoreOrder order;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "goods_id", nullable = false)
	private Goods goods;

	@Column(name = "goods_name", nullable = false)
	private String goodsName;

	@Column(name = "artist_name")
	private String artistName;

	@Column(name = "unit_price", nullable = false)
	private BigDecimal unitPrice;

	@Column(name = "quantity", nullable = false)
	private Integer quantity;

	@Column(name = "item_total_amount", nullable = false)
	private BigDecimal itemTotalAmount;

	@Column(name = "main_image_url")
	private String mainImageUrl;

	protected OrderItem() {
	}

	private OrderItem(StoreOrder order, Goods goods, int quantity) {
		this.order = order;
		this.goods = goods;
		this.goodsName = goods.getGoodsName();
		this.artistName = goods.getArtist() == null ? null : goods.getArtist().getArtistName();
		this.unitPrice = BigDecimal.valueOf(goods.getPrice());
		this.quantity = quantity;
		this.itemTotalAmount = this.unitPrice.multiply(BigDecimal.valueOf(quantity));
		this.mainImageUrl = goods.getMainImageUrl();
	}

	static OrderItem snapshot(StoreOrder order, Goods goods, int quantity) {
		return new OrderItem(order, goods, quantity);
	}
}
