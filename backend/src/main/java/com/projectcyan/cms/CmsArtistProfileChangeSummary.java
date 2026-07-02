package com.projectcyan.cms;

public record CmsArtistProfileChangeSummary(
	int added,
	int modified,
	int deleted
) {
	public int total() {
		return added + modified + deleted;
	}
}
