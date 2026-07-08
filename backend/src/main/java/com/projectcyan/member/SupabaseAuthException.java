package com.projectcyan.member;

public class SupabaseAuthException extends RuntimeException {

	private final int status;
	private final String responseBody;

	public SupabaseAuthException(String message, int status) {
		this(message, status, "");
	}

	public SupabaseAuthException(String message, int status, String responseBody) {
		super(message);
		this.status = status;
		this.responseBody = responseBody == null ? "" : responseBody;
	}

	public int getStatus() {
		return status;
	}

	public String getResponseBody() {
		return responseBody;
	}
}
