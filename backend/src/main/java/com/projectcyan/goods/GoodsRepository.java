package com.projectcyan.goods;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface GoodsRepository extends JpaRepository<Goods, Long>, JpaSpecificationExecutor<Goods> {

	@Query("select coalesce(max(goods.goodsId), 0) + 1 from Goods goods")
	Long nextGoodsId();

	List<Goods> findByArtistArtistIdAndGoodsIdNot(Long artistId, Long goodsId, Pageable pageable);

	List<Goods> findByCategoryCategoryIdAndGoodsIdNot(Long categoryId, Long goodsId, Pageable pageable);

	@EntityGraph(attributePaths = {"artist", "category", "tags"})
	@Query("select distinct goods from Goods goods")
	List<Goods> findAllForRecommendation();
}
