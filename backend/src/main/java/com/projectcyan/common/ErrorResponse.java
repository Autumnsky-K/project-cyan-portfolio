package com.projectcyan.common;

public record ErrorResponse(
	String code,
	String message,
	int status
) {
}
