package com.projectcyan.goods;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record GoodsStockUpdateRequest(
	@NotNull @Min(value = 0, message = "재고는 0 이상이어야 합니다.") Integer stockCount
) {
}
