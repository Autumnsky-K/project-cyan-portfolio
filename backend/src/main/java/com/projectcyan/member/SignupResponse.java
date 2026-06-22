package com.projectcyan.member;

import java.util.UUID;

public record SignupResponse(
	UUID userId,
	String email,
	String name
) {

	static SignupResponse from(Member member) {
		return new SignupResponse(member.getMemberUuid(), member.getEmail(), member.getName());
	}
}
