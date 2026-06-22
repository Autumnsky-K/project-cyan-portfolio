package com.projectcyan.member;

public class SupabaseAuthException extends RuntimeException {

	private final int status;

	public SupabaseAuthException(String message, int status) {
		super(message);
		this.status = status;
	}

	public int getStatus() {
		return status;
	}
}
