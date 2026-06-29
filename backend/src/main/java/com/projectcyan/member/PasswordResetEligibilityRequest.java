package com.projectcyan.member;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PasswordResetEligibilityRequest(
	@NotBlank @Email String email
) {
}
