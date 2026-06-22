package com.projectcyan.goods;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class GoodsDetailDataRepository {

	private final JdbcTemplate jdbcTemplate;

	public GoodsDetailDataRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public GoodsDetailMetadata findMetadata(Long goodsId) {
		GoodsDetailMetadata base = jdbcTemplate.queryForObject(
			"""
			select sale_type, sale_start_at, sale_end_at, shipping_fee, shipping_carrier,
			       shipping_scope, shipping_note, notice_intro, notice_cancel, notice_delivery
			from goods
			where goods_id = ?
			""",
			(resultSet, rowNumber) -> new GoodsDetailMetadata(
				resultSet.getString("sale_type"),
				toInstant(resultSet, "sale_start_at"),
				toInstant(resultSet, "sale_end_at"),
				new GoodsShippingResponse(
					resultSet.getInt("shipping_fee"),
					resultSet.getString("shipping_carrier"),
					resultSet.getString("shipping_scope"),
					resultSet.getString("shipping_note")
				),
				new GoodsNoticesResponse(
					resultSet.getString("notice_intro"),
					resultSet.getString("notice_cancel"),
					resultSet.getString("notice_delivery")
				),
				List.of(),
				List.of()
			),
			goodsId
		);
		if (base == null) {
			throw new IllegalStateException("Goods detail metadata is missing: " + goodsId);
		}
		return new GoodsDetailMetadata(
			base.saleType(),
			base.saleStartAt(),
			base.saleEndAt(),
			base.shipping(),
			base.notices(),
			findOptionGroups(goodsId),
			findVariants(goodsId)
		);
	}

	private List<GoodsOptionGroupResponse> findOptionGroups(Long goodsId) {
		Map<Long, MutableOptionGroup> groups = new LinkedHashMap<>();
		jdbcTemplate.query(
			"""
			select g.option_group_id, g.option_key, g.option_name,
			       v.option_value_id, v.value_name
			from goods_option_group g
			left join goods_option_value v on v.option_group_id = g.option_group_id
			where g.goods_id = ?
			order by g.display_order, v.display_order
			""",
			resultSet -> {
				long groupId = resultSet.getLong("option_group_id");
				MutableOptionGroup group = groups.get(groupId);
				if (group == null) {
					group = new MutableOptionGroup(
						groupId,
						resultSet.getString("option_key"),
						resultSet.getString("option_name")
					);
					groups.put(groupId, group);
				}
				long valueId = resultSet.getLong("option_value_id");
				if (!resultSet.wasNull()) {
					group.values.add(new GoodsOptionValueResponse(valueId, resultSet.getString("value_name")));
				}
			},
			goodsId
		);
		return groups.values().stream()
			.map(group -> new GoodsOptionGroupResponse(group.id, group.key, group.name, List.copyOf(group.values)))
			.toList();
	}

	private List<GoodsVariantResponse> findVariants(Long goodsId) {
		Map<Long, MutableVariant> variants = new LinkedHashMap<>();
		jdbcTemplate.query(
			"""
			select vr.variant_id, vr.sku, vr.additional_price, vr.stock_count, vr.active,
			       g.option_key, v.value_name
			from goods_variant vr
			left join goods_variant_value vv on vv.variant_id = vr.variant_id
			left join goods_option_value v on v.option_value_id = vv.option_value_id
			left join goods_option_group g on g.option_group_id = v.option_group_id
			where vr.goods_id = ?
			order by vr.variant_id, g.display_order
			""",
			resultSet -> {
				long variantId = resultSet.getLong("variant_id");
				MutableVariant variant = variants.get(variantId);
				if (variant == null) {
					variant = new MutableVariant(
						variantId,
						resultSet.getString("sku"),
						resultSet.getInt("additional_price"),
						resultSet.getInt("stock_count"),
						resultSet.getBoolean("active")
					);
					variants.put(variantId, variant);
				}
				String optionKey = resultSet.getString("option_key");
				if (optionKey != null) {
					variant.selections.put(optionKey, resultSet.getString("value_name"));
				}
			},
			goodsId
		);
		return variants.values().stream()
			.map(variant -> new GoodsVariantResponse(
				variant.id,
				variant.sku,
				variant.additionalPrice,
				variant.stockCount,
				variant.active,
				Map.copyOf(variant.selections)
			))
			.toList();
	}

	private Instant toInstant(ResultSet resultSet, String column) throws SQLException {
		var timestamp = resultSet.getTimestamp(column);
		return timestamp == null ? null : timestamp.toInstant();
	}

	private static final class MutableOptionGroup {
		private final long id;
		private final String key;
		private final String name;
		private final List<GoodsOptionValueResponse> values = new ArrayList<>();

		private MutableOptionGroup(long id, String key, String name) {
			this.id = id;
			this.key = key;
			this.name = name;
		}
	}

	private static final class MutableVariant {
		private final long id;
		private final String sku;
		private final int additionalPrice;
		private final int stockCount;
		private final boolean active;
		private final Map<String, String> selections = new LinkedHashMap<>();

		private MutableVariant(
			long id,
			String sku,
			int additionalPrice,
			int stockCount,
			boolean active
		) {
			this.id = id;
			this.sku = sku;
			this.additionalPrice = additionalPrice;
			this.stockCount = stockCount;
			this.active = active;
		}
	}
}
