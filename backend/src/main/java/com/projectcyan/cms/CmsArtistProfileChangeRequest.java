package com.projectcyan.cms;

public record CmsArtistProfileChangeRequest(
	String state,
	Long originalArtistId,
	Long artistId,
	String name,
	String groupName,
	String groupKey,
	Integer groupSortOrder,
	Boolean groupVisible,
	String groupHeroImageUrl,
	String groupSummary,
	String imageUrl,
	String lore,
	String debutDate,
	String collections,
	Integer sortOrder,
	Boolean visible
) {
}
