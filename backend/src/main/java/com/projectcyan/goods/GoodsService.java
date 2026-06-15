package com.projectcyan.goods;

import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class GoodsService {

	private static final Set<String> SORT_FIELDS = Set.of("createdAt", "price", "goodsName", "goodsId");

	private final GoodsRepository goodsRepository;

	public GoodsService(GoodsRepository goodsRepository) {
		this.goodsRepository = goodsRepository;
	}

	public PageResponse<GoodsSummaryResponse> findGoods(
		String q,
		Long artistId,
		Long categoryId,
		String tag,
		int page,
		int size,
		String sort
	) {
		Specification<Goods> specification = Specification
			.where(GoodsSpecifications.containsKeyword(q))
			.and(GoodsSpecifications.hasArtist(artistId))
			.and(GoodsSpecifications.hasCategory(categoryId))
			.and(GoodsSpecifications.hasTag(tag));

		Pageable pageable = PageRequest.of(
			Math.max(page, 0),
			clampPageSize(size),
			parseSort(sort)
		);

		return PageResponse.from(goodsRepository.findAll(specification, pageable).map(GoodsSummaryResponse::from));
	}

	public GoodsDetailResponse findGoodsDetail(Long goodsId) {
		return goodsRepository.findById(goodsId)
			.map(GoodsDetailResponse::from)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "해당 상품을 찾을 수 없습니다."));
	}

	private int clampPageSize(int size) {
		return Math.max(1, Math.min(size, 100));
	}

	private Sort parseSort(String rawSort) {
		if (rawSort == null || rawSort.isBlank()) {
			return Sort.by(Sort.Direction.DESC, "createdAt");
		}

		String[] parts = rawSort.split(",", 2);
		String property = parts[0].trim();
		if (!SORT_FIELDS.contains(property)) {
			property = "createdAt";
		}

		Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())
			? Sort.Direction.ASC
			: Sort.Direction.DESC;

		return Sort.by(direction, property);
	}
}
