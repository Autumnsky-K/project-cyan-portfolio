package com.projectcyan.goods;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.ResultSet;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

class ArtistEmbeddingRepositoryTest {

	private final JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
	private final ArtistEmbeddingRepository repository = new ArtistEmbeddingRepository(jdbcTemplate);

	@Test
	void upsertBindsVectorLiteralAndMetadata() {
		repository.upsert(7L, new float[] {0.5f, 0.25f}, "text-embedding-3-small", "hash-xyz");

		ArgumentCaptor<Object[]> argsCaptor = ArgumentCaptor.forClass(Object[].class);
		verify(jdbcTemplate).update(anyString(), argsCaptor.capture());

		assertThat(argsCaptor.getValue()).containsExactly(7L, "[0.5,0.25]", "text-embedding-3-small", "hash-xyz");
	}

	@Test
	@SuppressWarnings("unchecked")
	void findBestSimilarityToPreferredArtistsBindsCandidateAndPreferredIds() throws Exception {
		ResultSet resultSet = mock(ResultSet.class);
		when(resultSet.getLong("candidate_artist_id")).thenReturn(2L);
		when(resultSet.getDouble("best_cosine_distance")).thenReturn(0.15);

		when(jdbcTemplate.query(anyString(), any(RowMapper.class), any(Object[].class)))
			.thenAnswer(invocation -> {
				RowMapper<ArtistSimilarityRow> rowMapper = invocation.getArgument(1);
				return List.of(rowMapper.mapRow(resultSet, 0));
			});

		List<ArtistSimilarityRow> result = repository.findBestSimilarityToPreferredArtists(
			List.of(2L, 3L),
			List.of(1L)
		);

		assertThat(result).containsExactly(new ArtistSimilarityRow(2L, 0.15));

		ArgumentCaptor<String> sqlCaptor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<Object[]> argsCaptor = ArgumentCaptor.forClass(Object[].class);
		verify(jdbcTemplate).query(sqlCaptor.capture(), any(RowMapper.class), argsCaptor.capture());

		assertThat(sqlCaptor.getValue())
			.contains("candidate.artist_id in (?,?)")
			.contains("preferred.artist_id in (?)");
		assertThat(argsCaptor.getValue()).containsExactly(2L, 3L, 1L);
	}

	@Test
	void findBestSimilarityToPreferredArtistsReturnsEmptyWhenEitherSideIsEmpty() {
		assertThat(repository.findBestSimilarityToPreferredArtists(List.of(), List.of(1L))).isEmpty();
		assertThat(repository.findBestSimilarityToPreferredArtists(List.of(1L), List.of())).isEmpty();
		verify(jdbcTemplate, never()).query(anyString(), any(RowMapper.class), any(Object[].class));
	}
}
