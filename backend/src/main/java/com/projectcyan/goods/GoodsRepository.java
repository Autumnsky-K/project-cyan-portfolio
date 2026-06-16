package com.projectcyan.goods;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface GoodsRepository extends JpaRepository<Goods, Long>, JpaSpecificationExecutor<Goods> {

	@Query("select coalesce(max(goods.goodsId), 0) + 1 from Goods goods")
	Long nextGoodsId();
}
