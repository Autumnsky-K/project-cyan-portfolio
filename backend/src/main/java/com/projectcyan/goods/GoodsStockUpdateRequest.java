package com.projectcyan.goods;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record GoodsStockUpdateRequest(
	@NotNull @Min(0) Integer stockCount
) {
}
