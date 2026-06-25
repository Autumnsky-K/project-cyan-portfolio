package com.projectcyan.ai;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AiGoodsCatalogSnapshotRepository extends JpaRepository<AiGoodsCatalogSnapshot, Long> {

	Optional<AiGoodsCatalogSnapshot> findFirstByStatusOrderByGeneratedAtDescSnapshotIdDesc(String status);

	Optional<AiGoodsCatalogSnapshot> findFirstByOrderByGeneratedAtDescSnapshotIdDesc();
}
