package com.projectcyan.goods;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ArtistRepository extends JpaRepository<Artist, Long> {

	List<Artist> findAllByOrderByArtistNameAsc();
}
