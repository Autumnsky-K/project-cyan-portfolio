package com.projectcyan.admin;

import com.projectcyan.security.SecurityMonitoringService;
import com.projectcyan.support.SupportFaqService;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AdminOperationsPageController {

	private final SupportFaqService supportFaqService;
	private final SecurityMonitoringService securityMonitoringService;

	public AdminOperationsPageController(
		SupportFaqService supportFaqService,
		SecurityMonitoringService securityMonitoringService
	) {
		this.supportFaqService = supportFaqService;
		this.securityMonitoringService = securityMonitoringService;
	}

	@GetMapping("/admin/support")
	public String support(Model model) {
		var faqs = supportFaqService.findAdminFaqs();
		model.addAttribute("pageTitle", "고객센터/FAQ/이용약관");
		model.addAttribute("currentKey", "support");
		model.addAttribute("faqs", faqs);
		model.addAttribute("visibleFaqCount", faqs.stream().filter(faq -> faq.visible()).count());
		return "admin/operations/support";
	}

	@PostMapping("/admin/support/faqs")
	public String createFaq(
		@RequestParam String category,
		@RequestParam String question,
		@RequestParam String answer,
		@RequestParam(required = false) Integer sortOrder,
		@RequestParam(required = false, defaultValue = "false") boolean visible,
		RedirectAttributes redirectAttributes
	) {
		try {
			supportFaqService.create(category, question, answer, sortOrder, visible);
			redirectAttributes.addFlashAttribute("notice", "FAQ가 등록되었습니다.");
		} catch (ResponseStatusException exception) {
			redirectAttributes.addFlashAttribute("error", supportErrorMessage(exception));
		}
		return "redirect:/admin/support";
	}

	@PostMapping("/admin/support/faqs/{faqId}")
	public String updateFaq(
		@PathVariable Long faqId,
		@RequestParam String category,
		@RequestParam String question,
		@RequestParam String answer,
		@RequestParam(required = false) Integer sortOrder,
		@RequestParam(required = false, defaultValue = "false") boolean visible,
		RedirectAttributes redirectAttributes
	) {
		try {
			supportFaqService.update(faqId, category, question, answer, sortOrder, visible);
			redirectAttributes.addFlashAttribute("notice", "FAQ가 저장되었습니다.");
		} catch (ResponseStatusException exception) {
			redirectAttributes.addFlashAttribute("error", supportErrorMessage(exception));
		}
		return "redirect:/admin/support#faq-" + faqId;
	}

	@PostMapping("/admin/support/faqs/{faqId}/delete")
	public String deleteFaq(@PathVariable Long faqId, RedirectAttributes redirectAttributes) {
		try {
			supportFaqService.delete(faqId);
			redirectAttributes.addFlashAttribute("notice", "FAQ가 삭제되었습니다.");
		} catch (ResponseStatusException exception) {
			redirectAttributes.addFlashAttribute("error", supportErrorMessage(exception));
		}
		return "redirect:/admin/support";
	}

	@GetMapping("/admin/security")
	public String security(Model model) {
		model.addAttribute("pageTitle", "고객접속통계/보안");
		model.addAttribute("currentKey", "security");
		model.addAttribute("securityDashboard", securityMonitoringService.dashboard());
		return "admin/operations/security";
	}

	private String supportErrorMessage(ResponseStatusException exception) {
		return exception.getReason() == null || exception.getReason().isBlank()
			? "FAQ를 저장할 수 없습니다. 입력값을 확인해주세요."
			: exception.getReason();
	}
}
