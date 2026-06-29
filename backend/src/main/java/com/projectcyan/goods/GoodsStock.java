package com.projectcyan.goods;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "goods_stock")
public class GoodsStock {

	@Id
	@Column(name = "goods_id")
	private Long goodsId;

	@Column(name = "current_stock")
	private Integer currentStock;

	protected GoodsStock() {
	}

	GoodsStock(Goods goods, Integer currentStock) {
		this.goodsId = goods.getGoodsId();
		this.currentStock = currentStock;
	}

	public Long getGoodsId() {
		return goodsId;
	}

	public Integer getCurrentStock() {
		return currentStock;
	}

	void updateCurrentStock(Integer currentStock) {
		this.currentStock = currentStock;
	}
}
