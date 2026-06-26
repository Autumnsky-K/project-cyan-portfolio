package com.projectcyan.member;

public record FavoriteArtistResponse(
	Long artistId,
	String name,
	String imageUrl
) {
}
