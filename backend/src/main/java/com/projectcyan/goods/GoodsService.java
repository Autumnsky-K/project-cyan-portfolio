package com.projectcyan.goods;

import java.util.ArrayList;
import java.time.Instant;
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
	private final GoodsDetailDataRepository goodsDetailDataRepository;
	private final GoodsReviewRepository goodsReviewRepository;

	public GoodsService(
		GoodsRepository goodsRepository,
		ArtistRepository artistRepository,
		GoodsCategoryRepository goodsCategoryRepository,
		TagRepository tagRepository,
		GoodsStockRepository goodsStockRepository,
		GoodsDetailDataRepository goodsDetailDataRepository,
		GoodsReviewRepository goodsReviewRepository
	) {
		this.goodsRepository = goodsRepository;
		this.artistRepository = artistRepository;
		this.goodsCategoryRepository = goodsCategoryRepository;
		this.tagRepository = tagRepository;
		this.goodsStockRepository = goodsStockRepository;
		this.goodsDetailDataRepository = goodsDetailDataRepository;
		this.goodsReviewRepository = goodsReviewRepository;
	}

	public PageResponse<GoodsSummaryResponse> findGoods(
		String q,
		Long artistId,
		String artistIds,
		Long categoryId,
		String categoryIds,
		String tag,
		String tags,
		int page,
		int size,
		String sort
	) {
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
			.where(GoodsSpecifications.containsKeyword(q))
			.and(GoodsSpecifications.hasArtists(selectedArtistIds))
			.and(GoodsSpecifications.hasCategories(selectedCategoryIds))
			.and(GoodsSpecifications.hasTags(selectedTags));

		Pageable pageable = PageRequest.of(
			Math.max(page, 0),
			clampPageSize(size),
			parseSort(sort)
		);

		var goodsPage = goodsRepository.findAll(specification, pageable);
		Map<Long, GoodsReviewSummary> reviewSummaries = goodsReviewRepository.findSummaries(
			goodsPage.getContent().stream().map(Goods::getGoodsId).toList()
		);
		return new PageResponse<>(
			goodsPage.getContent().stream()
				.map(goods -> GoodsSummaryResponse.from(
					goods,
					reviewSummaries.getOrDefault(goods.getGoodsId(), GoodsReviewSummary.empty())
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
		GoodsDetailMetadata metadata = goodsDetailDataRepository.findMetadata(goodsId);
		PurchaseAvailability availability = purchaseAvailability(goods, metadata);
		return GoodsDetailResponse.from(
			goods,
			metadata,
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
		return relatedGoods.stream()
			.map(item -> GoodsSummaryResponse.from(
				item,
				reviewSummaries.getOrDefault(item.getGoodsId(), GoodsReviewSummary.empty())
			))
			.toList();
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

	private PurchaseAvailability purchaseAvailability(Goods goods, GoodsDetailMetadata metadata) {
		Instant now = Instant.now();
		if (metadata.saleStartAt() != null && now.isBefore(metadata.saleStartAt())) {
			return new PurchaseAvailability("UPCOMING", "판매 시작 전입니다.");
		}
		if (metadata.saleEndAt() != null && now.isAfter(metadata.saleEndAt())) {
			return new PurchaseAvailability("ENDED", "판매가 종료되었습니다.");
		}
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
		boolean hasStock = metadata.variants().isEmpty()
			? goods.getStockCount() != null && goods.getStockCount() > 0
			: metadata.variants().stream()
				.anyMatch(variant -> Boolean.TRUE.equals(variant.active()) && variant.stockCount() > 0);
		if (!hasStock) {
			return new PurchaseAvailability("SOLD_OUT", "모든 옵션이 품절되었습니다.");
		}
		return new PurchaseAvailability("AVAILABLE", "구매 가능한 상품입니다.");
	}

	private record PurchaseAvailability(String state, String message) {
	}

	private record FilterOptionGroup(String label, List<String> values) {
	}
}
