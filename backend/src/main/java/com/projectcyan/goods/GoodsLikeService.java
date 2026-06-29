package com.projectcyan.goods;

import java.time.Clock;

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
		if (!goodsRepository.existsById(goodsId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found.");
		}
		return response(memberId, goodsId);
	}

	@Transactional
	public GoodsLikeResponse addLike(Long memberId, Long goodsId) {
		if (!goodsRepository.existsById(goodsId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found.");
		}
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
		if (!goodsRepository.existsById(goodsId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found.");
		}
		goodsLikeRepository.deleteByMemberIdAndGoodsId(memberId, goodsId);
		return response(memberId, goodsId);
	}

	private GoodsLikeResponse response(Long memberId, Long goodsId) {
		return new GoodsLikeResponse(
			goodsLikeRepository.existsByMemberIdAndGoodsId(memberId, goodsId),
			goodsLikeRepository.countByGoodsId(goodsId)
		);
	}
}
