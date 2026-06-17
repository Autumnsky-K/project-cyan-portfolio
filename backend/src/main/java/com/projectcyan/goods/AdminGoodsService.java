package com.projectcyan.goods;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.projectcyan.admin.SupabaseUsageCounter;

@Service
@Transactional
public class AdminGoodsService {

	private static final String DELETED_STATUS = "DISCONTINUED";

	private final GoodsRepository goodsRepository;
	private final ArtistRepository artistRepository;
	private final GoodsCategoryRepository goodsCategoryRepository;
	private final TagRepository tagRepository;
	private final GoodsStockRepository goodsStockRepository;
	private final GoodsDescriptionSanitizer goodsDescriptionSanitizer;
	private final SupabaseUsageCounter supabaseUsageCounter;

	public AdminGoodsService(
		GoodsRepository goodsRepository,
		ArtistRepository artistRepository,
		GoodsCategoryRepository goodsCategoryRepository,
		TagRepository tagRepository,
		GoodsStockRepository goodsStockRepository,
		GoodsDescriptionSanitizer goodsDescriptionSanitizer,
		SupabaseUsageCounter supabaseUsageCounter
	) {
		this.goodsRepository = goodsRepository;
		this.artistRepository = artistRepository;
		this.goodsCategoryRepository = goodsCategoryRepository;
		this.tagRepository = tagRepository;
		this.goodsStockRepository = goodsStockRepository;
		this.goodsDescriptionSanitizer = goodsDescriptionSanitizer;
		this.supabaseUsageCounter = supabaseUsageCounter;
	}

	public GoodsDetailResponse createGoods(AdminGoodsRequest request) {
		Long goodsId = request.goodsId() == null ? goodsRepository.nextGoodsId() : request.goodsId();
		if (goodsRepository.existsById(goodsId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Goods already exists.");
		}

		Goods goods = new Goods(goodsId);
		applyGoodsRequest(goods, request);
		Goods savedGoods = goodsRepository.save(goods);
		GoodsStock stock = new GoodsStock(savedGoods, normalizeStockCount(request.stockCount()));
		goodsStockRepository.save(stock);
		savedGoods.setStockCount(stock.getCurrentStock());
		supabaseUsageCounter.recordWrite("상품 등록");
		return GoodsDetailResponse.from(savedGoods);
	}

	public GoodsDetailResponse updateGoods(Long goodsId, AdminGoodsRequest request) {
		Goods goods = findGoods(goodsId);
		applyGoodsRequest(goods, request);
		GoodsStock stock = upsertStock(goods, request.stockCount());
		goods.setStockCount(stock.getCurrentStock());
		supabaseUsageCounter.recordWrite("상품 수정");
		return GoodsDetailResponse.from(goods);
	}

	public GoodsDetailResponse updateSalesStatus(Long goodsId, GoodsStatusUpdateRequest request) {
		Goods goods = findGoods(goodsId);
		goods.updateSalesStatus(request.salesStatus().trim());
		attachStock(goods);
		supabaseUsageCounter.recordWrite("상품 판매 상태 변경");
		return GoodsDetailResponse.from(goods);
	}

	public GoodsDetailResponse updateStock(Long goodsId, GoodsStockUpdateRequest request) {
		Goods goods = findGoods(goodsId);
		GoodsStock stock = upsertStock(goods, request.stockCount());
		goods.setStockCount(stock.getCurrentStock());
		supabaseUsageCounter.recordWrite("상품 재고 변경");
		return GoodsDetailResponse.from(goods);
	}

	public void deleteGoods(Long goodsId) {
		Goods goods = findGoods(goodsId);
		goods.updateSalesStatus(DELETED_STATUS);
		supabaseUsageCounter.recordWrite("상품 비공개 처리");
	}

	private void applyGoodsRequest(Goods goods, AdminGoodsRequest request) {
		goods.update(
			request.name().trim(),
			request.price(),
			goodsDescriptionSanitizer.sanitize(request.description()),
			blankToNull(request.imageUrl()),
			findArtist(request.artistId()),
			findCategory(request.categoryId()),
			request.salesStatus().trim(),
			Boolean.TRUE.equals(request.isBestSeller()),
			Boolean.TRUE.equals(request.aiPickDefault()),
			findTags(request.tags())
		);
	}

	private Goods findGoods(Long goodsId) {
		return goodsRepository.findById(goodsId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goods not found."));
	}

	private Artist findArtist(Long artistId) {
		if (artistId == null) {
			return null;
		}
		return artistRepository.findById(artistId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Artist not found."));
	}

	private GoodsCategory findCategory(Long categoryId) {
		if (categoryId == null) {
			return null;
		}
		return goodsCategoryRepository.findById(categoryId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found."));
	}

	private Set<Tag> findTags(List<String> tagNames) {
		if (tagNames == null || tagNames.isEmpty()) {
			return new LinkedHashSet<>();
		}

		List<String> normalizedTagNames = tagNames.stream()
			.filter(tagName -> tagName != null && !tagName.isBlank())
			.map(String::trim)
			.distinct()
			.toList();

		if (normalizedTagNames.isEmpty()) {
			return new LinkedHashSet<>();
		}

		var tagsByName = tagRepository.findByTagNameIn(normalizedTagNames).stream()
			.collect(Collectors.toMap(Tag::getTagName, Function.identity()));
		for (String tagName : normalizedTagNames) {
			if (!tagsByName.containsKey(tagName)) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tag not found: " + tagName);
			}
		}

		return normalizedTagNames.stream()
			.map(tagsByName::get)
			.collect(Collectors.toCollection(LinkedHashSet::new));
	}

	private GoodsStock upsertStock(Goods goods, Integer stockCount) {
		GoodsStock stock = goodsStockRepository.findById(goods.getGoodsId())
			.orElseGet(() -> new GoodsStock(goods, 0));
		stock.updateCurrentStock(normalizeStockCount(stockCount));
		return goodsStockRepository.save(stock);
	}

	private void attachStock(Goods goods) {
		goods.setStockCount(goodsStockRepository.findById(goods.getGoodsId())
			.map(GoodsStock::getCurrentStock)
			.orElse(null));
	}

	private Integer normalizeStockCount(Integer stockCount) {
		return stockCount == null ? 0 : Math.max(stockCount, 0);
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}
