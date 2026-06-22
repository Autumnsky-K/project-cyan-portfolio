package com.projectcyan.goods;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "goods")
public class Goods {

	@Id
	@Column(name = "goods_id")
	private Long goodsId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "artist_id")
	private Artist artist;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "category_id")
	private GoodsCategory category;

	@Column(name = "goods_name")
	private String goodsName;

	@Column(name = "price")
	private Integer price;

	@Column(name = "description")
	private String description;

	@Column(name = "main_image_url")
	private String mainImageUrl;

	@Column(name = "ai_pick_default")
	private Boolean aiPickDefault;

	@Column(name = "is_best_seller")
	private Boolean bestSeller;

	@Column(name = "sales_status")
	private String salesStatus;

	@Transient
	private Integer stockCount;

	@Column(name = "created_at")
	private Instant createdAt;

	@ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(
		name = "goods_tag",
		joinColumns = @JoinColumn(name = "goods_id"),
		inverseJoinColumns = @JoinColumn(name = "tag_id")
	)
	private Set<Tag> tags = new LinkedHashSet<>();

	protected Goods() {
	}

	Goods(Long goodsId) {
		this.goodsId = goodsId;
		this.createdAt = Instant.now();
	}

	public Long getGoodsId() {
		return goodsId;
	}

	public Artist getArtist() {
		return artist;
	}

	public GoodsCategory getCategory() {
		return category;
	}

	public String getGoodsName() {
		return goodsName;
	}

	public Integer getPrice() {
		return price;
	}

	public String getDescription() {
		return description;
	}

	public String getMainImageUrl() {
		return mainImageUrl;
	}

	public Boolean getAiPickDefault() {
		return aiPickDefault;
	}

	public Boolean getBestSeller() {
		return bestSeller;
	}

	public String getSalesStatus() {
		return salesStatus;
	}

	public Integer getStockCount() {
		return stockCount;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Set<Tag> getTags() {
		return tags;
	}

	void update(
		String goodsName,
		Integer price,
		String description,
		String mainImageUrl,
		Artist artist,
		GoodsCategory category,
		String salesStatus,
		Boolean bestSeller,
		Boolean aiPickDefault,
		Set<Tag> tags
	) {
		this.goodsName = goodsName;
		this.price = price;
		this.description = description;
		this.mainImageUrl = mainImageUrl;
		this.artist = artist;
		this.category = category;
		this.salesStatus = salesStatus;
		this.bestSeller = bestSeller;
		this.aiPickDefault = aiPickDefault;
		this.tags.clear();
		this.tags.addAll(tags);
	}

	void updateSalesStatus(String salesStatus) {
		this.salesStatus = salesStatus;
	}

	void setStockCount(Integer stockCount) {
		this.stockCount = stockCount;
	}
}
