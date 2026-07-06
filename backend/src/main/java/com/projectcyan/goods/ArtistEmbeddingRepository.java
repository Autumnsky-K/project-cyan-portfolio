package com.projectcyan.goods;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ArtistEmbeddingRepository {

	private final JdbcTemplate jdbcTemplate;

	public ArtistEmbeddingRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public void upsert(long artistId, float[] embedding, String embeddingModel, String sourceTextHash) {
		jdbcTemplate.update(
			"""
			insert into artist_embedding (artist_id, embedding, embedding_model, source_text_hash, updated_at)
			values (?, ?::vector, ?, ?, now())
			on conflict (artist_id) do update set
				embedding = excluded.embedding,
				embedding_model = excluded.embedding_model,
				source_text_hash = excluded.source_text_hash,
				updated_at = now()
			""",
			artistId,
			toVectorLiteral(embedding),
			embeddingModel,
			sourceTextHash
		);
	}

	/**
	 * For each candidate artist that has an embedding, returns its closest cosine distance
	 * to any of the given preferred artists (also requires the preferred artist to have an embedding).
	 * Candidate artists with no matching row are simply absent from the result, letting callers
	 * fall back to a default (no-boost) distance.
	 */
	public List<ArtistSimilarityRow> findBestSimilarityToPreferredArtists(
		Collection<Long> candidateArtistIds,
		Collection<Long> preferredArtistIds
	) {
		if (candidateArtistIds == null || candidateArtistIds.isEmpty()
			|| preferredArtistIds == null || preferredArtistIds.isEmpty()) {
			return List.of();
		}

		String candidatePlaceholders = String.join(",", candidateArtistIds.stream().map(id -> "?").toList());
		String preferredPlaceholders = String.join(",", preferredArtistIds.stream().map(id -> "?").toList());

		List<Object> args = new ArrayList<>();
		args.addAll(candidateArtistIds);
		args.addAll(preferredArtistIds);

		return jdbcTemplate.query(
			"""
			select candidate.artist_id as candidate_artist_id,
			       min(candidate.embedding <=> preferred.embedding) as best_cosine_distance
			from artist_embedding candidate
			cross join artist_embedding preferred
			where candidate.artist_id in (%s)
			  and preferred.artist_id in (%s)
			group by candidate.artist_id
			""".formatted(candidatePlaceholders, preferredPlaceholders),
			(resultSet, rowNumber) -> new ArtistSimilarityRow(
				resultSet.getLong("candidate_artist_id"),
				resultSet.getDouble("best_cosine_distance")
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
