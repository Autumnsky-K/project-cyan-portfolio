package com.projectcyan.goods;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DigitalGoodsAssetStatusService {

	private final JdbcTemplate jdbcTemplate;

	public DigitalGoodsAssetStatusService(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@Transactional(readOnly = true)
	public Map<Long, Integer> activeAssetCounts(Collection<Long> goodsIds) {
		List<Long> normalizedGoodsIds = goodsIds == null
			? List.of()
			: goodsIds.stream()
				.filter(Objects::nonNull)
				.distinct()
				.toList();
		if (normalizedGoodsIds.isEmpty()) {
			return Map.of();
		}

		String placeholders = String.join(",", Collections.nCopies(normalizedGoodsIds.size(), "?"));
		List<Object> params = new ArrayList<>(normalizedGoodsIds);
		return jdbcTemplate.query("""
			select goods_id, count(*) as active_asset_count
			from digital_goods_asset
			where is_active = true
				and goods_id in (
			""" + placeholders + """
				)
			group by goods_id
			""",
			resultSet -> {
				Map<Long, Integer> counts = new LinkedHashMap<>();
				while (resultSet.next()) {
					counts.put(resultSet.getLong("goods_id"), resultSet.getInt("active_asset_count"));
				}
				return counts;
			},
			params.toArray()
		);
	}

	@Transactional(readOnly = true)
	public int activeAssetCount(Long goodsId) {
		if (goodsId == null) {
			return 0;
		}
		return activeAssetCounts(List.of(goodsId)).getOrDefault(goodsId, 0);
	}
}
