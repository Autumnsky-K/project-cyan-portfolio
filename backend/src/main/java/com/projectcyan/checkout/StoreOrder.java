package com.projectcyan.checkout;

import java.math.BigDecimal;
import java.time.Instant;

import com.projectcyan.member.Member;

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
@Table(name = "orders")
public class StoreOrder {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "order_id")
	private Long orderId;

	@Column(name = "order_no", nullable = false, unique = true, length = 64)
	private String orderNo;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;

	@Column(name = "subtotal_amount", nullable = false)
	private BigDecimal subtotalAmount;

	@Column(name = "shipping_amount", nullable = false)
	private BigDecimal shippingAmount;

	@Column(name = "total_amount", nullable = false)
	private BigDecimal totalAmount;

	@Column(name = "order_status", nullable = false)
	private String orderStatus;

	@Column(name = "recipient_name")
	private String recipientName;

	@Column(name = "recipient_phone")
	private String recipientPhone;

	@Column(name = "postal_code")
	private String postalCode;

	@Column(name = "address")
	private String address;

	@Column(name = "address_detail")
	private String addressDetail;

	@Column(name = "delivery_request")
	private String deliveryRequest;

	@Column(name = "ordered_at", nullable = false)
	private Instant orderedAt;

	protected StoreOrder() {
	}

	private StoreOrder(
		String orderNo,
		Member member,
		BigDecimal subtotalAmount,
		BigDecimal shippingAmount,
		BigDecimal totalAmount,
		ShippingAddressRequest shippingAddress
	) {
		this.orderNo = orderNo;
		this.member = member;
		this.subtotalAmount = subtotalAmount;
		this.shippingAmount = shippingAmount;
		this.totalAmount = totalAmount;
		this.orderStatus = "PENDING";
		this.recipientName = shippingAddress == null ? null : shippingAddress.recipientName();
		this.recipientPhone = shippingAddress == null ? null : shippingAddress.recipientPhone();
		this.postalCode = shippingAddress == null ? null : shippingAddress.postalCode();
		this.address = shippingAddress == null ? null : shippingAddress.address();
		this.addressDetail = shippingAddress == null ? null : shippingAddress.addressDetail();
		this.deliveryRequest = shippingAddress == null ? null : shippingAddress.deliveryRequest();
		this.orderedAt = Instant.now();
	}

	static StoreOrder pending(
		String orderNo,
		Member member,
		BigDecimal subtotalAmount,
		BigDecimal shippingAmount,
		BigDecimal totalAmount,
		ShippingAddressRequest shippingAddress
	) {
		return new StoreOrder(orderNo, member, subtotalAmount, shippingAmount, totalAmount, shippingAddress);
	}

	public Long getOrderId() {
		return orderId;
	}

	public String getOrderNo() {
		return orderNo;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}
}
