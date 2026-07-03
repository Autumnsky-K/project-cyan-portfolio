package com.projectcyan.inquiry;

import java.time.Clock;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.projectcyan.goods.PageResponse;

@Service
@Transactional(readOnly = true)
public class InquiryService {

	private final InquiryRepository inquiryRepository;
	private final Clock clock;

	@Autowired
	public InquiryService(InquiryRepository inquiryRepository) {
		this(inquiryRepository, Clock.systemUTC());
	}

	InquiryService(InquiryRepository inquiryRepository, Clock clock) {
		this.inquiryRepository = inquiryRepository;
		this.clock = clock;
	}

	@Transactional
	public InquiryResponse createSupportInquiry(Long memberId, InquirySupportRequest request) {
		validateTitleAndContent(request.title(), request.content());
		Inquiry inquiry = Inquiry.supportInquiry(memberId, request.title().trim(), request.content().trim(), clock.instant());
		return InquiryResponse.forOwner(inquiryRepository.save(inquiry));
	}

	@Transactional
	public InquiryResponse createProductInquiry(Long memberId, Long goodsId, InquiryProductRequest request) {
		validateTitleAndContent(request.title(), request.content());
		Inquiry inquiry = Inquiry.productInquiry(
			memberId,
			goodsId,
			request.title().trim(),
			request.content().trim(),
			Boolean.TRUE.equals(request.secret()),
			clock.instant()
		);
		return InquiryResponse.forOwner(inquiryRepository.save(inquiry));
	}

	public PageResponse<InquiryResponse> findMyInquiries(Long memberId, InquiryType inquiryType, int page, int size) {
		Page<Inquiry> inquiries = inquiryRepository.findByMemberIdAndInquiryTypeOrderByCreatedAtDesc(
			memberId,
			inquiryType,
			pageRequest(page, size)
		);
		return PageResponse.from(inquiries.map(InquiryResponse::forOwner));
	}

	public PageResponse<InquiryResponse> findGoodsInquiries(Long goodsId, Long viewerMemberId, int page, int size) {
		Page<Inquiry> inquiries = inquiryRepository.findByGoodsIdAndInquiryTypeOrderByCreatedAtDesc(
			goodsId,
			InquiryType.PRODUCT,
			pageRequest(page, size)
		);
		return PageResponse.from(inquiries.map(inquiry -> InquiryResponse.forPublic(inquiry, viewerMemberId)));
	}

	private void validateTitleAndContent(String title, String content) {
		if (title == null || title.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required.");
		}
		if (content == null || content.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content is required.");
		}
	}

	private PageRequest pageRequest(int page, int size) {
		int safeSize = Math.max(1, Math.min(size, 50));
		return PageRequest.of(Math.max(page, 0), safeSize);
	}
}
