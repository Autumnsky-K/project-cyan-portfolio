package com.projectcyan.goods;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GoodsStockRepository extends JpaRepository<GoodsStock, Long> {

	List<GoodsStock> findByGoodsIdIn(Collection<Long> goodsIds);
}
