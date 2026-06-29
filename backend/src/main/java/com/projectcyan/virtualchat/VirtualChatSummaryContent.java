package com.projectcyan.virtualchat;

import java.util.List;

public record VirtualChatSummaryContent(
	String summary,
	List<String> preferences,
	List<String> dislikedItems,
	List<String> constraints,
	List<Long> mentionedGoodsIds,
	List<String> unresolvedRequests
) {
}
