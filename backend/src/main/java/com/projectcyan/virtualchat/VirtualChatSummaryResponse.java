package com.projectcyan.virtualchat;

import java.time.Instant;

public record VirtualChatSummaryResponse(
	Long sessionId,
	VirtualChatSummaryContent summary,
	Integer summaryVersion,
	Integer sourceMessageCount,
	Long sourceLastMessageId,
	Instant createdAt,
	Instant updatedAt
) {
}
