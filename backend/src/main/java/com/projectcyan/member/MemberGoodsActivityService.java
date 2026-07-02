package com.projectcyan.member;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MemberGoodsActivityService {

	private static final int SECTION_LIMIT = 20;

	private final JdbcTemplate jdbcTemplate;

	public MemberGoodsActivityService(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@Transactional(readOnly = true)
	public MemberGoodsActivityResponse findGoodsActivity(Long memberId) {
		return new MemberGoodsActivityResponse(
			findLikedGoods(memberId),
			findRecentlyViewedGoods(memberId)
		);
	}

	private List<MemberGoodsActivityItemResponse> findLikedGoods(Long memberId) {
		return jdbcTemplate.query("""
			select
				g.goods_id,
				g.goods_name,
				g.price,
				g.main_image_url,
				g.description,
				liked.activity_at
			from (
				select goods_id, max(created_at) as activity_at
				from (
					select goods_id, created_at
					from goods_like
					where member_id = ?
					union all
					select goods_id, created_at
					from goods_favorite
					where member_id = ?
				) source
				group by goods_id
			) liked
			join goods g on g.goods_id = liked.goods_id
			order by liked.activity_at desc
			limit ?
			""", this::mapActivityItem, memberId, memberId, SECTION_LIMIT);
	}

	private List<MemberGoodsActivityItemResponse> findRecentlyViewedGoods(Long memberId) {
		return jdbcTemplate.query("""
			select
				g.goods_id,
				g.goods_name,
				g.price,
				g.main_image_url,
				g.description,
				viewed.activity_at
			from (
				select goods_id, max(viewed_at) as activity_at
				from goods_view_history
				where member_id = ?
				group by goods_id
			) viewed
			join goods g on g.goods_id = viewed.goods_id
			order by viewed.activity_at desc
			limit ?
			""", this::mapActivityItem, memberId, SECTION_LIMIT);
	}

	private MemberGoodsActivityItemResponse mapActivityItem(ResultSet resultSet, int rowNumber) throws SQLException {
		Timestamp activityTimestamp = resultSet.getTimestamp("activity_at");
		Number price = (Number) resultSet.getObject("price");

		return new MemberGoodsActivityItemResponse(
			resultSet.getLong("goods_id"),
			resultSet.getString("goods_name"),
			price == null ? null : price.intValue(),
			resultSet.getString("main_image_url"),
			resultSet.getString("description"),
			activityTimestamp == null ? Instant.EPOCH : activityTimestamp.toInstant()
		);
	}
}
