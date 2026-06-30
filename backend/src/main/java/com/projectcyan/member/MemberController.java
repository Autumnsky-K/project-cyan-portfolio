package com.projectcyan.member;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.projectcyan.member.auth.AuthenticatedMember;

@RestController
@RequestMapping("/api/members")
public class MemberController {

	private final MemberService memberService;

	public MemberController(MemberService memberService) {
		this.memberService = memberService;
	}

	@GetMapping("/me")
	public AuthenticatedMember currentMember(AuthenticatedMember currentMember) {
		return currentMember;
	}

	@PatchMapping("/me")
	public MemberProfileResponse updateCurrentMember(
		AuthenticatedMember currentMember,
		@Valid @RequestBody MemberProfileUpdateRequest request
	) {
		return memberService.updateCurrentMember(currentMember.memberId(), request);
	}

	@DeleteMapping("/me")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void withdrawCurrentMember(AuthenticatedMember currentMember) {
		memberService.withdrawCurrentMember(currentMember.memberId());
	}

	@PostMapping("/signup")
	@ResponseStatus(HttpStatus.CREATED)
	public SignupResponse signup(@Valid @RequestBody SignupRequest request) {
		return memberService.signup(request);
	}

	@PostMapping("/signup/availability")
	public SignupAvailabilityResponse checkSignupAvailability(@Valid @RequestBody SignupAvailabilityRequest request) {
		return memberService.checkSignupAvailability(request);
	}

	@PostMapping("/password-reset/eligibility")
	public PasswordResetEligibilityResponse checkPasswordResetEligibility(
		@Valid @RequestBody PasswordResetEligibilityRequest request
	) {
		return memberService.checkPasswordResetEligibility(request);
	}
}
