package com.projectcyan.member;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.security.SecureRandom;
import java.time.Clock;
import java.util.Optional;
import java.util.UUID;

import com.projectcyan.common.ApiErrorException;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.test.util.ReflectionTestUtils;

class MemberServiceTest {

	private final SupabaseAuthClient supabaseAuthClient = mock(SupabaseAuthClient.class);
	private final MemberRepository memberRepository = mock(MemberRepository.class);
	private final MemberAddressRepository memberAddressRepository = mock(MemberAddressRepository.class);
	private final PasswordResetTokenRepository passwordResetTokenRepository = mock(PasswordResetTokenRepository.class);
	private final PasswordResetMailService passwordResetMailService = mock(PasswordResetMailService.class);
	private final PasswordResetProperties passwordResetProperties = mock(PasswordResetProperties.class);
	private final MemberService memberService = new MemberService(
		supabaseAuthClient,
		memberRepository,
		memberAddressRepository,
		passwordResetTokenRepository,
		passwordResetMailService,
		passwordResetProperties,
		new SecureRandom(),
		Clock.systemUTC()
	);

	@Test
	void flushesWithdrawnMemberBeforeDeletingSupabaseAuthUser() {
		UUID memberUuid = UUID.randomUUID();
		Member member = Member.emailMember(memberUuid, "user@example.com", "User", "010-0000-0000");
		ReflectionTestUtils.setField(member, "memberId", 970L);
		when(memberRepository.findById(970L)).thenReturn(Optional.of(member));

		memberService.withdrawCurrentMember(970L);

		InOrder order = inOrder(memberAddressRepository, memberRepository, supabaseAuthClient);
		order.verify(memberAddressRepository).deleteByMemberMemberId(970L);
		order.verify(memberRepository).flush();
		order.verify(supabaseAuthClient).deleteUser(memberUuid);
	}

	@Test
	void reportsFailureWhenSupabaseAuthUserDeletionFails() {
		UUID memberUuid = UUID.randomUUID();
		Member member = Member.emailMember(memberUuid, "user@example.com", "User", "010-0000-0000");
		ReflectionTestUtils.setField(member, "memberId", 970L);
		when(memberRepository.findById(970L)).thenReturn(Optional.of(member));
		doThrow(new SupabaseAuthException("Auth delete failed.", 502))
			.when(supabaseAuthClient)
			.deleteUser(memberUuid);

		assertThatThrownBy(() -> memberService.withdrawCurrentMember(970L))
			.isInstanceOf(ApiErrorException.class)
			.extracting("code")
			.isEqualTo("MEMBER_AUTH_FAILED");
	}

	@Test
	void retriesWhenSupabaseAuthUserDeletionTemporarilyFails() {
		UUID memberUuid = UUID.randomUUID();
		Member member = Member.emailMember(memberUuid, "user@example.com", "User", "010-0000-0000");
		ReflectionTestUtils.setField(member, "memberId", 970L);
		when(memberRepository.findById(970L)).thenReturn(Optional.of(member));
		doThrow(new SupabaseAuthException("upstream request timeout", 504))
			.doNothing()
			.when(supabaseAuthClient)
			.deleteUser(memberUuid);

		memberService.withdrawCurrentMember(970L);

		verify(supabaseAuthClient, times(2)).deleteUser(memberUuid);
	}
}
