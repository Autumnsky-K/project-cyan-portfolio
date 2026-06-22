package com.projectcyan.goods;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/goods")
public class GoodsController {

	private final GoodsService goodsService;
	private final GoodsRecommendationService goodsRecommendationService;

	public GoodsController(
		GoodsService goodsService,
		GoodsRecommendationService goodsRecommendationService
	) {
		this.goodsService = goodsService;
		this.goodsRecommendationService = goodsRecommendationService;
	}

	@GetMapping
	public PageResponse<GoodsSummaryResponse> findGoods(
		@RequestParam(required = false) String q,
		@RequestParam(required = false) Long artistId,
		@RequestParam(required = false) String artistIds,
		@RequestParam(required = false) Long categoryId,
		@RequestParam(required = false) String categoryIds,
		@RequestParam(required = false) String tag,
		@RequestParam(required = false) String tags,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "20") int size,
		@RequestParam(defaultValue = "createdAt,desc") String sort
	) {
		return goodsService.findGoods(q, artistId, artistIds, categoryId, categoryIds, tag, tags, page, size, sort);
	}

	@GetMapping("/recommendation-candidates")
	public PageResponse<GoodsRecommendationResponse> findRecommendationCandidates(
		@RequestParam(required = false) String q,
		@RequestParam(required = false) String artistName,
		@RequestParam(required = false) String categoryName,
		@RequestParam(required = false) String tags,
		@RequestParam(required = false) Integer maxPrice,
		@RequestParam(required = false) String excludeGoodsIds,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size,
		@RequestParam(defaultValue = "relevance,desc") String sort
	) {
		return goodsRecommendationService.findCandidates(
			q,
			artistName,
			categoryName,
			tags,
			maxPrice,
			excludeGoodsIds,
			page,
			size,
			sort
		);
	}

	@GetMapping("/filters")
	public GoodsFiltersResponse findGoodsFilters() {
		return goodsService.findGoodsFilters();
	}

	@GetMapping("/{goodsId}")
	public GoodsDetailResponse findGoodsDetail(@PathVariable Long goodsId) {
		return goodsService.findGoodsDetail(goodsId);
	}

	@GetMapping("/{goodsId}/related")
	public List<GoodsSummaryResponse> findRelatedGoods(
		@PathVariable Long goodsId,
		@RequestParam(defaultValue = "8") int size
	) {
		return goodsService.findRelatedGoods(goodsId, size);
	}

	@GetMapping("/{goodsId}/reviews")
	public PageResponse<GoodsReviewResponse> findGoodsReviews(
		@PathVariable Long goodsId,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "5") int size,
		@RequestParam(defaultValue = "newest") String sort
	) {
		return goodsService.findGoodsReviews(goodsId, page, size, sort);
	}

	@GetMapping("/{goodsId}/reviews/summary")
	public GoodsReviewSummary findGoodsReviewSummary(@PathVariable Long goodsId) {
		return goodsService.findGoodsReviewSummary(goodsId);
	}
}
