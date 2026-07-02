package com.projectcyan.member.auth;

import java.util.UUID;

import com.projectcyan.member.Member;

public record AuthenticatedMember(
	Long memberId,
	UUID memberUuid,
	String email,
	String name,
	String phone,
	String memberGrade
) {

	public static AuthenticatedMember from(Member member) {
		return new AuthenticatedMember(
			member.getMemberId(),
			member.getMemberUuid(),
			member.getEmail(),
			member.getName(),
			member.getPhone(),
			member.getMemberGrade()
		);
	}
}
