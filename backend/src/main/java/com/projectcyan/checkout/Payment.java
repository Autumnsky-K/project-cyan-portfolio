package com.projectcyan.checkout;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "payment")
public class Payment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "payment_id")
	private Long paymentId;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "order_id", nullable = false)
	private StoreOrder order;

	@Column(name = "payment_amount", nullable = false)
	private BigDecimal paymentAmount;

	@Column(name = "payment_method")
	private String paymentMethod;

	@Column(name = "payment_status", nullable = false)
	private String paymentStatus;

	@Column(name = "provider")
	private String provider;

	@Column(name = "provider_payment_key")
	private String providerPaymentKey;

	@Column(name = "provider_order_id")
	private String providerOrderId;

	@Column(name = "requested_at")
	private Instant requestedAt;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected Payment() {
	}

	private Payment(StoreOrder order, String provider) {
		this.order = order;
		this.paymentAmount = order.getTotalAmount();
		this.paymentStatus = "READY";
		this.provider = provider;
		this.providerOrderId = order.getOrderNo();
		this.requestedAt = Instant.now();
		this.createdAt = this.requestedAt;
	}

	static Payment readyForToss(StoreOrder order) {
		return readyForProvider(order, "TOSS");
	}

	static Payment readyForProvider(StoreOrder order, String provider) {
		return new Payment(order, provider);
	}

	public Long getPaymentId() {
		return paymentId;
	}

	public StoreOrder getOrder() {
		return order;
	}

	public BigDecimal getPaymentAmount() {
		return paymentAmount;
	}

	public String getPaymentStatus() {
		return paymentStatus;
	}

	public String getProvider() {
		return provider;
	}

	public String getProviderPaymentKey() {
		return providerPaymentKey;
	}

	public String getProviderOrderId() {
		return providerOrderId;
	}

	public void markApproved(String providerPaymentKey, String paymentMethod) {
		this.paymentStatus = "APPROVED";
		if (providerPaymentKey != null && !providerPaymentKey.isBlank()) {
			this.providerPaymentKey = providerPaymentKey;
		}
		if (paymentMethod != null && !paymentMethod.isBlank()) {
			this.paymentMethod = paymentMethod;
		}
	}

	public void markCanceled() {
		if (!isApproved()) {
			this.paymentStatus = "CANCELED";
		}
	}

	public void markFailed() {
		if (!isApproved()) {
			this.paymentStatus = "FAILED";
		}
	}

	public boolean isApproved() {
		return "APPROVED".equals(paymentStatus);
	}
}
