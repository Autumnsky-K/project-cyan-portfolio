package com.projectcyan.goods;

import java.util.Locale;
import java.util.Set;

final class GoodsVisibility {

	static final Set<String> HIDDEN_FROM_PUBLIC_STATUSES = Set.of("HIDDEN", "DISCONTINUED");

	private GoodsVisibility() {
	}

	static boolean isPubliclyVisible(Goods goods) {
		return goods != null && !isHiddenFromPublic(goods.getSalesStatus());
	}

	static boolean isHiddenFromPublic(String salesStatus) {
		if (salesStatus == null || salesStatus.isBlank()) {
			return false;
		}
		return HIDDEN_FROM_PUBLIC_STATUSES.contains(salesStatus.trim().toUpperCase(Locale.ROOT));
	}
}
