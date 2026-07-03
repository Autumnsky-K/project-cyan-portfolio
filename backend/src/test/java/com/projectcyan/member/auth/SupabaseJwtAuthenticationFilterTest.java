package com.projectcyan.member.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import com.projectcyan.member.Member;
import com.projectcyan.member.MemberRepository;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class SupabaseJwtAuthenticationFilterTest {

	private final SupabaseJwtVerifier jwtVerifier = mock(SupabaseJwtVerifier.class);
	private final MemberRepository memberRepository = mock(MemberRepository.class);
	private final SupabaseJwtAuthenticationFilter filter = new SupabaseJwtAuthenticationFilter(jwtVerifier, memberRepository);

	@Test
	void rejectsProtectedRequestWithoutBearerToken() throws Exception {
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/orders");
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);

		filter.doFilter(request, response, filterChain);

		assertThat(response.getStatus()).isEqualTo(401);
		assertThat(response.getContentAsString()).contains("AUTH_UNAUTHORIZED");
		verifyNoInteractions(jwtVerifier, memberRepository, filterChain);
	}

	@Test
	void skipsPublicSignupRequest() throws Exception {
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/members/signup");
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);

		filter.doFilter(request, response, filterChain);

		verify(filterChain).doFilter(request, response);
		verifyNoInteractions(jwtVerifier, memberRepository);
	}

	@Test
	void protectsGoodsViewHistoryRequest() throws Exception {
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/goods/1001/views");
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);

		filter.doFilter(request, response, filterChain);

		assertThat(response.getStatus()).isEqualTo(401);
		assertThat(response.getContentAsString()).contains("AUTH_UNAUTHORIZED");
		verifyNoInteractions(jwtVerifier, memberRepository, filterChain);
	}

	@Test
	void protectsCheckoutPrepareRequest() throws Exception {
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/checkout/prepare");
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);

		filter.doFilter(request, response, filterChain);

		assertThat(response.getStatus()).isEqualTo(401);
		assertThat(response.getContentAsString()).contains("AUTH_UNAUTHORIZED");
		verifyNoInteractions(jwtVerifier, memberRepository, filterChain);
	}

	@Test
	void protectsFavoriteArtistsRequest() throws Exception {
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/members/me/favorite-artists");
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);

		filter.doFilter(request, response, filterChain);

		assertThat(response.getStatus()).isEqualTo(401);
		assertThat(response.getContentAsString()).contains("AUTH_UNAUTHORIZED");
		verifyNoInteractions(jwtVerifier, memberRepository, filterChain);
	}

	@Test
	void protectsGoodsLikesRequest() throws Exception {
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/goods/likes");
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);

		filter.doFilter(request, response, filterChain);

		assertThat(response.getStatus()).isEqualTo(401);
		assertThat(response.getContentAsString()).contains("AUTH_UNAUTHORIZED");
		verifyNoInteractions(jwtVerifier, memberRepository, filterChain);
	}

	@Test
	void protectsDigitalPurchaseStateRequest() throws Exception {
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/goods/1001/digital-purchase");
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);

		filter.doFilter(request, response, filterChain);

		assertThat(response.getStatus()).isEqualTo(401);
		assertThat(response.getContentAsString()).contains("AUTH_UNAUTHORIZED");
		verifyNoInteractions(jwtVerifier, memberRepository, filterChain);
	}

	@Test
	void protectsDigitalPurchaseRequest() throws Exception {
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/goods/1001/digital-purchase");
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);

		filter.doFilter(request, response, filterChain);

		assertThat(response.getStatus()).isEqualTo(401);
		assertThat(response.getContentAsString()).contains("AUTH_UNAUTHORIZED");
		verifyNoInteractions(jwtVerifier, memberRepository, filterChain);
	}

	@Test
	void protectsVisibleGoodsLikesStateRequest() throws Exception {
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/goods/likes/my");
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);

		filter.doFilter(request, response, filterChain);

		assertThat(response.getStatus()).isEqualTo(401);
		assertThat(response.getContentAsString()).contains("AUTH_UNAUTHORIZED");
		verifyNoInteractions(jwtVerifier, memberRepository, filterChain);
	}

	@Test
	void protectsAiPersonalizationContextRequest() throws Exception {
		MockHttpServletRequest request = new MockHttpServletRequest(
			"GET",
			"/api/ai/personalization-context"
		);
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);

		filter.doFilter(request, response, filterChain);

		assertThat(response.getStatus()).isEqualTo(401);
		assertThat(response.getContentAsString()).contains("AUTH_UNAUTHORIZED");
		verifyNoInteractions(jwtVerifier, memberRepository, filterChain);
	}

	@Test
	void exposesAuthenticatedMemberForAiPersonalizationContextRequest() throws Exception {
		UUID userId = UUID.randomUUID();
		Member member = Member.emailMember(userId, "user@example.com", "User", "010-0000-0000");
		MockHttpServletRequest request = new MockHttpServletRequest(
			"GET",
			"/api/ai/personalization-context"
		);
		request.addHeader("Authorization", "Bearer valid-token");
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);
		when(jwtVerifier.verify("valid-token")).thenReturn(new VerifiedSupabaseJwt(userId));
		when(memberRepository.findByMemberUuid(userId)).thenReturn(Optional.of(member));

		filter.doFilter(request, response, filterChain);

		assertThat(request.getAttribute(SupabaseJwtAuthenticationFilter.AUTHENTICATED_MEMBER_ATTRIBUTE))
			.isInstanceOf(AuthenticatedMember.class);
		verify(filterChain).doFilter(request, response);
	}

	@Test
	void exposesAuthenticatedMemberForDigitalPurchaseRequest() throws Exception {
		UUID userId = UUID.randomUUID();
		Member member = Member.emailMember(userId, "user@example.com", "User", "010-0000-0000");
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/goods/1001/digital-purchase");
		request.addHeader("Authorization", "Bearer valid-token");
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);
		when(jwtVerifier.verify("valid-token")).thenReturn(new VerifiedSupabaseJwt(userId));
		when(memberRepository.findByMemberUuid(userId)).thenReturn(Optional.of(member));

		filter.doFilter(request, response, filterChain);

		assertThat(response.getStatus()).isEqualTo(200);
		assertThat(request.getAttribute(SupabaseJwtAuthenticationFilter.AUTHENTICATED_MEMBER_ATTRIBUTE))
			.isInstanceOf(AuthenticatedMember.class);
		verify(filterChain).doFilter(request, response);
	}

	@Test
	void rejectsValidTokenWithoutMemberRow() throws Exception {
		UUID userId = UUID.randomUUID();
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/orders");
		request.addHeader("Authorization", "Bearer valid-token");
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);
		when(jwtVerifier.verify("valid-token")).thenReturn(new VerifiedSupabaseJwt(userId));
		when(memberRepository.findByMemberUuid(userId)).thenReturn(Optional.empty());

		filter.doFilter(request, response, filterChain);

		assertThat(response.getStatus()).isEqualTo(403);
		assertThat(response.getContentAsString()).contains("MEMBER_NOT_REGISTERED");
		verifyNoInteractions(filterChain);
	}

	@Test
	void rejectsCheckoutPrepareWhenTokenMemberIsMissing() throws Exception {
		UUID userId = UUID.randomUUID();
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/checkout/prepare");
		request.addHeader("Authorization", "Bearer valid-token");
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);
		when(jwtVerifier.verify("valid-token")).thenReturn(new VerifiedSupabaseJwt(userId));
		when(memberRepository.findByMemberUuid(userId)).thenReturn(Optional.empty());

		filter.doFilter(request, response, filterChain);

		assertThat(response.getStatus()).isEqualTo(403);
		assertThat(response.getContentAsString()).contains("MEMBER_NOT_REGISTERED");
		verifyNoInteractions(filterChain);
	}

	@Test
	void rejectsValidTokenForWithdrawnMember() throws Exception {
		UUID userId = UUID.randomUUID();
		Member member = Member.emailMember(userId, "user@example.com", "User", "010-0000-0000");
		member.withdraw();
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/members/me");
		request.addHeader("Authorization", "Bearer valid-token");
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);
		when(jwtVerifier.verify("valid-token")).thenReturn(new VerifiedSupabaseJwt(userId));
		when(memberRepository.findByMemberUuid(userId)).thenReturn(Optional.of(member));

		filter.doFilter(request, response, filterChain);

		assertThat(response.getStatus()).isEqualTo(403);
		assertThat(response.getContentAsString()).contains("MEMBER_WITHDRAWN");
		assertThat(response.getContentAsString()).contains("계정을 찾을 수 없습니다. 먼저 회원가입을 진행해 주세요.");
		verifyNoInteractions(filterChain);
	}

	@Test
	void exposesAuthenticatedMemberForProtectedRequest() throws Exception {
		UUID userId = UUID.randomUUID();
		Member member = Member.emailMember(userId, "user@example.com", "User", "010-0000-0000");
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/orders");
		request.addHeader("Authorization", "Bearer valid-token");
		MockHttpServletResponse response = new MockHttpServletResponse();
		FilterChain filterChain = mock(FilterChain.class);
		when(jwtVerifier.verify("valid-token")).thenReturn(new VerifiedSupabaseJwt(userId));
		when(memberRepository.findByMemberUuid(userId)).thenReturn(Optional.of(member));

		filter.doFilter(request, response, filterChain);

		assertThat(response.getStatus()).isEqualTo(200);
		assertThat(request.getAttribute(SupabaseJwtAuthenticationFilter.AUTHENTICATED_MEMBER_ATTRIBUTE))
			.isInstanceOf(AuthenticatedMember.class);
		verify(filterChain).doFilter(request, response);
	}
}
