package com.projectcyan.cms;

public record CmsArtistProfileRequest(
	Long artistId,
	String name,
	String groupName,
	String imageUrl,
	String lore,
	String debutDate,
	String collections,
	Integer sortOrder,
	Boolean visible
) {
}
