package com.projectcyan.member;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.projectcyan.member.auth.AuthenticatedMember;

@RestController
@RequestMapping("/api/members")
public class MemberController {

	private final MemberService memberService;
	private final FavoriteArtistService favoriteArtistService;
	private final MemberGoodsActivityService memberGoodsActivityService;
	private final DigitalLibraryService digitalLibraryService;

	public MemberController(
		MemberService memberService,
		FavoriteArtistService favoriteArtistService,
		MemberGoodsActivityService memberGoodsActivityService,
		DigitalLibraryService digitalLibraryService
	) {
		this.memberService = memberService;
		this.favoriteArtistService = favoriteArtistService;
		this.memberGoodsActivityService = memberGoodsActivityService;
		this.digitalLibraryService = digitalLibraryService;
	}

	@GetMapping("/me")
	public MemberProfileResponse currentMember(AuthenticatedMember currentMember) {
		return memberService.findCurrentProfile(currentMember);
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

	@GetMapping("/me/favorite-artists")
	public List<FavoriteArtistResponse> findFavoriteArtists(AuthenticatedMember currentMember) {
		return favoriteArtistService.findFavoriteArtists(currentMember.memberId());
	}

	@GetMapping("/me/goods-activity")
	public MemberGoodsActivityResponse findGoodsActivity(AuthenticatedMember currentMember) {
		return memberGoodsActivityService.findGoodsActivity(currentMember.memberId());
	}

	@GetMapping("/me/digital-library")
	public List<DigitalLibraryItemResponse> findDigitalLibrary(
		AuthenticatedMember currentMember,
		@RequestParam(name = "goodsId", required = false) Long goodsId
	) {
		return digitalLibraryService.findLibrary(currentMember.memberId(), goodsId);
	}

	@PostMapping("/me/digital-library/{entitlementId}/downloads")
	public DigitalDownloadResponse requestDigitalDownload(
		AuthenticatedMember currentMember,
		@PathVariable Long entitlementId,
		@RequestBody(required = false) DigitalDownloadRequest downloadRequest,
		HttpServletRequest servletRequest
	) {
		return digitalLibraryService.requestDownload(
			currentMember.memberId(),
			entitlementId,
			downloadRequest,
			clientIp(servletRequest),
			servletRequest.getHeader("User-Agent")
		);
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

	@PostMapping("/password-reset/request")
	public PasswordResetRequestedResponse requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
		return memberService.requestPasswordReset(request);
	}

	@PostMapping("/password-reset/confirm")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest request) {
		memberService.confirmPasswordReset(request);
	}

	private String clientIp(HttpServletRequest request) {
		String forwardedFor = request.getHeader("X-Forwarded-For");
		if (forwardedFor != null && !forwardedFor.isBlank()) {
			return forwardedFor.split(",")[0].trim();
		}
		return request.getRemoteAddr();
	}
}
