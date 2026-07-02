package com.projectcyan.ai;

import java.time.Instant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ai_llm_audit_log")
public class AiLlmAuditLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "audit_id")
	private Long auditId;

	@Column(name = "action", nullable = false, length = 80)
	private String action;

	@Column(name = "profile_id")
	private Long profileId;

	@Column(name = "result", nullable = false, length = 20)
	private String result;

	@Column(name = "actor", nullable = false, length = 100)
	private String actor;

	@Column(name = "client_ip", nullable = false, length = 100)
	private String clientIp;

	@Column(name = "detail", nullable = false, length = 1000)
	private String detail;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected AiLlmAuditLog() {
	}

	public static AiLlmAuditLog create(
		String action,
		Long profileId,
		boolean success,
		String actor,
		String clientIp,
		String detail
	) {
		AiLlmAuditLog value = new AiLlmAuditLog();
		value.action = action;
		value.profileId = profileId;
		value.result = success ? "SUCCESS" : "FAILED";
		value.actor = actor == null || actor.isBlank() ? "admin" : actor;
		value.clientIp = clientIp == null || clientIp.isBlank() ? "unknown" : clientIp;
		String safeDetail = detail == null ? "" : detail;
		value.detail = safeDetail.substring(0, Math.min(1000, safeDetail.length()));
		value.createdAt = Instant.now();
		return value;
	}
}
