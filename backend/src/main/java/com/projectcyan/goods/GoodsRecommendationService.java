package com.projectcyan.goods;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class GoodsRecommendationService {

	private static final Set<String> AVAILABLE_STATUSES = Set.of("ON_SALE", "AVAILABLE", "SALE");
	private static final Set<String> SEARCH_STOP_WORDS = Set.of(
		"artist",
		"goods",
		"product",
		"상품",
		"굿즈",
		"추천",
		"추천해줘",
		"보여줘"
	);

	private final GoodsRepository goodsRepository;
	private final GoodsStockRepository goodsStockRepository;
	private final SearchAliasRepository searchAliasRepository;

	public GoodsRecommendationService(
		GoodsRepository goodsRepository,
		GoodsStockRepository goodsStockRepository,
		SearchAliasRepository searchAliasRepository
	) {
		this.goodsRepository = goodsRepository;
		this.goodsStockRepository = goodsStockRepository;
		this.searchAliasRepository = searchAliasRepository;
	}

	public PageResponse<GoodsRecommendationResponse> findCandidates(
		String q,
		String artistName,
		String categoryName,
		String tags,
		Integer maxPrice,
		String excludeGoodsIds,
		int page,
		int size,
		String sort
	) {
		int safePage = Math.max(page, 0);
		int safeSize = Math.max(1, Math.min(size, 20));
		Set<Long> excludedIds = parseIds(excludeGoodsIds);
		SearchContext context = buildSearchContext(q, artistName, categoryName, tags);

		List<Goods> goods = goodsRepository.findAllForRecommendation();
		Map<Long, Integer> stocks = loadStocks(goods);
		List<ScoredGoods> scoredGoods = goods.stream()
			.filter(item -> isEligible(item, stocks.get(item.getGoodsId()), maxPrice, excludedIds))
			.filter(item -> matchesAliasDimensions(item, context))
			.map(item -> score(item, stocks.get(item.getGoodsId()), context, maxPrice))
			.filter(item -> !context.hasSearchTerms() || !item.response().matchedFields().isEmpty())
			.sorted(candidateComparator(sort))
			.toList();

		int fromIndex = Math.min(safePage * safeSize, scoredGoods.size());
		int toIndex = Math.min(fromIndex + safeSize, scoredGoods.size());
		List<GoodsRecommendationResponse> content = scoredGoods.subList(fromIndex, toIndex).stream()
			.map(ScoredGoods::response)
			.toList();
		long totalElements = scoredGoods.size();
		int totalPages = totalElements == 0 ? 0 : (int) Math.ceil((double) totalElements / safeSize);
		return new PageResponse<>(content, safePage, safeSize, totalElements, totalPages);
	}

	private SearchContext buildSearchContext(
		String q,
		String artistName,
		String categoryName,
		String tags
	) {
		Set<String> rawTerms = new LinkedHashSet<>();
		addTerms(rawTerms, q);
		addTerms(rawTerms, artistName);
		addTerms(rawTerms, categoryName);
		for (String tag : splitCommaSeparated(tags)) {
			addTerms(rawTerms, tag);
		}

		List<SearchAliasMatch> aliases = searchAliasRepository.findMatches(rawTerms);
		Set<Long> artistIds = new LinkedHashSet<>();
		Set<Long> groupIds = new LinkedHashSet<>();
		Set<Long> categoryIds = new LinkedHashSet<>();
		Set<String> tagNames = new LinkedHashSet<>();
		Set<String> expandedTerms = new LinkedHashSet<>(rawTerms);

		for (SearchAliasMatch alias : aliases) {
			if (alias.artistId() != null) {
				artistIds.add(alias.artistId());
			}
			if (alias.groupId() != null) {
				groupIds.add(alias.groupId());
			}
			if (alias.categoryId() != null) {
				categoryIds.add(alias.categoryId());
			}
			if (alias.tagId() != null && alias.tagName() != null) {
				String normalizedTagName = normalize(alias.tagName());
				tagNames.add(normalizedTagName);
				expandedTerms.add(normalizedTagName);
			}
		}

		addTerms(expandedTerms, artistName);
		addTerms(expandedTerms, categoryName);
		for (String tag : splitCommaSeparated(tags)) {
			tagNames.add(normalize(tag));
		}
		return new SearchContext(expandedTerms, artistIds, groupIds, categoryIds, tagNames);
	}

	private ScoredGoods score(
		Goods goods,
		Integer stockCount,
		SearchContext context,
		Integer maxPrice
	) {
		int score = 0;
		Set<String> matchedFields = new LinkedHashSet<>();
		String goodsName = normalize(goods.getGoodsName());
		String artistName = goods.getArtist() == null ? "" : normalize(goods.getArtist().getArtistName());
		String groupName = goods.getArtist() == null ? "" : normalize(goods.getArtist().getGroupName());
		String categoryName = goods.getCategory() == null ? "" : normalize(goods.getCategory().getCategoryName());
		Set<String> tags = goods.getTags().stream()
			.map(Tag::getTagName)
			.map(this::normalize)
			.collect(java.util.stream.Collectors.toSet());

		if (goods.getArtist() != null && context.artistIds().contains(goods.getArtist().getArtistId())) {
			score += 100;
			matchedFields.add("artistName");
		}
		if (goods.getArtist() != null
			&& goods.getArtist().getArtistGroup() != null
			&& context.groupIds().contains(goods.getArtist().getArtistGroup().getGroupId())) {
			score += 100;
			matchedFields.add("artistGroup");
		}
		if (goods.getCategory() != null && context.categoryIds().contains(goods.getCategory().getCategoryId())) {
			score += 80;
			matchedFields.add("categoryName");
		}
		if (tags.stream().anyMatch(context.tagNames()::contains)) {
			score += 90;
			matchedFields.add("tags");
		}

		for (String term : context.terms()) {
			if (term.isBlank()) {
				continue;
			}
			if (goodsName.contains(term)) {
				score += goodsName.equals(term) ? 60 : 35;
				matchedFields.add("name");
			}
			if (artistName.contains(term)) {
				score += artistName.equals(term) ? 55 : 30;
				matchedFields.add("artistName");
			}
			if (groupName.contains(term)) {
				score += groupName.equals(term) ? 55 : 30;
				matchedFields.add("artistGroup");
			}
			if (categoryName.contains(term)) {
				score += categoryName.equals(term) ? 45 : 25;
				matchedFields.add("categoryName");
			}
			if (tags.stream().anyMatch(tag -> tag.contains(term) || term.contains(tag))) {
				score += 40;
				matchedFields.add("tags");
			}
		}

		if (Boolean.TRUE.equals(goods.getAiPickDefault())) {
			score += 8;
		}
		if (Boolean.TRUE.equals(goods.getBestSeller())) {
			score += 6;
		}
		if (maxPrice != null && goods.getPrice() != null) {
			score += Math.max(0, 5 - Math.abs(maxPrice - goods.getPrice()) / 10_000);
		}

		List<String> matched = List.copyOf(matchedFields);
		return new ScoredGoods(
			score,
			new GoodsRecommendationResponse(
				goods.getGoodsId(),
				goods.getGoodsName(),
				goods.getPrice(),
				goods.getMainImageUrl(),
				goods.getTags().stream().map(Tag::getTagName).toList(),
				goods.getArtist() == null ? null : goods.getArtist().getArtistName(),
				goods.getCategory() == null ? null : goods.getCategory().getCategoryName(),
				goods.getSalesStatus(),
				stockCount,
				recommendationReason(matched),
				matched
			)
		);
	}

	private boolean matchesAliasDimensions(Goods goods, SearchContext context) {
		if (!context.artistIds().isEmpty()) {
			if (goods.getArtist() == null || !context.artistIds().contains(goods.getArtist().getArtistId())) {
				return false;
			}
		}
		if (!context.groupIds().isEmpty()) {
			if (goods.getArtist() == null
				|| goods.getArtist().getArtistGroup() == null
				|| !context.groupIds().contains(goods.getArtist().getArtistGroup().getGroupId())) {
				return false;
			}
		}
		if (!context.categoryIds().isEmpty()) {
			if (goods.getCategory() == null || !context.categoryIds().contains(goods.getCategory().getCategoryId())) {
				return false;
			}
		}
		if (!context.tagNames().isEmpty()) {
			boolean matchesTag = goods.getTags().stream()
				.map(Tag::getTagName)
				.map(this::normalize)
				.anyMatch(context.tagNames()::contains);
			if (!matchesTag) {
				return false;
			}
		}
		return true;
	}

	private boolean isEligible(
		Goods goods,
		Integer stockCount,
		Integer maxPrice,
		Set<Long> excludedIds
	) {
		if (excludedIds.contains(goods.getGoodsId())) {
			return false;
		}
		if (maxPrice != null && goods.getPrice() != null && goods.getPrice() > maxPrice) {
			return false;
		}
		if (stockCount != null && stockCount <= 0) {
			return false;
		}
		String status = goods.getSalesStatus();
		return status == null || status.isBlank() || AVAILABLE_STATUSES.contains(status.trim().toUpperCase(Locale.ROOT));
	}

	private Map<Long, Integer> loadStocks(List<Goods> goods) {
		if (goods.isEmpty()) {
			return Map.of();
		}
		Map<Long, Integer> stocks = new HashMap<>();
		goodsStockRepository.findByGoodsIdIn(goods.stream().map(Goods::getGoodsId).toList())
			.forEach(stock -> stocks.put(stock.getGoodsId(), stock.getCurrentStock()));
		return stocks;
	}

	private Comparator<ScoredGoods> candidateComparator(String sort) {
		if ("price,asc".equalsIgnoreCase(sort)) {
			return Comparator.<ScoredGoods, Integer>comparing(
				item -> item.response().price(),
				Comparator.nullsLast(Integer::compareTo)
			).thenComparing(ScoredGoods::score, Comparator.reverseOrder());
		}
		if ("price,desc".equalsIgnoreCase(sort)) {
			return Comparator.<ScoredGoods, Integer>comparing(
				item -> item.response().price(),
				Comparator.nullsLast(Comparator.reverseOrder())
			).thenComparing(ScoredGoods::score, Comparator.reverseOrder());
		}
		return Comparator.comparing(ScoredGoods::score).reversed()
			.thenComparing(item -> item.response().goodsId(), Comparator.reverseOrder());
	}

	private String recommendationReason(List<String> matchedFields) {
		if (matchedFields.isEmpty()) {
			return "추천 우선순위가 높은 판매 가능 상품입니다.";
		}
		return String.join(", ", matchedFields) + " 조건과 일치하는 상품입니다.";
	}

	private void addTerms(Set<String> terms, String rawText) {
		String normalized = normalize(rawText);
		if (normalized.isBlank()) {
			return;
		}
		terms.add(normalized);
		String[] tokens = normalized.split("[\\s,]+");
		for (String token : tokens) {
			if (token.length() >= 2 && !SEARCH_STOP_WORDS.contains(token)) {
				terms.add(token);
			}
		}
		for (int start = 0; start < tokens.length; start++) {
			StringBuilder phrase = new StringBuilder();
			for (int end = start; end < Math.min(tokens.length, start + 4); end++) {
				if (!phrase.isEmpty()) {
					phrase.append(' ');
				}
				phrase.append(tokens[end]);
				if (end > start) {
					terms.add(phrase.toString());
				}
			}
		}
	}

	private List<String> splitCommaSeparated(String rawValues) {
		if (rawValues == null || rawValues.isBlank()) {
			return List.of();
		}
		List<String> values = new ArrayList<>();
		for (String value : rawValues.split(",")) {
			if (!value.isBlank()) {
				values.add(value.trim());
			}
		}
		return values;
	}

	private Set<Long> parseIds(String rawIds) {
		Set<Long> ids = new LinkedHashSet<>();
		for (String value : splitCommaSeparated(rawIds)) {
			try {
				ids.add(Long.parseLong(value));
			} catch (NumberFormatException ignored) {
			}
		}
		return ids;
	}

	private String normalize(String value) {
		if (value == null) {
			return "";
		}
		return Normalizer.normalize(value, Normalizer.Form.NFKC)
			.trim()
			.toLowerCase(Locale.ROOT)
			.replaceAll("\\s+", " ");
	}

	private record SearchContext(
		Set<String> terms,
		Set<Long> artistIds,
		Set<Long> groupIds,
		Set<Long> categoryIds,
		Set<String> tagNames
	) {
		boolean hasSearchTerms() {
			return !terms.isEmpty()
				|| !artistIds.isEmpty()
				|| !groupIds.isEmpty()
				|| !categoryIds.isEmpty()
				|| !tagNames.isEmpty();
		}
	}

	private record ScoredGoods(int score, GoodsRecommendationResponse response) {
	}
}
