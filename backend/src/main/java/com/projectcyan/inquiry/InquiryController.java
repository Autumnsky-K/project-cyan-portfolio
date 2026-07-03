package com.projectcyan.inquiry;

import com.projectcyan.goods.PageResponse;
import com.projectcyan.member.auth.AuthenticatedMember;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

	private final InquiryService inquiryService;

	public InquiryController(InquiryService inquiryService) {
		this.inquiryService = inquiryService;
	}

	@PostMapping("/support")
	public ResponseEntity<InquiryResponse> createSupportInquiry(
		@RequestBody InquirySupportRequest request,
		AuthenticatedMember currentMember
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(inquiryService.createSupportInquiry(currentMember.memberId(), request));
	}

	@GetMapping("/me")
	public PageResponse<InquiryResponse> findMyInquiries(
		@RequestParam InquiryType type,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "20") int size,
		AuthenticatedMember currentMember
	) {
		return inquiryService.findMyInquiries(currentMember.memberId(), type, page, size);
	}
}
