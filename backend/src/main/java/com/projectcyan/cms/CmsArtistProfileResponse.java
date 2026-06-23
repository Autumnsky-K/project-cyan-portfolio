package com.projectcyan.cms;

public record CmsArtistProfileResponse(
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
