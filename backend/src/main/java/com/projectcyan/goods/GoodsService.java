package com.projectcyan.goods;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class GoodsService {

	private static final Set<String> SORT_FIELDS = Set.of("createdAt", "price", "goodsName", "goodsId");

	private final GoodsRepository goodsRepository;
	private final ArtistRepository artistRepository;
	private final GoodsCategoryRepository goodsCategoryRepository;
	private final TagRepository tagRepository;
	private final GoodsStockRepository goodsStockRepository;
	private final GoodsReviewRepository goodsReviewRepository;
	private final GoodsFavoriteRepository goodsFavoriteRepository;

	public GoodsService(
		GoodsRepository goodsRepository,
		ArtistRepository artistRepository,
		GoodsCategoryRepository goodsCategoryRepository,
		TagRepository tagRepository,
		GoodsStockRepository goodsStockRepository,
		GoodsReviewRepository goodsReviewRepository,
		GoodsFavoriteRepository goodsFavoriteRepository
	) {
		this.goodsRepository = goodsRepository;
		this.artistRepository = artistRepository;
		this.goodsCategoryRepository = goodsCategoryRepository;
		this.tagRepository = tagRepository;
		this.goodsStockRepository = goodsStockRepository;
		this.goodsReviewRepository = goodsReviewRepository;
		this.goodsFavoriteRepository = goodsFavoriteRepository;
	}

	public PageResponse<GoodsSummaryResponse> findGoods(
		String q,
		Long artistId,
		String artistIds,
		Long categoryId,
		String categoryIds,
		String tag,
		String tags,
		String goodsIds,
		int page,
		int size,
		String sort
	) {
		List<Long> selectedGoodsIds = parseIds(goodsIds);
		List<Long> selectedArtistIds = parseIds(artistIds);
		if (artistId != null) {
			selectedArtistIds.add(artistId);
		}

		List<Long> selectedCategoryIds = parseIds(categoryIds);
		if (categoryId != null) {
			selectedCategoryIds.add(categoryId);
		}

		List<String> selectedTags = parseNames(tags);
		if (tag != null && !tag.isBlank()) {
			selectedTags.add(tag.trim());
		}

		Specification<Goods> specification = Specification
			.where(GoodsSpecifications.hasGoodsIds(selectedGoodsIds))
			.and(GoodsSpecifications.containsKeyword(q))
			.and(GoodsSpecifications.hasArtists(selectedArtistIds))
			.and(GoodsSpecifications.hasCategories(selectedCategoryIds))
			.and(GoodsSpecifications.hasTags(selectedTags));

		Pageable pageable = PageRequest.of(
			Math.max(page, 0),
			clampPageSize(size),
			parseSort(sort)
		);

		var goodsPage = goodsRepository.findAll(specification, pageable);
		List<Goods> pageGoods = goodsPage.getContent();
		Map<Long, GoodsReviewSummary> reviewSummaries = goodsReviewRepository.findSummaries(
			pageGoods.stream().map(Goods::getGoodsId).toList()
		);
		Map<Long, Long> favoriteCounts = favoriteCounts(pageGoods);
		return new PageResponse<>(
			pageGoods.stream()
				.map(goods -> GoodsSummaryResponse.from(
					goods,
					reviewSummaries.getOrDefault(goods.getGoodsId(), GoodsReviewSummary.empty()),
					favoriteCounts.getOrDefault(goods.getGoodsId(), 0L)
				))
				.toList(),
			goodsPage.getNumber(),
			goodsPage.getSize(),
			goodsPage.getTotalElements(),
			goodsPage.getTotalPages()
		);
	}

	public GoodsDetailResponse findGoodsDetail(Long goodsId) {
		Goods goods = goodsRepository.findById(goodsId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found."));
		goods.setStockCount(goodsStockRepository.findById(goodsId)
			.map(GoodsStock::getCurrentStock)
			.orElse(0));
		PurchaseAvailability availability = purchaseAvailability(goods);
		return GoodsDetailResponse.from(
			goods,
			availability.state(),
			availability.message(),
			goodsReviewRepository.findSummary(goodsId)
		);
	}

	public List<GoodsSummaryResponse> findRelatedGoods(Long goodsId, int size) {
		Goods goods = goodsRepository.findById(goodsId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found."));
		int limit = Math.max(1, Math.min(size, 20));
		LinkedHashMap<Long, Goods> related = new LinkedHashMap<>();

		if (goods.getArtist() != null) {
			goodsRepository.findByArtistArtistIdAndGoodsIdNot(
				goods.getArtist().getArtistId(),
				goodsId,
				PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"))
			).forEach(item -> related.put(item.getGoodsId(), item));
		}
		if (related.size() < limit && goods.getCategory() != null) {
			goodsRepository.findByCategoryCategoryIdAndGoodsIdNot(
				goods.getCategory().getCategoryId(),
				goodsId,
				PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"))
			).forEach(item -> related.putIfAbsent(item.getGoodsId(), item));
		}
		List<Goods> relatedGoods = related.values().stream()
			.limit(limit)
			.toList();
		Map<Long, GoodsReviewSummary> reviewSummaries = goodsReviewRepository.findSummaries(
			relatedGoods.stream().map(Goods::getGoodsId).toList()
		);
		Map<Long, Long> favoriteCounts = favoriteCounts(relatedGoods);
		return relatedGoods.stream()
			.map(item -> GoodsSummaryResponse.from(
				item,
				reviewSummaries.getOrDefault(item.getGoodsId(), GoodsReviewSummary.empty()),
				favoriteCounts.getOrDefault(item.getGoodsId(), 0L)
			))
			.toList();
	}

	private Map<Long, Long> favoriteCounts(List<Goods> goods) {
		List<Long> goodsIds = goods.stream()
			.map(Goods::getGoodsId)
			.toList();
		if (goodsIds.isEmpty()) {
			return Map.of();
		}
		return goodsFavoriteRepository.countByGoodsIdIn(goodsIds).stream()
			.collect(java.util.stream.Collectors.toMap(
				GoodsFavoriteRepository.GoodsFavoriteCount::getGoodsId,
				GoodsFavoriteRepository.GoodsFavoriteCount::getFavoriteCount
			));
	}

	public PageResponse<GoodsReviewResponse> findGoodsReviews(Long goodsId, int page, int size, String sort) {
		if (!goodsRepository.existsById(goodsId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found.");
		}
		return goodsReviewRepository.findReviews(
			goodsId,
			Math.max(page, 0),
			Math.max(1, Math.min(size, 20)),
			sort
		);
	}

	public GoodsReviewSummary findGoodsReviewSummary(Long goodsId) {
		if (!goodsRepository.existsById(goodsId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found.");
		}
		return goodsReviewRepository.findSummary(goodsId);
	}

	public GoodsReviewResponse findMyGoodsReview(Long goodsId, Long memberId) {
		if (!goodsRepository.existsById(goodsId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found.");
		}
		return goodsReviewRepository.findMemberReview(goodsId, memberId).orElse(null);
	}

	@Transactional
	public GoodsReviewResponse createGoodsReview(
		Long goodsId,
		Long memberId,
		String authorName,
		GoodsReviewRequest request
	) {
		if (!goodsRepository.existsById(goodsId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found.");
		}
		validateReviewRequest(request);
		try {
			return goodsReviewRepository.createReview(
				goodsId,
				memberId,
				authorName(authorName),
				request.rating(),
				normalizeOptionLabel(request.optionLabel()),
				request.content().trim()
			);
		} catch (DataIntegrityViolationException exception) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Review already exists.");
		}
	}

	@Transactional
	public GoodsReviewResponse updateGoodsReview(
		Long goodsId,
		Long reviewId,
		Long memberId,
		GoodsReviewRequest request
	) {
		if (!goodsRepository.existsById(goodsId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found.");
		}
		validateReviewRequest(request);
		return goodsReviewRepository.updateReview(
				goodsId,
				reviewId,
				memberId,
				request.rating(),
				normalizeOptionLabel(request.optionLabel()),
				request.content().trim()
			)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found."));
	}

	@Transactional
	public void deleteGoodsReview(Long goodsId, Long reviewId, Long memberId) {
		if (!goodsRepository.existsById(goodsId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found.");
		}
		if (!goodsReviewRepository.deleteReview(goodsId, reviewId, memberId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found.");
		}
	}

	public GoodsFiltersResponse findGoodsFilters() {
		return new GoodsFiltersResponse(
			groupFilterOptions(
				artistRepository.findAllByOrderByArtistNameAsc(),
				Artist::getArtistName,
				artist -> artist.getArtistId().toString()
			),
			groupFilterOptions(
				goodsCategoryRepository.findAllByOrderByCategoryNameAsc(),
				GoodsCategory::getCategoryName,
				category -> category.getCategoryId().toString()
			),
			groupFilterOptions(
				tagRepository.findAllByOrderByTagNameAsc(),
				Tag::getTagName,
				Tag::getTagName
			)
		);
	}

	private <T> List<GoodsFilterOptionResponse> groupFilterOptions(
		List<T> items,
		Function<T, String> labelExtractor,
		Function<T, String> valueExtractor
	) {
		Map<String, FilterOptionGroup> grouped = new LinkedHashMap<>();
		for (T item : items) {
			String label = labelExtractor.apply(item).trim();
			FilterOptionGroup group = grouped.computeIfAbsent(
				label.toLowerCase(Locale.ROOT),
				key -> new FilterOptionGroup(label, new ArrayList<>())
			);
			group.values().add(valueExtractor.apply(item));
		}
		return grouped.values().stream()
			.map(group -> new GoodsFilterOptionResponse(group.label(), String.join("|", group.values())))
			.toList();
	}

	private int clampPageSize(int size) {
		return Math.max(1, Math.min(size, 100));
	}

	private List<Long> parseIds(String rawIds) {
		if (rawIds == null || rawIds.isBlank()) {
			return new ArrayList<>();
		}
		List<Long> ids = new ArrayList<>();
		for (String rawId : rawIds.split(",")) {
			if (!rawId.isBlank()) {
				try {
					ids.add(Long.parseLong(rawId.trim()));
				} catch (NumberFormatException exception) {
					throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid goods filter parameter.");
				}
			}
		}
		return ids;
	}

	private List<String> parseNames(String rawNames) {
		if (rawNames == null || rawNames.isBlank()) {
			return new ArrayList<>();
		}
		List<String> names = new ArrayList<>();
		for (String rawName : rawNames.split(",")) {
			if (!rawName.isBlank()) {
				names.add(rawName.trim());
			}
		}
		return names;
	}

	private Sort parseSort(String rawSort) {
		if (rawSort == null || rawSort.isBlank()) {
			return Sort.by(Sort.Direction.DESC, "createdAt");
		}

		String[] parts = rawSort.split(",", 2);
		String property = parts[0].trim();
		if (!SORT_FIELDS.contains(property)) {
			property = "createdAt";
		}

		Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())
			? Sort.Direction.ASC
			: Sort.Direction.DESC;

		return Sort.by(direction, property);
	}

	private PurchaseAvailability purchaseAvailability(Goods goods) {
		String salesStatus = goods.getSalesStatus() == null
			? ""
			: goods.getSalesStatus().trim().toUpperCase(Locale.ROOT);
		if ("UPCOMING".equals(salesStatus)) {
			return new PurchaseAvailability("UPCOMING", "판매 시작 전입니다.");
		}
		if ("ENDED".equals(salesStatus) || "DISCONTINUED".equals(salesStatus) || "HIDDEN".equals(salesStatus)) {
			return new PurchaseAvailability("UNAVAILABLE", "현재 구매할 수 없는 상품입니다.");
		}
		if ("SOLD_OUT".equals(salesStatus)) {
			return new PurchaseAvailability("SOLD_OUT", "품절된 상품입니다.");
		}
		boolean hasStock = goods.getStockCount() != null && goods.getStockCount() > 0;
		if (!hasStock) {
			return new PurchaseAvailability("SOLD_OUT", "품절된 상품입니다.");
		}
		return new PurchaseAvailability("AVAILABLE", "구매 가능한 상품입니다.");
	}

	private void validateReviewRequest(GoodsReviewRequest request) {
		if (request == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review request is required.");
		}
		if (request.rating() == null || request.rating() < 1 || request.rating() > 5) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5.");
		}
		if (request.content() == null || request.content().trim().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review content is required.");
		}
		if (request.content().trim().length() > 1000) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review content must be 1000 characters or less.");
		}
	}

	private String normalizeOptionLabel(String optionLabel) {
		if (optionLabel == null || optionLabel.isBlank()) {
			return null;
		}
		return optionLabel.trim();
	}

	private String authorName(String rawName) {
		if (rawName == null || rawName.isBlank()) {
			return "Project Cyan Member";
		}
		return rawName.trim();
	}

	private record PurchaseAvailability(String state, String message) {
	}

	private record FilterOptionGroup(String label, List<String> values) {
	}
}
