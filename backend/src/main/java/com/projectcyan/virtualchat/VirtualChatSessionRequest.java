package com.projectcyan.virtualchat;

public record VirtualChatSessionRequest(
	Long guideId,
	String title,
	String sourceScreen
) {
}
