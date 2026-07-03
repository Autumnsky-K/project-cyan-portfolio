package com.projectcyan.goods;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class GoodsRecommendationServiceTest {

	private GoodsRepository goodsRepository;
	private GoodsStockRepository goodsStockRepository;
	private SearchAliasRepository searchAliasRepository;
	private GoodsRecommendationService service;

	@BeforeEach
	void setUp() {
		goodsRepository = mock(GoodsRepository.class);
		goodsStockRepository = mock(GoodsStockRepository.class);
		searchAliasRepository = mock(SearchAliasRepository.class);
		service = new GoodsRecommendationService(
			goodsRepository,
			goodsStockRepository,
			searchAliasRepository
		);
	}

	@Test
	void expandsAliasesAndReturnsMatchingSaleableGoods() {
		Goods goods = goods(
			42L, "Artist A Photocard", 35_000, "ON_SALE",
			1L, "Artist A", null, null, 1L, "Photocard", "PHOTOCARD"
		);
		GoodsStock stock = new GoodsStock(goods, 10);
		when(goodsRepository.findAllForRecommendation()).thenReturn(List.of(goods));
		when(goodsStockRepository.findByGoodsIdIn(List.of(42L)))
			.thenReturn(List.of(stock));
		when(searchAliasRepository.findMatches(org.mockito.ArgumentMatchers.anyCollection()))
			.thenReturn(List.of(
				new SearchAliasMatch("artist a", 1L, null, null, null, null),
				new SearchAliasMatch("photocard", null, null, null, 11L, "PHOTOCARD")
			));

		PageResponse<GoodsRecommendationResponse> response = service.findCandidates(
			"Artist A Photocard 추천해줘",
			null,
			null,
			null,
			null,
			null,
			null,
			0,
			10,
			"relevance,desc"
		);

		assertThat(response.totalElements()).isEqualTo(1);
		assertThat(response.content().getFirst().goodsId()).isEqualTo(42L);
		assertThat(response.content().getFirst().matchedFields())
			.contains("artistName", "tags");
	}

	@Test
	void requiresGroupAndCategoryAliasesToMatchTogether() {
		Goods exactMatch = goods(
			42L, "Artist A Photocard", 35_000, "ON_SALE",
			1L, "Artist A", 1L, "Group One", 1L, "Photocard", "PHOTOCARD"
		);
		Goods groupOnly = goods(
			43L, "Artist B Lightstick", 45_000, "ON_SALE",
			2L, "Artist B", 1L, "Group One", 3L, "Lightstick", "LIGHTSTICK"
		);
		Goods categoryOnly = goods(
			44L, "Artist C Photocard", 25_000, "ON_SALE",
			3L, "Artist C", 2L, "Group Two", 1L, "Photocard", "PHOTOCARD"
		);
		GoodsStock exactMatchStock = new GoodsStock(exactMatch, 10);
		GoodsStock groupOnlyStock = new GoodsStock(groupOnly, 10);
		GoodsStock categoryOnlyStock = new GoodsStock(categoryOnly, 10);
		when(goodsRepository.findAllForRecommendation()).thenReturn(List.of(exactMatch, groupOnly, categoryOnly));
		when(goodsStockRepository.findByGoodsIdIn(List.of(42L, 43L, 44L)))
			.thenReturn(List.of(
				exactMatchStock,
				groupOnlyStock,
				categoryOnlyStock
			));
		when(searchAliasRepository.findMatches(org.mockito.ArgumentMatchers.anyCollection()))
			.thenReturn(List.of(
				new SearchAliasMatch("group one", null, 1L, null, null, null),
				new SearchAliasMatch("photocard", null, null, 1L, null, null)
			));

		PageResponse<GoodsRecommendationResponse> response = service.findCandidates(
			"group one photocard",
			null,
			null,
			null,
			null,
			null,
			null,
			0,
			10,
			"relevance,desc"
		);

		assertThat(response.content())
			.extracting(GoodsRecommendationResponse::goodsId)
			.containsExactly(42L);
		assertThat(response.content().getFirst().matchedFields())
			.contains("artistGroup", "categoryName");
	}

	@Test
	void resolvesMultiWordGroupAliasInsideQuery() {
		Goods goods = goods(
			45L, "Group One Photocard", 15_000, "ON_SALE",
			1L, "Artist A", 1L, "Group One", 1L, "Photocard", "PHOTOCARD"
		);
		GoodsStock stock = new GoodsStock(goods, 10);
		when(goodsRepository.findAllForRecommendation()).thenReturn(List.of(goods));
		when(goodsStockRepository.findByGoodsIdIn(List.of(45L)))
			.thenReturn(List.of(stock));
		when(searchAliasRepository.findMatches(org.mockito.ArgumentMatchers.argThat(
			aliases -> aliases.contains("group one") && aliases.contains("photocard")
		))).thenReturn(List.of(
			new SearchAliasMatch("group one", null, 1L, null, null, null),
			new SearchAliasMatch("photocard", null, null, 1L, null, null)
		));

		PageResponse<GoodsRecommendationResponse> response = service.findCandidates(
			"group one photocard",
			null,
			null,
			null,
			null,
			null,
			null,
			0,
			10,
			"relevance,desc"
		);

		assertThat(response.content())
			.extracting(GoodsRecommendationResponse::goodsId)
			.containsExactly(45L);
	}

	@Test
	void qOnlyArtistNameMatchesRecommendationFieldsWithoutAiPreprocessing() {
		Goods artistMatch = goods(
			45L, "Artist A Photocard", 15_000, "ON_SALE",
			1L, "Artist A", 1L, "Group One", 1L, "Photocard", "PHOTOCARD"
		);
		Goods otherArtist = goods(
			46L, "Artist B Photocard", 18_000, "ON_SALE",
			2L, "Artist B", 1L, "Group One", 1L, "Photocard", "PHOTOCARD"
		);
		GoodsStock artistMatchStock = new GoodsStock(artistMatch, 10);
		GoodsStock otherArtistStock = new GoodsStock(otherArtist, 10);
		when(goodsRepository.findAllForRecommendation()).thenReturn(List.of(artistMatch, otherArtist));
		when(goodsStockRepository.findByGoodsIdIn(List.of(45L, 46L)))
			.thenReturn(List.of(artistMatchStock, otherArtistStock));
		when(searchAliasRepository.findMatches(org.mockito.ArgumentMatchers.anyCollection()))
			.thenReturn(List.of());

		PageResponse<GoodsRecommendationResponse> response = service.findCandidates(
			"Artist A",
			null,
			null,
			null,
			null,
			null,
			null,
			0,
			10,
			"relevance,desc"
		);

		assertThat(response.content())
			.extracting(GoodsRecommendationResponse::goodsId)
			.containsExactly(45L);
		assertThat(response.content().getFirst().matchedFields())
			.contains("name", "artistName");
	}

	@Test
	void qOnlyPhotocardMatchesCategoryAndTagFieldsWithoutAiPreprocessing() {
		Goods photocard = goods(
			45L, "Artist A Photocard", 15_000, "ON_SALE",
			1L, "Artist A", 1L, "Group One", 1L, "Photocard", "PHOTOCARD"
		);
		Goods lightstick = goods(
			46L, "Artist A Lightstick", 45_000, "ON_SALE",
			1L, "Artist A", 1L, "Group One", 3L, "Lightstick", "LIGHTSTICK"
		);
		GoodsStock photocardStock = new GoodsStock(photocard, 10);
		GoodsStock lightstickStock = new GoodsStock(lightstick, 10);
		when(goodsRepository.findAllForRecommendation()).thenReturn(List.of(photocard, lightstick));
		when(goodsStockRepository.findByGoodsIdIn(List.of(45L, 46L)))
			.thenReturn(List.of(photocardStock, lightstickStock));
		when(searchAliasRepository.findMatches(org.mockito.ArgumentMatchers.anyCollection()))
			.thenReturn(List.of());

		PageResponse<GoodsRecommendationResponse> response = service.findCandidates(
			"photocard",
			null,
			null,
			null,
			null,
			null,
			null,
			0,
			10,
			"relevance,desc"
		);

		assertThat(response.content())
			.extracting(GoodsRecommendationResponse::goodsId)
			.containsExactly(45L);
		assertThat(response.content().getFirst().matchedFields())
			.contains("name", "categoryName", "tags");
	}

	@Test
	void appliesPriceStockAndExcludedIdHardFilters() {
		Goods affordable = goods(
			1L, "Affordable Keyring", 20_000, "ON_SALE",
			null, null, null, null, null, "Keyring", "KEYRING"
		);
		Goods expensive = goods(
			2L, "Expensive Keyring", 60_000, "ON_SALE",
			null, null, null, null, null, "Keyring", "KEYRING"
		);
		Goods soldOut = goods(
			3L, "Sold Out Keyring", 10_000, "ON_SALE",
			null, null, null, null, null, "Keyring", "KEYRING"
		);
		GoodsStock affordableStock = new GoodsStock(affordable, 5);
		GoodsStock expensiveStock = new GoodsStock(expensive, 5);
		GoodsStock soldOutStock = new GoodsStock(soldOut, 0);
		when(goodsRepository.findAllForRecommendation()).thenReturn(List.of(affordable, expensive, soldOut));
		when(goodsStockRepository.findByGoodsIdIn(List.of(1L, 2L, 3L)))
			.thenReturn(List.of(
				affordableStock,
				expensiveStock,
				soldOutStock
			));
		when(searchAliasRepository.findMatches(org.mockito.ArgumentMatchers.anyCollection()))
			.thenReturn(List.of());

		PageResponse<GoodsRecommendationResponse> response = service.findCandidates(
			"키링",
			null,
			null,
			null,
			50_000,
			"1",
			null,
			0,
			10,
			"relevance,desc"
		);

		assertThat(response.content()).isEmpty();
		assertThat(response.totalElements()).isZero();
	}

	@Test
	void preferredArtistIdsBoostRankingWithoutFilteringOtherCandidates() {
		Goods preferred = goods(
			10L, "Simple Keyring", 20_000, "ON_SALE",
			1L, "Artist A", null, null, 1L, "Keyring", "KEYRING"
		);
		Goods strongerTextMatch = goods(
			11L, "Premium Keyring Keyring Keyring", 20_000, "ON_SALE",
			2L, "Artist B", null, null, 1L, "Keyring", "KEYRING"
		);
		List<GoodsStock> stocks = List.of(
			new GoodsStock(preferred, 5),
			new GoodsStock(strongerTextMatch, 5)
		);
		when(goodsRepository.findAllForRecommendation()).thenReturn(List.of(preferred, strongerTextMatch));
		when(goodsStockRepository.findByGoodsIdIn(org.mockito.ArgumentMatchers.anyCollection()))
			.thenReturn(stocks);
		when(searchAliasRepository.findMatches(org.mockito.ArgumentMatchers.anyCollection()))
			.thenReturn(List.of(new SearchAliasMatch("키링", null, null, null, 1L, "KEYRING")));

		PageResponse<GoodsRecommendationResponse> response = service.findCandidates(
			"키링",
			null,
			null,
			null,
			null,
			null,
			"1",
			0,
			10,
			"relevance,desc"
		);

		assertThat(response.content())
			.extracting(GoodsRecommendationResponse::goodsId)
			.containsExactly(10L, 11L);
		assertThat(response.content().getFirst().matchedFields())
			.contains("preferredArtist");
	}

	@Test
	void genericRecommendationUsesPreferredArtistsWithoutTreatingIntentWordsAsFilters() {
		Goods preferred = goods(
			10L, "Artist A Lightstick", 55_000, "ON_SALE",
			1L, "Artist A", null, null, 3L, "Lightstick", "LIGHTSTICK"
		);
		Goods other = goods(
			11L, "Artist B Photocard", 20_000, "ON_SALE",
			2L, "Artist B", null, null, 1L, "Photocard", "PHOTOCARD"
		);
		GoodsStock otherStock = new GoodsStock(other, 5);
		GoodsStock preferredStock = new GoodsStock(preferred, 5);
		when(goodsRepository.findAllForRecommendation()).thenReturn(List.of(other, preferred));
		when(goodsStockRepository.findByGoodsIdIn(org.mockito.ArgumentMatchers.anyCollection()))
			.thenReturn(List.of(otherStock, preferredStock));
		when(searchAliasRepository.findMatches(org.mockito.ArgumentMatchers.anyCollection()))
			.thenReturn(List.of());

		for (String request : List.of(
			"상품 추천해줘",
			"그냥 추천해줘.",
			"추천 좀 해줘!",
			"내가 좋아하는 아티스트를 기준으로 굿즈 추천해주세요"
		)) {
			PageResponse<GoodsRecommendationResponse> response = service.findCandidates(
				request, null, null, null, null, null, "1", 0, 10, "relevance,desc"
			);

			assertThat(response.content())
				.extracting(GoodsRecommendationResponse::goodsId)
				.as(request)
				.containsExactly(10L, 11L);
			assertThat(response.content().getFirst().matchedFields()).contains("preferredArtist");
		}
	}

	@Test
	void genericRecommendationWithoutPreferencesReturnsSaleableDefaults() {
		Goods defaultPick = goods(
			10L, "Artist A Lightstick", 55_000, "ON_SALE",
			1L, "Artist A", null, null, 3L, "Lightstick", "LIGHTSTICK"
		);
		when(defaultPick.getAiPickDefault()).thenReturn(true);
		GoodsStock defaultPickStock = new GoodsStock(defaultPick, 5);
		when(goodsRepository.findAllForRecommendation()).thenReturn(List.of(defaultPick));
		when(goodsStockRepository.findByGoodsIdIn(List.of(10L)))
			.thenReturn(List.of(defaultPickStock));
		when(searchAliasRepository.findMatches(org.mockito.ArgumentMatchers.anyCollection()))
			.thenReturn(List.of());

		PageResponse<GoodsRecommendationResponse> response = service.findCandidates(
			"추천해줘", null, null, null, null, null, null, 0, 10, "relevance,desc"
		);

		assertThat(response.content())
			.extracting(GoodsRecommendationResponse::goodsId)
			.containsExactly(10L);
	}

	@Test
	void explicitArtistOverridesDifferentPreferredArtist() {
		Goods requestedArtist = goods(
			10L, "Artist A Photocard", 20_000, "ON_SALE",
			1L, "Artist A", null, null, 1L, "Photocard", "PHOTOCARD"
		);
		Goods preferredArtist = goods(
			11L, "Artist B Photocard", 20_000, "ON_SALE",
			2L, "Artist B", null, null, 1L, "Photocard", "PHOTOCARD"
		);
		GoodsStock requestedArtistStock = new GoodsStock(requestedArtist, 5);
		GoodsStock preferredArtistStock = new GoodsStock(preferredArtist, 5);
		when(goodsRepository.findAllForRecommendation()).thenReturn(List.of(requestedArtist, preferredArtist));
		when(goodsStockRepository.findByGoodsIdIn(org.mockito.ArgumentMatchers.anyCollection()))
			.thenReturn(List.of(requestedArtistStock, preferredArtistStock));
		when(searchAliasRepository.findMatches(org.mockito.ArgumentMatchers.anyCollection()))
			.thenReturn(List.of(new SearchAliasMatch("artist a", 1L, null, null, null, null)));

		PageResponse<GoodsRecommendationResponse> response = service.findCandidates(
			"Artist A 굿즈 추천해줘", null, null, null, null, null, "2", 0, 10, "relevance,desc"
		);

		assertThat(response.content())
			.extracting(GoodsRecommendationResponse::goodsId)
			.containsExactly(10L);
	}

	private Goods goods(
		long goodsId,
		String name,
		int price,
		String status,
		Long artistId,
		String artistName,
		Long groupId,
		String groupName,
		Long categoryId,
		String categoryName,
		String tagName
	) {
		Goods goods = mock(Goods.class);
		when(goods.getGoodsId()).thenReturn(goodsId);
		when(goods.getGoodsName()).thenReturn(name);
		when(goods.getPrice()).thenReturn(price);
		when(goods.getSalesStatus()).thenReturn(status);
		when(goods.getAiPickDefault()).thenReturn(false);
		when(goods.getBestSeller()).thenReturn(false);
		Tag goodsTag = tag(tagName);
		when(goods.getTags()).thenReturn(new LinkedHashSet<>(Set.of(goodsTag)));

		if (artistId != null) {
			Artist artist = mock(Artist.class);
			when(artist.getArtistId()).thenReturn(artistId);
			when(artist.getArtistName()).thenReturn(artistName);
			if (groupId != null) {
				ArtistGroup artistGroup = mock(ArtistGroup.class);
				when(artistGroup.getGroupId()).thenReturn(groupId);
				when(artistGroup.getGroupName()).thenReturn(groupName);
				when(artist.getArtistGroup()).thenReturn(artistGroup);
				when(artist.getGroupName()).thenReturn(groupName);
			}
			when(goods.getArtist()).thenReturn(artist);
		}
		if (categoryName != null) {
			GoodsCategory category = mock(GoodsCategory.class);
			when(category.getCategoryId()).thenReturn(categoryId);
			when(category.getCategoryName()).thenReturn(categoryName);
			when(goods.getCategory()).thenReturn(category);
		}
		return goods;
	}

	private Tag tag(String name) {
		Tag tag = mock(Tag.class);
		when(tag.getTagName()).thenReturn(name);
		return tag;
	}
}
