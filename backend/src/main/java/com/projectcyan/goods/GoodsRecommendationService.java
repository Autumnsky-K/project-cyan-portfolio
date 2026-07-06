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
		"내",
		"내가",
		"그냥",
		"아무거나",
		"좋아하는",
		"선호하는",
		"아티스트",
		"연예인",
		"기준",
		"기반",
		"관련",
		"상품",
		"굿즈",
		"추천",
		"추천해",
		"추천해줘",
		"추천해주세요",
		"해줘",
		"해주세요",
		"좀",
		"좀요",
		"뭐",
		"살까",
		"보여줘",
		"찾아줘",
		"찾아줄래",
		"찾아줄래요",
		"찾아주세요",
		"찾아봐",
		"찾아봐요",
		"장바구니",
		"거",
		"것",
		"쓸만한",
		"쓸만한거",
		"살만한",
		"살만한거",
		"수",
		// "-(으)ㄹ 만하다"는 어떤 동사에나 붙는 범용 보조 구문이라 앞 동사와 무관하게 걸러낸다.
		"만한",
		"만한거",
		"만합니다",
		"만해요",
		"만할까요",
		"만할까",
		// "-아/어 주다"도 마찬가지로 앞 동사와 무관한 범용 보조 동사다.
		"해줄",
		"해줄까",
		"해줄까요",
		"해줄게",
		"해줄게요",
		"해줄래",
		"해줄래요",
		"다른"
	);
	private static final List<String> KOREAN_PARTICLES = List.of(
		"에서는", "에게서", "으로", "에서", "에게", "한테",
		"은", "는", "이", "가", "을", "를", "의", "에", "로", "과", "와", "도", "만"
	);
	// 검색 의도와 무관한 동사/보조용언 어근. 활용형(어미 변화)이 무한하므로
	// 어근 + 어미 조합으로 판정해 개별 활용형을 일일이 등록하지 않아도 되게 한다.
	private static final Set<String> INTENT_VERB_STEMS = Set.of(
		"추천",
		"있",
		"없",
		"싶",
		// "하다"를 포함한 어근을 그대로 등록하면 "-(으)ㄹ" 계열 어미가 붙을 때
		// "하"+"ㄹ"이 "할"로 축약되어 startsWith 매칭이 깨진다("좋아할만한" != "좋아하"+...).
		// 그래서 "하"를 뗀 어근을 등록하고, "하는"/"할" 등 "하"를 포함한 어미로 매칭한다.
		"좋아",
		"선호",
		"부탁",
		"괜찮",
		"좋"
	);
	private static final List<String> KOREAN_VERB_ENDINGS = List.of(
		"하고싶어요", "하고싶어", "고싶어요", "고싶은", "고싶어", "고싶다",
		"해주세요", "해줄래요", "해줄래", "해줘요", "해줘", "해주실",
		"하는", "하고", "하지만", "하지", "하면", "하니까",
		"할래요", "할래", "할까요", "할까", "할게요", "할", "할만한", "을만한",
		"하나요", "하나", "합니다", "해요", "해", "함",
		"습니다", "네요", "네", "음",
		"을까요", "을까", "을래요", "을래",
		"어서", "어도", "어요", "어", "아요", "아",
		"나요", "나", "다면", "다", "은", "는", "은거", "는거",
		"드려요", "드립니다", "드릴게요", "드릴까요", "드려", "드림"
	);

	private static final int DEFAULT_SEMANTIC_CANDIDATE_SIZE = 10;

	private final GoodsRepository goodsRepository;
	private final GoodsStockRepository goodsStockRepository;
	private final SearchAliasRepository searchAliasRepository;
	private final GoodsEmbeddingRepository goodsEmbeddingRepository;
	private final ArtistEmbeddingRepository artistEmbeddingRepository;

	public GoodsRecommendationService(
		GoodsRepository goodsRepository,
		GoodsStockRepository goodsStockRepository,
		SearchAliasRepository searchAliasRepository,
		GoodsEmbeddingRepository goodsEmbeddingRepository,
		ArtistEmbeddingRepository artistEmbeddingRepository
	) {
		this.goodsRepository = goodsRepository;
		this.goodsStockRepository = goodsStockRepository;
		this.searchAliasRepository = searchAliasRepository;
		this.goodsEmbeddingRepository = goodsEmbeddingRepository;
		this.artistEmbeddingRepository = artistEmbeddingRepository;
	}

	public PageResponse<GoodsRecommendationResponse> findCandidates(
		String q,
		String artistName,
		String categoryName,
		String tags,
		Integer maxPrice,
		String excludeGoodsIds,
		String preferredArtistIds,
		int page,
		int size,
		String sort
	) {
		int safePage = Math.max(page, 0);
		int safeSize = Math.max(1, Math.min(size, 20));
		Set<Long> excludedIds = parseIds(excludeGoodsIds);
		Set<Long> preferredIds = parseIds(preferredArtistIds);
		SearchContext context = buildSearchContext(q, artistName, categoryName, tags);

		List<Goods> goods = goodsRepository.findAllForRecommendation();
		Map<Long, Integer> stocks = loadStocks(goods);
		List<ScoredGoods> scoredGoods = goods.stream()
			.filter(item -> isEligible(item, stocks.get(item.getGoodsId()), maxPrice, excludedIds))
			.filter(item -> matchesAliasDimensions(item, context))
			.map(item -> score(item, stocks.get(item.getGoodsId()), context, maxPrice, preferredIds))
			.filter(item -> !context.hasSearchTerms() || hasNonPreferenceMatch(item.response().matchedFields()))
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

	public PageResponse<GoodsRecommendationResponse> findSemanticCandidates(SemanticSearchRequest request) {
		int safeSize = Math.max(1, Math.min(
			request.size() == null ? DEFAULT_SEMANTIC_CANDIDATE_SIZE : request.size(),
			20
		));
		Set<Long> excludedIds = request.excludeGoodsIds() == null
			? Set.of()
			: new LinkedHashSet<>(request.excludeGoodsIds());
		Set<Long> preferredIds = request.preferredArtistIds() == null
			? Set.of()
			: new LinkedHashSet<>(request.preferredArtistIds());
		SearchContext context = buildSearchContext(null, request.artistName(), request.categoryName(), null);

		List<Goods> goods = goodsRepository.findAllForRecommendation();
		Map<Long, Integer> stocks = loadStocks(goods);
		Map<Long, Goods> eligibleGoodsById = goods.stream()
			.filter(item -> isEligible(item, stocks.get(item.getGoodsId()), request.maxPrice(), excludedIds))
			.filter(item -> matchesAliasDimensions(item, context))
			.collect(java.util.stream.Collectors.toMap(Goods::getGoodsId, item -> item));

		if (eligibleGoodsById.isEmpty()) {
			return new PageResponse<>(List.of(), 0, safeSize, 0, 0);
		}

		float[] queryEmbedding = toFloatArray(request.queryEmbedding());
		List<GoodsEmbeddingSimilarityRow> nearest = goodsEmbeddingRepository.findNearestByCandidateIds(
			eligibleGoodsById.keySet(),
			queryEmbedding,
			safeSize
		);

		Map<Long, Double> artistBoostDistanceById = loadArtistBoostDistances(eligibleGoodsById, nearest, preferredIds);

		List<GoodsRecommendationResponse> content = nearest.stream()
			.sorted(
				Comparator.comparingDouble(GoodsEmbeddingSimilarityRow::cosineDistance)
					.thenComparingDouble(row -> artistBoostDistance(
						eligibleGoodsById.get(row.goodsId()),
						preferredIds,
						artistBoostDistanceById
					))
			)
			.map(row -> semanticResponse(
				eligibleGoodsById.get(row.goodsId()),
				stocks.get(row.goodsId()),
				context,
				preferredIds
			))
			.toList();

		return new PageResponse<>(content, 0, safeSize, content.size(), content.isEmpty() ? 0 : 1);
	}

	/**
	 * Cosine distance (via pgvector) is a different unit than the goods-embedding distance used
	 * for the primary ranking, so it is only ever used as a secondary tie-break, never mixed into
	 * the primary score. Falls back to a boolean exact-match boost when no artist embeddings are
	 * populated yet, so this stays a no-op until the Part 3 batch job runs.
	 */
	private Map<Long, Double> loadArtistBoostDistances(
		Map<Long, Goods> eligibleGoodsById,
		List<GoodsEmbeddingSimilarityRow> nearest,
		Set<Long> preferredArtistIds
	) {
		if (preferredArtistIds.isEmpty()) {
			return Map.of();
		}
		Set<Long> candidateArtistIds = nearest.stream()
			.map(row -> eligibleGoodsById.get(row.goodsId()))
			.filter(goods -> goods != null && goods.getArtist() != null)
			.map(goods -> goods.getArtist().getArtistId())
			.collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
		if (candidateArtistIds.isEmpty()) {
			return Map.of();
		}
		return artistEmbeddingRepository.findBestSimilarityToPreferredArtists(candidateArtistIds, preferredArtistIds)
			.stream()
			.collect(java.util.stream.Collectors.toMap(
				ArtistSimilarityRow::candidateArtistId,
				ArtistSimilarityRow::bestCosineDistance
			));
	}

	private double artistBoostDistance(
		Goods goods,
		Set<Long> preferredArtistIds,
		Map<Long, Double> artistBoostDistanceById
	) {
		if (goods == null || goods.getArtist() == null) {
			return Double.MAX_VALUE;
		}
		Long artistId = goods.getArtist().getArtistId();
		if (preferredArtistIds.contains(artistId)) {
			return 0.0;
		}
		return artistBoostDistanceById.getOrDefault(artistId, Double.MAX_VALUE);
	}

	private boolean isPreferredArtist(Goods goods, Set<Long> preferredArtistIds) {
		return goods.getArtist() != null && preferredArtistIds.contains(goods.getArtist().getArtistId());
	}

	private GoodsRecommendationResponse semanticResponse(
		Goods goods,
		Integer stockCount,
		SearchContext context,
		Set<Long> preferredArtistIds
	) {
		Set<String> matchedFields = new LinkedHashSet<>();
		if (goods.getArtist() != null && context.artistIds().contains(goods.getArtist().getArtistId())) {
			matchedFields.add("artistName");
		}
		if (goods.getArtist() != null
			&& goods.getArtist().getArtistGroup() != null
			&& context.groupIds().contains(goods.getArtist().getArtistGroup().getGroupId())) {
			matchedFields.add("artistGroup");
		}
		if (goods.getCategory() != null && context.categoryIds().contains(goods.getCategory().getCategoryId())) {
			matchedFields.add("categoryName");
		}
		if (isPreferredArtist(goods, preferredArtistIds)) {
			matchedFields.add("preferredArtist");
		}
		List<String> matched = List.copyOf(matchedFields);
		return new GoodsRecommendationResponse(
			goods.getGoodsId(),
			goods.getGoodsName(),
			goods.getPrice(),
			goods.getMainImageUrl(),
			goods.getTags().stream().map(Tag::getTagName).toList(),
			goods.getArtist() == null ? null : goods.getArtist().getArtistId(),
			goods.getArtist() == null ? null : goods.getArtist().getArtistName(),
			goods.getCategory() == null ? null : goods.getCategory().getCategoryName(),
			goods.getSalesStatus(),
			stockCount,
			recommendationReason(matched),
			matched
		);
	}

	private float[] toFloatArray(List<Float> values) {
		if (values == null || values.isEmpty()) {
			return new float[0];
		}
		float[] array = new float[values.size()];
		for (int index = 0; index < values.size(); index++) {
			array[index] = values.get(index);
		}
		return array;
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
		Set<String> expandedTerms = rawTerms.stream()
			.filter(term -> !isGenericSearchTerm(term))
			.collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));

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
		Integer maxPrice,
		Set<Long> preferredArtistIds
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
		if (goods.getArtist() != null && preferredArtistIds.contains(goods.getArtist().getArtistId())) {
			score += 20;
			matchedFields.add("preferredArtist");
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
				goods.getArtist() == null ? null : goods.getArtist().getArtistId(),
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

	private boolean hasNonPreferenceMatch(List<String> matchedFields) {
		return matchedFields.stream().anyMatch(field -> !"preferredArtist".equals(field));
	}

	private void addTerms(Set<String> terms, String rawText) {
		String normalized = normalize(rawText);
		if (normalized.isBlank()) {
			return;
		}
		terms.add(normalized);
		String[] tokens = normalized.split("[\\s,]+");
		for (String token : tokens) {
			String cleanToken = trimSearchPunctuation(token);
			if (cleanToken.length() >= 2 && !isStopWord(cleanToken)) {
				terms.add(cleanToken);
			}
			String strippedToken = isStopWord(cleanToken)
				? cleanToken
				: stripKoreanParticle(cleanToken);
			if (strippedToken.length() >= 2 && !isStopWord(strippedToken)) {
				terms.add(strippedToken);
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

	private boolean isGenericSearchTerm(String term) {
		String[] tokens = normalize(term).split("[\\s,]+");
		for (String token : tokens) {
			String cleanToken = trimSearchPunctuation(token);
			String strippedToken = isStopWord(cleanToken)
				? cleanToken
				: stripKoreanParticle(cleanToken);
			if (!strippedToken.isBlank() && !isStopWord(strippedToken)) {
				return false;
			}
		}
		return true;
	}

	private boolean isStopWord(String token) {
		return SEARCH_STOP_WORDS.contains(token) || isIntentVerbForm(token);
	}

	private boolean isIntentVerbForm(String token) {
		for (String stem : INTENT_VERB_STEMS) {
			if (token.length() <= stem.length() || !token.startsWith(stem)) {
				continue;
			}
			String ending = token.substring(stem.length());
			if (ending.startsWith("좀")) {
				ending = ending.substring(1);
			}
			if (ending.isEmpty() || KOREAN_VERB_ENDINGS.contains(ending)) {
				return true;
			}
		}
		return false;
	}

	private String trimSearchPunctuation(String token) {
		return token.replaceAll("^[\\p{P}\\p{S}]+|[\\p{P}\\p{S}]+$", "");
	}

	private String stripKoreanParticle(String token) {
		for (String particle : KOREAN_PARTICLES) {
			if (token.endsWith(particle) && token.length() - particle.length() >= 2) {
				return token.substring(0, token.length() - particle.length());
			}
		}
		return token;
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
