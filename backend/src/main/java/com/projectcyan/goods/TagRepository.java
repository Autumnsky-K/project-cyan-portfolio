package com.projectcyan.goods;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long> {

	List<Tag> findAllByOrderByTagNameAsc();

	List<Tag> findByTagNameIn(Collection<String> tagNames);
}
