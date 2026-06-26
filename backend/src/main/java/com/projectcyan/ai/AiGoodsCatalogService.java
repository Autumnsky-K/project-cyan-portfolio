package com.projectcyan.ai;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.projectcyan.goods.Goods;
import com.projectcyan.goods.GoodsRepository;
import com.projectcyan.goods.GoodsStock;
import com.projectcyan.goods.GoodsStockRepository;
import com.projectcyan.goods.Tag;
import com.projectcyan.storage.SupabaseStorageObject;
import com.projectcyan.storage.SupabaseStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AiGoodsCatalogService {

	private static final String TSV_HEADER = String.join("\t",
		"goodsId",
		"name",
		"price",
		"artistId",
		"artistName",
		"groupName",
		"categoryName",
		"tags",
		"salesStatus",
		"stockCount",
		"aiPickDefault",
		"bestSeller",
		"description"
	);
	private static final MediaType TSV_MEDIA_TYPE = new MediaType(
		"text",
		"tab-separated-values",
		StandardCharsets.UTF_8
	);

	private final GoodsRepository goodsRepository;
	private final GoodsStockRepository goodsStockRepository;
	private final SupabaseStorageService storageService;
	private final AiGoodsCatalogSnapshotRepository snapshotRepository;
	private final AiGoodsCatalogProperties properties;

	public AiGoodsCatalogService(
		GoodsRepository goodsRepository,
		GoodsStockRepository goodsStockRepository,
		SupabaseStorageService storageService,
		AiGoodsCatalogSnapshotRepository snapshotRepository,
		AiGoodsCatalogProperties properties
	) {
		this.goodsRepository = goodsRepository;
		this.goodsStockRepository = goodsStockRepository;
		this.storageService = storageService;
		this.snapshotRepository = snapshotRepository;
		this.properties = properties;
	}

	public AiGoodsCatalogSnapshot exportCatalog() {
		Instant generatedAt = Instant.now();
		try {
			List<Goods> goods = goodsRepository.findAllForRecommendation();
			Map<Long, Integer> stocks = loadStocks(goods);
			String tsv = buildCatalogTsv(goods, stocks);
			SupabaseStorageObject storageObject = storageService.uploadTextObject(
				properties.getBucket(),
				properties.getPath(),
				properties.getLatestFileName(),
				tsv,
				TSV_MEDIA_TYPE,
				true
			);
			String catalogUrl = storageService.createSignedObjectUrl(
				storageObject.bucketName(),
				storageObject.path(),
				properties.getSignedUrlTtlSeconds()
			);
			Instant urlExpiresAt = generatedAt.plusSeconds(Math.max(1, properties.getSignedUrlTtlSeconds()));
			return snapshotRepository.save(AiGoodsCatalogSnapshot.success(
				storageObject.bucketName(),
				storageObject.path(),
				catalogUrl,
				urlExpiresAt,
				generatedAt,
				goods.size(),
				(long) tsv.getBytes(StandardCharsets.UTF_8).length
			));
		} catch (RuntimeException exception) {
			snapshotRepository.save(AiGoodsCatalogSnapshot.failed(generatedAt, truncateError(exception.getMessage())));
			throw exception;
		}
	}

	@Transactional(readOnly = true)
	public AiGoodsCatalogSnapshot findLatestSuccessfulSnapshot() {
		return snapshotRepository.findFirstByStatusOrderByGeneratedAtDescSnapshotIdDesc(
			AiGoodsCatalogSnapshot.STATUS_SUCCESS
		).orElseThrow(() -> new ResponseStatusException(
			HttpStatus.NOT_FOUND,
			"AI goods catalog snapshot not found."
		));
	}

	@Transactional(readOnly = true)
	public AiGoodsCatalogSnapshot findLatestSnapshot() {
		return snapshotRepository.findFirstByOrderByGeneratedAtDescSnapshotIdDesc()
			.orElse(null);
	}

	String buildCatalogTsv(List<Goods> goods, Map<Long, Integer> stocks) {
		StringBuilder builder = new StringBuilder(TSV_HEADER).append('\n');
		goods.stream()
			.sorted(catalogComparator())
			.forEach(item -> appendGoodsRow(builder, item, stocks.getOrDefault(item.getGoodsId(), 0)));
		return builder.toString();
	}

	private Map<Long, Integer> loadStocks(List<Goods> goods) {
		if (goods.isEmpty()) {
			return Map.of();
		}
		Map<Long, Integer> stocks = new LinkedHashMap<>();
		goodsStockRepository.findByGoodsIdIn(goods.stream().map(Goods::getGoodsId).toList())
			.forEach(stock -> stocks.put(stock.getGoodsId(), stock.getCurrentStock()));
		return stocks;
	}

	private Comparator<Goods> catalogComparator() {
		return Comparator
			.comparing((Goods goods) -> !Boolean.TRUE.equals(goods.getAiPickDefault()))
			.thenComparing(goods -> !Boolean.TRUE.equals(goods.getBestSeller()))
			.thenComparing(Goods::getGoodsId, Comparator.nullsLast(Long::compareTo));
	}

	private void appendGoodsRow(StringBuilder builder, Goods goods, Integer stockCount) {
		builder.append(tsvCell(goods.getGoodsId()))
			.append('\t').append(tsvCell(goods.getGoodsName()))
			.append('\t').append(tsvCell(goods.getPrice()))
			.append('\t').append(tsvCell(goods.getArtist() == null ? null : goods.getArtist().getArtistId()))
			.append('\t').append(tsvCell(goods.getArtist() == null ? null : goods.getArtist().getArtistName()))
			.append('\t').append(tsvCell(goods.getArtist() == null ? null : goods.getArtist().getGroupName()))
			.append('\t').append(tsvCell(goods.getCategory() == null ? null : goods.getCategory().getCategoryName()))
			.append('\t').append(tsvCell(tagText(goods)))
			.append('\t').append(tsvCell(goods.getSalesStatus()))
			.append('\t').append(tsvCell(stockCount))
			.append('\t').append(tsvCell(Boolean.TRUE.equals(goods.getAiPickDefault())))
			.append('\t').append(tsvCell(Boolean.TRUE.equals(goods.getBestSeller())))
			.append('\t').append(tsvCell(goods.getDescription()))
			.append('\n');
	}

	private String tagText(Goods goods) {
		return goods.getTags().stream()
			.map(Tag::getTagName)
			.filter(StringUtils::hasText)
			.sorted()
			.collect(Collectors.joining(","));
	}

	private String tsvCell(Object value) {
		if (value == null) {
			return "";
		}
		return value.toString()
			.replaceAll("[\\t\\n\\r]+", " ")
			.replaceAll("\\s+", " ")
			.trim();
	}

	private String truncateError(String message) {
		if (!StringUtils.hasText(message)) {
			return "AI goods catalog export failed.";
		}
		return message.length() > 2000 ? message.substring(0, 2000) : message;
	}
}
