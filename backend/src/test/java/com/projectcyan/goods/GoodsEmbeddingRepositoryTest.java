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

class GoodsEmbeddingRepositoryTest {

	private final JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
	private final GoodsEmbeddingRepository repository = new GoodsEmbeddingRepository(jdbcTemplate);

	@Test
	void upsertBindsVectorLiteralAndMetadata() {
		repository.upsert(42L, new float[] {0.1f, 0.2f, 0.3f}, "text-embedding-3-small", "hash-abc");

		ArgumentCaptor<Object[]> argsCaptor = ArgumentCaptor.forClass(Object[].class);
		verify(jdbcTemplate).update(anyString(), argsCaptor.capture());

		Object[] args = argsCaptor.getValue();
		assertThat(args).containsExactly(42L, "[0.1,0.2,0.3]", "text-embedding-3-small", "hash-abc");
	}

	@Test
	@SuppressWarnings("unchecked")
	void findNearestByCandidateIdsBindsVectorTwiceAndCandidateIdsAndLimit() throws Exception {
		ResultSet resultSet = mock(ResultSet.class);
		when(resultSet.getLong("goods_id")).thenReturn(10L);
		when(resultSet.getDouble("cosine_distance")).thenReturn(0.05);

		when(jdbcTemplate.query(anyString(), any(RowMapper.class), any(Object[].class)))
			.thenAnswer(invocation -> {
				RowMapper<GoodsEmbeddingSimilarityRow> rowMapper = invocation.getArgument(1);
				return List.of(rowMapper.mapRow(resultSet, 0));
			});

		List<GoodsEmbeddingSimilarityRow> result = repository.findNearestByCandidateIds(
			List.of(10L, 20L, 30L),
			new float[] {0.5f, 0.5f},
			5
		);

		assertThat(result).containsExactly(new GoodsEmbeddingSimilarityRow(10L, 0.05));

		ArgumentCaptor<String> sqlCaptor = ArgumentCaptor.forClass(String.class);
		ArgumentCaptor<Object[]> argsCaptor = ArgumentCaptor.forClass(Object[].class);
		verify(jdbcTemplate).query(sqlCaptor.capture(), any(RowMapper.class), argsCaptor.capture());

		assertThat(sqlCaptor.getValue()).contains("where goods_id in (?,?,?)");
		Object[] args = argsCaptor.getValue();
		assertThat(args).containsExactly("[0.5,0.5]", 10L, 20L, 30L, "[0.5,0.5]", 5);
	}

	@Test
	void findNearestByCandidateIdsReturnsEmptyForNoCandidates() {
		List<GoodsEmbeddingSimilarityRow> result = repository.findNearestByCandidateIds(
			List.of(),
			new float[] {0.1f},
			5
		);

		assertThat(result).isEmpty();
		verify(jdbcTemplate, never()).query(anyString(), any(RowMapper.class), any(Object[].class));
	}
}
