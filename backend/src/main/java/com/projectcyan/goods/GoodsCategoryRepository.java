package com.projectcyan.goods;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GoodsCategoryRepository extends JpaRepository<GoodsCategory, Long> {

	List<GoodsCategory> findAllByOrderByCategoryNameAsc();

	Optional<GoodsCategory> findByCategoryNameIgnoreCase(String categoryName);

	@Query("select coalesce(max(category.categoryId), 0) + 1 from GoodsCategory category")
	Long nextCategoryId();
}
