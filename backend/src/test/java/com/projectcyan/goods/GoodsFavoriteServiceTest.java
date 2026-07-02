package com.projectcyan.goods;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class GoodsFavoriteServiceTest {

	private static final Instant NOW = Instant.parse("2026-06-24T03:00:00Z");

	private GoodsRepository goodsRepository;
	private GoodsFavoriteRepository goodsFavoriteRepository;
	private GoodsReviewRepository goodsReviewRepository;
	private GoodsLikeRepository goodsLikeRepository;
	private GoodsFavoriteService service;

	@BeforeEach
	void setUp() {
		goodsRepository = mock(GoodsRepository.class);
		goodsFavoriteRepository = mock(GoodsFavoriteRepository.class);
		goodsReviewRepository = mock(GoodsReviewRepository.class);
		goodsLikeRepository = mock(GoodsLikeRepository.class);
		service = new GoodsFavoriteService(
			goodsRepository,
			goodsFavoriteRepository,
			goodsReviewRepository,
			goodsLikeRepository,
			Clock.fixed(NOW, ZoneOffset.UTC)
		);
	}

	@Test
	void findsFavoriteGoodsInFavoriteOrder() {
		Goods secondGoods = goods(2002L, "Second goods");
		Goods firstGoods = goods(1001L, "First goods");
		when(goodsFavoriteRepository.findByMemberIdOrderByCreatedAtDescFavoriteIdDesc(7L))
			.thenReturn(List.of(
				new GoodsFavorite(7L, 2002L, NOW),
				new GoodsFavorite(7L, 1001L, NOW.minusSeconds(10))
			));
		when(goodsRepository.findAllById(List.of(2002L, 1001L))).thenReturn(List.of(firstGoods, secondGoods));
		when(goodsReviewRepository.findSummaries(Set.of(2002L, 1001L))).thenReturn(Map.of());
		when(goodsLikeRepository.countByGoodsIdIn(Set.of(2002L, 1001L))).thenReturn(List.of());

		List<GoodsSummaryResponse> favorites = service.findFavoriteGoods(7L);

		assertThat(favorites).extracting(GoodsSummaryResponse::goodsId).containsExactly(2002L, 1001L);
	}

	@Test
	void addsFavoriteGoods() {
		Goods goods = goods(1001L, "First goods");
		when(goodsRepository.findById(1001L)).thenReturn(Optional.of(goods));
		when(goodsFavoriteRepository.existsByMemberIdAndGoodsId(7L, 1001L)).thenReturn(false);

		service.addFavorite(7L, 1001L);

		verify(goodsFavoriteRepository).save(any(GoodsFavorite.class));
	}

	@Test
	void skipsExistingFavoriteGoods() {
		Goods goods = goods(1001L, "First goods");
		when(goodsRepository.findById(1001L)).thenReturn(Optional.of(goods));
		when(goodsFavoriteRepository.existsByMemberIdAndGoodsId(7L, 1001L)).thenReturn(true);

		service.addFavorite(7L, 1001L);

		verify(goodsFavoriteRepository, never()).save(any());
	}

	@Test
	void rejectsMissingGoods() {
		when(goodsRepository.findById(9999L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.addFavorite(7L, 9999L))
			.isInstanceOf(ResponseStatusException.class)
			.hasMessageContaining("404");

		verify(goodsFavoriteRepository, never()).save(any());
	}

	@Test
	void removesFavoriteGoods() {
		service.removeFavorite(7L, 1001L);

		verify(goodsFavoriteRepository).deleteByMemberIdAndGoodsId(7L, 1001L);
	}

	private Goods goods(Long goodsId, String name) {
		Goods goods = mock(Goods.class);
		when(goods.getGoodsId()).thenReturn(goodsId);
		when(goods.getGoodsName()).thenReturn(name);
		when(goods.getPrice()).thenReturn(1000);
		when(goods.getTags()).thenReturn(Set.of());
		return goods;
	}
}
