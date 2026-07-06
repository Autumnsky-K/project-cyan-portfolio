package com.projectcyan.goods;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
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

	private static final Set<String> SORT_FIELDS = Set.of(
		"createdAt",
		"price",
		"goodsName",
		"goodsId",
		"artist.artistName",
		"category.categoryName",
		"salesStatus"
	);
	private static final Set<String> DIGITAL_GOODS_KEYWORDS = Set.of(
		"digital",
		"voice",
		"message",
		"download",
		"wallpaper",
		"stream",
		"ticket",
		"ar",
		"pass",
		"디지털",
		"보이스",
		"음성",
		"메시지",
		"메세지",
		"다운로드",
		"월페이퍼",
		"배경화면",
		"스트리밍",
		"티켓",
		"라이브",
		"스티커",
		"패스"
	);
	private static final int HOME_GOODS_SAMPLE_SIZE = 6;
	private static final int HOME_GROUP_LIMIT = 12;

	private final GoodsRepository goodsRepository;
	private final ArtistRepository artistRepository;
	private final GoodsCategoryRepository goodsCategoryRepository;
	private final TagRepository tagRepository;
	private final GoodsStockRepository goodsStockRepository;
	private final GoodsReviewRepository goodsReviewRepository;
	private final GoodsLikeRepository goodsLikeRepository;
	private final GoodsExtraImageRepository goodsExtraImageRepository;
	private final GoodsViewHistoryRepository goodsViewHistoryRepository;

	public GoodsService(
		GoodsRepository goodsRepository,
		ArtistRepository artistRepository,
		GoodsCategoryRepository goodsCategoryRepository,
		TagRepository tagRepository,
		GoodsStockRepository goodsStockRepository,
		GoodsReviewRepository goodsReviewRepository,
		GoodsLikeRepository goodsLikeRepository,
		GoodsExtraImageRepository goodsExtraImageRepository,
		GoodsViewHistoryRepository goodsViewHistoryRepository
	) {
		this.goodsRepository = goodsRepository;
		this.artistRepository = artistRepository;
		this.goodsCategoryRepository = goodsCategoryRepository;
		this.tagRepository = tagRepository;
		this.goodsStockRepository = goodsStockRepository;
		this.goodsReviewRepository = goodsReviewRepository;
		this.goodsLikeRepository = goodsLikeRepository;
		this.goodsExtraImageRepository = goodsExtraImageRepository;
		this.goodsViewHistoryRepository = goodsViewHistoryRepository;
	}

	public PageResponse<GoodsSummaryResponse> findGoods(
		String q,
		Long artistId,
		String artistIds,
		Long categoryId,
		String categoryIds,
		String salesStatus,
		String tag,
		String tags,
		String goodsIds,
		int page,
		int size,
		String sort
	) {
		return findGoods(q, artistId, artistIds, categoryId, categoryIds, salesStatus, tag, tags, goodsIds, page, size, sort, null, false);
	}

	public PageResponse<GoodsSummaryResponse> findPublicGoods(
		String q,
		Long artistId,
		String artistIds,
		Long categoryId,
		String categoryIds,
		String salesStatus,
		String tag,
		String tags,
		String goodsIds,
		int page,
		int size,
		String sort
	) {
		return findPublicGoods(q, artistId, artistIds, categoryId, categoryIds, salesStatus, tag, tags, goodsIds, page, size, sort, null);
	}

	public PageResponse<GoodsSummaryResponse> findPublicGoods(
		String q,
		Long artistId,
		String artistIds,
		Long categoryId,
		String categoryIds,
		String salesStatus,
		String tag,
		String tags,
		String goodsIds,
		int page,
		int size,
		String sort,
		String viewPeriod
	) {
		return findGoods(q, artistId, artistIds, categoryId, categoryIds, salesStatus, tag, tags, goodsIds, page, size, sort, viewPeriod, true);
	}

	private PageResponse<GoodsSummaryResponse> findGoods(
		String q,
		Long artistId,
		String artistIds,
		Long categoryId,
		String categoryIds,
		String salesStatus,
		String tag,
		String tags,
		String goodsIds,
		int page,
		int size,
		String sort,
		String viewPeriod,
		boolean publicOnly
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
			.and(GoodsSpecifications.hasSalesStatus(salesStatus))
			.and(GoodsSpecifications.hasTags(selectedTags));
		if (publicOnly) {
			specification = specification.and(GoodsSpecifications.isPubliclyVisible());
		}

		int normalizedPage = Math.max(page, 0);
		int normalizedSize = clampPageSize(size);

		if (isViewCountSort(sort)) {
			return findGoodsByViewCount(specification, normalizedPage, normalizedSize, viewPeriod);
		}
		if (isLikeCountSort(sort)) {
			return findGoodsByLikeCount(specification, normalizedPage, normalizedSize);
		}

		Pageable pageable = PageRequest.of(normalizedPage, normalizedSize, parseSort(sort));

		var goodsPage = goodsRepository.findAll(specification, pageable);
		List<Goods> pageGoods = goodsPage.getContent();
		Map<Long, GoodsReviewSummary> reviewSummaries = goodsReviewRepository.findSummaries(
			pageGoods.stream().map(Goods::getGoodsId).toList()
		);
		Map<Long, Long> likeCounts = likeCounts(pageGoods);
		return new PageResponse<>(
			pageGoods.stream()
				.map(goods -> GoodsSummaryResponse.from(
					goods,
					reviewSummaries.getOrDefault(goods.getGoodsId(), GoodsReviewSummary.empty()),
					likeCounts.getOrDefault(goods.getGoodsId(), 0L)
				))
				.toList(),
			goodsPage.getNumber(),
			goodsPage.getSize(),
			goodsPage.getTotalElements(),
			goodsPage.getTotalPages()
		);
	}

	private PageResponse<GoodsSummaryResponse> findGoodsByViewCount(
		Specification<Goods> specification,
		int page,
		int size,
		String viewPeriod
	) {
		List<Goods> sortedGoods = new ArrayList<>(
			goodsRepository.findAll(specification, Sort.by(Sort.Direction.DESC, "createdAt"))
		);
		Map<Long, Long> viewCounts = viewCounts(sortedGoods, viewPeriod);
		sortedGoods.sort(Comparator
			.comparing((Goods goods) -> viewCounts.getOrDefault(goods.getGoodsId(), 0L)).reversed()
			.thenComparing(Goods::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
			.thenComparing(Goods::getGoodsId, Comparator.reverseOrder()));

		int totalElements = sortedGoods.size();
		int fromIndex = Math.min(page * size, totalElements);
		int toIndex = Math.min(fromIndex + size, totalElements);
		List<Goods> pageGoods = sortedGoods.subList(fromIndex, toIndex);
		Map<Long, GoodsReviewSummary> reviewSummaries = goodsReviewRepository.findSummaries(
			pageGoods.stream().map(Goods::getGoodsId).toList()
		);
		Map<Long, Long> likeCounts = likeCounts(pageGoods);
		return new PageResponse<>(
			pageGoods.stream()
				.map(goods -> GoodsSummaryResponse.from(
					goods,
					reviewSummaries.getOrDefault(goods.getGoodsId(), GoodsReviewSummary.empty()),
					likeCounts.getOrDefault(goods.getGoodsId(), 0L)
				))
				.toList(),
			page,
			size,
			totalElements,
			(int) Math.ceil((double) totalElements / size)
		);
	}

	private PageResponse<GoodsSummaryResponse> findGoodsByLikeCount(
		Specification<Goods> specification,
		int page,
		int size
	) {
		List<Goods> sortedGoods = new ArrayList<>(
			goodsRepository.findAll(specification, Sort.by(Sort.Direction.DESC, "createdAt"))
		);
		Map<Long, Long> likeCounts = likeCounts(sortedGoods);
		sortedGoods.sort(Comparator
			.comparing((Goods goods) -> likeCounts.getOrDefault(goods.getGoodsId(), 0L)).reversed()
			.thenComparing(Goods::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
			.thenComparing(Goods::getGoodsId, Comparator.reverseOrder()));

		int totalElements = sortedGoods.size();
		int fromIndex = Math.min(page * size, totalElements);
		int toIndex = Math.min(fromIndex + size, totalElements);
		List<Goods> pageGoods = sortedGoods.subList(fromIndex, toIndex);
		Map<Long, GoodsReviewSummary> reviewSummaries = goodsReviewRepository.findSummaries(
			pageGoods.stream().map(Goods::getGoodsId).toList()
		);
		Map<Long, Long> pageLikeCounts = likeCounts(pageGoods);
		return new PageResponse<>(
			pageGoods.stream()
				.map(goods -> GoodsSummaryResponse.from(
					goods,
					reviewSummaries.getOrDefault(goods.getGoodsId(), GoodsReviewSummary.empty()),
					pageLikeCounts.getOrDefault(goods.getGoodsId(), 0L)
				))
				.toList(),
			page,
			size,
			totalElements,
			(int) Math.ceil((double) totalElements / size)
		);
	}

	public GoodsDetailResponse findGoodsDetail(Long goodsId) {
		return detailResponse(findGoods(goodsId));
	}

	public GoodsDetailResponse findPublicGoodsDetail(Long goodsId) {
		Goods goods = findGoods(goodsId);
		if (!GoodsVisibility.isPubliclyVisible(goods)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found.");
		}
		return detailResponse(goods);
	}

	public GoodsHomeDiscoveryResponse findGoodsHomeDiscovery() {
		List<Goods> publicGoods = goodsRepository.findAllForRecommendation().stream()
			.filter(GoodsVisibility::isPubliclyVisible)
			.sorted(recentGoodsFirst())
			.toList();
		List<Goods> digitalGoods = publicGoods.stream()
			.filter(this::isDigitalGoods)
			.toList();
		List<Goods> physicalGoods = publicGoods.stream()
			.filter(goods -> !isDigitalGoods(goods))
			.toList();

		return new GoodsHomeDiscoveryResponse(
			summaryResponses(physicalGoods, HOME_GOODS_SAMPLE_SIZE),
			summaryResponses(digitalGoods, HOME_GOODS_SAMPLE_SIZE),
			groupGoodsByArtist(publicGoods, HOME_GROUP_LIMIT),
			groupGoodsByCategory(publicGoods, HOME_GROUP_LIMIT),
			groupGoodsByCategory(physicalGoods, HOME_GROUP_LIMIT),
			groupGoodsByCategory(digitalGoods, HOME_GROUP_LIMIT),
			groupDigitalTags(digitalGoods, HOME_GROUP_LIMIT),
			publicGoods.size(),
			physicalGoods.size(),
			digitalGoods.size()
		);
	}

	private GoodsDetailResponse detailResponse(Goods goods) {
		Long goodsId = goods.getGoodsId();
		Integer stockCount = goodsStockRepository.findById(goodsId)
			.map(GoodsStock::getCurrentStock)
			.orElse(0);
		goods.setStockCount(isDigitalGoods(goods) ? 1 : stockCount);
		PurchaseAvailability availability = purchaseAvailability(goods);
		return GoodsDetailResponse.from(
			goods,
			availability.state(),
			availability.message(),
			goodsReviewRepository.findSummary(goodsId),
			goodsLikeRepository.countByGoodsId(goodsId),
			goodsExtraImageRepository.findByGoodsGoodsIdOrderBySortOrderAscImageIdAsc(goodsId).stream()
				.map(GoodsExtraImageResponse::from)
				.toList()
		);
	}

	public List<GoodsSummaryResponse> findRelatedGoods(Long goodsId, int size) {
		Goods goods = findGoods(goodsId);
		if (!GoodsVisibility.isPubliclyVisible(goods)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found.");
		}
		int limit = Math.max(1, Math.min(size, 20));
		LinkedHashMap<Long, Goods> related = new LinkedHashMap<>();

		if (goods.getArtist() != null) {
			goodsRepository.findByArtistArtistIdAndGoodsIdNot(
				goods.getArtist().getArtistId(),
				goodsId,
				PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"))
			).stream()
				.filter(GoodsVisibility::isPubliclyVisible)
				.forEach(item -> related.put(item.getGoodsId(), item));
		}
		if (related.size() < limit && goods.getCategory() != null) {
			goodsRepository.findByCategoryCategoryIdAndGoodsIdNot(
				goods.getCategory().getCategoryId(),
				goodsId,
				PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"))
			).stream()
				.filter(GoodsVisibility::isPubliclyVisible)
				.forEach(item -> related.putIfAbsent(item.getGoodsId(), item));
		}
		List<Goods> relatedGoods = related.values().stream()
			.limit(limit)
			.toList();
		Map<Long, GoodsReviewSummary> reviewSummaries = goodsReviewRepository.findSummaries(
			relatedGoods.stream().map(Goods::getGoodsId).toList()
		);
		Map<Long, Long> likeCounts = likeCounts(relatedGoods);
		return relatedGoods.stream()
			.map(item -> GoodsSummaryResponse.from(
				item,
				reviewSummaries.getOrDefault(item.getGoodsId(), GoodsReviewSummary.empty()),
				likeCounts.getOrDefault(item.getGoodsId(), 0L)
			))
			.toList();
	}

	private Map<Long, Long> likeCounts(List<Goods> goods) {
		List<Long> goodsIds = goods.stream()
			.map(Goods::getGoodsId)
			.toList();
		if (goodsIds.isEmpty()) {
			return Map.of();
		}
		return goodsLikeRepository.countByGoodsIdIn(goodsIds).stream()
			.collect(java.util.stream.Collectors.toMap(
				GoodsLikeRepository.GoodsLikeCount::getGoodsId,
				GoodsLikeRepository.GoodsLikeCount::getLikeCount
			));
	}

	private List<GoodsSummaryResponse> summaryResponses(List<Goods> goods, int limit) {
		List<Goods> selectedGoods = goods.stream()
			.limit(limit)
			.toList();
		if (selectedGoods.isEmpty()) {
			return List.of();
		}
		Map<Long, GoodsReviewSummary> reviewSummaries = goodsReviewRepository.findSummaries(
			selectedGoods.stream().map(Goods::getGoodsId).toList()
		);
		Map<Long, Long> likeCounts = likeCounts(selectedGoods);
		return selectedGoods.stream()
			.map(item -> GoodsSummaryResponse.from(
				item,
				reviewSummaries.getOrDefault(item.getGoodsId(), GoodsReviewSummary.empty()),
				likeCounts.getOrDefault(item.getGoodsId(), 0L)
			))
			.toList();
	}

	private Comparator<Goods> recentGoodsFirst() {
		return Comparator
			.comparing(Goods::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
			.thenComparing(Goods::getGoodsId, Comparator.nullsLast(Comparator.reverseOrder()));
	}

	private List<GoodsHomeDiscoveryGroupResponse> groupGoodsByArtist(List<Goods> goods, int limit) {
		Map<String, HomeDiscoveryGroup> grouped = new LinkedHashMap<>();
		for (Goods item : goods) {
			Artist artist = item.getArtist();
			if (artist == null || artist.getArtistId() == null) {
				continue;
			}
			addHomeDiscoveryGroup(
				grouped,
				artist.getArtistName(),
				artist.getArtistId().toString(),
				item.getMainImageUrl()
			);
		}
		return homeDiscoveryGroupResponses(grouped, limit);
	}

	private List<GoodsHomeDiscoveryGroupResponse> groupGoodsByCategory(List<Goods> goods, int limit) {
		Map<String, HomeDiscoveryGroup> grouped = new LinkedHashMap<>();
		for (Goods item : goods) {
			GoodsCategory category = item.getCategory();
			if (category == null || category.getCategoryId() == null) {
				continue;
			}
			addHomeDiscoveryGroup(
				grouped,
				category.getCategoryName(),
				category.getCategoryId().toString(),
				item.getMainImageUrl()
			);
		}
		return homeDiscoveryGroupResponses(grouped, limit);
	}

	private List<GoodsHomeDiscoveryGroupResponse> groupDigitalTags(List<Goods> goods, int limit) {
		Map<String, HomeDiscoveryGroup> grouped = new LinkedHashMap<>();
		for (Goods item : goods) {
			for (Tag tag : item.getTags()) {
				if (isDigitalText(tag.getTagName())) {
					addHomeDiscoveryGroup(grouped, tag.getTagName(), tag.getTagName(), item.getMainImageUrl());
				}
			}
		}
		return homeDiscoveryGroupResponses(grouped, limit);
	}

	private void addHomeDiscoveryGroup(
		Map<String, HomeDiscoveryGroup> grouped,
		String rawLabel,
		String rawValue,
		String imageUrl
	) {
		if (rawLabel == null || rawLabel.isBlank() || rawValue == null || rawValue.isBlank()) {
			return;
		}
		String label = rawLabel.trim();
		HomeDiscoveryGroup group = grouped.computeIfAbsent(
			label.toLowerCase(Locale.ROOT),
			key -> new HomeDiscoveryGroup(label)
		);
		group.add(rawValue.trim(), imageUrl);
	}

	private List<GoodsHomeDiscoveryGroupResponse> homeDiscoveryGroupResponses(
		Map<String, HomeDiscoveryGroup> grouped,
		int limit
	) {
		return grouped.values().stream()
			.sorted(Comparator
				.comparingLong(HomeDiscoveryGroup::count).reversed()
				.thenComparing(group -> group.label().toLowerCase(Locale.ROOT)))
			.limit(limit)
			.map(group -> new GoodsHomeDiscoveryGroupResponse(
				group.label(),
				String.join("|", group.values()),
				group.count(),
				group.imageUrl()
			))
			.toList();
	}

	private boolean isDigitalGoods(Goods goods) {
		if (goods == null) {
			return false;
		}
		if (goods.getCategory() != null) {
			return goods.getCategory().getFulfillmentType() == GoodsFulfillmentType.DIGITAL;
		}
		if (isDigitalText(goods.getGoodsName())) {
			return true;
		}
		return goods.getTags().stream()
			.map(Tag::getTagName)
			.anyMatch(this::isDigitalText);
	}

	private boolean isDigitalText(String value) {
		if (value == null || value.isBlank()) {
			return false;
		}
		String normalizedValue = value.toLowerCase(Locale.ROOT);
		return DIGITAL_GOODS_KEYWORDS.stream().anyMatch(normalizedValue::contains);
	}

	private Map<Long, Long> viewCounts(List<Goods> goods, String viewPeriod) {
		List<Long> goodsIds = goods.stream()
			.map(Goods::getGoodsId)
			.toList();
		if (goodsIds.isEmpty()) {
			return Map.of();
		}
		Instant viewedAt = viewPeriodStart(viewPeriod);
		List<GoodsViewHistoryRepository.GoodsViewCount> counts = viewedAt == null
			? goodsViewHistoryRepository.countByGoodsIdIn(goodsIds)
			: goodsViewHistoryRepository.countByGoodsIdInSince(goodsIds, viewedAt);
		return counts.stream()
			.collect(java.util.stream.Collectors.toMap(
				GoodsViewHistoryRepository.GoodsViewCount::getGoodsId,
				GoodsViewHistoryRepository.GoodsViewCount::getViewCount
			));
	}

	private Instant viewPeriodStart(String viewPeriod) {
		if (viewPeriod == null || viewPeriod.isBlank()) {
			return null;
		}
		return switch (viewPeriod.trim().toLowerCase(Locale.ROOT)) {
			case "day" -> Instant.now().minus(Duration.ofDays(1));
			case "7d" -> Instant.now().minus(Duration.ofDays(7));
			case "30d" -> Instant.now().minus(Duration.ofDays(30));
			default -> null;
		};
	}

	public PageResponse<GoodsReviewResponse> findGoodsReviews(Long goodsId, int page, int size, String sort) {
		findPublicGoods(goodsId);
		return goodsReviewRepository.findReviews(
			goodsId,
			Math.max(page, 0),
			Math.max(1, Math.min(size, 20)),
			sort
		);
	}

	public GoodsReviewSummary findGoodsReviewSummary(Long goodsId) {
		findPublicGoods(goodsId);
		return goodsReviewRepository.findSummary(goodsId);
	}

	public GoodsReviewResponse findMyGoodsReview(Long goodsId, Long memberId) {
		findPublicGoods(goodsId);
		return goodsReviewRepository.findMemberReview(goodsId, memberId).orElse(null);
	}

	@Transactional
	public GoodsReviewResponse createGoodsReview(
		Long goodsId,
		Long memberId,
		String authorName,
		GoodsReviewRequest request
	) {
		findPublicGoods(goodsId);
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
		findPublicGoods(goodsId);
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
		findPublicGoods(goodsId);
		if (!goodsReviewRepository.deleteReview(goodsId, reviewId, memberId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found.");
		}
	}

	private Goods findGoods(Long goodsId) {
		return goodsRepository.findById(goodsId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found."));
	}

	private Goods findPublicGoods(Long goodsId) {
		Goods goods = findGoods(goodsId);
		if (!GoodsVisibility.isPubliclyVisible(goods)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found.");
		}
		return goods;
	}

	public void ensureGoodsVisible(Long goodsId) {
		findPublicGoods(goodsId);
	}

	public GoodsFiltersResponse findGoodsFilters() {
		return new GoodsFiltersResponse(
			artistFilterOptions(artistRepository.findAllByOrderByArtistNameAsc()),
			categoryFilterOptions(goodsCategoryRepository.findAllByOrderByCategoryNameAsc()),
			groupFilterOptions(
				tagRepository.findAllByOrderByTagNameAsc(),
				Tag::getTagName,
				Tag::getTagName
			)
		);
	}

	private List<GoodsFilterOptionResponse> artistFilterOptions(List<Artist> artists) {
		Map<String, ArtistFilterOptionGroup> grouped = new LinkedHashMap<>();
		for (Artist artist : artists) {
			String label = artist.getArtistName().trim();
			String groupName = normalizeArtistGroupName(artist.getGroupName());
			String groupValue = artist.getArtistGroup() == null ? null : artist.getArtistGroup().getGroupId().toString();
			String key = "%s:%s".formatted(label.toLowerCase(Locale.ROOT), groupName.toLowerCase(Locale.ROOT));
			ArtistFilterOptionGroup group = grouped.computeIfAbsent(
				key,
				ignored -> new ArtistFilterOptionGroup(label, groupName, groupValue, new ArrayList<>())
			);
			group.values().add(artist.getArtistId().toString());
		}
		return grouped.values().stream()
			.map(group -> GoodsFilterOptionResponse.artist(
				group.label(),
				String.join("|", group.values()),
				group.groupName(),
				group.groupValue()
			))
			.toList();
	}

	private String normalizeArtistGroupName(String groupName) {
		if (groupName == null || groupName.isBlank()) {
			return "기타";
		}
		return groupName.trim();
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

	private List<GoodsFilterOptionResponse> categoryFilterOptions(List<GoodsCategory> categories) {
		return categories.stream()
			.map(category -> new GoodsFilterOptionResponse(
				category.getCategoryName(),
				category.getCategoryId().toString(),
				category.getFulfillmentType().name()
			))
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

	private boolean isViewCountSort(String rawSort) {
		if (rawSort == null || rawSort.isBlank()) {
			return false;
		}
		return "viewCount".equalsIgnoreCase(rawSort.split(",", 2)[0].trim());
	}

	private boolean isLikeCountSort(String rawSort) {
		if (rawSort == null || rawSort.isBlank()) {
			return false;
		}
		return "likeCount".equalsIgnoreCase(rawSort.split(",", 2)[0].trim());
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
		if (!isDigitalGoods(goods) && !hasStock) {
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

	private record ArtistFilterOptionGroup(String label, String groupName, String groupValue, List<String> values) {
	}

	private static final class HomeDiscoveryGroup {
		private final String label;
		private final List<String> values = new ArrayList<>();
		private long count;
		private String imageUrl;

		private HomeDiscoveryGroup(String label) {
			this.label = label;
		}

		private void add(String value, String nextImageUrl) {
			if (!values.contains(value)) {
				values.add(value);
			}
			count += 1;
			if ((imageUrl == null || imageUrl.isBlank()) && nextImageUrl != null && !nextImageUrl.isBlank()) {
				imageUrl = nextImageUrl;
			}
		}

		private String label() {
			return label;
		}

		private List<String> values() {
			return values;
		}

		private long count() {
			return count;
		}

		private String imageUrl() {
			return imageUrl;
		}
	}
}
