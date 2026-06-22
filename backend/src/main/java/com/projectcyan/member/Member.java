package com.projectcyan.member;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "member")
public class Member {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "member_id")
	private Long memberId;

	@Column(name = "member_uuid", nullable = false, unique = true)
	private UUID memberUuid;

	@Column(name = "email", unique = true)
	private String email;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "phone")
	private String phone;

	@Column(name = "login_provider", nullable = false)
	private String loginProvider;

	@Column(name = "login_id", nullable = false)
	private String loginId;

	@Column(name = "password_hash")
	private String passwordHash;

	@Column(name = "member_grade", nullable = false)
	private String memberGrade;

	@Column(name = "avatar_url")
	private String avatarUrl;

	@Column(name = "joined_at", nullable = false)
	private Instant joinedAt;

	@Column(name = "last_login_at")
	private Instant lastLoginAt;

	@Column(name = "status", nullable = false)
	private String status;

	protected Member() {
	}

	private Member(UUID memberUuid, String email, String name, String phone) {
		this.memberUuid = memberUuid;
		this.email = email;
		this.name = name;
		this.phone = phone;
		this.loginProvider = "EMAIL";
		this.loginId = email;
		this.passwordHash = null;
		this.memberGrade = "BASIC";
		this.avatarUrl = null;
		this.joinedAt = Instant.now();
		this.lastLoginAt = null;
		this.status = "ACTIVE";
	}

	public static Member emailMember(UUID memberUuid, String email, String name, String phone) {
		return new Member(memberUuid, email, name, phone);
	}

	public Long getMemberId() {
		return memberId;
	}

	public UUID getMemberUuid() {
		return memberUuid;
	}

	public String getEmail() {
		return email;
	}

	public String getName() {
		return name;
	}
}
