package com.projectcyan.goods;

import java.sql.Timestamp;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Repository;

@Repository
public class GoodsReviewRepository {

	private final JdbcTemplate jdbcTemplate;

	public GoodsReviewRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public Map<Long, GoodsReviewSummary> findSummaries(Collection<Long> goodsIds) {
		if (goodsIds == null || goodsIds.isEmpty() || !hasReviewTable()) {
			return Map.of();
		}

		String placeholders = String.join(",", goodsIds.stream().map(id -> "?").toList());
		Map<Long, GoodsReviewSummary> summaries = new LinkedHashMap<>();
		jdbcTemplate.query(
			"""
			select goods_id,
			       coalesce(round(avg(rating)::numeric, 1), 0) as average_rating,
			       count(*) as review_count,
			       count(*) filter (where rating = 5) as rating_five_count,
			       count(*) filter (where rating = 4) as rating_four_count,
			       count(*) filter (where rating = 3) as rating_three_count,
			       count(*) filter (where rating = 2) as rating_two_count,
			       count(*) filter (where rating = 1) as rating_one_count
			from goods_review
			where goods_id in (%s)
			group by goods_id
			""".formatted(placeholders),
			(RowCallbackHandler) resultSet -> summaries.put(
				resultSet.getLong("goods_id"),
				new GoodsReviewSummary(
					resultSet.getDouble("average_rating"),
					resultSet.getLong("review_count"),
					resultSet.getLong("rating_five_count"),
					resultSet.getLong("rating_four_count"),
					resultSet.getLong("rating_three_count"),
					resultSet.getLong("rating_two_count"),
					resultSet.getLong("rating_one_count")
				)
			),
			goodsIds.toArray()
		);
		return summaries;
	}

	public GoodsReviewSummary findSummary(Long goodsId) {
		return findSummaries(List.of(goodsId)).getOrDefault(goodsId, GoodsReviewSummary.empty());
	}

	public PageResponse<GoodsReviewResponse> findReviews(Long goodsId, int page, int size, String sort) {
		if (!hasReviewTable()) {
			return new PageResponse<>(List.of(), page, size, 0, 0);
		}

		int offset = page * size;
		String orderBy = "rating".equalsIgnoreCase(sort)
			? "rating desc, created_at desc, review_id desc"
			: "created_at desc, review_id desc";
		List<GoodsReviewResponse> reviews = jdbcTemplate.query(
			"""
			select review_id, member_id, rating, author_name, option_label, content, created_at, updated_at
			from goods_review
			where goods_id = ?
			order by %s
			limit ? offset ?
			""".formatted(orderBy),
			(resultSet, rowNumber) -> mapReview(resultSet, null),
			goodsId,
			size,
			offset
		);
		long totalElements = jdbcTemplate.queryForObject(
			"select count(*) from goods_review where goods_id = ?",
			Long.class,
			goodsId
		);
		int totalPages = totalElements == 0 ? 0 : (int) Math.ceil((double) totalElements / size);
		return new PageResponse<>(reviews, page, size, totalElements, totalPages);
	}

	public Optional<GoodsReviewResponse> findMemberReview(Long goodsId, Long memberId) {
		if (!hasReviewTable()) {
			return Optional.empty();
		}

		List<GoodsReviewResponse> reviews = jdbcTemplate.query(
			"""
			select review_id, member_id, rating, author_name, option_label, content, created_at, updated_at
			from goods_review
			where goods_id = ? and member_id = ?
			limit 1
			""",
			(resultSet, rowNumber) -> mapReview(resultSet, memberId),
			goodsId,
			memberId
		);
		return reviews.stream().findFirst();
	}

	public GoodsReviewResponse createReview(
		Long goodsId,
		Long memberId,
		String authorName,
		Integer rating,
		String optionLabel,
		String content
	) {
		return jdbcTemplate.queryForObject(
			"""
			insert into goods_review (goods_id, member_id, rating, author_name, option_label, content)
			values (?, ?, ?, ?, ?, ?)
			returning review_id, member_id, rating, author_name, option_label, content, created_at, updated_at
			""",
			(resultSet, rowNumber) -> mapReview(resultSet, memberId),
			goodsId,
			memberId,
			rating,
			authorName,
			optionLabel,
			content
		);
	}

	public Optional<GoodsReviewResponse> updateReview(
		Long goodsId,
		Long reviewId,
		Long memberId,
		Integer rating,
		String optionLabel,
		String content
	) {
		List<GoodsReviewResponse> reviews = jdbcTemplate.query(
			"""
			update goods_review
			set rating = ?, option_label = ?, content = ?, updated_at = now()
			where goods_id = ? and review_id = ? and member_id = ?
			returning review_id, member_id, rating, author_name, option_label, content, created_at, updated_at
			""",
			(resultSet, rowNumber) -> mapReview(resultSet, memberId),
			rating,
			optionLabel,
			content,
			goodsId,
			reviewId,
			memberId
		);
		return reviews.stream().findFirst();
	}

	public boolean deleteReview(Long goodsId, Long reviewId, Long memberId) {
		return jdbcTemplate.update(
			"delete from goods_review where goods_id = ? and review_id = ? and member_id = ?",
			goodsId,
			reviewId,
			memberId
		) > 0;
	}

	private boolean hasReviewTable() {
		return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
			"select to_regclass('public.goods_review') is not null",
			Boolean.class
		));
	}

	private GoodsReviewResponse mapReview(java.sql.ResultSet resultSet, Long currentMemberId) throws java.sql.SQLException {
		Timestamp createdAt = resultSet.getTimestamp("created_at");
		Timestamp updatedAt = resultSet.getTimestamp("updated_at");
		Long memberId = resultSet.getObject("member_id", Long.class);
		return new GoodsReviewResponse(
			resultSet.getLong("review_id"),
			memberId,
			resultSet.getInt("rating"),
			resultSet.getString("author_name"),
			resultSet.getString("option_label"),
			resultSet.getString("content"),
			createdAt == null ? null : createdAt.toInstant(),
			updatedAt == null ? null : updatedAt.toInstant(),
			currentMemberId != null && currentMemberId.equals(memberId)
		);
	}
}
