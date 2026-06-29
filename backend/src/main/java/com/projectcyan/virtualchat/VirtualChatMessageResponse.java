package com.projectcyan.virtualchat;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record VirtualChatMessageResponse(
	Long messageId,
	Long sessionId,
	VirtualChatSpeaker speaker,
	String messageText,
	String action,
	List<Map<String, Object>> actions,
	Map<String, Object> metadata,
	Instant createdAt
) {
}
