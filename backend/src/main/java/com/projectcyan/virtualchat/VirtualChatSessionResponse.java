package com.projectcyan.virtualchat;

import java.time.Instant;

public record VirtualChatSessionResponse(
	Long sessionId,
	Long guideId,
	String title,
	String sourceScreen,
	Instant startedAt,
	Instant endedAt
) {
}
