package com.projectcyan.ai;

import java.time.Instant;

public record AiHookPolicyResponse(
	Long policyId,
	String hook,
	String check,
	String threshold,
	String action,
	String message,
	String replacement,
	boolean enabled,
	int priority,
	Instant updatedAt
) {

	public static AiHookPolicyResponse from(AiHookPolicy policy) {
		return new AiHookPolicyResponse(
			policy.getPolicyId(),
			policy.getHook(),
			policy.getCheck(),
			policy.getThreshold(),
			policy.getAction(),
			policy.getMessage(),
			policy.getReplacement(),
			policy.isEnabled(),
			policy.getPriority(),
			policy.getUpdatedAt()
		);
	}
}
