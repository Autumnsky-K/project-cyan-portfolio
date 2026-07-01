package com.projectcyan.member;

import jakarta.validation.constraints.NotBlank;

public record MemberProfileUpdateRequest(
	String email,
	@NotBlank String name,
	@NotBlank String phone,
	@NotBlank String address,
	String addressDetail,
	String deliveryRequest
) {
}
