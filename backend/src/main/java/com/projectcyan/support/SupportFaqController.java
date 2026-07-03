package com.projectcyan.support;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/support/faqs")
public class SupportFaqController {

	private final SupportFaqService supportFaqService;

	public SupportFaqController(SupportFaqService supportFaqService) {
		this.supportFaqService = supportFaqService;
	}

	@GetMapping
	public List<SupportFaqResponse> faqs() {
		return supportFaqService.findVisibleFaqs();
	}
}
