package com.projectcyan.goods;

import java.util.List;
import java.util.Collection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GoodsFavoriteRepository extends JpaRepository<GoodsFavorite, Long> {

	interface GoodsFavoriteCount {
		Long getGoodsId();

		Long getFavoriteCount();
	}

	List<GoodsFavorite> findByMemberIdOrderByCreatedAtDescFavoriteIdDesc(Long memberId);

	boolean existsByMemberIdAndGoodsId(Long memberId, Long goodsId);

	void deleteByMemberIdAndGoodsId(Long memberId, Long goodsId);

	@Query("""
		select favorite.goodsId as goodsId, count(favorite) as favoriteCount
		from GoodsFavorite favorite
		where favorite.goodsId in :goodsIds
		group by favorite.goodsId
		""")
	List<GoodsFavoriteCount> countByGoodsIdIn(Collection<Long> goodsIds);
}
