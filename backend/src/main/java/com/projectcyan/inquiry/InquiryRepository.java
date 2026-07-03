package com.projectcyan.inquiry;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

	Page<Inquiry> findByMemberIdOrderByCreatedAtDesc(Long memberId, Pageable pageable);

	Page<Inquiry> findByMemberIdAndInquiryTypeOrderByCreatedAtDesc(
		Long memberId,
		InquiryType inquiryType,
		Pageable pageable
	);

	Page<Inquiry> findByGoodsIdAndInquiryTypeOrderByCreatedAtDesc(
		Long goodsId,
		InquiryType inquiryType,
		Pageable pageable
	);

	Page<Inquiry> findByInquiryTypeOrderByCreatedAtDesc(InquiryType inquiryType, Pageable pageable);

	Page<Inquiry> findByStatusOrderByCreatedAtAsc(InquiryStatus status, Pageable pageable);
}
