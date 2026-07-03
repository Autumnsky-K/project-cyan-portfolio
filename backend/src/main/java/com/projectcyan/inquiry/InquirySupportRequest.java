package com.projectcyan.inquiry;

public record InquirySupportRequest(
	String title,
	String content,
	Long orderId
) {
}
