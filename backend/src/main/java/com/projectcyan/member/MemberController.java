package com.projectcyan.member;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
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
	private final FavoriteArtistService favoriteArtistService;

	public MemberController(
		MemberService memberService,
		FavoriteArtistService favoriteArtistService
	) {
		this.memberService = memberService;
		this.favoriteArtistService = favoriteArtistService;
	}

	@GetMapping("/me")
	public MemberProfileResponse currentMember(AuthenticatedMember currentMember) {
		return memberService.findCurrentProfile(currentMember);
	}

	@GetMapping("/me/favorite-artists")
	public List<FavoriteArtistResponse> findFavoriteArtists(AuthenticatedMember currentMember) {
		return favoriteArtistService.findFavoriteArtists(currentMember.memberId());
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
