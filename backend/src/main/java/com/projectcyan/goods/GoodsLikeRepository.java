package com.projectcyan.goods;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GoodsLikeRepository extends JpaRepository<GoodsLike, Long> {

	interface GoodsLikeCount {
		Long getGoodsId();

		Long getLikeCount();
	}

	boolean existsByMemberIdAndGoodsId(Long memberId, Long goodsId);

	List<GoodsLike> findByMemberIdOrderByCreatedAtDescLikeIdDesc(Long memberId);

	void deleteByMemberIdAndGoodsId(Long memberId, Long goodsId);

	long countByGoodsId(Long goodsId);

	@Query("""
		select goodsLike.goodsId as goodsId, count(goodsLike) as likeCount
		from GoodsLike goodsLike
		where goodsLike.goodsId in :goodsIds
		group by goodsLike.goodsId
		""")
	List<GoodsLikeCount> countByGoodsIdIn(@Param("goodsIds") Collection<Long> goodsIds);

	@Query("""
		select goodsLike.goodsId
		from GoodsLike goodsLike
		where goodsLike.memberId = :memberId
			and goodsLike.goodsId in :goodsIds
		""")
	List<Long> findLikedGoodsIds(
		@Param("memberId") Long memberId,
		@Param("goodsIds") Collection<Long> goodsIds
	);
}
