package com.projectcyan.virtualchat;

import java.util.List;
import java.util.Map;

public record VirtualChatMessageRequest(
	VirtualChatSpeaker speaker,
	String messageText,
	String action,
	List<Map<String, Object>> actions,
	Map<String, Object> metadata,
	List<VirtualRecommendationRequest> recommendations
) {
}
