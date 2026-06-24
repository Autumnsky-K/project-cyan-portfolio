package com.projectcyan.cart;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
	name = "cart",
	uniqueConstraints = @UniqueConstraint(name = "cart_member_unique", columnNames = "member_id")
)
public class Cart {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "cart_id")
	private Long cartId;

	@Column(name = "member_id", nullable = false)
	private Long memberId;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected Cart() {
	}

	Cart(Long memberId, Instant createdAt) {
		this.memberId = memberId;
		this.createdAt = createdAt;
		this.updatedAt = createdAt;
	}

	public Long getCartId() {
		return cartId;
	}

	public Long getMemberId() {
		return memberId;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	void touch(Instant updatedAt) {
		this.updatedAt = updatedAt;
	}
}
