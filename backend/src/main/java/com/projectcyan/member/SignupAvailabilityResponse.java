package com.projectcyan.member;

public record SignupAvailabilityResponse(
	boolean available,
	boolean emailExists,
	boolean phoneExists
) {
	static SignupAvailabilityResponse from(boolean emailExists, boolean phoneExists) {
		return new SignupAvailabilityResponse(!emailExists && !phoneExists, emailExists, phoneExists);
	}
}
