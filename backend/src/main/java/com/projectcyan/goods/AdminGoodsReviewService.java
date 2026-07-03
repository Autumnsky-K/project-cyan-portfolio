package com.projectcyan.goods;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminGoodsReviewService {

	private static final int PAGE_SIZE = 20;

	private final GoodsReviewRepository goodsReviewRepository;

	public AdminGoodsReviewService(GoodsReviewRepository goodsReviewRepository) {
		this.goodsReviewRepository = goodsReviewRepository;
	}

	@Transactional(readOnly = true)
	public PageResponse<AdminGoodsReviewRow> findReviews(String q, int page) {
		return goodsReviewRepository.findAdminReviews(q, Math.max(page, 0), PAGE_SIZE);
	}

	@Transactional
	public void deleteReview(Long reviewId) {
		if (!goodsReviewRepository.deleteReviewById(reviewId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found.");
		}
	}
}
