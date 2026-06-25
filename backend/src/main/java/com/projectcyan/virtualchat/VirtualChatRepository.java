package com.projectcyan.virtualchat;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class VirtualChatRepository {

	private static final TypeReference<List<Map<String, Object>>> ACTIONS_TYPE = new TypeReference<>() {
	};
	private static final TypeReference<Map<String, Object>> METADATA_TYPE = new TypeReference<>() {
	};

	private final JdbcTemplate jdbcTemplate;
	private final ObjectMapper objectMapper;

	public VirtualChatRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
		this.jdbcTemplate = jdbcTemplate;
		this.objectMapper = objectMapper;
	}

	public VirtualChatSessionResponse createSession(
		Long memberId,
		Long guideId,
		String title,
		String sourceScreen
	) {
		return jdbcTemplate.queryForObject("""
			insert into virtual_chat_session (member_id, guide_id, title, source_screen)
			values (?, ?, ?, ?)
			returning session_id, guide_id, title, source_screen, started_at, ended_at
			""",
			(resultSet, rowNumber) -> mapSession(resultSet),
			memberId,
			guideId,
			title,
			sourceScreen
		);
	}

	public long countSessions(Long memberId) {
		Long count = jdbcTemplate.queryForObject(
			"select count(*) from virtual_chat_session where member_id = ?",
			Long.class,
			memberId
		);
		return count == null ? 0L : count;
	}

	public List<VirtualChatSessionResponse> findSessions(Long memberId, int page, int size) {
		return jdbcTemplate.query("""
			select session_id, guide_id, title, source_screen, started_at, ended_at
			from virtual_chat_session
			where member_id = ?
			order by started_at desc, session_id desc
			limit ? offset ?
			""",
			(resultSet, rowNumber) -> mapSession(resultSet),
			memberId,
			size,
			(long) page * size
		);
	}

	public Optional<Long> findSessionMemberId(Long sessionId) {
		List<Long> memberIds = jdbcTemplate.query(
			"select member_id from virtual_chat_session where session_id = ?",
			(resultSet, rowNumber) -> resultSet.getLong("member_id"),
			sessionId
		);
		return memberIds.stream().findFirst();
	}

	public List<VirtualChatMessageResponse> findMessages(Long sessionId) {
		return jdbcTemplate.query("""
			select message_id, session_id, speaker, message_text, action, actions_json, metadata_json, created_at
			from virtual_chat_message
			where session_id = ?
			order by created_at asc, message_id asc
			""",
			(resultSet, rowNumber) -> mapMessage(resultSet),
			sessionId
		);
	}

	public VirtualChatMessageResponse createMessage(Long sessionId, VirtualChatMessageRequest request) {
		return jdbcTemplate.queryForObject("""
			insert into virtual_chat_message (session_id, speaker, message_text, action, actions_json, metadata_json)
			values (?, ?, ?, ?, cast(? as jsonb), cast(? as jsonb))
			returning message_id, session_id, speaker, message_text, action, actions_json, metadata_json, created_at
			""",
			(resultSet, rowNumber) -> mapMessage(resultSet),
			sessionId,
			request.speaker().name(),
			request.messageText().trim(),
			blankToNull(request.action()),
			toJson(request.actions()),
			toJson(request.metadata())
		);
	}

	public void createRecommendations(
		Long memberId,
		Long sessionId,
		Long messageId,
		List<VirtualRecommendationRequest> recommendations
	) {
		for (VirtualRecommendationRequest recommendation : recommendations) {
			jdbcTemplate.update("""
				insert into virtual_recommendation (
					member_id, session_id, message_id, goods_id, request_text, recommendation_reason, rank_order
				)
				values (?, ?, ?, ?, ?, ?, ?)
				""",
				memberId,
				sessionId,
				messageId,
				recommendation.goodsId(),
				blankToNull(recommendation.requestText()),
				blankToNull(recommendation.recommendationReason()),
				recommendation.rankOrder() == null ? 0 : recommendation.rankOrder()
			);
		}
	}

	public void endSession(Long sessionId) {
		jdbcTemplate.update(
			"update virtual_chat_session set ended_at = coalesce(ended_at, now()) where session_id = ?",
			sessionId
		);
	}

	private VirtualChatSessionResponse mapSession(ResultSet resultSet) throws SQLException {
		return new VirtualChatSessionResponse(
			resultSet.getLong("session_id"),
			resultSet.getLong("guide_id"),
			resultSet.getString("title"),
			resultSet.getString("source_screen"),
			toInstant(resultSet.getTimestamp("started_at")),
			toInstant(resultSet.getTimestamp("ended_at"))
		);
	}

	private VirtualChatMessageResponse mapMessage(ResultSet resultSet) throws SQLException {
		return new VirtualChatMessageResponse(
			resultSet.getLong("message_id"),
			resultSet.getLong("session_id"),
			VirtualChatSpeaker.valueOf(resultSet.getString("speaker")),
			resultSet.getString("message_text"),
			resultSet.getString("action"),
			readJson(resultSet.getString("actions_json"), ACTIONS_TYPE, List.of()),
			readJson(resultSet.getString("metadata_json"), METADATA_TYPE, Map.of()),
			toInstant(resultSet.getTimestamp("created_at"))
		);
	}

	private <T> T readJson(String rawJson, TypeReference<T> type, T fallback) {
		if (rawJson == null || rawJson.isBlank()) {
			return fallback;
		}
		try {
			return objectMapper.readValue(rawJson, type);
		} catch (JacksonException exception) {
			return fallback;
		}
	}

	private String toJson(Object value) {
		if (value == null) {
			return null;
		}
		try {
			return objectMapper.writeValueAsString(value);
		} catch (JacksonException exception) {
			throw new IllegalArgumentException("Invalid virtual chat JSON payload.", exception);
		}
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}

	private java.time.Instant toInstant(Timestamp timestamp) {
		return timestamp == null ? null : timestamp.toInstant();
	}
}
