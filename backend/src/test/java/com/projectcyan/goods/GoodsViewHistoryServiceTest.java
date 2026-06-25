package com.projectcyan.goods;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class GoodsViewHistoryServiceTest {

	private static final Instant NOW = Instant.parse("2026-06-23T06:00:00Z");

	private GoodsRepository goodsRepository;
	private GoodsViewHistoryRepository goodsViewHistoryRepository;
	private GoodsViewHistoryService service;

	@BeforeEach
	void setUp() {
		goodsRepository = mock(GoodsRepository.class);
		goodsViewHistoryRepository = mock(GoodsViewHistoryRepository.class);
		service = new GoodsViewHistoryService(
			goodsRepository,
			goodsViewHistoryRepository,
			Clock.fixed(NOW, ZoneOffset.UTC)
		);
	}

	@Test
	void savesFirstView() {
		when(goodsRepository.existsById(1001L)).thenReturn(true);
		when(goodsViewHistoryRepository.existsByMemberIdAndGoodsIdAndViewedAtGreaterThanEqual(
			7L,
			1001L,
			NOW.minusSeconds(600)
		)).thenReturn(false);

		service.recordView(7L, 1001L);

		verify(goodsViewHistoryRepository).save(any(GoodsViewHistory.class));
	}

	@Test
	void skipsViewWithinTenMinutes() {
		when(goodsRepository.existsById(1001L)).thenReturn(true);
		when(goodsViewHistoryRepository.existsByMemberIdAndGoodsIdAndViewedAtGreaterThanEqual(
			7L,
			1001L,
			NOW.minusSeconds(600)
		)).thenReturn(true);

		service.recordView(7L, 1001L);

		verify(goodsViewHistoryRepository, never()).save(any());
	}

	@Test
	void rejectsMissingGoods() {
		when(goodsRepository.existsById(9999L)).thenReturn(false);

		assertThatThrownBy(() -> service.recordView(7L, 9999L))
			.isInstanceOf(ResponseStatusException.class)
			.hasMessageContaining("404");

		verify(goodsViewHistoryRepository, never()).save(any());
	}
}
