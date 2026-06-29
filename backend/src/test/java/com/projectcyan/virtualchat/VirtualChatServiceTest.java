package com.projectcyan.virtualchat;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class VirtualChatServiceTest {

	private VirtualChatRepository virtualChatRepository;
	private VirtualChatService virtualChatService;

	@BeforeEach
	void setUp() {
		virtualChatRepository = mock(VirtualChatRepository.class);
		virtualChatService = new VirtualChatService(virtualChatRepository);
	}

	@Test
	void createsMessageAndRecommendationsForOwnedSession() {
		Long memberId = 7L;
		Long sessionId = 11L;
		VirtualRecommendationRequest recommendation = new VirtualRecommendationRequest(
			42L,
			"포토카드 추천해줘",
			"artistName 조건과 일치하는 상품입니다.",
			0
		);
		VirtualChatMessageRequest request = new VirtualChatMessageRequest(
			VirtualChatSpeaker.ASSISTANT,
			"이 포토카드는 어때요?",
			"navigate",
			List.of(Map.of("type", "navigate", "path", "/goods/42")),
			Map.of("model", "project-cyan-ai"),
			List.of(recommendation)
		);
		VirtualChatMessageResponse response = new VirtualChatMessageResponse(
			21L,
			sessionId,
			VirtualChatSpeaker.ASSISTANT,
			request.messageText(),
			request.action(),
			request.actions(),
			request.metadata(),
			Instant.parse("2026-06-25T00:00:00Z")
		);
		when(virtualChatRepository.findSessionMemberId(sessionId)).thenReturn(Optional.of(memberId));
		when(virtualChatRepository.createMessage(sessionId, request)).thenReturn(response);

		virtualChatService.createMessage(memberId, sessionId, request);

		verify(virtualChatRepository).createRecommendations(memberId, sessionId, 21L, List.of(recommendation));
	}

	@Test
	void rejectsMessageForAnotherMembersSession() {
		Long sessionId = 11L;
		VirtualChatMessageRequest request = new VirtualChatMessageRequest(
			VirtualChatSpeaker.USER,
			"추천해줘",
			null,
			null,
			null,
			null
		);
		when(virtualChatRepository.findSessionMemberId(sessionId)).thenReturn(Optional.of(99L));

		assertThatThrownBy(() -> virtualChatService.createMessage(7L, sessionId, request))
			.isInstanceOf(ResponseStatusException.class)
			.hasMessageContaining("404 NOT_FOUND");

		verify(virtualChatRepository, never()).createMessage(sessionId, request);
	}

	@Test
	void rejectsBlankMessageText() {
		Long memberId = 7L;
		Long sessionId = 11L;
		VirtualChatMessageRequest request = new VirtualChatMessageRequest(
			VirtualChatSpeaker.USER,
			" ",
			null,
			null,
			null,
			null
		);
		when(virtualChatRepository.findSessionMemberId(sessionId)).thenReturn(Optional.of(memberId));

		assertThatThrownBy(() -> virtualChatService.createMessage(memberId, sessionId, request))
			.isInstanceOf(ResponseStatusException.class)
			.hasMessageContaining("400 BAD_REQUEST");
	}

	@Test
	void upsertsSummaryForOwnedSession() {
		Long memberId = 7L;
		Long sessionId = 11L;
		VirtualChatSummaryRequest request = summaryRequest();
		when(virtualChatRepository.findSessionMemberId(sessionId)).thenReturn(Optional.of(memberId));

		virtualChatService.upsertSummary(memberId, sessionId, request);

		verify(virtualChatRepository).upsertSummary(sessionId, request);
	}

	@Test
	void rejectsSummaryForAnotherMembersSession() {
		Long sessionId = 11L;
		VirtualChatSummaryRequest request = summaryRequest();
		when(virtualChatRepository.findSessionMemberId(sessionId)).thenReturn(Optional.of(99L));

		assertThatThrownBy(() -> virtualChatService.upsertSummary(7L, sessionId, request))
			.isInstanceOf(ResponseStatusException.class)
			.hasMessageContaining("404 NOT_FOUND");

		verify(virtualChatRepository, never()).upsertSummary(sessionId, request);
	}

	@Test
	void clampsRecentSessionContextToThree() {
		virtualChatService.findRecentSessionContexts(7L, 11L, 20);

		verify(virtualChatRepository).findRecentSessionContexts(7L, 11L, 3);
	}

	@Test
	void rejectsOversizedSummaryLists() {
		VirtualChatSummaryContent summary = new VirtualChatSummaryContent(
			"대화 요약",
			java.util.stream.IntStream.range(0, 11).mapToObj(index -> "선호 " + index).toList(),
			List.of(),
			List.of(),
			List.of(),
			List.of()
		);
		VirtualChatSummaryRequest request = new VirtualChatSummaryRequest(summary, 2, 22L);
		when(virtualChatRepository.findSessionMemberId(11L)).thenReturn(Optional.of(7L));

		assertThatThrownBy(() -> virtualChatService.upsertSummary(7L, 11L, request))
			.isInstanceOf(ResponseStatusException.class)
			.hasMessageContaining("400 BAD_REQUEST");
	}

	private VirtualChatSummaryRequest summaryRequest() {
		return new VirtualChatSummaryRequest(
			new VirtualChatSummaryContent(
				"아이유 포토카드를 추천함",
				List.of("아이유"),
				List.of("고가 리셀"),
				List.of("10만원 이하"),
				List.of(42L),
				List.of("앨범 추가 추천")
			),
			2,
			22L
		);
	}
}
