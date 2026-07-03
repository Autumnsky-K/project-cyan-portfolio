package com.projectcyan.goods;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "goods_category")
public class GoodsCategory {

	@Id
	@Column(name = "category_id")
	private Long categoryId;

	@Column(name = "category_name")
	private String categoryName;

	@Enumerated(EnumType.STRING)
	@Column(name = "fulfillment_type")
	private GoodsFulfillmentType fulfillmentType = GoodsFulfillmentType.PHYSICAL;

	protected GoodsCategory() {
	}

	GoodsCategory(Long categoryId, String categoryName, GoodsFulfillmentType fulfillmentType) {
		this.categoryId = categoryId;
		this.categoryName = categoryName;
		this.fulfillmentType = fulfillmentType == null ? GoodsFulfillmentType.PHYSICAL : fulfillmentType;
	}

	public Long getCategoryId() {
		return categoryId;
	}

	public String getCategoryName() {
		return categoryName;
	}

	public GoodsFulfillmentType getFulfillmentType() {
		return fulfillmentType == null ? GoodsFulfillmentType.PHYSICAL : fulfillmentType;
	}

	void update(String categoryName, GoodsFulfillmentType fulfillmentType) {
		this.categoryName = categoryName;
		this.fulfillmentType = fulfillmentType == null ? GoodsFulfillmentType.PHYSICAL : fulfillmentType;
	}
}
