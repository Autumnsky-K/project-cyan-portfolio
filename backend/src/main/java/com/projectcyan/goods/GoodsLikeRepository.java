package com.projectcyan.goods;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GoodsLikeRepository extends JpaRepository<GoodsLike, Long> {

	interface GoodsLikeCount {
		Long getGoodsId();

		Long getLikeCount();
	}

	boolean existsByMemberIdAndGoodsId(Long memberId, Long goodsId);

	void deleteByMemberIdAndGoodsId(Long memberId, Long goodsId);

	long countByGoodsId(Long goodsId);

	@Query("""
		select goodsLike.goodsId as goodsId, count(goodsLike) as likeCount
		from GoodsLike goodsLike
		where goodsLike.goodsId in :goodsIds
		group by goodsLike.goodsId
		""")
	List<GoodsLikeCount> countByGoodsIdIn(Collection<Long> goodsIds);
}
