package com.projectcyan.member;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;

class FavoriteArtistServiceTest {

	private final FavoriteArtistRepository favoriteArtistRepository = mock(FavoriteArtistRepository.class);
	private final FavoriteArtistService favoriteArtistService = new FavoriteArtistService(favoriteArtistRepository);

	@Test
	void findsFavoriteArtistsForAuthenticatedMemberOnly() {
		List<FavoriteArtistResponse> artists = List.of(
			new FavoriteArtistResponse(7L, "aespa", null)
		);
		when(favoriteArtistRepository.findByMemberId(11L)).thenReturn(artists);

		List<FavoriteArtistResponse> response = favoriteArtistService.findFavoriteArtists(11L);

		assertThat(response).isEqualTo(artists);
		verify(favoriteArtistRepository).findByMemberId(11L);
	}
}
