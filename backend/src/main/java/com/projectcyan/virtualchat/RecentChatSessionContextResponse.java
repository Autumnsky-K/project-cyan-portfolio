package com.projectcyan.virtualchat;

import java.time.Instant;

public record RecentChatSessionContextResponse(
	Long sessionId,
	Instant startedAt,
	Instant endedAt,
	VirtualChatSummaryContent summary,
	boolean needsSummary
) {
}
