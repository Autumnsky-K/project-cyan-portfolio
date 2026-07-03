package com.projectcyan.goods;

import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AdminGoodsClassificationPageController {

	private final AdminGoodsClassificationService adminGoodsClassificationService;

	public AdminGoodsClassificationPageController(AdminGoodsClassificationService adminGoodsClassificationService) {
		this.adminGoodsClassificationService = adminGoodsClassificationService;
	}

	@GetMapping("/admin/goods/classifications")
	public String classifications(Model model) {
		addClassificationModel(model);
		return "admin/goods/classifications";
	}

	@PostMapping("/admin/goods/categories")
	public String createCategory(
		@RequestParam String categoryName,
		@RequestParam(defaultValue = "PHYSICAL") String fulfillmentType,
		RedirectAttributes redirectAttributes
	) {
		try {
			adminGoodsClassificationService.createCategory(categoryName, fulfillmentType);
			redirectAttributes.addFlashAttribute("notice", "카테고리가 등록되었습니다.");
		} catch (ResponseStatusException exception) {
			redirectAttributes.addFlashAttribute("error", classificationErrorMessage(exception));
		}
		return "redirect:/admin/goods/classifications";
	}

	@PostMapping("/admin/goods/categories/{categoryId}")
	public String updateCategory(
		@PathVariable Long categoryId,
		@RequestParam String categoryName,
		@RequestParam(defaultValue = "PHYSICAL") String fulfillmentType,
		RedirectAttributes redirectAttributes
	) {
		try {
			adminGoodsClassificationService.updateCategory(categoryId, categoryName, fulfillmentType);
			redirectAttributes.addFlashAttribute("notice", "카테고리가 저장되었습니다.");
		} catch (ResponseStatusException exception) {
			redirectAttributes.addFlashAttribute("error", classificationErrorMessage(exception));
		}
		return "redirect:/admin/goods/classifications";
	}

	@PostMapping("/admin/goods/categories/{categoryId}/delete")
	public String deleteCategory(@PathVariable Long categoryId, RedirectAttributes redirectAttributes) {
		try {
			adminGoodsClassificationService.deleteCategory(categoryId);
			redirectAttributes.addFlashAttribute("notice", "카테고리가 삭제되었습니다.");
		} catch (ResponseStatusException exception) {
			redirectAttributes.addFlashAttribute("error", classificationErrorMessage(exception));
		}
		return "redirect:/admin/goods/classifications";
	}

	@PostMapping("/admin/goods/tags")
	public String createTag(
		@RequestParam String tagName,
		RedirectAttributes redirectAttributes
	) {
		try {
			adminGoodsClassificationService.createTag(tagName);
			redirectAttributes.addFlashAttribute("notice", "태그가 등록되었습니다.");
		} catch (ResponseStatusException exception) {
			redirectAttributes.addFlashAttribute("error", classificationErrorMessage(exception));
		}
		return "redirect:/admin/goods/classifications#tags";
	}

	@PostMapping("/admin/goods/tags/{tagId}")
	public String updateTag(
		@PathVariable Long tagId,
		@RequestParam String tagName,
		RedirectAttributes redirectAttributes
	) {
		try {
			adminGoodsClassificationService.updateTag(tagId, tagName);
			redirectAttributes.addFlashAttribute("notice", "태그가 저장되었습니다.");
		} catch (ResponseStatusException exception) {
			redirectAttributes.addFlashAttribute("error", classificationErrorMessage(exception));
		}
		return "redirect:/admin/goods/classifications#tags";
	}

	@PostMapping("/admin/goods/tags/{tagId}/delete")
	public String deleteTag(@PathVariable Long tagId, RedirectAttributes redirectAttributes) {
		try {
			adminGoodsClassificationService.deleteTag(tagId);
			redirectAttributes.addFlashAttribute("notice", "태그가 삭제되었습니다.");
		} catch (ResponseStatusException exception) {
			redirectAttributes.addFlashAttribute("error", classificationErrorMessage(exception));
		}
		return "redirect:/admin/goods/classifications#tags";
	}

	private void addClassificationModel(Model model) {
		List<GoodsFulfillmentType> fulfillmentTypes = Arrays.asList(GoodsFulfillmentType.values());
		model.addAttribute("categories", adminGoodsClassificationService.findCategoryRows());
		model.addAttribute("tags", adminGoodsClassificationService.findTagRows());
		model.addAttribute("fulfillmentTypes", fulfillmentTypes);
		model.addAttribute("defaultFulfillmentType", GoodsFulfillmentType.PHYSICAL.name());
	}

	private String classificationErrorMessage(ResponseStatusException exception) {
		return exception.getReason() == null || exception.getReason().isBlank()
			? "분류 정보를 저장할 수 없습니다. 입력값을 확인해주세요."
			: exception.getReason();
	}
}
