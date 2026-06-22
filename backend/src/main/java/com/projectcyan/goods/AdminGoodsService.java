package com.projectcyan.goods;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.projectcyan.admin.SupabaseUsageCounter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AdminGoodsService {

	private static final String DISCONTINUED_STATUS = "DISCONTINUED";
	private static final Set<String> SALES_STATUSES = Set.of("ON_SALE", "SOLD_OUT", "HIDDEN", DISCONTINUED_STATUS);

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
			throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 존재하는 굿즈 ID입니다.");
		}

		Goods goods = new Goods(goodsId);
		applyGoodsRequest(goods, request);
		Goods savedGoods = goodsRepository.save(goods);
		GoodsStock stock = new GoodsStock(savedGoods, normalizeStockCount(request.stockCount()));
		goodsStockRepository.save(stock);
		savedGoods.setStockCount(stock.getCurrentStock());
		supabaseUsageCounter.recordWrite("굿즈 등록");
		return GoodsDetailResponse.from(savedGoods);
	}

	public GoodsDetailResponse updateGoods(Long goodsId, AdminGoodsRequest request) {
		Goods goods = findGoods(goodsId);
		applyGoodsRequest(goods, request);
		GoodsStock stock = upsertStock(goods, request.stockCount());
		goods.setStockCount(stock.getCurrentStock());
		supabaseUsageCounter.recordWrite("굿즈 수정");
		return GoodsDetailResponse.from(goods);
	}

	public int bulkUpdateGoods(List<AdminGoodsBulkRow> rows) {
		if (rows == null || rows.isEmpty()) {
			return 0;
		}

		for (AdminGoodsBulkRow row : rows) {
			if (row.goodsId() == null) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "굿즈 ID가 없습니다.");
			}
			Goods goods = findGoods(row.goodsId());
			applyGoodsBulkRow(goods, row);
			GoodsStock stock = upsertStock(goods, row.stockCount());
			goods.setStockCount(stock.getCurrentStock());
		}

		supabaseUsageCounter.recordWrite("굿즈 일괄 수정");
		return rows.size();
	}

	public GoodsDetailResponse updateSalesStatus(Long goodsId, GoodsStatusUpdateRequest request) {
		Goods goods = findGoods(goodsId);
		goods.updateSalesStatus(request.salesStatus().trim());
		attachStock(goods);
		supabaseUsageCounter.recordWrite("굿즈 판매 상태 변경");
		return GoodsDetailResponse.from(goods);
	}

	public GoodsDetailResponse updateStock(Long goodsId, GoodsStockUpdateRequest request) {
		Goods goods = findGoods(goodsId);
		GoodsStock stock = upsertStock(goods, request.stockCount());
		goods.setStockCount(stock.getCurrentStock());
		supabaseUsageCounter.recordWrite("굿즈 재고 변경");
		return GoodsDetailResponse.from(goods);
	}

	public void discontinueGoods(Long goodsId) {
		Goods goods = findGoods(goodsId);
		goods.updateSalesStatus(DISCONTINUED_STATUS);
		supabaseUsageCounter.recordWrite("굿즈 판매 중단 처리");
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

	private void applyGoodsBulkRow(Goods goods, AdminGoodsBulkRow row) {
		if (row.name() == null || row.name().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "굿즈명은 비워둘 수 없습니다.");
		}
		if (row.price() == null || row.price() < 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "가격은 0 이상이어야 합니다.");
		}
		if (row.salesStatus() == null || row.salesStatus().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "판매 상태를 선택해 주세요.");
		}
		if (!SALES_STATUSES.contains(row.salesStatus().trim())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "판매 상태 값이 올바르지 않습니다.");
		}

		goods.update(
			row.name().trim(),
			row.price(),
			goods.getDescription(),
			blankToNull(row.imageUrl()),
			findArtist(row.artistId()),
			findCategory(row.categoryId()),
			row.salesStatus().trim(),
			Boolean.TRUE.equals(goods.getBestSeller()),
			Boolean.TRUE.equals(goods.getAiPickDefault()),
			findTags(parseTagsText(row.tagsText()))
		);
	}

	private Goods findGoods(Long goodsId) {
		return goodsRepository.findById(goodsId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "굿즈를 찾을 수 없습니다."));
	}

	private Artist findArtist(Long artistId) {
		if (artistId == null) {
			return null;
		}
		return artistRepository.findById(artistId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "아티스트를 찾을 수 없습니다."));
	}

	private GoodsCategory findCategory(Long categoryId) {
		if (categoryId == null) {
			return null;
		}
		return goodsCategoryRepository.findById(categoryId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "카테고리를 찾을 수 없습니다."));
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
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "태그를 찾을 수 없습니다: " + tagName);
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
		if (stockCount != null && stockCount < 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "재고는 0 이상이어야 합니다.");
		}
		return stockCount == null ? 0 : stockCount;
	}

	private List<String> parseTagsText(String tagsText) {
		if (tagsText == null || tagsText.isBlank()) {
			return List.of();
		}
		String normalizedTagsText = tagsText.contains("#")
			? tagsText.replace("#", ",")
			: tagsText;
		return Arrays.stream(normalizedTagsText.split(","))
			.map(String::trim)
			.filter(tagName -> !tagName.isBlank())
			.distinct()
			.toList();
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}
