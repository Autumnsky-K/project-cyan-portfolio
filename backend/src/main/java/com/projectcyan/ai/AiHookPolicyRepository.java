package com.projectcyan.ai;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AiHookPolicyRepository extends JpaRepository<AiHookPolicy, Long> {

	List<AiHookPolicy> findByEnabledTrueOrderByPriorityAscPolicyIdAsc();

	List<AiHookPolicy> findAllByOrderByPriorityAscPolicyIdAsc();
}
