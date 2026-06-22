package com.projectcyan.member;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SignupRequest(
	@NotBlank @Email String email,
	@NotBlank @Size(min = 6) String password,
	@NotBlank String name,
	@NotBlank String phone,
	@NotBlank String address,
	@Valid @NotNull SignupAgreementsRequest agreements
) {
}
