package com.projectcyan.ai;

import java.time.Instant;

public record AiHookPolicyResponse(
	String hook,
	String check,
	String threshold,
	String action,
	String message,
	boolean enabled,
	int priority,
	Instant updatedAt
) {

	public static AiHookPolicyResponse from(AiHookPolicy policy) {
		return new AiHookPolicyResponse(
			policy.getHook(),
			policy.getCheck(),
			policy.getThreshold(),
			policy.getAction(),
			policy.getMessage(),
			policy.isEnabled(),
			policy.getPriority(),
			policy.getUpdatedAt()
		);
	}
}
