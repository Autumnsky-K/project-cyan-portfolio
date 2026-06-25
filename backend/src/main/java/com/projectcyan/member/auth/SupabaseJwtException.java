package com.projectcyan.member.auth;

public class SupabaseJwtException extends RuntimeException {

	public SupabaseJwtException(String message) {
		super(message);
	}

	public SupabaseJwtException(String message, Throwable cause) {
		super(message, cause);
	}
}
