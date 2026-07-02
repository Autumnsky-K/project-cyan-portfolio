package com.projectcyan.goods;

import java.util.Collection;
import java.util.List;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GoodsStockRepository extends JpaRepository<GoodsStock, Long> {

	List<GoodsStock> findByGoodsIdIn(Collection<Long> goodsIds);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select stock from GoodsStock stock where stock.goodsId in :goodsIds")
	List<GoodsStock> findByGoodsIdInForUpdate(@Param("goodsIds") Collection<Long> goodsIds);
}
