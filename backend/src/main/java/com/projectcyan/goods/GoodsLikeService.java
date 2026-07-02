package com.projectcyan.goods;

import java.time.Clock;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GoodsLikeService {

	private final GoodsRepository goodsRepository;
	private final GoodsLikeRepository goodsLikeRepository;
	private final Clock clock;

	@Autowired
	public GoodsLikeService(GoodsRepository goodsRepository, GoodsLikeRepository goodsLikeRepository) {
		this(goodsRepository, goodsLikeRepository, Clock.systemUTC());
	}

	GoodsLikeService(GoodsRepository goodsRepository, GoodsLikeRepository goodsLikeRepository, Clock clock) {
		this.goodsRepository = goodsRepository;
		this.goodsLikeRepository = goodsLikeRepository;
		this.clock = clock;
	}

	@Transactional(readOnly = true)
	public GoodsLikeResponse findMyLike(Long memberId, Long goodsId) {
		findPublicGoods(goodsId);
		return response(memberId, goodsId);
	}

	@Transactional(readOnly = true)
	public List<GoodsLikeItemResponse> findMyLikes(Long memberId, String goodsIds) {
		List<Long> selectedGoodsIds = parseGoodsIds(goodsIds);
		if (selectedGoodsIds.isEmpty()) {
			return List.of();
		}
		Set<Long> visibleGoodsIds = goodsRepository.findAllById(selectedGoodsIds).stream()
			.filter(GoodsVisibility::isPubliclyVisible)
			.map(Goods::getGoodsId)
			.collect(Collectors.toCollection(LinkedHashSet::new));
		if (visibleGoodsIds.isEmpty()) {
			return List.of();
		}
		Set<Long> likedGoodsIds = new LinkedHashSet<>(goodsLikeRepository.findLikedGoodsIds(memberId, visibleGoodsIds));
		Map<Long, Long> likeCounts = goodsLikeRepository.countByGoodsIdIn(visibleGoodsIds).stream()
			.collect(Collectors.toMap(
				GoodsLikeRepository.GoodsLikeCount::getGoodsId,
				GoodsLikeRepository.GoodsLikeCount::getLikeCount
			));
		return selectedGoodsIds.stream()
			.filter(visibleGoodsIds::contains)
			.map(goodsId -> new GoodsLikeItemResponse(
				goodsId,
				likedGoodsIds.contains(goodsId),
				likeCounts.getOrDefault(goodsId, 0L)
			))
			.toList();
	}

	@Transactional
	public GoodsLikeResponse addLike(Long memberId, Long goodsId) {
		findPublicGoods(goodsId);
		if (!goodsLikeRepository.existsByMemberIdAndGoodsId(memberId, goodsId)) {
			try {
				goodsLikeRepository.save(new GoodsLike(memberId, goodsId, clock.instant()));
			} catch (DataIntegrityViolationException exception) {
				if (!goodsLikeRepository.existsByMemberIdAndGoodsId(memberId, goodsId)) {
					throw exception;
				}
			}
		}
		return response(memberId, goodsId);
	}

	@Transactional
	public GoodsLikeResponse removeLike(Long memberId, Long goodsId) {
		findPublicGoods(goodsId);
		goodsLikeRepository.deleteByMemberIdAndGoodsId(memberId, goodsId);
		return response(memberId, goodsId);
	}

	private Goods findPublicGoods(Long goodsId) {
		Goods goods = goodsRepository.findById(goodsId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found."));
		if (!GoodsVisibility.isPubliclyVisible(goods)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found.");
		}
		return goods;
	}

	private GoodsLikeResponse response(Long memberId, Long goodsId) {
		return new GoodsLikeResponse(
			goodsLikeRepository.existsByMemberIdAndGoodsId(memberId, goodsId),
			goodsLikeRepository.countByGoodsId(goodsId)
		);
	}

	private List<Long> parseGoodsIds(String rawGoodsIds) {
		if (rawGoodsIds == null || rawGoodsIds.isBlank()) {
			return List.of();
		}
		List<Long> goodsIds = new ArrayList<>();
		for (String rawGoodsId : rawGoodsIds.split(",")) {
			if (rawGoodsId.isBlank()) {
				continue;
			}
			try {
				goodsIds.add(Long.parseLong(rawGoodsId.trim()));
			} catch (NumberFormatException exception) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid goodsIds parameter.");
			}
		}
		return goodsIds.stream()
			.distinct()
			.limit(100)
			.toList();
	}
}
