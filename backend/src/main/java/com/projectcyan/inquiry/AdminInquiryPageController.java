package com.projectcyan.inquiry;

import com.projectcyan.common.ApiErrorException;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AdminInquiryPageController {

	private final AdminInquiryService adminInquiryService;

	public AdminInquiryPageController(AdminInquiryService adminInquiryService) {
		this.adminInquiryService = adminInquiryService;
	}

	@GetMapping("/admin/inquiries")
	public String inquiries(Model model) {
		model.addAttribute("inquiries", adminInquiryService.findAll());
		return "admin/inquiries/list";
	}

	@PostMapping("/admin/inquiries/{inquiryId}/answer")
	public String answerInquiry(
		@PathVariable Long inquiryId,
		@ModelAttribute InquiryAnswerRequest answerRequest,
		RedirectAttributes redirectAttributes
	) {
		try {
			adminInquiryService.answer(inquiryId, answerRequest);
			redirectAttributes.addFlashAttribute("notice", "답변이 등록되었습니다.");
		} catch (ApiErrorException exception) {
			redirectAttributes.addFlashAttribute("error", exception.getMessage());
		}
		return "redirect:/admin/inquiries";
	}
}
