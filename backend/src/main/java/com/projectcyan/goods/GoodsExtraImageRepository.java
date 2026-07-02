package com.projectcyan.goods;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GoodsExtraImageRepository extends JpaRepository<GoodsExtraImage, Long> {

	List<GoodsExtraImage> findByGoodsGoodsIdOrderBySortOrderAscImageIdAsc(Long goodsId);

	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("delete from GoodsExtraImage image where image.goods.goodsId = :goodsId")
	void deleteByGoodsGoodsId(@Param("goodsId") Long goodsId);
}
