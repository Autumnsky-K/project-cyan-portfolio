package com.projectcyan.member;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "member_address")
public class MemberAddress {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "address_id")
	private Long addressId;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;

	@Column(name = "recipient_name", nullable = false)
	private String recipientName;

	@Column(name = "phone", nullable = false)
	private String phone;

	@Column(name = "postal_code")
	private String postalCode;

	@Column(name = "address", nullable = false)
	private String address;

	@Column(name = "address_detail")
	private String addressDetail;

	@Column(name = "is_default", nullable = false)
	private boolean defaultAddress;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected MemberAddress() {
	}

	private MemberAddress(Member member, String recipientName, String phone, String address) {
		this.member = member;
		this.recipientName = recipientName;
		this.phone = phone;
		this.postalCode = null;
		this.address = address;
		this.addressDetail = null;
		this.defaultAddress = true;
		this.createdAt = Instant.now();
		this.updatedAt = this.createdAt;
	}

	public static MemberAddress defaultAddress(Member member, String recipientName, String phone, String address) {
		return new MemberAddress(member, recipientName, phone, address);
	}
}
