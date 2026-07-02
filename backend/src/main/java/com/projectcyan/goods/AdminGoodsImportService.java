package com.projectcyan.goods;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.projectcyan.storage.AdminStoragePageController;
import com.projectcyan.storage.StorageDirectoryIndexService;
import com.projectcyan.storage.SupabaseStorageException;
import com.projectcyan.storage.SupabaseStorageObject;
import com.projectcyan.storage.SupabaseStorageService;
import com.projectcyan.storage.SupabaseStorageWriteResult;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminGoodsImportService {

	private static final String IMAGE_SOURCE_SUPABASE = "SUPABASE";
	private static final String IMAGE_SOURCE_LOCAL = "LOCAL";
	private static final List<String> IMAGE_EXTENSIONS = List.of("png", "jpg", "jpeg", "webp");
	private static final Path LOCAL_IMPORT_BATCH_ROOT = Path.of(
		System.getProperty("java.io.tmpdir"),
		"project-cyan-goods-import"
	);

	private final AdminGoodsService adminGoodsService;
	private final GoodsRepository goodsRepository;
	private final ArtistRepository artistRepository;
	private final GoodsCategoryRepository goodsCategoryRepository;
	private final SupabaseStorageService supabaseStorageService;
	private final StorageDirectoryIndexService storageDirectoryIndexService;

	public AdminGoodsImportService(
		AdminGoodsService adminGoodsService,
		GoodsRepository goodsRepository,
		ArtistRepository artistRepository,
		GoodsCategoryRepository goodsCategoryRepository,
		SupabaseStorageService supabaseStorageService,
		StorageDirectoryIndexService storageDirectoryIndexService
	) {
		this.adminGoodsService = adminGoodsService;
		this.goodsRepository = goodsRepository;
		this.artistRepository = artistRepository;
		this.goodsCategoryRepository = goodsCategoryRepository;
		this.supabaseStorageService = supabaseStorageService;
		this.storageDirectoryIndexService = storageDirectoryIndexService;
	}

	public AdminGoodsImportPreview preview(MultipartFile file) {
		return preview(file, List.of(), List.of(), false);
	}

	public AdminGoodsImportPreview preview(
		MultipartFile file,
		List<MultipartFile> imageFiles,
		List<String> imageRelativePaths,
		boolean useLocalImages
	) {
		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV 파일을 선택해주세요.");
		}
		try {
			List<List<String>> rawRows = parseCsv(file);
			if (!useLocalImages) {
				return preview(rawRows, imageUrlsByPath(), IMAGE_SOURCE_SUPABASE, null, List.of(), List.of());
			}
			LocalImageBatch batch = saveLocalImageBatch(imageFiles, imageRelativePaths);
			AdminGoodsImportPreview localPreview = preview(
				rawRows,
				batch.logicalImageUrls(),
				IMAGE_SOURCE_LOCAL,
				batch.batchId(),
				batch.imageFolders(),
				List.of()
			);
			if (localPreview.hasErrors()) {
				deleteLocalImageBatch(batch.batchId());
			}
			return localPreview;
		} catch (IOException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV 파일을 읽을 수 없습니다.");
		}
	}

	public AdminGoodsImportPreview preview(
		MultipartFile file,
		String imageBatchId,
		boolean useLocalImages
	) {
		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV 파일을 선택해주세요.");
		}
		try {
			List<List<String>> rawRows = parseCsv(file);
			if (!useLocalImages) {
				return preview(rawRows, imageUrlsByPath(), IMAGE_SOURCE_SUPABASE, null, List.of(), List.of());
			}
			LocalImageBatch batch = loadLocalImageBatch(imageBatchId);
			return preview(
				rawRows,
				batch.logicalImageUrls(),
				IMAGE_SOURCE_LOCAL,
				batch.batchId(),
				batch.imageFolders(),
				List.of()
			);
		} catch (IOException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV 파일을 읽을 수 없습니다.");
		}
	}

	public String createLocalImageBatch() {
		String batchId = UUID.randomUUID().toString();
		try {
			Files.createDirectories(localBatchDir(batchId));
			return batchId;
		} catch (IOException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로컬 이미지 배치를 만들 수 없습니다.");
		}
	}

	public int appendLocalImageBatch(
		String batchId,
		List<MultipartFile> imageFiles,
		List<String> imageRelativePaths
	) {
		try {
			List<LocalUploadCandidate> candidates = localUploadCandidates(imageFiles, imageRelativePaths);
			Path batchDir = localBatchDir(batchId);
			if (!Files.isDirectory(batchDir)) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로컬 이미지 배치를 찾을 수 없습니다. CSV와 이미지 폴더를 다시 미리보기 해주세요.");
			}
			copyLocalImageCandidates(
				batchDir,
				candidates,
				candidates.stream().map(LocalUploadCandidate::relativePath).toList()
			);
			return loadLocalImageBatch(batchId).files().size();
		} catch (IOException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로컬 이미지 배치를 저장할 수 없습니다.");
		}
	}

	public AdminGoodsImportPreview previewRaw(List<AdminGoodsImportRow> rows) {
		return previewRaw(rows, IMAGE_SOURCE_SUPABASE, null);
	}

	public AdminGoodsImportPreview previewRaw(
		List<AdminGoodsImportRow> rows,
		String imageSource,
		String imageBatchId
	) {
		List<List<String>> rawRows = rowsToRawRows(rows);
		if (isLocalImageSource(imageSource)) {
			LocalImageBatch batch = loadLocalImageBatch(imageBatchId);
			return preview(
				rawRows,
				batch.logicalImageUrls(),
				IMAGE_SOURCE_LOCAL,
				batch.batchId(),
				batch.imageFolders(),
				List.of()
			);
		}
		return preview(rawRows, imageUrlsByPath(), IMAGE_SOURCE_SUPABASE, null, List.of(), List.of());
	}

	public int importRows(List<AdminGoodsImportRow> rows) {
		return importRows(rows, IMAGE_SOURCE_SUPABASE, null);
	}

	public int importRows(List<AdminGoodsImportRow> rows, String imageSource, String imageBatchId) {
		AdminGoodsImportPreview preview = isLocalImageSource(imageSource)
			? previewWithUploadedLocalImages(rows, imageBatchId)
			: previewRaw(rows);
		if (preview.hasErrors()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "오류가 있는 행이 있어 등록할 수 없습니다.");
		}
		int importedCount = 0;
		for (AdminGoodsImportRow row : preview.rows()) {
			String description = descriptionWithDetailImages(row.description(), row.detailImageUrls());
			AdminGoodsRequest request = new AdminGoodsRequest(
				row.resolvedGoodsId(),
				row.name().trim(),
				Integer.parseInt(row.price().trim()),
				blankToNull(description),
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

	private AdminGoodsImportPreview previewWithUploadedLocalImages(List<AdminGoodsImportRow> rows, String imageBatchId) {
		List<List<String>> rawRows = rowsToRawRows(rows);
		LocalImageBatch batch = loadLocalImageBatch(imageBatchId);
		AdminGoodsImportPreview preUploadPreview = preview(
			rawRows,
			batch.logicalImageUrls(),
			IMAGE_SOURCE_LOCAL,
			batch.batchId(),
			batch.imageFolders(),
			List.of()
		);
		if (preUploadPreview.hasErrors()) {
			return preUploadPreview;
		}
		try {
			return preview(
				rawRows,
				uploadLocalImageBatch(batch),
				IMAGE_SOURCE_LOCAL,
				batch.batchId(),
				batch.imageFolders(),
				List.of()
			);
		} finally {
			deleteLocalImageBatch(batch.batchId());
		}
	}

	private List<List<String>> rowsToRawRows(List<AdminGoodsImportRow> rows) {
		return rows.stream()
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
			.toList();
	}

	private AdminGoodsImportPreview preview(
		List<List<String>> rawRows,
		Map<String, String> imageUrls,
		String imageSource,
		String imageBatchId,
		List<String> imageFolders,
		List<String> previewErrors
	) {
		Map<String, Long> artistIds = artistIdsByName();
		Map<String, Long> categoryIds = categoryIdsByName();
		List<AdminGoodsImportRow> rows = new ArrayList<>();
		List<String> errors = new ArrayList<>(previewErrors == null ? List.of() : previewErrors);
		List<List<String>> rowsForPreview = rawRows;
		if (isLocalImageSource(imageSource)) {
			LocalFolderAssignment assignment = assignLocalImageFolders(rawRows, imageFolders);
			rowsForPreview = assignment.rawRows();
			errors.addAll(assignment.errors());
		}

		for (int index = 0; index < rowsForPreview.size(); index++) {
			List<String> rawRow = rowsForPreview.get(index);
			if (isBlankRow(rawRow)) {
				continue;
			}
			rows.add(previewRow(index + 2, rawRow, artistIds, categoryIds, imageUrls));
		}
		return new AdminGoodsImportPreview(rows, errors, imageSource, imageBatchId, imageFolders);
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
		String normalizedSalesStatus = "HIDDEN";
		ImageMatch imageMatch = matchImages(imageFolder, imageUrls);
		if (imageMatch.mainImageUrl() == null) {
			errors.add("이미지 폴더에서 이미지를 찾을 수 없습니다.");
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
			imageMatch.detailImageUrls(),
			errors
		);
	}

	private ImageMatch matchImages(String imageFolder, Map<String, String> imageUrls) {
		List<FolderImage> images = folderImages(imageFolder, imageUrls);
		if (images.isEmpty()) {
			return new ImageMatch(null, List.of(), List.of());
		}
		String mainImageUrl = images.getFirst().url();
		List<String> extraImageUrls = images.stream()
			.skip(1)
			.limit(4)
			.map(FolderImage::url)
			.toList();
		List<String> detailImageUrls = images.stream()
			.skip(5)
			.map(FolderImage::url)
			.toList();
		return new ImageMatch(mainImageUrl, extraImageUrls, detailImageUrls);
	}

	private List<FolderImage> folderImages(String imageFolder, Map<String, String> imageUrls) {
		String folder = normalizeImageFolder(imageFolder);
		if (folder == null || imageUrls == null || imageUrls.isEmpty()) {
			return List.of();
		}
		String prefix = (AdminStoragePageController.GOODS_IMAGE_PATH + "/" + folder + "/").toLowerCase(Locale.ROOT);
		return imageUrls.entrySet().stream()
			.map(entry -> folderImage(entry, prefix))
			.filter(Optional::isPresent)
			.map(Optional::get)
			.sorted(this::compareFolderImages)
			.toList();
	}

	private Optional<FolderImage> folderImage(Map.Entry<String, String> entry, String prefix) {
		String objectPath = entry.getKey();
		if (objectPath == null || !objectPath.startsWith(prefix)) {
			return Optional.empty();
		}
		String fileName = objectPath.substring(prefix.length());
		if (!StringUtils.hasText(fileName) || fileName.contains("/") || !isImportImageExtension(fileName)) {
			return Optional.empty();
		}
		return Optional.of(new FolderImage(fileName, entry.getValue()));
	}

	private int compareFolderImages(FolderImage left, FolderImage right) {
		int groupComparison = Integer.compare(imageSortGroup(left), imageSortGroup(right));
		if (groupComparison != 0) {
			return groupComparison;
		}
		int numberComparison = Integer.compare(imageSortNumber(left), imageSortNumber(right));
		if (numberComparison != 0) {
			return numberComparison;
		}
		return String.CASE_INSENSITIVE_ORDER.compare(left.fileName(), right.fileName());
	}

	private int imageSortGroup(FolderImage image) {
		String baseName = objectBaseName(image.fileName());
		if ("main".equals(baseName)) {
			return 0;
		}
		return parseBaseNumber(baseName).isPresent() ? 1 : 2;
	}

	private int imageSortNumber(FolderImage image) {
		return parseBaseNumber(objectBaseName(image.fileName())).orElse(Integer.MAX_VALUE);
	}

	private Optional<Integer> parseBaseNumber(String baseName) {
		if (!StringUtils.hasText(baseName) || !baseName.chars().allMatch(Character::isDigit)) {
			return Optional.empty();
		}
		try {
			return Optional.of(Integer.parseInt(baseName));
		} catch (NumberFormatException exception) {
			return Optional.empty();
		}
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

	private LocalImageBatch saveLocalImageBatch(
		List<MultipartFile> imageFiles,
		List<String> imageRelativePaths
	) throws IOException {
		List<LocalUploadCandidate> candidates = localUploadCandidates(imageFiles, imageRelativePaths);
		List<String> strippedPaths = stripCommonRoot(candidates.stream()
			.map(LocalUploadCandidate::relativePath)
			.toList());
		String batchId = createLocalImageBatch();
		Path batchDir = localBatchDir(batchId);
		copyLocalImageCandidates(batchDir, candidates, strippedPaths);
		return loadLocalImageBatch(batchId);
	}

	private List<LocalUploadCandidate> localUploadCandidates(
		List<MultipartFile> imageFiles,
		List<String> imageRelativePaths
	) {
		if (imageFiles == null || imageFiles.stream().noneMatch(file -> file != null && !file.isEmpty())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로컬 이미지 폴더를 선택해주세요.");
		}

		List<LocalUploadCandidate> candidates = new ArrayList<>();
		for (int index = 0; index < imageFiles.size(); index++) {
			MultipartFile file = imageFiles.get(index);
			if (file == null || file.isEmpty()) {
				continue;
			}
			String rawPath = valueAt(imageRelativePaths, index);
			if (rawPath.isBlank()) {
				rawPath = file.getOriginalFilename();
			}
			String normalizedPath = normalizeLocalUploadPath(rawPath);
			if (!isImportImageExtension(normalizedPath)) {
				continue;
			}
			candidates.add(new LocalUploadCandidate(file, normalizedPath));
		}
		if (candidates.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로컬 폴더에서 이미지 파일을 찾을 수 없습니다.");
		}
		return candidates;
	}

	private void copyLocalImageCandidates(
		Path batchDir,
		List<LocalUploadCandidate> candidates,
		List<String> relativePaths
	) throws IOException {
		Set<String> seenPaths = existingLocalImagePaths(batchDir);
		for (int index = 0; index < candidates.size(); index++) {
			MultipartFile file = candidates.get(index).file();
			String relativePath = normalizeProductRelativeImagePath(relativePaths.get(index));
			if (relativePath == null) {
				continue;
			}
			String seenKey = relativePath.toLowerCase(Locale.ROOT);
			if (!seenPaths.add(seenKey)) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "중복된 이미지 파일 경로가 있습니다: " + relativePath);
			}
			Path target = batchDir.resolve(relativePath).normalize();
			if (!target.startsWith(batchDir)) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일 경로가 올바르지 않습니다.");
			}
			Files.createDirectories(target.getParent());
			Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
		}
	}

	private Set<String> existingLocalImagePaths(Path batchDir) throws IOException {
		if (!Files.isDirectory(batchDir)) {
			return new LinkedHashSet<>();
		}
		try (var paths = Files.walk(batchDir)) {
			return paths
				.filter(Files::isRegularFile)
				.map(path -> batchDir.relativize(path).toString().replace('\\', '/').toLowerCase(Locale.ROOT))
				.collect(Collectors.toCollection(LinkedHashSet::new));
		}
	}

	private LocalImageBatch loadLocalImageBatch(String batchId) {
		if (!StringUtils.hasText(batchId)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로컬 이미지 배치가 없습니다. CSV와 이미지 폴더를 다시 미리보기 해주세요.");
		}
		Path batchDir = localBatchDir(batchId);
		if (!Files.isDirectory(batchDir)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로컬 이미지 배치를 찾을 수 없습니다. CSV와 이미지 폴더를 다시 미리보기 해주세요.");
		}
		try (var paths = Files.walk(batchDir)) {
			List<LocalImageFile> files = paths
				.filter(Files::isRegularFile)
				.map(path -> {
					String relativePath = batchDir.relativize(path).toString().replace('\\', '/');
					return localImageFile(relativePath, path);
				})
				.filter(Optional::isPresent)
				.map(Optional::get)
				.sorted(Comparator.comparing(LocalImageFile::relativePath))
				.toList();
			if (files.isEmpty()) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로컬 이미지 배치에 유효한 이미지가 없습니다.");
			}
			return localImageBatch(batchId, files);
		} catch (IOException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로컬 이미지 배치를 읽을 수 없습니다.");
		}
	}

	private Map<String, String> uploadLocalImageBatch(LocalImageBatch batch) {
		Map<String, String> uploadedUrls = new LinkedHashMap<>();
		for (LocalImageFile file : batch.files()) {
			try {
				SupabaseStorageWriteResult uploadResult = supabaseStorageService.uploadObjectBySizePolicyWithResult(
					AdminStoragePageController.GOODS_IMAGE_BUCKET,
					AdminStoragePageController.GOODS_IMAGE_PATH,
					file.relativePath(),
					new LocalImportMultipartFile(file.tempPath(), objectFileName(file.relativePath())),
					false
				);
				SupabaseStorageObject uploaded = uploadResult.object();
				storageDirectoryIndexService.recordUploadedImage(uploaded, uploadResult.created());
				uploadedUrls.put(file.logicalObjectPath().toLowerCase(Locale.ROOT), uploaded.publicUrl());
			} catch (SupabaseStorageException exception) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
			}
		}
		return uploadedUrls;
	}

	private LocalFolderAssignment assignLocalImageFolders(List<List<String>> rawRows, List<String> localImageFolders) {
		List<List<String>> assignedRows = new ArrayList<>();
		if (rawRows != null) {
			for (List<String> row : rawRows) {
				assignedRows.add(row == null ? new ArrayList<>() : new ArrayList<>(row));
			}
		}
		List<String> sortedLocalFolders = localImageFolders == null ? List.of() : localImageFolders.stream()
			.filter(StringUtils::hasText)
			.distinct()
			.sorted()
			.toList();
		Map<String, String> localFoldersByKey = sortedLocalFolders.stream()
			.collect(Collectors.toMap(
				folder -> folder.toLowerCase(Locale.ROOT),
				folder -> folder,
				(left, right) -> left,
				LinkedHashMap::new
			));
		List<String> errors = new ArrayList<>();
		Set<String> usedFolderKeys = new LinkedHashSet<>();
		Set<String> duplicateCsvFolders = new LinkedHashSet<>();

		for (int index = 0; index < assignedRows.size(); index++) {
			List<String> row = assignedRows.get(index);
			if (isBlankRow(row)) {
				continue;
			}
			String explicitFolder = normalizeImageFolder(valueAt(row, 7));
			if (explicitFolder != null) {
				String key = explicitFolder.toLowerCase(Locale.ROOT);
				if (!localFoldersByKey.containsKey(key)) {
					errors.add((index + 2) + "행 이미지폴더가 로컬 폴더에 없습니다: " + explicitFolder);
				}
				if (!usedFolderKeys.add(key)) {
					duplicateCsvFolders.add(explicitFolder);
				}
				setValueAt(row, 7, explicitFolder);
				continue;
			}
			Optional<String> nextFolder = sortedLocalFolders.stream()
				.filter(folder -> !usedFolderKeys.contains(folder.toLowerCase(Locale.ROOT)))
				.findFirst();
			if (nextFolder.isEmpty()) {
				errors.add((index + 2) + "행에 배정할 로컬 이미지 폴더가 없습니다.");
				continue;
			}
			String assignedFolder = nextFolder.get();
			usedFolderKeys.add(assignedFolder.toLowerCase(Locale.ROOT));
			setValueAt(row, 7, assignedFolder);
		}

		if (!duplicateCsvFolders.isEmpty()) {
			errors.add("CSV 이미지폴더가 중복됩니다: " + compactFolderList(new ArrayList<>(duplicateCsvFolders)));
		}

		List<String> extraLocalFolders = localFoldersByKey.entrySet().stream()
			.filter(entry -> !usedFolderKeys.contains(entry.getKey()))
			.map(Map.Entry::getValue)
			.toList();
		if (!extraLocalFolders.isEmpty()) {
			errors.add("CSV 행에 배정되지 않은 로컬 이미지 폴더: " + compactFolderList(extraLocalFolders));
		}
		return new LocalFolderAssignment(assignedRows, errors);
	}

	private List<String> stripCommonRoot(List<String> paths) {
		if (paths.isEmpty()) {
			return paths;
		}
		List<List<String>> segments = paths.stream()
			.map(path -> List.of(path.split("/")))
			.toList();
		if (segments.stream().anyMatch(parts -> parts.size() < 3)) {
			return paths;
		}
		String root = segments.getFirst().getFirst();
		boolean sameRoot = segments.stream()
			.allMatch(parts -> root.equalsIgnoreCase(parts.getFirst()));
		if (!sameRoot) {
			return paths;
		}
		return segments.stream()
			.map(parts -> String.join("/", parts.subList(1, parts.size())))
			.toList();
	}

	private String normalizeLocalUploadPath(String rawPath) {
		if (!StringUtils.hasText(rawPath)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일 경로를 확인할 수 없습니다.");
		}
		String normalizedPath = rawPath.trim().replace('\\', '/').replaceAll("^/+", "").replaceAll("/+$", "");
		if (!StringUtils.hasText(normalizedPath)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일 경로를 확인할 수 없습니다.");
		}
		for (String segment : normalizedPath.split("/", -1)) {
			if (!StringUtils.hasText(segment) || ".".equals(segment) || "..".equals(segment) || segment.contains("\u0000")) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일 경로가 올바르지 않습니다.");
			}
		}
		return normalizedPath;
	}

	private String normalizeProductRelativeImagePath(String relativePath) {
		String normalizedPath = normalizeLocalUploadPath(relativePath);
		String goodsPrefix = AdminStoragePageController.GOODS_IMAGE_PATH + "/";
		if (normalizedPath.toLowerCase(Locale.ROOT).startsWith(goodsPrefix.toLowerCase(Locale.ROOT))) {
			normalizedPath = normalizedPath.substring(goodsPrefix.length());
		}
		String objectName = objectFileName(normalizedPath);
		if (!"webp".equalsIgnoreCase(StringUtils.getFilenameExtension(objectName))) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "일괄등록 이미지는 WebP로 변환된 파일만 처리합니다.");
		}
		String parentPath = parentObjectPath(normalizedPath);
		if (!StringUtils.hasText(parentPath)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "상품별 하위 폴더 안에 이미지를 배치해주세요.");
		}
		return normalizedPath;
	}

	private Optional<LocalImageFile> localImageFile(String relativePath, Path tempPath) {
		String normalizedPath = normalizeProductRelativeImagePath(relativePath);
		if (normalizedPath == null) {
			return Optional.empty();
		}
		String logicalObjectPath = AdminStoragePageController.GOODS_IMAGE_PATH + "/" + normalizedPath;
		return Optional.of(new LocalImageFile(normalizedPath, logicalObjectPath, tempPath));
	}

	private LocalImageBatch localImageBatch(String batchId, List<LocalImageFile> files) {
		List<String> imageFolders = files.stream()
			.map(file -> parentObjectPath(file.relativePath()))
			.distinct()
			.sorted()
			.toList();
		Map<String, String> logicalImageUrls = files.stream()
			.collect(Collectors.toMap(
				file -> file.logicalObjectPath().toLowerCase(Locale.ROOT),
				file -> "local-import://" + batchId + "/" + file.relativePath(),
				(left, right) -> left,
				LinkedHashMap::new
			));
		return new LocalImageBatch(batchId, files, imageFolders, logicalImageUrls);
	}

	private Path localBatchDir(String batchId) {
		if (!StringUtils.hasText(batchId) || !batchId.matches("[0-9a-fA-F-]{36}")) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로컬 이미지 배치 ID가 올바르지 않습니다.");
		}
		Path root = LOCAL_IMPORT_BATCH_ROOT.toAbsolutePath().normalize();
		Path batchDir = root.resolve(batchId).normalize();
		if (!batchDir.startsWith(root)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로컬 이미지 배치 ID가 올바르지 않습니다.");
		}
		return batchDir;
	}

	private void deleteLocalImageBatch(String batchId) {
		if (!StringUtils.hasText(batchId)) {
			return;
		}
		Path batchDir;
		try {
			batchDir = localBatchDir(batchId);
		} catch (ResponseStatusException exception) {
			return;
		}
		if (!Files.exists(batchDir)) {
			return;
		}
		try (var paths = Files.walk(batchDir)) {
			paths.sorted(Comparator.reverseOrder()).forEach(path -> {
				try {
					Files.deleteIfExists(path);
				} catch (IOException ignored) {
				}
			});
		} catch (IOException ignored) {
		}
	}

	private boolean isImportImageExtension(String path) {
		String extension = StringUtils.getFilenameExtension(path);
		return extension != null && IMAGE_EXTENSIONS.contains(extension.toLowerCase(Locale.ROOT));
	}

	private String objectFileName(String objectPath) {
		int separatorIndex = objectPath.lastIndexOf('/');
		return separatorIndex >= 0 ? objectPath.substring(separatorIndex + 1) : objectPath;
	}

	private String parentObjectPath(String objectPath) {
		int separatorIndex = objectPath.lastIndexOf('/');
		return separatorIndex >= 0 ? objectPath.substring(0, separatorIndex) : "";
	}

	private String objectBaseName(String objectPath) {
		String objectName = objectFileName(objectPath).toLowerCase(Locale.ROOT);
		String extension = StringUtils.getFilenameExtension(objectName);
		return extension == null ? objectName : objectName.substring(0, objectName.length() - extension.length() - 1);
	}

	private String compactFolderList(List<String> folders) {
		int maxVisible = 8;
		String joined = folders.stream()
			.limit(maxVisible)
			.collect(Collectors.joining(", "));
		int hiddenCount = folders.size() - maxVisible;
		return hiddenCount > 0 ? joined + " 외 " + hiddenCount + "개" : joined;
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
				if (isGuideRow(row)) {
					continue;
				}
				rows.add(row);
			}
		}
		return rows;
	}

	private boolean isGuideRow(List<String> row) {
		return !row.isEmpty() && row.getFirst() != null && row.getFirst().trim().startsWith("#");
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
		return values != null && index < values.size() && values.get(index) != null ? values.get(index).trim() : "";
	}

	private void setValueAt(List<String> values, int index, String value) {
		while (values.size() <= index) {
			values.add("");
		}
		values.set(index, value == null ? "" : value);
	}

	private boolean isBlankRow(List<String> row) {
		return row == null || row.stream().allMatch(value -> value == null || value.isBlank());
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
			return "HIDDEN";
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

	private String descriptionWithDetailImages(String description, List<String> detailImageUrls) {
		List<String> imageUrls = detailImageUrls == null ? List.of() : detailImageUrls.stream()
			.filter(StringUtils::hasText)
			.toList();
		if (imageUrls.isEmpty()) {
			return description;
		}
		StringBuilder html = new StringBuilder();
		if (StringUtils.hasText(description)) {
			html.append(description.trim());
		}
		for (String imageUrl : imageUrls) {
			if (html.length() > 0) {
				html.append("\n");
			}
			html.append("<p><img src=\"")
				.append(escapeHtmlAttribute(imageUrl))
				.append("\" alt=\"\"></p>");
		}
		return html.toString();
	}

	private String escapeHtmlAttribute(String value) {
		return value
			.replace("&", "&amp;")
			.replace("\"", "&quot;")
			.replace("<", "&lt;")
			.replace(">", "&gt;");
	}

	private boolean isLocalImageSource(String imageSource) {
		return IMAGE_SOURCE_LOCAL.equalsIgnoreCase(imageSource);
	}

	private record ImageMatch(String mainImageUrl, List<String> extraImageUrls, List<String> detailImageUrls) {
	}

	private record FolderImage(String fileName, String url) {
	}

	private record LocalFolderAssignment(List<List<String>> rawRows, List<String> errors) {
	}

	private record LocalUploadCandidate(MultipartFile file, String relativePath) {
	}

	private record LocalImageBatch(
		String batchId,
		List<LocalImageFile> files,
		List<String> imageFolders,
		Map<String, String> logicalImageUrls
	) {
	}

	private record LocalImageFile(String relativePath, String logicalObjectPath, Path tempPath) {
	}

	private record LocalImportMultipartFile(Path path, String originalFilename) implements MultipartFile {

		@Override
		public String getName() {
			return "file";
		}

		@Override
		public String getOriginalFilename() {
			return originalFilename;
		}

		@Override
		public String getContentType() {
			return "image/webp";
		}

		@Override
		public boolean isEmpty() {
			return getSize() == 0;
		}

		@Override
		public long getSize() {
			try {
				return Files.size(path);
			} catch (IOException exception) {
				throw new IllegalStateException("로컬 이미지 파일 크기를 읽을 수 없습니다.", exception);
			}
		}

		@Override
		public byte[] getBytes() throws IOException {
			return Files.readAllBytes(path);
		}

		@Override
		public InputStream getInputStream() throws IOException {
			return Files.newInputStream(path);
		}

		@Override
		public void transferTo(File dest) throws IOException {
			Files.copy(path, dest.toPath(), StandardCopyOption.REPLACE_EXISTING);
		}
	}
}
