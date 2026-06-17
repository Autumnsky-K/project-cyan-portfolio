package com.projectcyan.goods;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "goods_stock")
public class GoodsStock {

	@Id
	@Column(name = "goods_id")
	private Long goodsId;

	@OneToOne(fetch = FetchType.LAZY)
	@MapsId
	@JoinColumn(name = "goods_id")
	private Goods goods;

	@Column(name = "current_stock")
	private Integer currentStock;

	protected GoodsStock() {
	}

	GoodsStock(Goods goods, Integer currentStock) {
		this.goods = goods;
		this.goodsId = goods.getGoodsId();
		this.currentStock = currentStock;
	}

	public Long getGoodsId() {
		return goodsId;
	}

	public Goods getGoods() {
		return goods;
	}

	public Integer getCurrentStock() {
		return currentStock;
	}

	void updateCurrentStock(Integer currentStock) {
		this.currentStock = currentStock;
	}
}
