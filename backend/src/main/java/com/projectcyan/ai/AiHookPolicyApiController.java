package com.projectcyan.ai;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/hooks")
public class AiHookPolicyApiController {

	private final AiHookPolicyService hookPolicyService;

	public AiHookPolicyApiController(AiHookPolicyService hookPolicyService) {
		this.hookPolicyService = hookPolicyService;
	}

	@GetMapping
	public List<AiHookPolicyResponse> findActivePolicies() {
		return hookPolicyService.findActivePolicies();
	}
}
