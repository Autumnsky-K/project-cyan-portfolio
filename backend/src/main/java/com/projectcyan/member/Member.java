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

	public String getPhone() {
		return phone;
	}

	public String getMemberGrade() {
		return memberGrade;
	}

	public Instant getJoinedAt() {
		return joinedAt;
	}

	public String getStatus() {
		return status;
	}

	public boolean isActive() {
		return "ACTIVE".equals(status);
	}

	public void updateProfile(String name, String phone) {
		this.name = name;
		this.phone = phone;
	}

	public void updateProfile(String email, String name, String phone) {
		this.email = email;
		this.name = name;
		this.phone = phone;
		this.loginId = email == null || email.isBlank() ? "member-" + memberUuid : email;
	}

	public void updateAdminProfile(String email, String name, String phone, String memberGrade, String status) {
		this.email = email;
		this.name = name;
		this.phone = phone;
		this.memberGrade = memberGrade;
		this.status = status;
		this.loginId = email == null || email.isBlank() ? "member-" + memberUuid : email;
	}

	public void withdraw() {
		String withdrawnId = "withdrawn-" + memberId + "-" + memberUuid;
		this.email = null;
		this.name = "탈퇴 회원";
		this.phone = null;
		this.loginProvider = "WITHDRAWN";
		this.loginId = withdrawnId;
		this.passwordHash = null;
		this.avatarUrl = null;
		this.status = "WITHDRAWN";
	}
}
