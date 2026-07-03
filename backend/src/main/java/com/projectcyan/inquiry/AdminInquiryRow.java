package com.projectcyan.inquiry;

import java.time.Instant;

public record AdminInquiryRow(
	Long inquiryId,
	String inquiryType,
	String title,
	String content,
	boolean secret,
	String memberName,
	String memberEmail,
	Long goodsId,
	String goodsName,
	String orderNo,
	String status,
	String answerContent,
	Instant createdAt,
	Instant answeredAt
) {
}
