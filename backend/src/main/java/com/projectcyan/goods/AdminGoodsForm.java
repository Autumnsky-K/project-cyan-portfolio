package com.projectcyan.goods;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AdminGoodsForm {

	private Long goodsId;

	@NotBlank(message = "굿즈 이름을 입력해주세요.")
	private String name;

	@NotNull(message = "가격을 입력해주세요.")
	@Min(value = 0, message = "가격은 0 이상이어야 합니다.")
	private Integer price;

	private String description;

	private String imageUrl;

	@NotNull(message = "아티스트를 선택해주세요.")
	private Long artistId;

	@NotNull(message = "카테고리를 선택해주세요.")
	private Long categoryId;

	@NotBlank(message = "판매 상태를 선택해주세요.")
	private String salesStatus = "ON_SALE";

	private boolean bestSeller;

	private boolean aiPickDefault;

	@NotNull(message = "재고를 입력해주세요.")
	@Min(value = 0, message = "재고는 0 이상이어야 합니다.")
	private Integer stockCount = 0;

	private List<String> tags = new ArrayList<>();

	public static AdminGoodsForm empty() {
		return new AdminGoodsForm();
	}

	public static AdminGoodsForm from(GoodsDetailResponse goods) {
		AdminGoodsForm form = new AdminGoodsForm();
		form.goodsId = goods.goodsId();
		form.name = goods.name();
		form.price = goods.price();
		form.description = goods.description();
		form.imageUrl = goods.imageUrl();
		form.artistId = goods.artistId();
		form.salesStatus = goods.salesStatus();
		form.bestSeller = Boolean.TRUE.equals(goods.isBestSeller());
		form.aiPickDefault = Boolean.TRUE.equals(goods.aiPickDefault());
		form.stockCount = goods.stockCount();
		form.tags = new ArrayList<>(goods.tags() == null ? List.of() : goods.tags());
		return form;
	}

	public AdminGoodsRequest toRequest() {
		return new AdminGoodsRequest(
			goodsId,
			name,
			price,
			description,
			imageUrl,
			artistId,
			categoryId,
			salesStatus,
			bestSeller,
			aiPickDefault,
			stockCount,
			tags
		);
	}

	public Long getGoodsId() {
		return goodsId;
	}

	public void setGoodsId(Long goodsId) {
		this.goodsId = goodsId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Integer getPrice() {
		return price;
	}

	public void setPrice(Integer price) {
		this.price = price;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public Long getArtistId() {
		return artistId;
	}

	public void setArtistId(Long artistId) {
		this.artistId = artistId;
	}

	public Long getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(Long categoryId) {
		this.categoryId = categoryId;
	}

	public String getSalesStatus() {
		return salesStatus;
	}

	public void setSalesStatus(String salesStatus) {
		this.salesStatus = salesStatus;
	}

	public boolean isBestSeller() {
		return bestSeller;
	}

	public void setBestSeller(boolean bestSeller) {
		this.bestSeller = bestSeller;
	}

	public boolean isAiPickDefault() {
		return aiPickDefault;
	}

	public void setAiPickDefault(boolean aiPickDefault) {
		this.aiPickDefault = aiPickDefault;
	}

	public Integer getStockCount() {
		return stockCount;
	}

	public void setStockCount(Integer stockCount) {
		this.stockCount = stockCount;
	}

	public List<String> getTags() {
		return tags;
	}

	public void setTags(List<String> tags) {
		this.tags = tags == null ? new ArrayList<>() : tags;
	}
}
