package com.projectcyan.inquiry;

public record InquiryProductRequest(
	String title,
	String content,
	Boolean secret
) {
}
