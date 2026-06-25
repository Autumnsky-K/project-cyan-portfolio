package com.projectcyan.ai;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AdminAiPageController {

	private final AiGoodsCatalogService catalogService;

	public AdminAiPageController(AiGoodsCatalogService catalogService) {
		this.catalogService = catalogService;
	}

	@GetMapping("/admin/ai")
	public String aiAdmin(Model model) {
		model.addAttribute("latestCatalogSnapshot", catalogService.findLatestSnapshot());
		return "admin/ai/index";
	}

	@PostMapping("/admin/ai/goods-catalog/export")
	public String exportGoodsCatalog(RedirectAttributes redirectAttributes) {
		AiGoodsCatalogSnapshot snapshot = catalogService.exportCatalog();
		redirectAttributes.addFlashAttribute("catalogExportMessage", "AI 상품 카탈로그 TSV를 생성했습니다.");
		redirectAttributes.addFlashAttribute("catalogExportUrl", snapshot.getCatalogUrl());
		return "redirect:/admin/ai";
	}
}
