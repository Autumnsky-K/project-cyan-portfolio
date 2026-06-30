package com.projectcyan.member;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FavoriteArtistService {

	private final FavoriteArtistRepository favoriteArtistRepository;

	public FavoriteArtistService(FavoriteArtistRepository favoriteArtistRepository) {
		this.favoriteArtistRepository = favoriteArtistRepository;
	}

	@Transactional(readOnly = true)
	public List<FavoriteArtistResponse> findFavoriteArtists(Long memberId) {
		return favoriteArtistRepository.findByMemberId(memberId);
	}
}
