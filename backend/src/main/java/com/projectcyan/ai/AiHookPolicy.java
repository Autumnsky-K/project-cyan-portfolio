package com.projectcyan.ai;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "ai_hook_policy")
public class AiHookPolicy {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "policy_id")
	private Long policyId;

	@Column(name = "hook", nullable = false, length = 20)
	private String hook;

	@Column(name = "check_name", nullable = false, length = 80)
	private String check;

	@Column(name = "threshold_value", nullable = false, length = 500)
	private String threshold;

	@Column(name = "action", nullable = false, length = 40)
	private String action;

	@Column(name = "message", nullable = false, length = 1000)
	private String message;

	@Column(name = "replacement", length = 1000)
	private String replacement;

	@Column(name = "enabled", nullable = false)
	private boolean enabled;

	@Column(name = "priority", nullable = false)
	private int priority;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected AiHookPolicy() {
	}

	private AiHookPolicy(
		String hook,
		String check,
		String threshold,
		String action,
		String message,
		String replacement,
		boolean enabled,
		int priority
	) {
		this.hook = hook;
		this.check = check;
		this.threshold = threshold;
		this.action = action;
		this.message = message;
		this.replacement = replacement;
		this.enabled = enabled;
		this.priority = priority;
	}

	public static AiHookPolicy create(
		String hook,
		String check,
		String threshold,
		String action,
		String message,
		String replacement,
		boolean enabled,
		int priority
	) {
		return new AiHookPolicy(hook, check, threshold, action, message, replacement, enabled, priority);
	}

	@PrePersist
	@PreUpdate
	void updateTimestamp() {
		this.updatedAt = Instant.now();
	}

	public Long getPolicyId() {
		return policyId;
	}

	public String getHook() {
		return hook;
	}

	public String getCheck() {
		return check;
	}

	public String getThreshold() {
		return threshold;
	}

	public String getAction() {
		return action;
	}

	public String getMessage() {
		return message;
	}

	public String getReplacement() {
		return replacement;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public int getPriority() {
		return priority;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
