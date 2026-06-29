package com.projectcyan.ai;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AiPersonalizationRepository {

	private final JdbcTemplate jdbcTemplate;

	public AiPersonalizationRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public List<AiPurchasedGoodsResponse> findRecentPurchasedGoods(Long memberId, int limit) {
		return jdbcTemplate.query("""
			select oi.goods_id, oi.goods_name, oi.artist_name, oi.unit_price, oi.quantity,
			       o.order_status, o.ordered_at
			from order_item oi
			join orders o on o.order_id = oi.order_id
			where o.member_id = ?
			  and o.order_status in ('PAID', 'PREPARING', 'SHIPPED', 'DONE')
			order by o.ordered_at desc, oi.order_item_id desc
			limit ?
			""",
			(resultSet, rowNumber) -> {
				Timestamp purchasedAt = resultSet.getTimestamp("ordered_at");
				return new AiPurchasedGoodsResponse(
					resultSet.getLong("goods_id"),
					resultSet.getString("goods_name"),
					resultSet.getString("artist_name"),
					resultSet.getBigDecimal("unit_price").intValue(),
					resultSet.getInt("quantity"),
					resultSet.getString("order_status"),
					purchasedAt == null ? null : purchasedAt.toInstant()
				);
			},
			memberId,
			limit
		);
	}
}
