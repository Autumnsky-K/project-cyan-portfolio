package com.projectcyan.member;

import jakarta.validation.constraints.NotBlank;

public record MemberProfileUpdateRequest(
	@NotBlank String name,
	@NotBlank String phone,
	@NotBlank String address
) {
}
