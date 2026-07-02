package com.projectcyan.goods;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GoodsViewHistoryRepository extends JpaRepository<GoodsViewHistory, Long> {

	interface GoodsViewCount {
		Long getGoodsId();

		Long getViewCount();
	}

	boolean existsByMemberIdAndGoodsIdAndViewedAtGreaterThanEqual(
		Long memberId,
		Long goodsId,
		Instant viewedAt
	);

	@Query("""
		select history.goodsId as goodsId, count(history) as viewCount
		from GoodsViewHistory history
		where history.goodsId in :goodsIds
		group by history.goodsId
		""")
	List<GoodsViewCount> countByGoodsIdIn(Collection<Long> goodsIds);

	@Query("""
		select history.goodsId as goodsId, count(history) as viewCount
		from GoodsViewHistory history
		where history.goodsId in :goodsIds and history.viewedAt >= :viewedAt
		group by history.goodsId
		""")
	List<GoodsViewCount> countByGoodsIdInSince(Collection<Long> goodsIds, Instant viewedAt);
}
