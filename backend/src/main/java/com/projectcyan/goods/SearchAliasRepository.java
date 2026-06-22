package com.projectcyan.goods;

import java.util.Collection;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class SearchAliasRepository {

	private final JdbcTemplate jdbcTemplate;

	public SearchAliasRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public List<SearchAliasMatch> findMatches(Collection<String> normalizedAliases) {
		if (normalizedAliases == null || normalizedAliases.isEmpty()) {
			return List.of();
		}

		String placeholders = String.join(",", normalizedAliases.stream().map(alias -> "?").toList());
		return jdbcTemplate.query(
			"""
			select sa.normalized_alias,
			       sa.artist_id,
			       sa.category_id,
			       sa.tag_id,
			       tag.tag_name
			from search_alias sa
			left join tag on tag.tag_id = sa.tag_id
			where sa.normalized_alias in (%s)
			""".formatted(placeholders),
			(resultSet, rowNumber) -> new SearchAliasMatch(
				resultSet.getString("normalized_alias"),
				resultSet.getObject("artist_id", Long.class),
				resultSet.getObject("category_id", Long.class),
				resultSet.getObject("tag_id", Long.class),
				resultSet.getString("tag_name")
			),
			normalizedAliases.toArray()
		);
	}
}
