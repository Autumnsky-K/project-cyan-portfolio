package com.projectcyan.goods;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminGoodsRequest(
	Long goodsId,
	@NotBlank String name,
	@NotNull @Min(0) Integer price,
	String description,
	String imageUrl,
	Long artistId,
	Long categoryId,
	@NotBlank String salesStatus,
	Boolean isBestSeller,
	Boolean aiPickDefault,
	@Min(value = 0, message = "재고는 0 이상이어야 합니다.") Integer stockCount,
	List<String> tags,
	List<String> extraImageUrls
) {
}
