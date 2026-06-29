package com.projectcyan.ai;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AdminAiPageController {

	private final AiGoodsCatalogService catalogService;
	private final AiHookPolicyService hookPolicyService;

	public AdminAiPageController(AiGoodsCatalogService catalogService, AiHookPolicyService hookPolicyService) {
		this.catalogService = catalogService;
		this.hookPolicyService = hookPolicyService;
	}

	@GetMapping("/admin/ai")
	public String aiAdmin(Model model) {
		model.addAttribute("latestCatalogSnapshot", catalogService.findLatestSnapshot());
		model.addAttribute("hookSheetText", hookPolicyService.buildHookSheetText());
		model.addAttribute("hasHookPolicies", hookPolicyService.hasSavedPolicies());
		return "admin/ai/index";
	}

	@GetMapping("/admin/ai/behavior-lab")
	public String aiBehaviorLab() {
		return "admin/ai/behavior-lab";
	}

	@PostMapping("/admin/ai/goods-catalog/export")
	public String exportGoodsCatalog(RedirectAttributes redirectAttributes) {
		AiGoodsCatalogSnapshot snapshot = catalogService.exportCatalog();
		redirectAttributes.addFlashAttribute("catalogExportMessage", "AI 상품 카탈로그 TSV를 생성했습니다.");
		redirectAttributes.addFlashAttribute("catalogExportUrl", snapshot.getCatalogUrl());
		return "redirect:/admin/ai";
	}

	@PostMapping("/admin/ai/hooks")
	public String saveHookPolicies(
		@RequestParam("hookSheetText") String hookSheetText,
		RedirectAttributes redirectAttributes
	) {
		hookPolicyService.replaceFromSheetText(hookSheetText);
		redirectAttributes.addFlashAttribute("hookPolicyMessage", "AI hook 정책을 저장했습니다.");
		return "redirect:/admin/ai";
	}
}
