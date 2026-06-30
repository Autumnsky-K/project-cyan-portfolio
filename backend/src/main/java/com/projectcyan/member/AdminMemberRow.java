package com.projectcyan.member;

import java.time.Instant;
import java.util.UUID;

public record AdminMemberRow(
	Long memberId,
	UUID memberUuid,
	String email,
	String name,
	String phone,
	String address,
	String memberGrade,
	String status,
	Instant joinedAt
) {
	static AdminMemberRow from(Member member, String address) {
		return new AdminMemberRow(
			member.getMemberId(),
			member.getMemberUuid(),
			member.getEmail(),
			member.getName(),
			member.getPhone(),
			address,
			member.getMemberGrade(),
			member.getStatus(),
			member.getJoinedAt()
		);
	}
}
