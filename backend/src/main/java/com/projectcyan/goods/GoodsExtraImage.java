package com.projectcyan.goods;

import java.time.Instant;

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
@Table(name = "goods_extra_images")
public class GoodsExtraImage {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "image_id")
	private Long imageId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "goods_id")
	private Goods goods;

	@Column(name = "image_url")
	private String imageUrl;

	@Column(name = "alt_text")
	private String altText;

	@Column(name = "sort_order")
	private Integer sortOrder;

	@Column(name = "created_at")
	private Instant createdAt;

	protected GoodsExtraImage() {
	}

	GoodsExtraImage(Goods goods, String imageUrl, String altText, Integer sortOrder) {
		this.goods = goods;
		this.imageUrl = imageUrl;
		this.altText = altText;
		this.sortOrder = sortOrder;
		this.createdAt = Instant.now();
	}

	public Long getImageId() {
		return imageId;
	}

	public Goods getGoods() {
		return goods;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public String getAltText() {
		return altText;
	}

	public Integer getSortOrder() {
		return sortOrder;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
