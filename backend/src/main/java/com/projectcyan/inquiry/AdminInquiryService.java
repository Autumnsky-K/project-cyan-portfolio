package com.projectcyan.inquiry;

import java.time.Clock;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projectcyan.checkout.StoreOrder;
import com.projectcyan.checkout.StoreOrderRepository;
import com.projectcyan.common.ApiErrorException;
import com.projectcyan.goods.Goods;
import com.projectcyan.goods.GoodsRepository;
import com.projectcyan.member.Member;
import com.projectcyan.member.MemberRepository;

@Service
@Transactional(readOnly = true)
public class AdminInquiryService {

	private final InquiryRepository inquiryRepository;
	private final MemberRepository memberRepository;
	private final GoodsRepository goodsRepository;
	private final StoreOrderRepository storeOrderRepository;
	private final Clock clock;

	@Autowired
	public AdminInquiryService(
		InquiryRepository inquiryRepository,
		MemberRepository memberRepository,
		GoodsRepository goodsRepository,
		StoreOrderRepository storeOrderRepository
	) {
		this(inquiryRepository, memberRepository, goodsRepository, storeOrderRepository, Clock.systemUTC());
	}

	AdminInquiryService(
		InquiryRepository inquiryRepository,
		MemberRepository memberRepository,
		GoodsRepository goodsRepository,
		StoreOrderRepository storeOrderRepository,
		Clock clock
	) {
		this.inquiryRepository = inquiryRepository;
		this.memberRepository = memberRepository;
		this.goodsRepository = goodsRepository;
		this.storeOrderRepository = storeOrderRepository;
		this.clock = clock;
	}

	public List<AdminInquiryRow> findAll() {
		List<Inquiry> inquiries = inquiryRepository.findAll();

		Map<Long, Member> membersById = memberRepository
			.findAllById(inquiries.stream().map(Inquiry::getMemberId).distinct().toList())
			.stream()
			.collect(Collectors.toMap(Member::getMemberId, member -> member));

		Map<Long, Goods> goodsById = goodsRepository
			.findAllById(inquiries.stream().map(Inquiry::getGoodsId).filter(java.util.Objects::nonNull).distinct().toList())
			.stream()
			.collect(Collectors.toMap(Goods::getGoodsId, goods -> goods));

		Map<Long, StoreOrder> ordersById = storeOrderRepository
			.findAllById(inquiries.stream().map(Inquiry::getOrderId).filter(java.util.Objects::nonNull).distinct().toList())
			.stream()
			.collect(Collectors.toMap(StoreOrder::getOrderId, order -> order));

		return inquiries.stream()
			.sorted(
				Comparator.comparing((Inquiry inquiry) -> inquiry.getStatus() == InquiryStatus.PENDING ? 0 : 1)
					.thenComparing(Inquiry::getCreatedAt, Comparator.reverseOrder())
			)
			.map(inquiry -> toRow(inquiry, membersById, goodsById, ordersById))
			.toList();
	}

	@Transactional
	public void answer(Long inquiryId, InquiryAnswerRequest request) {
		if (request.answerContent() == null || request.answerContent().isBlank()) {
			throw new ApiErrorException("INQUIRY_ANSWER_REQUIRED", "답변 내용을 입력해 주세요.", HttpStatus.BAD_REQUEST);
		}
		Inquiry inquiry = inquiryRepository.findById(inquiryId)
			.orElseThrow(() -> new ApiErrorException("INQUIRY_NOT_FOUND", "문의를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
		inquiry.answer(null, request.answerContent().trim(), clock.instant());
	}

	private AdminInquiryRow toRow(
		Inquiry inquiry,
		Map<Long, Member> membersById,
		Map<Long, Goods> goodsById,
		Map<Long, StoreOrder> ordersById
	) {
		Member member = membersById.get(inquiry.getMemberId());
		Goods goods = inquiry.getGoodsId() == null ? null : goodsById.get(inquiry.getGoodsId());
		StoreOrder order = inquiry.getOrderId() == null ? null : ordersById.get(inquiry.getOrderId());

		return new AdminInquiryRow(
			inquiry.getInquiryId(),
			inquiry.getInquiryType().name(),
			inquiry.getTitle(),
			inquiry.getContent(),
			inquiry.isSecret(),
			member == null ? "탈퇴 회원" : member.getName(),
			member == null ? "" : member.getEmail(),
			inquiry.getGoodsId(),
			goods == null ? "" : goods.getGoodsName(),
			order == null ? null : order.getOrderNo(),
			inquiry.getStatus().name(),
			inquiry.getAnswerContent(),
			inquiry.getCreatedAt(),
			inquiry.getAnsweredAt()
		);
	}
}
