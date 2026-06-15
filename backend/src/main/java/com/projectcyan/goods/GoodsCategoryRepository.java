package com.projectcyan.goods;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GoodsCategoryRepository extends JpaRepository<GoodsCategory, Long> {

	List<GoodsCategory> findAllByOrderByCategoryNameAsc();
}
