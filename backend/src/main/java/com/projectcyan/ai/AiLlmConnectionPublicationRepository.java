package com.projectcyan.ai;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiLlmConnectionPublicationRepository extends JpaRepository<AiLlmConnectionPublication, Long> {
	Optional<AiLlmConnectionPublication> findTopByOrderByPublicationIdDesc();
	Optional<AiLlmConnectionPublication> findTopByProfileIdAndProfileVersionOrderByPublicationIdDesc(Long profileId, long profileVersion);
	List<AiLlmConnectionPublication> findTop20ByOrderByPublicationIdDesc();
}
