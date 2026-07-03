package com.projectcyan.goods;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public record AdminGoodsReviewRow(
	Long reviewId,
	Long goodsId,
	String goodsName,
	Long memberId,
	Integer rating,
	String authorName,
	String optionLabel,
	String content,
	Instant createdAt,
	Instant updatedAt
) {
	private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter
		.ofPattern("yyyy-MM-dd HH:mm")
		.withZone(ZoneId.of("Asia/Seoul"));

	public String createdAtLabel() {
		return formatInstant(createdAt);
	}

	public String updatedAtLabel() {
		return formatInstant(updatedAt);
	}

	private static String formatInstant(Instant value) {
		return value == null ? "" : DATE_TIME_FORMATTER.format(value);
	}
}
