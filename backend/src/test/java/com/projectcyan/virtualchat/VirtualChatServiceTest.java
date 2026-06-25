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
}
