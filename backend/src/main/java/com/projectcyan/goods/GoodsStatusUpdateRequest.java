package com.projectcyan.goods;

import jakarta.validation.constraints.NotBlank;

public record GoodsStatusUpdateRequest(
	@NotBlank String salesStatus
) {
}
