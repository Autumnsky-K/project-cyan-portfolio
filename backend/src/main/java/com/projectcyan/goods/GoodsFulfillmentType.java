package com.projectcyan.goods;

import java.util.Arrays;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum GoodsFulfillmentType {
	PHYSICAL("실물"),
	DIGITAL("디지털");

	private final String label;

	GoodsFulfillmentType(String label) {
		this.label = label;
	}

	public String label() {
		return label;
	}

	static GoodsFulfillmentType from(String rawValue) {
		if (rawValue == null || rawValue.isBlank()) {
			return PHYSICAL;
		}
		String normalizedValue = rawValue.trim().toUpperCase(Locale.ROOT);
		return Arrays.stream(values())
			.filter(type -> type.name().equals(normalizedValue))
			.findFirst()
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "상품 유형 값이 올바르지 않습니다."));
	}
}
