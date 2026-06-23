package com.projectcyan.member;

public record SignupAgreementsRequest(
	Boolean age,
	Boolean service,
	Boolean privacy,
	Boolean marketing,
	Boolean recommend
) {

	boolean hasRequiredAgreements() {
		return Boolean.TRUE.equals(age)
			&& Boolean.TRUE.equals(service)
			&& Boolean.TRUE.equals(privacy);
	}
}
