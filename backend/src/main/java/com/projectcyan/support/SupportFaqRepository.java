package com.projectcyan.support;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportFaqRepository extends JpaRepository<SupportFaq, Long> {

	List<SupportFaq> findAllByOrderBySortOrderAscFaqIdAsc();

	List<SupportFaq> findByVisibleTrueOrderBySortOrderAscFaqIdAsc();
}
