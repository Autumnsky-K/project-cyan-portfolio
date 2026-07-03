package com.projectcyan.inquiry;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "inquiry")
public class Inquiry {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "inquiry_id")
	private Long inquiryId;

	@Enumerated(EnumType.STRING)
	@Column(name = "inquiry_type", nullable = false)
	private InquiryType inquiryType;

	@Column(name = "member_id", nullable = false)
	private Long memberId;

	@Column(name = "goods_id")
	private Long goodsId;

	@Column(name = "order_id")
	private Long orderId;

	@Column(name = "title", nullable = false)
	private String title;

	@Column(name = "content", nullable = false)
	private String content;

	@Column(name = "is_secret", nullable = false)
	private boolean secret;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private InquiryStatus status;

	@Column(name = "answer_content")
	private String answerContent;

	@Column(name = "answered_by")
	private Long answeredBy;

	@Column(name = "answered_at")
	private Instant answeredAt;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected Inquiry() {
	}

	private Inquiry(
		InquiryType inquiryType,
		Long memberId,
		Long goodsId,
		Long orderId,
		String title,
		String content,
		boolean secret,
		Instant now
	) {
		this.inquiryType = inquiryType;
		this.memberId = memberId;
		this.goodsId = goodsId;
		this.orderId = orderId;
		this.title = title;
		this.content = content;
		this.secret = secret;
		this.status = InquiryStatus.PENDING;
		this.createdAt = now;
		this.updatedAt = now;
	}

	public static Inquiry supportInquiry(
		Long memberId,
		String title,
		String content,
		Long orderId,
		Instant now
	) {
		return new Inquiry(InquiryType.SUPPORT, memberId, null, orderId, title, content, false, now);
	}

	public static Inquiry productInquiry(
		Long memberId,
		Long goodsId,
		String title,
		String content,
		boolean secret,
		Instant now
	) {
		return new Inquiry(InquiryType.PRODUCT, memberId, goodsId, null, title, content, secret, now);
	}

	public Long getInquiryId() {
		return inquiryId;
	}

	public InquiryType getInquiryType() {
		return inquiryType;
	}

	public Long getMemberId() {
		return memberId;
	}

	public Long getGoodsId() {
		return goodsId;
	}

	public Long getOrderId() {
		return orderId;
	}

	public String getTitle() {
		return title;
	}

	public String getContent() {
		return content;
	}

	public boolean isSecret() {
		return secret;
	}

	public InquiryStatus getStatus() {
		return status;
	}

	public String getAnswerContent() {
		return answerContent;
	}

	public Long getAnsweredBy() {
		return answeredBy;
	}

	public Instant getAnsweredAt() {
		return answeredAt;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public void answer(Long adminMemberId, String answerContent, Instant now) {
		this.answerContent = answerContent;
		this.answeredBy = adminMemberId;
		this.answeredAt = now;
		this.status = InquiryStatus.ANSWERED;
		this.updatedAt = now;
	}
}
