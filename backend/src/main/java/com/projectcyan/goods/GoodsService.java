package com.projectcyan.goods;

import java.util.ArrayList;
import java.util.List;
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
	private final ArtistRepository artistRepository;
	private final GoodsCategoryRepository goodsCategoryRepository;
	private final TagRepository tagRepository;
	private final GoodsDescriptionSanitizer goodsDescriptionSanitizer;

	public GoodsService(
		GoodsRepository goodsRepository,
		ArtistRepository artistRepository,
		GoodsCategoryRepository goodsCategoryRepository,
		TagRepository tagRepository,
		GoodsDescriptionSanitizer goodsDescriptionSanitizer
	) {
		this.goodsRepository = goodsRepository;
		this.artistRepository = artistRepository;
		this.goodsCategoryRepository = goodsCategoryRepository;
		this.tagRepository = tagRepository;
		this.goodsDescriptionSanitizer = goodsDescriptionSanitizer;
	}

	public PageResponse<GoodsSummaryResponse> findGoods(
		String q,
		Long artistId,
		String artistIds,
		Long categoryId,
		String categoryIds,
		String tag,
		String tags,
		int page,
		int size,
		String sort
	) {
		List<Long> selectedArtistIds = parseIds(artistIds);
		if (artistId != null) {
			selectedArtistIds.add(artistId);
		}

		List<Long> selectedCategoryIds = parseIds(categoryIds);
		if (categoryId != null) {
			selectedCategoryIds.add(categoryId);
		}

		List<String> selectedTags = parseNames(tags);
		if (tag != null && !tag.isBlank()) {
			selectedTags.add(tag.trim());
		}

		Specification<Goods> specification = Specification
			.where(GoodsSpecifications.containsKeyword(q))
			.and(GoodsSpecifications.hasArtists(selectedArtistIds))
			.and(GoodsSpecifications.hasCategories(selectedCategoryIds))
			.and(GoodsSpecifications.hasTags(selectedTags));

		Pageable pageable = PageRequest.of(
			Math.max(page, 0),
			clampPageSize(size),
			parseSort(sort)
		);

		return PageResponse.from(goodsRepository.findAll(specification, pageable).map(GoodsSummaryResponse::from));
	}

	public GoodsDetailResponse findGoodsDetail(Long goodsId) {
		return goodsRepository.findById(goodsId)
			.map(goods -> GoodsDetailResponse.from(goods, goodsDescriptionSanitizer.sanitize(goods.getDescription())))
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found."));
	}

	public GoodsFiltersResponse findGoodsFilters() {
		return new GoodsFiltersResponse(
			artistRepository.findAllByOrderByArtistNameAsc().stream()
				.map(artist -> new GoodsFilterOptionResponse(artist.getArtistName(), artist.getArtistId().toString()))
				.toList(),
			goodsCategoryRepository.findAllByOrderByCategoryNameAsc().stream()
				.map(category -> new GoodsFilterOptionResponse(category.getCategoryName(), category.getCategoryId().toString()))
				.toList(),
			tagRepository.findAllByOrderByTagNameAsc().stream()
				.map(tag -> new GoodsFilterOptionResponse(tag.getTagName(), tag.getTagName()))
				.toList()
		);
	}

	private int clampPageSize(int size) {
		return Math.max(1, Math.min(size, 100));
	}

	private List<Long> parseIds(String rawIds) {
		if (rawIds == null || rawIds.isBlank()) {
			return new ArrayList<>();
		}
		List<Long> ids = new ArrayList<>();
		for (String rawId : rawIds.split(",")) {
			if (!rawId.isBlank()) {
				try {
					ids.add(Long.parseLong(rawId.trim()));
				} catch (NumberFormatException exception) {
					throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid goods filter parameter.");
				}
			}
		}
		return ids;
	}

	private List<String> parseNames(String rawNames) {
		if (rawNames == null || rawNames.isBlank()) {
			return new ArrayList<>();
		}
		List<String> names = new ArrayList<>();
		for (String rawName : rawNames.split(",")) {
			if (!rawName.isBlank()) {
				names.add(rawName.trim());
			}
		}
		return names;
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
