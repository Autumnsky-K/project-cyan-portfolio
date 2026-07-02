package com.projectcyan.goods;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import com.projectcyan.admin.SupabaseUsageCounter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class AdminGoodsServiceTest {

	private GoodsRepository goodsRepository;
	private GoodsStockRepository goodsStockRepository;
	private AdminGoodsService adminGoodsService;

	@BeforeEach
	void setUp() {
		goodsRepository = mock(GoodsRepository.class);
		goodsStockRepository = mock(GoodsStockRepository.class);
		adminGoodsService = new AdminGoodsService(
			goodsRepository,
			mock(ArtistRepository.class),
			mock(GoodsCategoryRepository.class),
			mock(TagRepository.class),
			goodsStockRepository,
			new GoodsDescriptionSanitizer(),
			new SupabaseUsageCounter(),
			mock(GoodsExtraImageRepository.class)
		);
	}

	@Test
	void createsGoodsStockWithSavedGoodsId() {
		when(goodsRepository.nextGoodsId()).thenReturn(3001L);
		when(goodsRepository.existsById(3001L)).thenReturn(false);
		when(goodsRepository.save(any(Goods.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(goodsStockRepository.save(any(GoodsStock.class))).thenAnswer(invocation -> invocation.getArgument(0));

		GoodsDetailResponse response = adminGoodsService.createGoods(new AdminGoodsRequest(
			null,
			"Test Goods",
			12000,
			"<p>description</p>",
			null,
			null,
			null,
			"ON_SALE",
			false,
			false,
			7,
			List.of(),
			List.of()
		));

		ArgumentCaptor<GoodsStock> stockCaptor = ArgumentCaptor.forClass(GoodsStock.class);
		verify(goodsStockRepository).save(stockCaptor.capture());
		assertThat(stockCaptor.getValue().getGoodsId()).isEqualTo(3001L);
		assertThat(stockCaptor.getValue().getCurrentStock()).isEqualTo(7);
		assertThat(response.goodsId()).isEqualTo(3001L);
		assertThat(response.stockCount()).isEqualTo(7);
	}
}
