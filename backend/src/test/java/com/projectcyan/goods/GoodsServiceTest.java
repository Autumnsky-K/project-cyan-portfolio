package com.projectcyan.goods;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.LinkedHashSet;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class GoodsServiceTest {

	private GoodsRepository goodsRepository;
	private GoodsStockRepository goodsStockRepository;
	private GoodsReviewRepository goodsReviewRepository;
	private GoodsService goodsService;

	@BeforeEach
	void setUp() {
		goodsRepository = mock(GoodsRepository.class);
		goodsStockRepository = mock(GoodsStockRepository.class);
		goodsReviewRepository = mock(GoodsReviewRepository.class);
		goodsService = new GoodsService(
			goodsRepository,
			mock(ArtistRepository.class),
			mock(GoodsCategoryRepository.class),
			mock(TagRepository.class),
			goodsStockRepository,
			goodsReviewRepository
		);
	}

	@Test
	void usesBaseStockWhenGoodsHasNoVariants() {
		GoodsDetailResponse response = findDetail(
			goods("ON_SALE"),
			5
		);

		assertThat(response.purchaseState()).isEqualTo("AVAILABLE");
		assertThat(response.stockCount()).isEqualTo(5);
	}

	@Test
	void reportsSoldOutWhenBaseStockIsEmpty() {
		GoodsDetailResponse response = findDetail(goods("ON_SALE"), 0);
		assertThat(response.purchaseState()).isEqualTo("SOLD_OUT");
	}

	@Test
	void unavailableSalesStatusOverridesRemainingStock() {
		GoodsDetailResponse response = findDetail(
			goods("HIDDEN"),
			5
		);

		assertThat(response.purchaseState()).isEqualTo("UNAVAILABLE");
	}

	@Test
	private GoodsDetailResponse findDetail(Goods goods, int stockCount) {
		GoodsStock stock = new GoodsStock(goods, stockCount);
		when(goodsRepository.findById(goods.getGoodsId())).thenReturn(Optional.of(goods));
		when(goodsStockRepository.findById(goods.getGoodsId())).thenReturn(Optional.of(stock));
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

}
