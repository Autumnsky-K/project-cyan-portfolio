package com.projectcyan.member;

import java.util.UUID;

public record MemberProfileResponse(
	Long memberId,
	UUID memberUuid,
	String email,
	String name,
	String phone,
	String address
) {

	static MemberProfileResponse from(Member member, String address) {
		return new MemberProfileResponse(
			member.getMemberId(),
			member.getMemberUuid(),
			member.getEmail(),
			member.getName(),
			member.getPhone(),
			address
		);
	}
}
