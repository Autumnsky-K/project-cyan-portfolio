package com.projectcyan.checkout;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "payment_attempt")
public class PaymentAttempt {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "payment_attempt_id")
	private Long paymentAttemptId;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "order_id", nullable = false)
	private StoreOrder order;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "payment_id", nullable = false)
	private Payment payment;

	@Column(name = "payment_method")
	private String paymentMethod;

	@Column(name = "tid")
	private String tid;

	@Column(name = "partner_order_id")
	private String partnerOrderId;

	@Column(name = "partner_user_id")
	private String partnerUserId;

	@Column(name = "attempt_status", nullable = false)
	private String attemptStatus;

	@Column(name = "provider")
	private String provider;

	@Column(name = "provider_order_id")
	private String providerOrderId;

	@Column(name = "requested_at", nullable = false)
	private Instant requestedAt;

	protected PaymentAttempt() {
	}

	private PaymentAttempt(StoreOrder order, Payment payment) {
		this.order = order;
		this.payment = payment;
		this.attemptStatus = "READY";
		this.provider = "TOSS";
		this.providerOrderId = order.getOrderNo();
		this.requestedAt = Instant.now();
	}

	static PaymentAttempt readyForToss(StoreOrder order, Payment payment) {
		return new PaymentAttempt(order, payment);
	}
}
