package com.projectcyan.goods;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GoodsExtraImageRepository extends JpaRepository<GoodsExtraImage, Long> {

	List<GoodsExtraImage> findByGoodsGoodsIdOrderBySortOrderAscImageIdAsc(Long goodsId);
}
