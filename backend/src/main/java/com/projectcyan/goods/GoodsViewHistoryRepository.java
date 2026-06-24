package com.projectcyan.goods;

import java.time.Instant;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GoodsViewHistoryRepository extends JpaRepository<GoodsViewHistory, Long> {

	boolean existsByMemberIdAndGoodsIdAndViewedAtGreaterThanEqual(
		Long memberId,
		Long goodsId,
		Instant viewedAt
	);
}
