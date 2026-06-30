package com.projectcyan.member;

import java.util.List;
import java.util.Locale;

import com.projectcyan.common.ApiErrorException;
import com.projectcyan.member.auth.AuthenticatedMember;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class MemberService {

	private final SupabaseAuthClient supabaseAuthClient;
	private final MemberRepository memberRepository;
	private final MemberAddressRepository memberAddressRepository;

	public MemberService(
		SupabaseAuthClient supabaseAuthClient,
		MemberRepository memberRepository,
		MemberAddressRepository memberAddressRepository
	) {
		this.supabaseAuthClient = supabaseAuthClient;
		this.memberRepository = memberRepository;
		this.memberAddressRepository = memberAddressRepository;
	}

	@Transactional
	public SignupResponse signup(SignupRequest request) {
		validateSignupRequest(request);
		String email = normalizeEmail(request.email());
		String phone = normalizePhone(request.phone());

		if (memberRepository.existsByEmail(email)) {
			throw new ApiErrorException(
				"MEMBER_EMAIL_ALREADY_EXISTS",
				"이미 가입된 이메일 주소입니다. 로그인하거나 비밀번호를 찾아주세요.",
				HttpStatus.CONFLICT
			);
		}
		if (memberRepository.existsByPhoneDigits(phoneDigits(phone))) {
			throw new ApiErrorException(
				"MEMBER_PHONE_ALREADY_EXISTS",
				"이미 가입된 휴대폰 번호입니다. 기존 계정으로 로그인해주세요.",
				HttpStatus.CONFLICT
			);
		}

		SignupRequest normalizedRequest = new SignupRequest(
			email,
			request.password(),
			request.name(),
			phone,
			request.address(),
			request.agreements()
		);
		SupabaseAuthUser authUser;
		try {
			authUser = supabaseAuthClient.createUser(normalizedRequest);
		} catch (SupabaseAuthException exception) {
			throw authException(exception);
		}

		try {
			Member member = memberRepository.findByMemberUuid(authUser.id())
				.orElseGet(() -> memberRepository.save(Member.emailMember(
					authUser.id(),
					email,
					request.name().trim(),
					phone
				)));
			memberAddressRepository.save(MemberAddress.defaultAddress(
				member,
				request.name().trim(),
				phone,
				request.address().trim()
			));
			return SignupResponse.from(member);
		} catch (DataAccessException exception) {
			supabaseAuthClient.deleteUser(authUser.id());
			throw new ApiErrorException("MEMBER_SIGNUP_FAILED", "회원 정보를 저장하지 못했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Transactional(readOnly = true)
	public MemberProfileResponse findCurrentProfile(AuthenticatedMember currentMember) {
		Member member = memberRepository.findById(currentMember.memberId())
			.orElseThrow(() -> new ApiErrorException(
				"MEMBER_NOT_FOUND",
				"Member profile was not found.",
				HttpStatus.NOT_FOUND
			));
		MemberAddress address = memberAddressRepository
			.findFirstByMemberMemberIdOrderByDefaultAddressDescAddressIdAsc(member.getMemberId())
			.orElse(null);

		return MemberProfileResponse.from(member, address);
	}

	@Transactional(readOnly = true)
	public SignupAvailabilityResponse checkSignupAvailability(SignupAvailabilityRequest request) {
		String email = normalizeEmail(request.email());
		String phone = normalizePhone(request.phone());

		return SignupAvailabilityResponse.from(
			memberRepository.existsByEmail(email),
			memberRepository.existsByPhoneDigits(phoneDigits(phone))
		);
	}

	@Transactional(readOnly = true)
	public PasswordResetEligibilityResponse checkPasswordResetEligibility(PasswordResetEligibilityRequest request) {
		String email = normalizeEmail(request.email());

		return new PasswordResetEligibilityResponse(memberRepository.existsByEmail(email));
	}

	@Transactional
	public MemberProfileResponse updateCurrentMember(Long memberId, MemberProfileUpdateRequest request) {
		String name = normalizeName(request.name());
		String phone = normalizePhone(request.phone());
		String address = normalizeAddress(request.address());

		Member member = memberRepository.findById(memberId)
			.orElseThrow(() -> new ApiErrorException("MEMBER_NOT_FOUND", "회원 정보를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

		if (memberRepository.existsByPhoneDigitsExcludingMemberId(phoneDigits(phone), member.getMemberId())) {
			throw new ApiErrorException(
				"MEMBER_PHONE_ALREADY_EXISTS",
				"이미 가입된 휴대폰 번호입니다. 다른 번호를 입력해주세요.",
				HttpStatus.CONFLICT
			);
		}

		member.updateProfile(name, phone);
		MemberAddress memberAddress = memberAddressRepository
			.findFirstByMemberMemberIdOrderByDefaultAddressDescAddressIdAsc(member.getMemberId())
			.orElseGet(() -> memberAddressRepository.save(MemberAddress.defaultAddress(member, name, phone, address)));
		memberAddress.updateDefaultAddress(name, phone, address);

		return MemberProfileResponse.from(member, memberAddress);
	}

	@Transactional
	public void withdrawCurrentMember(Long memberId) {
		Member member = memberRepository.findById(memberId)
			.orElseThrow(() -> new ApiErrorException("MEMBER_NOT_FOUND", "회원 정보를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

		memberAddressRepository.deleteByMemberMemberId(member.getMemberId());
		member.withdraw();
		supabaseAuthClient.deleteUser(member.getMemberUuid());
	}

	@Transactional(readOnly = true)
	public List<AdminMemberRow> findAdminMembers() {
		return memberRepository.findAllByOrderByMemberIdDesc()
			.stream()
			.map(member -> AdminMemberRow.from(
				member,
				memberAddressRepository
					.findFirstByMemberMemberIdOrderByDefaultAddressDescAddressIdAsc(member.getMemberId())
					.map(MemberAddress::getAddress)
					.orElse("")
			))
			.toList();
	}

	@Transactional
	public SignupResponse createAdminMember(AdminMemberForm form) {
		return signup(new SignupRequest(
			normalizeEmail(form.email()),
			form.password(),
			normalizeName(form.name()),
			normalizePhone(form.phone()),
			normalizeAddress(form.address()),
			new SignupAgreementsRequest(true, true, true, false, false)
		));
	}

	@Transactional
	public void updateAdminMember(Long memberId, AdminMemberForm form) {
		Member member = memberRepository.findById(memberId)
			.orElseThrow(() -> new ApiErrorException("MEMBER_NOT_FOUND", "회원 정보를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
		String email = normalizeEmail(form.email());
		String name = normalizeName(form.name());
		String phone = normalizePhone(form.phone());
		String address = normalizeAddress(form.address());
		String memberGrade = normalizeAdminValue(form.memberGrade(), "BASIC");
		String status = normalizeAdminValue(form.status(), "ACTIVE");

		memberRepository.findByEmail(email)
			.filter(foundMember -> !foundMember.getMemberId().equals(member.getMemberId()))
			.ifPresent(foundMember -> {
				throw new ApiErrorException(
					"MEMBER_EMAIL_ALREADY_EXISTS",
					"이미 가입된 이메일 주소입니다.",
					HttpStatus.CONFLICT
				);
			});
		if (memberRepository.existsByPhoneDigitsExcludingMemberId(phoneDigits(phone), member.getMemberId())) {
			throw new ApiErrorException(
				"MEMBER_PHONE_ALREADY_EXISTS",
				"이미 가입된 휴대폰 번호입니다.",
				HttpStatus.CONFLICT
			);
		}

		member.updateAdminProfile(email, name, phone, memberGrade, status);
		MemberAddress memberAddress = memberAddressRepository
			.findFirstByMemberMemberIdOrderByDefaultAddressDescAddressIdAsc(member.getMemberId())
			.orElseGet(() -> memberAddressRepository.save(MemberAddress.defaultAddress(member, name, phone, address)));
		memberAddress.updateDefaultAddress(name, phone, address);
	}

	@Transactional
	public void deleteAdminMember(Long memberId) {
		withdrawCurrentMember(memberId);
	}

	private void validateSignupRequest(SignupRequest request) {
		if (!request.agreements().hasRequiredAgreements()) {
			throw new ApiErrorException("MEMBER_REQUIRED_TERMS_MISSING", "필수 약관에 모두 동의해주세요.", HttpStatus.BAD_REQUEST);
		}
		if (!StringUtils.hasText(request.password()) || request.password().length() < 6) {
			throw new ApiErrorException("MEMBER_INVALID_PASSWORD", "비밀번호는 6자 이상이어야 합니다.", HttpStatus.BAD_REQUEST);
		}
	}

	private String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private String normalizeName(String name) {
		String normalizedName = name == null ? "" : name.trim();
		if (!StringUtils.hasText(normalizedName)) {
			throw new ApiErrorException("MEMBER_INVALID_NAME", "이름을 입력해주세요.", HttpStatus.BAD_REQUEST);
		}
		return normalizedName;
	}

	private String normalizeAddress(String address) {
		String normalizedAddress = address == null ? "" : address.trim();
		if (!StringUtils.hasText(normalizedAddress)) {
			throw new ApiErrorException("MEMBER_INVALID_ADDRESS", "주소를 입력해주세요.", HttpStatus.BAD_REQUEST);
		}
		return normalizedAddress;
	}

	private String normalizePhone(String phone) {
		String phoneDigits = phoneDigits(phone);
		if (!phoneDigits.matches("010\\d{8}")) {
			throw new ApiErrorException("MEMBER_INVALID_PHONE", "휴대폰번호는 010-0000-0000 형식으로 입력해주세요.", HttpStatus.BAD_REQUEST);
		}
		return phoneDigits.substring(0, 3) + "-" + phoneDigits.substring(3, 7) + "-" + phoneDigits.substring(7);
	}

	private String phoneDigits(String phone) {
		return phone == null ? "" : phone.replaceAll("\\D", "");
	}

	private String normalizeAdminValue(String value, String fallbackValue) {
		String normalizedValue = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
		return StringUtils.hasText(normalizedValue) ? normalizedValue : fallbackValue;
	}

	private ApiErrorException authException(SupabaseAuthException exception) {
		if (exception.getStatus() == 409 || exception.getMessage().toLowerCase(Locale.ROOT).contains("already")) {
			return new ApiErrorException(
				"MEMBER_EMAIL_ALREADY_EXISTS",
				"이미 가입된 이메일 주소입니다. 로그인하거나 비밀번호를 찾아주세요.",
				HttpStatus.CONFLICT
			);
		}
		if (exception.getStatus() >= 400 && exception.getStatus() < 500) {
			return new ApiErrorException("MEMBER_AUTH_REJECTED", exception.getMessage(), HttpStatus.BAD_REQUEST);
		}
		return new ApiErrorException("MEMBER_AUTH_FAILED", exception.getMessage(), HttpStatus.BAD_GATEWAY);
	}
}
