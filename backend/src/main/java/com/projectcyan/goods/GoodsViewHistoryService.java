package com.projectcyan.goods;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GoodsViewHistoryService {

	private static final Duration DUPLICATE_WINDOW = Duration.ofMinutes(10);

	private final GoodsRepository goodsRepository;
	private final GoodsViewHistoryRepository goodsViewHistoryRepository;
	private final Clock clock;

	@Autowired
	public GoodsViewHistoryService(
		GoodsRepository goodsRepository,
		GoodsViewHistoryRepository goodsViewHistoryRepository
	) {
		this(goodsRepository, goodsViewHistoryRepository, Clock.systemUTC());
	}

	GoodsViewHistoryService(
		GoodsRepository goodsRepository,
		GoodsViewHistoryRepository goodsViewHistoryRepository,
		Clock clock
	) {
		this.goodsRepository = goodsRepository;
		this.goodsViewHistoryRepository = goodsViewHistoryRepository;
		this.clock = clock;
	}

	@Transactional
	public void recordView(Long memberId, Long goodsId) {
		Goods goods = goodsRepository.findById(goodsId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found."));
		if (!GoodsVisibility.isPubliclyVisible(goods)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found.");
		}

		Instant viewedAt = clock.instant();
		Instant duplicateThreshold = viewedAt.minus(DUPLICATE_WINDOW);
		boolean recentlyViewed = goodsViewHistoryRepository
			.existsByMemberIdAndGoodsIdAndViewedAtGreaterThanEqual(
				memberId,
				goodsId,
				duplicateThreshold
			);
		if (recentlyViewed) {
			return;
		}

		goodsViewHistoryRepository.save(new GoodsViewHistory(memberId, goodsId, viewedAt));
	}
}
