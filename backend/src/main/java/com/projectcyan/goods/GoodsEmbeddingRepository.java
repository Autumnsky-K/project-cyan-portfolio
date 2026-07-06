package com.projectcyan.goods;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class GoodsEmbeddingRepository {

	private final JdbcTemplate jdbcTemplate;

	public GoodsEmbeddingRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public void upsert(long goodsId, float[] embedding, String embeddingModel, String sourceTextHash) {
		jdbcTemplate.update(
			"""
			insert into goods_embedding (goods_id, embedding, embedding_model, source_text_hash, updated_at)
			values (?, ?::vector, ?, ?, now())
			on conflict (goods_id) do update set
				embedding = excluded.embedding,
				embedding_model = excluded.embedding_model,
				source_text_hash = excluded.source_text_hash,
				updated_at = now()
			""",
			goodsId,
			toVectorLiteral(embedding),
			embeddingModel,
			sourceTextHash
		);
	}

	public List<GoodsEmbeddingSimilarityRow> findNearestByCandidateIds(
		Collection<Long> candidateGoodsIds,
		float[] queryEmbedding,
		int limit
	) {
		if (candidateGoodsIds == null || candidateGoodsIds.isEmpty()) {
			return List.of();
		}

		String placeholders = String.join(",", candidateGoodsIds.stream().map(id -> "?").toList());
		String vectorLiteral = toVectorLiteral(queryEmbedding);

		List<Object> args = new ArrayList<>();
		args.add(vectorLiteral);
		args.addAll(candidateGoodsIds);
		args.add(vectorLiteral);
		args.add(Math.max(1, limit));

		return jdbcTemplate.query(
			"""
			select goods_id, embedding <=> ?::vector as cosine_distance
			from goods_embedding
			where goods_id in (%s)
			order by embedding <=> ?::vector
			limit ?
			""".formatted(placeholders),
			(resultSet, rowNumber) -> new GoodsEmbeddingSimilarityRow(
				resultSet.getLong("goods_id"),
				resultSet.getDouble("cosine_distance")
			),
			args.toArray()
		);
	}

	private String toVectorLiteral(float[] embedding) {
		StringBuilder builder = new StringBuilder("[");
		for (int index = 0; index < embedding.length; index++) {
			if (index > 0) {
				builder.append(',');
			}
			builder.append(embedding[index]);
		}
		return builder.append(']').toString();
	}
}
