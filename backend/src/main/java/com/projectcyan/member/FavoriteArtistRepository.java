package com.projectcyan.member;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class FavoriteArtistRepository {

	private final JdbcTemplate jdbcTemplate;

	public FavoriteArtistRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public List<FavoriteArtistResponse> findByMemberId(Long memberId) {
		return jdbcTemplate.query(
			"""
			select a.artist_id, a.artist_name
			from member_artist ma
			join artist a on a.artist_id = ma.artist_id
			where ma.member_id = ?
			order by ma.created_at desc, a.artist_id asc
			""",
			(resultSet, rowNumber) -> new FavoriteArtistResponse(
				resultSet.getLong("artist_id"),
				resultSet.getString("artist_name"),
				null
			),
			memberId
		);
	}
}
