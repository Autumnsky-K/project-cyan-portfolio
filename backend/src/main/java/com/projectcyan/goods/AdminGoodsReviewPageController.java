package com.projectcyan.goods;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.util.UriComponentsBuilder;

@Controller
public class AdminGoodsReviewPageController {

	private final AdminGoodsReviewService adminGoodsReviewService;
	private final String frontendPreviewBaseUrl;

	public AdminGoodsReviewPageController(
		AdminGoodsReviewService adminGoodsReviewService,
		@Value("${project-cyan.frontend.preview-base-url:http://localhost:5173}") String frontendPreviewBaseUrl
	) {
		this.adminGoodsReviewService = adminGoodsReviewService;
		this.frontendPreviewBaseUrl = trimTrailingSlash(frontendPreviewBaseUrl);
	}

	@GetMapping("/admin/goods/reviews")
	public String listReviews(
		@RequestParam(required = false) String q,
		@RequestParam(defaultValue = "0") int page,
		Model model
	) {
		PageResponse<AdminGoodsReviewRow> reviewPage = adminGoodsReviewService.findReviews(q, page);
		model.addAttribute("reviewPage", reviewPage);
		model.addAttribute("q", q == null ? "" : q);
		model.addAttribute("pageNumbers", pageNumbers(reviewPage.page(), reviewPage.totalPages()));
		model.addAttribute("frontendGoodsBaseUrl", frontendPreviewBaseUrl + "/goods");
		return "admin/goods/reviews";
	}

	@PostMapping("/admin/goods/reviews/{reviewId}/delete")
	public String deleteReview(
		@PathVariable Long reviewId,
		@RequestParam(required = false) String q,
		@RequestParam(defaultValue = "0") int page,
		RedirectAttributes redirectAttributes
	) {
		try {
			adminGoodsReviewService.deleteReview(reviewId);
			redirectAttributes.addFlashAttribute("notice", "리뷰가 삭제되었습니다.");
		} catch (ResponseStatusException exception) {
			redirectAttributes.addFlashAttribute("error", "리뷰를 찾을 수 없습니다.");
		}
		return redirectToReviews(q, page);
	}

	private String redirectToReviews(String q, int page) {
		UriComponentsBuilder builder = UriComponentsBuilder.fromPath("/admin/goods/reviews");
		if (q != null && !q.isBlank()) {
			builder.queryParam("q", q.trim());
		}
		builder.queryParam("page", Math.max(page, 0));
		return "redirect:" + builder.build().encode().toUriString();
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

	private static String trimTrailingSlash(String value) {
		if (value == null || value.isBlank()) {
			return "http://localhost:5173";
		}
		return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
	}
}
