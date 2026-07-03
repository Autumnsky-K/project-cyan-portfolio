package com.projectcyan.goods;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class GoodsLikeServiceTest {

	private static final Instant NOW = Instant.parse("2026-07-03T03:00:00Z");

	private GoodsRepository goodsRepository;
	private GoodsLikeRepository goodsLikeRepository;
	private GoodsReviewRepository goodsReviewRepository;
	private GoodsLikeService service;

	@BeforeEach
	void setUp() {
		goodsRepository = mock(GoodsRepository.class);
		goodsLikeRepository = mock(GoodsLikeRepository.class);
		goodsReviewRepository = mock(GoodsReviewRepository.class);
		service = new GoodsLikeService(
			goodsRepository,
			goodsLikeRepository,
			goodsReviewRepository,
			Clock.fixed(NOW, ZoneOffset.UTC)
		);
	}

	@Test
	void findsLikedGoodsInLikeOrder() {
		Goods secondGoods = goods(2002L, "Second goods", "ON_SALE");
		Goods firstGoods = goods(1001L, "First goods", "ON_SALE");
		when(goodsLikeRepository.findByMemberIdOrderByCreatedAtDescLikeIdDesc(7L))
			.thenReturn(List.of(
				new GoodsLike(7L, 2002L, NOW),
				new GoodsLike(7L, 1001L, NOW.minusSeconds(10))
			));
		when(goodsRepository.findAllById(List.of(2002L, 1001L))).thenReturn(List.of(firstGoods, secondGoods));
		when(goodsReviewRepository.findSummaries(Set.of(2002L, 1001L))).thenReturn(Map.of());
		when(goodsLikeRepository.countByGoodsIdIn(Set.of(2002L, 1001L))).thenReturn(List.of());

		List<GoodsSummaryResponse> likedGoods = service.findLikedGoods(7L);

		assertThat(likedGoods).extracting(GoodsSummaryResponse::goodsId).containsExactly(2002L, 1001L);
	}

	@Test
	void excludesHiddenGoodsFromLikedGoods() {
		Goods visibleGoods = goods(1001L, "Visible goods", "ON_SALE");
		Goods hiddenGoods = goods(2002L, "Hidden goods", "HIDDEN");
		when(goodsLikeRepository.findByMemberIdOrderByCreatedAtDescLikeIdDesc(7L))
			.thenReturn(List.of(
				new GoodsLike(7L, 2002L, NOW),
				new GoodsLike(7L, 1001L, NOW.minusSeconds(10))
			));
		when(goodsRepository.findAllById(List.of(2002L, 1001L))).thenReturn(List.of(visibleGoods, hiddenGoods));
		when(goodsReviewRepository.findSummaries(Set.of(2002L, 1001L))).thenReturn(Map.of());
		when(goodsLikeRepository.countByGoodsIdIn(Set.of(2002L, 1001L))).thenReturn(List.of());

		List<GoodsSummaryResponse> likedGoods = service.findLikedGoods(7L);

		assertThat(likedGoods).extracting(GoodsSummaryResponse::goodsId).containsExactly(1001L);
	}

	private Goods goods(Long goodsId, String name, String salesStatus) {
		Goods goods = mock(Goods.class);
		when(goods.getGoodsId()).thenReturn(goodsId);
		when(goods.getGoodsName()).thenReturn(name);
		when(goods.getPrice()).thenReturn(1000);
		when(goods.getSalesStatus()).thenReturn(salesStatus);
		when(goods.getTags()).thenReturn(Set.of());
		return goods;
	}
}
