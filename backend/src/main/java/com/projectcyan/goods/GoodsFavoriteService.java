package com.projectcyan.goods;

import java.time.Clock;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GoodsFavoriteService {

	private final GoodsRepository goodsRepository;
	private final GoodsFavoriteRepository goodsFavoriteRepository;
	private final GoodsReviewRepository goodsReviewRepository;
	private final GoodsLikeRepository goodsLikeRepository;
	private final Clock clock;

	@Autowired
	public GoodsFavoriteService(
		GoodsRepository goodsRepository,
		GoodsFavoriteRepository goodsFavoriteRepository,
		GoodsReviewRepository goodsReviewRepository,
		GoodsLikeRepository goodsLikeRepository
	) {
		this(goodsRepository, goodsFavoriteRepository, goodsReviewRepository, goodsLikeRepository, Clock.systemUTC());
	}

	GoodsFavoriteService(
		GoodsRepository goodsRepository,
		GoodsFavoriteRepository goodsFavoriteRepository,
		GoodsReviewRepository goodsReviewRepository,
		GoodsLikeRepository goodsLikeRepository,
		Clock clock
	) {
		this.goodsRepository = goodsRepository;
		this.goodsFavoriteRepository = goodsFavoriteRepository;
		this.goodsReviewRepository = goodsReviewRepository;
		this.goodsLikeRepository = goodsLikeRepository;
		this.clock = clock;
	}

	@Transactional(readOnly = true)
	public List<GoodsSummaryResponse> findFavoriteGoods(Long memberId) {
		List<Long> favoriteGoodsIds = goodsFavoriteRepository
			.findByMemberIdOrderByCreatedAtDescFavoriteIdDesc(memberId)
			.stream()
			.map(GoodsFavorite::getGoodsId)
			.toList();
		if (favoriteGoodsIds.isEmpty()) {
			return List.of();
		}

		Map<Long, Goods> goodsById = new LinkedHashMap<>();
		goodsRepository.findAllById(favoriteGoodsIds)
			.forEach(goods -> goodsById.put(goods.getGoodsId(), goods));
		Map<Long, GoodsReviewSummary> reviewSummaries = goodsReviewRepository.findSummaries(goodsById.keySet());
		Map<Long, Long> likeCounts = goodsLikeRepository.countByGoodsIdIn(goodsById.keySet()).stream()
			.collect(java.util.stream.Collectors.toMap(
				GoodsLikeRepository.GoodsLikeCount::getGoodsId,
				GoodsLikeRepository.GoodsLikeCount::getLikeCount
			));

		return favoriteGoodsIds.stream()
			.map(goodsById::get)
			.filter(goods -> goods != null)
			.map(goods -> GoodsSummaryResponse.from(
				goods,
				reviewSummaries.getOrDefault(goods.getGoodsId(), GoodsReviewSummary.empty()),
				likeCounts.getOrDefault(goods.getGoodsId(), 0L)
			))
			.toList();
	}

	@Transactional
	public void addFavorite(Long memberId, Long goodsId) {
		if (!goodsRepository.existsById(goodsId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found.");
		}
		if (goodsFavoriteRepository.existsByMemberIdAndGoodsId(memberId, goodsId)) {
			return;
		}

		try {
			goodsFavoriteRepository.save(new GoodsFavorite(memberId, goodsId, clock.instant()));
		} catch (DataIntegrityViolationException exception) {
			if (!goodsFavoriteRepository.existsByMemberIdAndGoodsId(memberId, goodsId)) {
				throw exception;
			}
		}
	}

	@Transactional
	public void removeFavorite(Long memberId, Long goodsId) {
		goodsFavoriteRepository.deleteByMemberIdAndGoodsId(memberId, goodsId);
	}
}
