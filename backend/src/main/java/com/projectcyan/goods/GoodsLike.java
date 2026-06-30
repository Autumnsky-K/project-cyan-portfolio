package com.projectcyan.goods;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
	name = "goods_like",
	uniqueConstraints = @UniqueConstraint(
		name = "goods_like_member_goods_unique",
		columnNames = {"member_id", "goods_id"}
	)
)
public class GoodsLike {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "like_id")
	private Long likeId;

	@Column(name = "member_id", nullable = false)
	private Long memberId;

	@Column(name = "goods_id", nullable = false)
	private Long goodsId;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected GoodsLike() {
	}

	GoodsLike(Long memberId, Long goodsId, Instant createdAt) {
		this.memberId = memberId;
		this.goodsId = goodsId;
		this.createdAt = createdAt;
	}

	public Long getLikeId() {
		return likeId;
	}

	public Long getMemberId() {
		return memberId;
	}

	public Long getGoodsId() {
		return goodsId;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
