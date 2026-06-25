package com.projectcyan.goods;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "goods_view_history")
public class GoodsViewHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "view_history_id")
	private Long viewHistoryId;

	@Column(name = "member_id", nullable = false)
	private Long memberId;

	@Column(name = "goods_id", nullable = false)
	private Long goodsId;

	@Column(name = "viewed_at", nullable = false)
	private Instant viewedAt;

	protected GoodsViewHistory() {
	}

	GoodsViewHistory(Long memberId, Long goodsId, Instant viewedAt) {
		this.memberId = memberId;
		this.goodsId = goodsId;
		this.viewedAt = viewedAt;
	}

	public Long getViewHistoryId() {
		return viewHistoryId;
	}

	public Long getMemberId() {
		return memberId;
	}

	public Long getGoodsId() {
		return goodsId;
	}

	public Instant getViewedAt() {
		return viewedAt;
	}
}
