package com.projectcyan.goods;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.validation.Valid;

@Controller
public class AdminGoodsPageController {

	private static final int PAGE_SIZE = 12;
	private static final List<String> SALES_STATUSES = List.of("ON_SALE", "SOLD_OUT", "HIDDEN", "DISCONTINUED");

	private final GoodsService goodsService;
	private final AdminGoodsService adminGoodsService;
	private final GoodsRepository goodsRepository;
	private final GoodsStockRepository goodsStockRepository;

	public AdminGoodsPageController(
		GoodsService goodsService,
		AdminGoodsService adminGoodsService,
		GoodsRepository goodsRepository,
		GoodsStockRepository goodsStockRepository
	) {
		this.goodsService = goodsService;
		this.adminGoodsService = adminGoodsService;
		this.goodsRepository = goodsRepository;
		this.goodsStockRepository = goodsStockRepository;
	}

	@GetMapping("/admin/goods")
	public String listGoods(
		@RequestParam(required = false) String q,
		@RequestParam(required = false) Long artistId,
		@RequestParam(required = false) Long categoryId,
		@RequestParam(defaultValue = "createdAt,desc") String sort,
		@RequestParam(defaultValue = "0") int page,
		Model model
	) {
		PageResponse<GoodsSummaryResponse> goodsPage = goodsService.findGoods(
			q,
			artistId,
			null,
			categoryId,
			null,
			null,
			null,
			page,
			PAGE_SIZE,
			sort
		);

		model.addAttribute("goodsPage", goodsPage);
		model.addAttribute("filters", goodsService.findGoodsFilters());
		model.addAttribute("q", q == null ? "" : q);
		model.addAttribute("artistId", artistId);
		model.addAttribute("categoryId", categoryId);
		model.addAttribute("sort", sort);
		model.addAttribute("pageNumbers", pageNumbers(goodsPage.page(), goodsPage.totalPages()));
		model.addAttribute("salesStatuses", SALES_STATUSES);
		model.addAttribute("stockCounts", stockCounts(goodsPage.content()));
		return "admin/goods/list";
	}

	@GetMapping("/admin/goods/new")
	public String newGoods(Model model) {
		model.addAttribute("form", AdminGoodsForm.empty());
		addFormOptions(model);
		model.addAttribute("mode", "create");
		return "admin/goods/form";
	}

	@GetMapping("/admin/goods/{goodsId}/edit")
	public String editGoods(@PathVariable Long goodsId, Model model) {
		GoodsDetailResponse goods = goodsService.findGoodsDetail(goodsId);
		AdminGoodsForm form = AdminGoodsForm.from(goods);
		form.setCategoryId(findCategoryIdByGoodsId(goodsId));
		form.setStockCount(findStockCount(goodsId));
		model.addAttribute("form", form);
		addFormOptions(model);
		model.addAttribute("mode", "edit");
		return "admin/goods/form";
	}

	@PostMapping("/admin/goods")
	public String createGoods(
		@Valid @ModelAttribute("form") AdminGoodsForm form,
		BindingResult bindingResult,
		Model model,
		RedirectAttributes redirectAttributes
	) {
		if (bindingResult.hasErrors()) {
			addFormOptions(model);
			model.addAttribute("mode", "create");
			return "admin/goods/form";
		}

		GoodsDetailResponse saved = adminGoodsService.createGoods(form.toRequest());
		redirectAttributes.addFlashAttribute("notice", "Goods created.");
		return "redirect:/admin/goods/" + saved.goodsId() + "/edit";
	}

	@PostMapping("/admin/goods/{goodsId}")
	public String updateGoods(
		@PathVariable Long goodsId,
		@Valid @ModelAttribute("form") AdminGoodsForm form,
		BindingResult bindingResult,
		Model model,
		RedirectAttributes redirectAttributes
	) {
		form.setGoodsId(goodsId);
		if (bindingResult.hasErrors()) {
			addFormOptions(model);
			model.addAttribute("mode", "edit");
			return "admin/goods/form";
		}

		adminGoodsService.updateGoods(goodsId, form.toRequest());
		redirectAttributes.addFlashAttribute("notice", "Goods updated.");
		return "redirect:/admin/goods/" + goodsId + "/edit";
	}

	@PostMapping("/admin/goods/{goodsId}/status")
	public String updateStatus(
		@PathVariable Long goodsId,
		@RequestParam String salesStatus,
		RedirectAttributes redirectAttributes
	) {
		adminGoodsService.updateSalesStatus(goodsId, new GoodsStatusUpdateRequest(salesStatus));
		redirectAttributes.addFlashAttribute("notice", "Sales status updated.");
		return "redirect:/admin/goods";
	}

	@PostMapping("/admin/goods/{goodsId}/stock")
	public String updateStock(
		@PathVariable Long goodsId,
		@RequestParam Integer stockCount,
		RedirectAttributes redirectAttributes
	) {
		adminGoodsService.updateStock(goodsId, new GoodsStockUpdateRequest(stockCount));
		redirectAttributes.addFlashAttribute("notice", "Stock updated.");
		return "redirect:/admin/goods";
	}

	@PostMapping("/admin/goods/{goodsId}/delete")
	public String deleteGoods(@PathVariable Long goodsId, RedirectAttributes redirectAttributes) {
		adminGoodsService.deleteGoods(goodsId);
		redirectAttributes.addFlashAttribute("notice", "Goods discontinued.");
		return "redirect:/admin/goods";
	}

	private void addFormOptions(Model model) {
		model.addAttribute("filters", goodsService.findGoodsFilters());
		model.addAttribute("salesStatuses", SALES_STATUSES);
	}

	private Map<Long, Integer> stockCounts(List<GoodsSummaryResponse> goods) {
		List<Long> goodsIds = goods.stream()
			.map(GoodsSummaryResponse::goodsId)
			.toList();
		return goodsStockRepository.findByGoodsIdIn(goodsIds).stream()
			.collect(Collectors.toMap(GoodsStock::getGoodsId, GoodsStock::getCurrentStock));
	}

	private Long findCategoryIdByGoodsId(Long goodsId) {
		return goodsRepository.findById(goodsId)
			.map(Goods::getCategory)
			.map(GoodsCategory::getCategoryId)
			.orElse(null);
	}

	private Integer findStockCount(Long goodsId) {
		return goodsStockRepository.findById(goodsId)
			.map(GoodsStock::getCurrentStock)
			.orElse(0);
	}

	private List<Integer> pageNumbers(int currentPage, int totalPages) {
		if (totalPages < 1) {
			return List.of();
		}

		int maxVisiblePages = 5;
		int halfWindow = maxVisiblePages / 2;
		int startPage = Math.max(0, Math.min(currentPage - halfWindow, totalPages - maxVisiblePages));
		int endPage = Math.min(totalPages, startPage + maxVisiblePages);
		return java.util.stream.IntStream.range(startPage, endPage).boxed().toList();
	}
}
