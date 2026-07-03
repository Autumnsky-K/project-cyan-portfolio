package com.projectcyan.goods;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TagRepository extends JpaRepository<Tag, Long> {

	List<Tag> findAllByOrderByTagNameAsc();

	List<Tag> findByTagNameIn(Collection<String> tagNames);

	Optional<Tag> findByTagNameIgnoreCase(String tagName);

	@Query("select coalesce(max(tag.tagId), 0) + 1 from Tag tag")
	Long nextTagId();

	@Query("select count(goods) from Goods goods join goods.tags tag where tag.tagId = :tagId")
	long countGoodsByTagId(@Param("tagId") Long tagId);
}
