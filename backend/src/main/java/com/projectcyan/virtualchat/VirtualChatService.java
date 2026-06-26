package com.projectcyan.virtualchat;

import java.util.List;

import com.projectcyan.goods.PageResponse;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VirtualChatService {

	private static final long DEFAULT_GUIDE_ID = 1L;
	private static final int DEFAULT_PAGE_SIZE = 20;
	private static final int MAX_PAGE_SIZE = 50;

	private final VirtualChatRepository virtualChatRepository;

	public VirtualChatService(VirtualChatRepository virtualChatRepository) {
		this.virtualChatRepository = virtualChatRepository;
	}

	@Transactional
	public VirtualChatSessionResponse createSession(Long memberId, VirtualChatSessionRequest request) {
		Long guideId = request == null || request.guideId() == null ? DEFAULT_GUIDE_ID : request.guideId();
		return virtualChatRepository.createSession(
			memberId,
			guideId,
			trimToNull(request == null ? null : request.title()),
			trimToNull(request == null ? null : request.sourceScreen())
		);
	}

	@Transactional(readOnly = true)
	public PageResponse<VirtualChatSessionResponse> findSessions(Long memberId, int page, int size) {
		int safePage = Math.max(0, page);
		int safeSize = Math.max(1, Math.min(size <= 0 ? DEFAULT_PAGE_SIZE : size, MAX_PAGE_SIZE));
		long totalElements = virtualChatRepository.countSessions(memberId);
		List<VirtualChatSessionResponse> content = virtualChatRepository.findSessions(memberId, safePage, safeSize);
		int totalPages = totalElements == 0 ? 0 : (int) Math.ceil((double) totalElements / safeSize);
		return new PageResponse<>(content, safePage, safeSize, totalElements, totalPages);
	}

	@Transactional(readOnly = true)
	public List<VirtualChatMessageResponse> findMessages(Long memberId, Long sessionId) {
		ensureOwnedSession(memberId, sessionId);
		return virtualChatRepository.findMessages(sessionId);
	}

	@Transactional
	public VirtualChatMessageResponse createMessage(
		Long memberId,
		Long sessionId,
		VirtualChatMessageRequest request
	) {
		ensureOwnedSession(memberId, sessionId);
		validateMessageRequest(request);
		VirtualChatMessageResponse message = virtualChatRepository.createMessage(sessionId, request);
		List<VirtualRecommendationRequest> recommendations = request.recommendations() == null
			? List.of()
			: request.recommendations();
		if (!recommendations.isEmpty()) {
			virtualChatRepository.createRecommendations(memberId, sessionId, message.messageId(), recommendations);
		}
		return message;
	}

	@Transactional
	public void endSession(Long memberId, Long sessionId) {
		ensureOwnedSession(memberId, sessionId);
		virtualChatRepository.endSession(sessionId);
	}

	private void ensureOwnedSession(Long memberId, Long sessionId) {
		Long ownerMemberId = virtualChatRepository.findSessionMemberId(sessionId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat session not found."));
		if (!ownerMemberId.equals(memberId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat session not found.");
		}
	}

	private void validateMessageRequest(VirtualChatMessageRequest request) {
		if (request == null || request.speaker() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Speaker is required.");
		}
		if (request.messageText() == null || request.messageText().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message text is required.");
		}
		if (request.recommendations() == null) {
			return;
		}
		for (VirtualRecommendationRequest recommendation : request.recommendations()) {
			if (recommendation.goodsId() == null) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Recommendation goodsId is required.");
			}
		}
	}

	private String trimToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}
