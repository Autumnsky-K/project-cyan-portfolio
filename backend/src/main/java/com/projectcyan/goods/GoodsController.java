package com.projectcyan.goods;

import java.util.List;

import com.projectcyan.member.DigitalLibraryItemResponse;
import com.projectcyan.member.auth.AuthenticatedMember;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/goods")
public class GoodsController {

	private final GoodsService goodsService;
	private final GoodsRecommendationService goodsRecommendationService;
	private final GoodsViewHistoryService goodsViewHistoryService;
	private final GoodsFavoriteService goodsFavoriteService;
	private final GoodsLikeService goodsLikeService;
	private final DigitalGoodsPurchaseService digitalGoodsPurchaseService;

	public GoodsController(
		GoodsService goodsService,
		GoodsRecommendationService goodsRecommendationService,
		GoodsViewHistoryService goodsViewHistoryService,
		GoodsFavoriteService goodsFavoriteService,
		GoodsLikeService goodsLikeService,
		DigitalGoodsPurchaseService digitalGoodsPurchaseService
	) {
		this.goodsService = goodsService;
		this.goodsRecommendationService = goodsRecommendationService;
		this.goodsViewHistoryService = goodsViewHistoryService;
		this.goodsFavoriteService = goodsFavoriteService;
		this.goodsLikeService = goodsLikeService;
		this.digitalGoodsPurchaseService = digitalGoodsPurchaseService;
	}

	@GetMapping
	public PageResponse<GoodsSummaryResponse> findGoods(
		@RequestParam(required = false) String q,
		@RequestParam(required = false) Long artistId,
		@RequestParam(required = false) String artistIds,
		@RequestParam(required = false) Long categoryId,
		@RequestParam(required = false) String categoryIds,
		@RequestParam(required = false) String salesStatus,
		@RequestParam(required = false) String tag,
		@RequestParam(required = false) String tags,
		@RequestParam(required = false) String goodsIds,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "20") int size,
		@RequestParam(defaultValue = "createdAt,desc") String sort,
		@RequestParam(defaultValue = "all") String viewPeriod
	) {
		return goodsService.findPublicGoods(
			q, artistId, artistIds, categoryId, categoryIds, salesStatus, tag, tags, goodsIds, page, size, sort, viewPeriod
		);
	}

	@GetMapping("/recommendation-candidates")
	public PageResponse<GoodsRecommendationResponse> findRecommendationCandidates(
		@RequestParam(required = false) String q,
		@RequestParam(required = false) String artistName,
		@RequestParam(required = false) String categoryName,
		@RequestParam(required = false) String tags,
		@RequestParam(required = false) Integer maxPrice,
		@RequestParam(required = false) String excludeGoodsIds,
		@RequestParam(required = false) String preferredArtistIds,
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
			preferredArtistIds,
			page,
			size,
			sort
		);
	}

	@GetMapping("/filters")
	public GoodsFiltersResponse findGoodsFilters() {
		return goodsService.findGoodsFilters();
	}

	@GetMapping("/home-discovery")
	public GoodsHomeDiscoveryResponse findGoodsHomeDiscovery() {
		return goodsService.findGoodsHomeDiscovery();
	}

	@GetMapping("/favorites")
	public List<GoodsSummaryResponse> findFavoriteGoods(AuthenticatedMember currentMember) {
		return goodsFavoriteService.findFavoriteGoods(currentMember.memberId());
	}

	@GetMapping("/{goodsId}")
	public GoodsDetailResponse findGoodsDetail(@PathVariable Long goodsId) {
		return goodsService.findPublicGoodsDetail(goodsId);
	}

	@GetMapping("/{goodsId}/digital-purchase")
	public ResponseEntity<DigitalLibraryItemResponse> findMyDigitalGoodsPurchase(
		@PathVariable Long goodsId,
		AuthenticatedMember currentMember
	) {
		return digitalGoodsPurchaseService.findPurchased(currentMember.memberId(), goodsId)
			.map(ResponseEntity::ok)
			.orElseGet(() -> ResponseEntity.noContent().build());
	}

	@PostMapping("/{goodsId}/digital-purchase")
	public DigitalLibraryItemResponse purchaseDigitalGoods(
		@PathVariable Long goodsId,
		AuthenticatedMember currentMember
	) {
		return digitalGoodsPurchaseService.claim(currentMember.memberId(), goodsId);
	}

	@PostMapping("/{goodsId}/favorites")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void addFavorite(
		@PathVariable Long goodsId,
		AuthenticatedMember currentMember
	) {
		goodsFavoriteService.addFavorite(currentMember.memberId(), goodsId);
	}

	@DeleteMapping("/{goodsId}/favorites")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void removeFavorite(
		@PathVariable Long goodsId,
		AuthenticatedMember currentMember
	) {
		goodsFavoriteService.removeFavorite(currentMember.memberId(), goodsId);
	}

	@GetMapping("/{goodsId}/likes/my")
	public GoodsLikeResponse findMyLike(
		@PathVariable Long goodsId,
		AuthenticatedMember currentMember
	) {
		return goodsLikeService.findMyLike(currentMember.memberId(), goodsId);
	}

	@GetMapping("/likes")
	public List<GoodsSummaryResponse> findLikedGoods(AuthenticatedMember currentMember) {
		return goodsLikeService.findLikedGoods(currentMember.memberId());
	}

	@GetMapping("/likes/my")
	public List<GoodsLikeItemResponse> findMyLikes(
		@RequestParam(required = false) String goodsIds,
		AuthenticatedMember currentMember
	) {
		return goodsLikeService.findMyLikes(currentMember.memberId(), goodsIds);
	}

	@PostMapping("/{goodsId}/likes")
	public GoodsLikeResponse addLike(
		@PathVariable Long goodsId,
		AuthenticatedMember currentMember
	) {
		return goodsLikeService.addLike(currentMember.memberId(), goodsId);
	}

	@DeleteMapping("/{goodsId}/likes")
	public GoodsLikeResponse removeLike(
		@PathVariable Long goodsId,
		AuthenticatedMember currentMember
	) {
		return goodsLikeService.removeLike(currentMember.memberId(), goodsId);
	}

	@PostMapping("/{goodsId}/views")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void recordGoodsView(
		@PathVariable Long goodsId,
		AuthenticatedMember currentMember
	) {
		goodsViewHistoryService.recordView(currentMember.memberId(), goodsId);
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

	@GetMapping("/{goodsId}/reviews/my")
	public ResponseEntity<GoodsReviewResponse> findMyGoodsReview(
		@PathVariable Long goodsId,
		AuthenticatedMember currentMember
	) {
		GoodsReviewResponse review = goodsService.findMyGoodsReview(goodsId, currentMember.memberId());
		return review == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(review);
	}

	@PostMapping("/{goodsId}/reviews")
	public ResponseEntity<GoodsReviewResponse> createGoodsReview(
		@PathVariable Long goodsId,
		@RequestBody GoodsReviewRequest request,
		AuthenticatedMember currentMember
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(goodsService.createGoodsReview(
				goodsId,
				currentMember.memberId(),
				currentMember.name(),
				request
			));
	}

	@PatchMapping("/{goodsId}/reviews/{reviewId}")
	public GoodsReviewResponse updateGoodsReview(
		@PathVariable Long goodsId,
		@PathVariable Long reviewId,
		@RequestBody GoodsReviewRequest request,
		AuthenticatedMember currentMember
	) {
		return goodsService.updateGoodsReview(goodsId, reviewId, currentMember.memberId(), request);
	}

	@DeleteMapping("/{goodsId}/reviews/{reviewId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteGoodsReview(
		@PathVariable Long goodsId,
		@PathVariable Long reviewId,
		AuthenticatedMember currentMember
	) {
		goodsService.deleteGoodsReview(goodsId, reviewId, currentMember.memberId());
	}
}
