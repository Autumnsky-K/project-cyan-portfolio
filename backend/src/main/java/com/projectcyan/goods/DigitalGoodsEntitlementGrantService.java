package com.projectcyan.goods;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DigitalGoodsEntitlementGrantService {

	private final JdbcTemplate jdbcTemplate;

	public DigitalGoodsEntitlementGrantService(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@Transactional
	public int grantForOrder(Long orderId) {
		if (orderId == null) {
			return 0;
		}
		return jdbcTemplate.update("""
			insert into digital_goods_entitlement (
				member_id,
				goods_id,
				order_id,
				order_item_id,
				grant_source,
				entitlement_status,
				granted_at
			)
			select
				o.member_id,
				oi.goods_id,
				o.order_id,
				min(oi.order_item_id) as order_item_id,
				'ORDER',
				'ACTIVE',
				now()
			from orders o
			join order_item oi on oi.order_id = o.order_id
			join goods g on g.goods_id = oi.goods_id
			join goods_category gc on gc.category_id = g.category_id
			where o.order_id = ?
				and gc.fulfillment_type = 'DIGITAL'
			group by o.member_id, oi.goods_id, o.order_id
			on conflict do nothing
			""", orderId);
	}

	@Transactional
	public int grantFreeGoods(Long memberId, Long goodsId) {
		if (memberId == null || goodsId == null) {
			return 0;
		}
		return jdbcTemplate.update("""
			insert into digital_goods_entitlement (
				member_id,
				goods_id,
				grant_source,
				entitlement_status,
				granted_at
			)
			select
				?,
				g.goods_id,
				'PURCHASE_ZERO',
				'ACTIVE',
				now()
			from goods g
			join goods_category gc on gc.category_id = g.category_id
			where g.goods_id = ?
				and gc.fulfillment_type = 'DIGITAL'
			on conflict do nothing
			""", memberId, goodsId);
	}

	@Transactional(readOnly = true)
	public boolean hasActiveEntitlement(Long memberId, Long goodsId) {
		if (memberId == null || goodsId == null) {
			return false;
		}
		Integer count = jdbcTemplate.queryForObject("""
			select count(*)
			from digital_goods_entitlement
			where member_id = ?
				and goods_id = ?
				and entitlement_status = 'ACTIVE'
			""", Integer.class, memberId, goodsId);
		return count != null && count > 0;
	}
}
