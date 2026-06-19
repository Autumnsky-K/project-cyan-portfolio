package com.projectcyan.goods;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class GoodsServiceTest {

	private GoodsRepository goodsRepository;
	private GoodsStockRepository goodsStockRepository;
	private GoodsDetailDataRepository goodsDetailDataRepository;
	private GoodsReviewRepository goodsReviewRepository;
	private GoodsService goodsService;

	@BeforeEach
	void setUp() {
		goodsRepository = mock(GoodsRepository.class);
		goodsStockRepository = mock(GoodsStockRepository.class);
		goodsDetailDataRepository = mock(GoodsDetailDataRepository.class);
		goodsReviewRepository = mock(GoodsReviewRepository.class);
		goodsService = new GoodsService(
			goodsRepository,
			mock(ArtistRepository.class),
			mock(GoodsCategoryRepository.class),
			mock(TagRepository.class),
			goodsStockRepository,
			goodsDetailDataRepository,
			goodsReviewRepository
		);
	}

	@Test
	void usesBaseStockWhenGoodsHasNoVariants() {
		GoodsDetailResponse response = findDetail(
			goods("ON_SALE"),
			5,
			metadata(null, null, List.of())
		);

		assertThat(response.purchaseState()).isEqualTo("AVAILABLE");
		assertThat(response.stockCount()).isEqualTo(5);
	}

	@Test
	void usesVariantStockWhenVariantsExist() {
		GoodsVariantResponse soldOutVariant = new GoodsVariantResponse(
			101L,
			"SKU-101",
			0,
			0,
			true,
			Map.of("color", "Blue")
		);

		GoodsDetailResponse response = findDetail(
			goods("ON_SALE"),
			5,
			metadata(null, null, List.of(soldOutVariant))
		);

		assertThat(response.purchaseState()).isEqualTo("SOLD_OUT");
	}

	@Test
	void unavailableSalesStatusOverridesRemainingStock() {
		GoodsDetailResponse response = findDetail(
			goods("HIDDEN"),
			5,
			metadata(null, null, List.of())
		);

		assertThat(response.purchaseState()).isEqualTo("UNAVAILABLE");
	}

	@Test
	void futureSaleStartOverridesRemainingStock() {
		GoodsDetailResponse response = findDetail(
			goods("ON_SALE"),
			5,
			metadata(Instant.now().plusSeconds(3600), null, List.of())
		);

		assertThat(response.purchaseState()).isEqualTo("UPCOMING");
	}

	private GoodsDetailResponse findDetail(Goods goods, int stockCount, GoodsDetailMetadata metadata) {
		GoodsStock stock = new GoodsStock(goods, stockCount);
		when(goodsRepository.findById(goods.getGoodsId())).thenReturn(Optional.of(goods));
		when(goodsStockRepository.findById(goods.getGoodsId())).thenReturn(Optional.of(stock));
		when(goodsDetailDataRepository.findMetadata(goods.getGoodsId())).thenReturn(metadata);
		when(goodsReviewRepository.findSummary(goods.getGoodsId())).thenReturn(GoodsReviewSummary.empty());
		return goodsService.findGoodsDetail(goods.getGoodsId());
	}

	private Goods goods(String salesStatus) {
		Goods goods = new Goods(1L);
		goods.update(
			"Test Goods",
			10000,
			null,
			null,
			null,
			null,
			salesStatus,
			false,
			false,
			new LinkedHashSet<>()
		);
		return goods;
	}

	private GoodsDetailMetadata metadata(
		Instant saleStartAt,
		Instant saleEndAt,
		List<GoodsVariantResponse> variants
	) {
		return new GoodsDetailMetadata(
			"STANDARD",
			saleStartAt,
			saleEndAt,
			new GoodsShippingResponse(0, "Test Carrier", "Domestic", null),
			new GoodsNoticesResponse(null, null, null),
			List.of(),
			variants
		);
	}
}
