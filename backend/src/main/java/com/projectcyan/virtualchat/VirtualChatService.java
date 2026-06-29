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
	private static final int MAX_RECENT_SESSION_LIMIT = 3;
	private static final int MAX_SUMMARY_LENGTH = 1000;
	private static final int MAX_SUMMARY_LIST_SIZE = 10;
	private static final int MAX_SUMMARY_ITEM_LENGTH = 200;
	private static final int MAX_MENTIONED_GOODS_SIZE = 20;

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

	@Transactional(readOnly = true)
	public List<RecentChatSessionContextResponse> findRecentSessionContexts(
		Long memberId,
		Long excludeSessionId,
		int limit
	) {
		int safeLimit = Math.max(1, Math.min(limit <= 0 ? MAX_RECENT_SESSION_LIMIT : limit, MAX_RECENT_SESSION_LIMIT));
		return virtualChatRepository.findRecentSessionContexts(memberId, excludeSessionId, safeLimit);
	}

	@Transactional
	public VirtualChatSummaryResponse upsertSummary(
		Long memberId,
		Long sessionId,
		VirtualChatSummaryRequest request
	) {
		ensureOwnedSession(memberId, sessionId);
		validateSummaryRequest(request);
		return virtualChatRepository.upsertSummary(sessionId, request);
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

	private void validateSummaryRequest(VirtualChatSummaryRequest request) {
		if (request == null || request.summary() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Summary is required.");
		}
		if (request.sourceMessageCount() == null || request.sourceMessageCount() < 1) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sourceMessageCount must be positive.");
		}
		if (request.sourceLastMessageId() == null || request.sourceLastMessageId() < 1) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sourceLastMessageId must be positive.");
		}

		VirtualChatSummaryContent summary = request.summary();
		validateText(summary.summary(), MAX_SUMMARY_LENGTH, "summary");
		validateTextList(summary.preferences(), "preferences");
		validateTextList(summary.dislikedItems(), "dislikedItems");
		validateTextList(summary.constraints(), "constraints");
		validateTextList(summary.unresolvedRequests(), "unresolvedRequests");
		if (summary.mentionedGoodsIds() != null) {
			if (summary.mentionedGoodsIds().size() > MAX_MENTIONED_GOODS_SIZE
				|| summary.mentionedGoodsIds().stream().anyMatch(goodsId -> goodsId == null || goodsId < 1)) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "mentionedGoodsIds is invalid.");
			}
		}
	}

	private void validateTextList(List<String> values, String fieldName) {
		if (values == null) {
			return;
		}
		if (values.size() > MAX_SUMMARY_LIST_SIZE) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " has too many items.");
		}
		for (String value : values) {
			validateText(value, MAX_SUMMARY_ITEM_LENGTH, fieldName);
		}
	}

	private void validateText(String value, int maxLength, String fieldName) {
		if (value == null || value.isBlank() || value.length() > maxLength) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is invalid.");
		}
	}

	private String trimToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}
