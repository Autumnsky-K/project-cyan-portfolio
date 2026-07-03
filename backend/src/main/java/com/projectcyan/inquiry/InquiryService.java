package com.projectcyan.inquiry;

import java.time.Clock;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.projectcyan.checkout.StoreOrder;
import com.projectcyan.checkout.StoreOrderRepository;
import com.projectcyan.goods.PageResponse;

@Service
@Transactional(readOnly = true)
public class InquiryService {

	private final InquiryRepository inquiryRepository;
	private final StoreOrderRepository storeOrderRepository;
	private final Clock clock;

	@Autowired
	public InquiryService(InquiryRepository inquiryRepository, StoreOrderRepository storeOrderRepository) {
		this(inquiryRepository, storeOrderRepository, Clock.systemUTC());
	}

	InquiryService(InquiryRepository inquiryRepository, StoreOrderRepository storeOrderRepository, Clock clock) {
		this.inquiryRepository = inquiryRepository;
		this.storeOrderRepository = storeOrderRepository;
		this.clock = clock;
	}

	@Transactional
	public InquiryResponse createSupportInquiry(Long memberId, InquirySupportRequest request) {
		validateTitleAndContent(request.title(), request.content());
		StoreOrder order = resolveOwnedOrder(memberId, request.orderId());
		Inquiry inquiry = Inquiry.supportInquiry(
			memberId,
			request.title().trim(),
			request.content().trim(),
			order == null ? null : order.getOrderId(),
			clock.instant()
		);
		return InquiryResponse.forOwner(inquiryRepository.save(inquiry), order == null ? null : order.getOrderNo());
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
		return InquiryResponse.forOwner(inquiryRepository.save(inquiry), null);
	}

	public PageResponse<InquiryResponse> findMyInquiries(Long memberId, InquiryType inquiryType, int page, int size) {
		Page<Inquiry> inquiries = inquiryRepository.findByMemberIdAndInquiryTypeOrderByCreatedAtDesc(
			memberId,
			inquiryType,
			pageRequest(page, size)
		);
		Map<Long, String> orderNosById = findOrderNosByIds(inquiries.map(Inquiry::getOrderId).toList());
		return PageResponse.from(
			inquiries.map(inquiry -> InquiryResponse.forOwner(inquiry, orderNosById.get(inquiry.getOrderId())))
		);
	}

	public PageResponse<InquiryResponse> findGoodsInquiries(Long goodsId, Long viewerMemberId, int page, int size) {
		Page<Inquiry> inquiries = inquiryRepository.findByGoodsIdAndInquiryTypeOrderByCreatedAtDesc(
			goodsId,
			InquiryType.PRODUCT,
			pageRequest(page, size)
		);
		return PageResponse.from(inquiries.map(inquiry -> InquiryResponse.forPublic(inquiry, viewerMemberId)));
	}

	private StoreOrder resolveOwnedOrder(Long memberId, Long orderId) {
		if (orderId == null) {
			return null;
		}
		StoreOrder order = storeOrderRepository.findById(orderId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));
		if (!memberId.equals(order.getMemberId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Order does not belong to the current member.");
		}
		return order;
	}

	private Map<Long, String> findOrderNosByIds(List<Long> orderIds) {
		List<Long> uniqueOrderIds = orderIds.stream()
			.filter(orderId -> orderId != null)
			.distinct()
			.toList();
		if (uniqueOrderIds.isEmpty()) {
			return new HashMap<>();
		}
		Map<Long, String> orderNosById = new HashMap<>();
		for (StoreOrder order : storeOrderRepository.findAllById(uniqueOrderIds)) {
			orderNosById.put(order.getOrderId(), order.getOrderNo());
		}
		return orderNosById;
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
