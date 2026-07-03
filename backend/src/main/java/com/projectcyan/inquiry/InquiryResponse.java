package com.projectcyan.inquiry;

import java.time.Instant;

public record InquiryResponse(
	Long inquiryId,
	String inquiryType,
	Long goodsId,
	String title,
	String content,
	boolean secret,
	String status,
	String answerContent,
	Instant answeredAt,
	Instant createdAt
) {

	public static InquiryResponse forOwner(Inquiry inquiry) {
		return new InquiryResponse(
			inquiry.getInquiryId(),
			inquiry.getInquiryType().name(),
			inquiry.getGoodsId(),
			inquiry.getTitle(),
			inquiry.getContent(),
			inquiry.isSecret(),
			inquiry.getStatus().name(),
			inquiry.getAnswerContent(),
			inquiry.getAnsweredAt(),
			inquiry.getCreatedAt()
		);
	}

	public static InquiryResponse forPublic(Inquiry inquiry, Long viewerMemberId) {
		boolean ownedByViewer = viewerMemberId != null && viewerMemberId.equals(inquiry.getMemberId());
		boolean masked = inquiry.isSecret() && !ownedByViewer;
		return new InquiryResponse(
			inquiry.getInquiryId(),
			inquiry.getInquiryType().name(),
			inquiry.getGoodsId(),
			inquiry.getTitle(),
			masked ? null : inquiry.getContent(),
			inquiry.isSecret(),
			inquiry.getStatus().name(),
			masked ? null : inquiry.getAnswerContent(),
			inquiry.getAnsweredAt(),
			inquiry.getCreatedAt()
		);
	}
}
