package com.projectcyan.member;

import java.util.UUID;

public record MemberProfileResponse(
	Long memberId,
	UUID memberUuid,
	String email,
	String name,
	String phone,
	String postalCode,
	String address,
	String addressDetail,
	String deliveryRequest
) {

	static MemberProfileResponse from(Member member, MemberAddress address) {
		return new MemberProfileResponse(
			member.getMemberId(),
			member.getMemberUuid(),
			member.getEmail(),
			address == null || isBlank(address.getRecipientName()) ? member.getName() : address.getRecipientName(),
			isBlank(member.getPhone()) && address != null ? address.getPhone() : member.getPhone(),
			address == null ? "" : valueOrEmpty(address.getPostalCode()),
			address == null ? "" : valueOrEmpty(address.getAddress()),
			address == null ? "" : valueOrEmpty(address.getAddressDetail()),
			address == null ? "" : valueOrEmpty(address.getDeliveryRequest())
		);
	}

	private static String valueOrEmpty(String value) {
		return value == null ? "" : value;
	}

	private static boolean isBlank(String value) {
		return value == null || value.isBlank();
	}
}
