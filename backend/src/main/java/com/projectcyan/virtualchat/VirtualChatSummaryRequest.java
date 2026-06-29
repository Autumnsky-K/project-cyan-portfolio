package com.projectcyan.virtualchat;

public record VirtualChatSummaryRequest(
	VirtualChatSummaryContent summary,
	Integer sourceMessageCount,
	Long sourceLastMessageId
) {
}
