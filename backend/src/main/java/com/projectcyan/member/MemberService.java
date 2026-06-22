package com.projectcyan.member;

import java.util.Locale;

import com.projectcyan.common.ApiErrorException;

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
		if (memberRepository.existsByEmail(email)) {
			throw new ApiErrorException("MEMBER_EMAIL_ALREADY_EXISTS", "이미 가입된 이메일입니다.", HttpStatus.CONFLICT);
		}

		SupabaseAuthUser authUser;
		try {
			authUser = supabaseAuthClient.createUser(request);
		} catch (SupabaseAuthException exception) {
			throw authException(exception);
		}

		try {
			Member member = memberRepository.findByMemberUuid(authUser.id())
				.orElseGet(() -> memberRepository.save(Member.emailMember(
					authUser.id(),
					email,
					request.name().trim(),
					request.phone().trim()
				)));
			memberAddressRepository.save(MemberAddress.defaultAddress(
				member,
				request.name().trim(),
				request.phone().trim(),
				request.address().trim()
			));
			return SignupResponse.from(member);
		} catch (DataAccessException exception) {
			supabaseAuthClient.deleteUser(authUser.id());
			throw new ApiErrorException("MEMBER_SIGNUP_FAILED", "회원 정보를 저장하지 못했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
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

	private ApiErrorException authException(SupabaseAuthException exception) {
		if (exception.getStatus() == 409 || exception.getMessage().toLowerCase(Locale.ROOT).contains("already")) {
			return new ApiErrorException("MEMBER_EMAIL_ALREADY_EXISTS", "이미 가입된 이메일입니다.", HttpStatus.CONFLICT);
		}
		if (exception.getStatus() >= 400 && exception.getStatus() < 500) {
			return new ApiErrorException("MEMBER_AUTH_REJECTED", exception.getMessage(), HttpStatus.BAD_REQUEST);
		}
		return new ApiErrorException("MEMBER_AUTH_FAILED", exception.getMessage(), HttpStatus.BAD_GATEWAY);
	}
}
