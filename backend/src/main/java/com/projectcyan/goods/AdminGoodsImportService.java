package com.projectcyan.goods;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import com.projectcyan.storage.AdminStoragePageController;
import com.projectcyan.storage.SupabaseStorageException;
import com.projectcyan.storage.SupabaseStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminGoodsImportService {

	private static final List<String> IMAGE_EXTENSIONS = List.of("png", "jpg", "jpeg", "webp");

	private final AdminGoodsService adminGoodsService;
	private final GoodsRepository goodsRepository;
	private final ArtistRepository artistRepository;
	private final GoodsCategoryRepository goodsCategoryRepository;
	private final SupabaseStorageService supabaseStorageService;

	public AdminGoodsImportService(
		AdminGoodsService adminGoodsService,
		GoodsRepository goodsRepository,
		ArtistRepository artistRepository,
		GoodsCategoryRepository goodsCategoryRepository,
		SupabaseStorageService supabaseStorageService
	) {
		this.adminGoodsService = adminGoodsService;
		this.goodsRepository = goodsRepository;
		this.artistRepository = artistRepository;
		this.goodsCategoryRepository = goodsCategoryRepository;
		this.supabaseStorageService = supabaseStorageService;
	}

	public AdminGoodsImportPreview preview(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV 파일을 선택해주세요.");
		}
		try {
			return preview(parseCsv(file));
		} catch (IOException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV 파일을 읽을 수 없습니다.");
		}
	}

	public AdminGoodsImportPreview previewRaw(List<AdminGoodsImportRow> rows) {
		return preview(rows.stream()
			.map(row -> Arrays.asList(
				row.goodsId(),
				row.name(),
				row.price(),
				row.artistName(),
				row.categoryName(),
				row.stockCount(),
				row.salesStatus(),
				row.imageFolder(),
				row.tagsText(),
				row.description(),
				row.bestSeller(),
				row.aiPickDefault()
			))
			.toList());
	}

	public int importRows(List<AdminGoodsImportRow> rows) {
		AdminGoodsImportPreview preview = previewRaw(rows);
		if (preview.hasErrors()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "오류가 있는 행이 있어 등록할 수 없습니다.");
		}
		int importedCount = 0;
		for (AdminGoodsImportRow row : preview.rows()) {
			AdminGoodsRequest request = new AdminGoodsRequest(
				row.resolvedGoodsId(),
				row.name().trim(),
				Integer.parseInt(row.price().trim()),
				blankToNull(row.description()),
				row.mainImageUrl(),
				row.resolvedArtistId(),
				row.resolvedCategoryId(),
				normalizeSalesStatus(row.salesStatus()),
				parseBoolean(row.bestSeller()),
				parseBoolean(row.aiPickDefault()),
				parseInteger(row.stockCount()).orElse(0),
				parseTags(row.tagsText()),
				row.extraImageUrls()
			);
			if (row.resolvedGoodsId() == null) {
				adminGoodsService.createGoods(request);
			} else {
				adminGoodsService.updateGoods(row.resolvedGoodsId(), request);
			}
			importedCount++;
		}
		return importedCount;
	}

	private AdminGoodsImportPreview preview(List<List<String>> rawRows) {
		Map<String, Long> artistIds = artistIdsByName();
		Map<String, Long> categoryIds = categoryIdsByName();
		Map<String, String> imageUrls = imageUrlsByPath();
		List<AdminGoodsImportRow> rows = new ArrayList<>();

		for (int index = 0; index < rawRows.size(); index++) {
			List<String> rawRow = rawRows.get(index);
			if (rawRow.stream().allMatch(value -> value == null || value.isBlank())) {
				continue;
			}
			rows.add(previewRow(index + 2, rawRow, artistIds, categoryIds, imageUrls));
		}
		return new AdminGoodsImportPreview(rows);
	}

	private AdminGoodsImportRow previewRow(
		int rowNumber,
		List<String> rawRow,
		Map<String, Long> artistIds,
		Map<String, Long> categoryIds,
		Map<String, String> imageUrls
	) {
		String goodsId = valueAt(rawRow, 0);
		String name = valueAt(rawRow, 1);
		String price = valueAt(rawRow, 2);
		String artistName = valueAt(rawRow, 3);
		String categoryName = valueAt(rawRow, 4);
		String stockCount = valueAt(rawRow, 5);
		String salesStatus = valueAt(rawRow, 6);
		String imageFolder = valueAt(rawRow, 7);
		String tagsText = valueAt(rawRow, 8);
		String description = valueAt(rawRow, 9);
		String bestSeller = valueAt(rawRow, 10);
		String aiPickDefault = valueAt(rawRow, 11);
		List<String> errors = new ArrayList<>();

		Long resolvedGoodsId = null;
		if (!goodsId.isBlank()) {
			try {
				resolvedGoodsId = Long.parseLong(goodsId.trim());
				if (!goodsRepository.existsById(resolvedGoodsId)) {
					errors.add("goods_id에 해당하는 상품이 없습니다.");
				}
			} catch (NumberFormatException exception) {
				errors.add("goods_id는 숫자여야 합니다.");
			}
		}
		if (name.isBlank()) {
			errors.add("상품명이 필요합니다.");
		}
		if (parseInteger(price).isEmpty()) {
			errors.add("가격은 숫자여야 합니다.");
		}
		if (parseInteger(stockCount).isEmpty()) {
			errors.add("재고는 숫자여야 합니다.");
		}
		Long artistId = artistIds.get(normalizeKey(artistName));
		if (artistId == null) {
			errors.add("아티스트를 찾을 수 없습니다.");
		}
		Long categoryId = categoryIds.get(normalizeKey(categoryName));
		if (categoryId == null) {
			errors.add("카테고리를 찾을 수 없습니다.");
		}
		String normalizedSalesStatus = normalizeSalesStatus(salesStatus);
		if (!List.of("ON_SALE", "SOLD_OUT", "HIDDEN", "DISCONTINUED").contains(normalizedSalesStatus)) {
			errors.add("판매상태 값이 올바르지 않습니다.");
		}
		ImageMatch imageMatch = matchImages(imageFolder, imageUrls);
		if (imageMatch.mainImageUrl() == null) {
			errors.add("이미지 폴더에서 main 이미지를 찾을 수 없습니다.");
		}

		return new AdminGoodsImportRow(
			rowNumber,
			goodsId,
			name,
			price,
			artistName,
			categoryName,
			stockCount,
			normalizedSalesStatus,
			imageFolder,
			tagsText,
			description,
			bestSeller,
			aiPickDefault,
			resolvedGoodsId,
			artistId,
			categoryId,
			imageMatch.mainImageUrl(),
			imageMatch.extraImageUrls(),
			errors
		);
	}

	private ImageMatch matchImages(String imageFolder, Map<String, String> imageUrls) {
		String folder = normalizeImageFolder(imageFolder);
		if (folder == null) {
			return new ImageMatch(null, List.of());
		}
		String mainImageUrl = findImageUrl(imageUrls, folder, "main").orElse(null);
		List<String> extraImageUrls = new ArrayList<>();
		for (int index = 1; index <= 4; index++) {
			findImageUrl(imageUrls, folder, String.valueOf(index)).ifPresent(extraImageUrls::add);
		}
		return new ImageMatch(mainImageUrl, extraImageUrls);
	}

	private Optional<String> findImageUrl(Map<String, String> imageUrls, String folder, String name) {
		for (String extension : IMAGE_EXTENSIONS) {
			String path = AdminStoragePageController.GOODS_IMAGE_PATH + "/" + folder + "/" + name + "." + extension;
			String imageUrl = imageUrls.get(path.toLowerCase(Locale.ROOT));
			if (imageUrl != null) {
				return Optional.of(imageUrl);
			}
		}
		return Optional.empty();
	}

	private String normalizeImageFolder(String imageFolder) {
		if (imageFolder == null || imageFolder.isBlank()) {
			return null;
		}
		String folder = imageFolder.trim().replace("\\", "/");
		while (folder.startsWith("/")) {
			folder = folder.substring(1);
		}
		while (folder.endsWith("/")) {
			folder = folder.substring(0, folder.length() - 1);
		}
		if (folder.startsWith(AdminStoragePageController.GOODS_IMAGE_PATH + "/")) {
			folder = folder.substring(AdminStoragePageController.GOODS_IMAGE_PATH.length() + 1);
		}
		return folder.isBlank() ? null : folder;
	}

	private Map<String, String> imageUrlsByPath() {
		try {
			return supabaseStorageService.listImageObjects(
					AdminStoragePageController.GOODS_IMAGE_BUCKET,
					AdminStoragePageController.GOODS_IMAGE_PATH,
					5000
				)
				.stream()
				.collect(
					LinkedHashMap::new,
					(map, image) -> map.put(image.path().toLowerCase(Locale.ROOT), image.publicUrl()),
					LinkedHashMap::putAll
				);
		} catch (SupabaseStorageException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Storage 이미지를 불러올 수 없습니다.");
		}
	}

	private Map<String, Long> artistIdsByName() {
		Map<String, Long> result = new HashMap<>();
		for (Artist artist : artistRepository.findAllByOrderByArtistNameAsc()) {
			result.put(normalizeKey(artist.getArtistName()), artist.getArtistId());
		}
		return result;
	}

	private Map<String, Long> categoryIdsByName() {
		Map<String, Long> result = new HashMap<>();
		for (GoodsCategory category : goodsCategoryRepository.findAllByOrderByCategoryNameAsc()) {
			result.put(normalizeKey(category.getCategoryName()), category.getCategoryId());
		}
		return result;
	}

	private List<List<String>> parseCsv(MultipartFile file) throws IOException {
		List<List<String>> rows = new ArrayList<>();
		try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
			String line;
			boolean firstLine = true;
			while ((line = reader.readLine()) != null) {
				List<String> row = parseCsvLine(stripBom(line));
				if (firstLine) {
					firstLine = false;
					continue;
				}
				rows.add(row);
			}
		}
		return rows;
	}

	private List<String> parseCsvLine(String line) {
		List<String> values = new ArrayList<>();
		StringBuilder value = new StringBuilder();
		boolean quoted = false;
		for (int index = 0; index < line.length(); index++) {
			char character = line.charAt(index);
			if (character == '"') {
				if (quoted && index + 1 < line.length() && line.charAt(index + 1) == '"') {
					value.append('"');
					index++;
				} else {
					quoted = !quoted;
				}
			} else if (character == ',' && !quoted) {
				values.add(value.toString().trim());
				value.setLength(0);
			} else {
				value.append(character);
			}
		}
		values.add(value.toString().trim());
		return values;
	}

	private String stripBom(String value) {
		return value != null && value.startsWith("\uFEFF") ? value.substring(1) : value;
	}

	private String valueAt(List<String> values, int index) {
		return index < values.size() && values.get(index) != null ? values.get(index).trim() : "";
	}

	private Optional<Integer> parseInteger(String value) {
		if (value == null || value.isBlank()) {
			return Optional.empty();
		}
		try {
			int parsedValue = Integer.parseInt(value.trim());
			return parsedValue < 0 ? Optional.empty() : Optional.of(parsedValue);
		} catch (NumberFormatException exception) {
			return Optional.empty();
		}
	}

	private String normalizeSalesStatus(String value) {
		if (value == null || value.isBlank()) {
			return "ON_SALE";
		}
		return value.trim().toUpperCase(Locale.ROOT);
	}

	private Boolean parseBoolean(String value) {
		if (value == null || value.isBlank()) {
			return false;
		}
		return List.of("true", "1", "y", "yes", "on", "예", "네").contains(value.trim().toLowerCase(Locale.ROOT));
	}

	private List<String> parseTags(String tagsText) {
		if (tagsText == null || tagsText.isBlank()) {
			return List.of();
		}
		return List.of(tagsText.replace("#", ",").split(",")).stream()
			.map(String::trim)
			.filter(tag -> !tag.isBlank())
			.distinct()
			.toList();
	}

	private String normalizeKey(String value) {
		return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}

	private record ImageMatch(String mainImageUrl, List<String> extraImageUrls) {
	}
}
