package com.projectcyan.goods;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GoodsFavoriteRepository extends JpaRepository<GoodsFavorite, Long> {

	List<GoodsFavorite> findByMemberIdOrderByCreatedAtDescFavoriteIdDesc(Long memberId);

	boolean existsByMemberIdAndGoodsId(Long memberId, Long goodsId);

	void deleteByMemberIdAndGoodsId(Long memberId, Long goodsId);
}
