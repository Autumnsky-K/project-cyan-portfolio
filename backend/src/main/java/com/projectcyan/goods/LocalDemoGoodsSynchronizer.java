package com.projectcyan.goods;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import tools.jackson.databind.ObjectMapper;

@Component
@Profile("local")
public class LocalDemoGoodsSynchronizer {

	private static final Logger log = LoggerFactory.getLogger(LocalDemoGoodsSynchronizer.class);
	private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
	private static final Instant DEMO_ANCHOR = Instant.parse("2026-06-18T00:00:00Z");
	private static final long CATEGORY_ID_BASE = 1_000_000_000_000L;
	private static final long ARTIST_ID_BASE = 2_000_000_000_000L;
	private static final long GOODS_ID_BASE = 3_000_000_000_000L;
	private static final long VARIANT_ID_BASE = 4_000_000_000_000L;
	private static final long OPTION_GROUP_ID_BASE = 5_000_000_000_000L;
	private static final long OPTION_VALUE_ID_BASE = 6_000_000_000_000L;
	private static final long ID_RANGE = 900_000_000_000L;

	private final Path imageRoot;
	private final Path metadataPath;
	private final JdbcTemplate jdbcTemplate;
	private final TransactionTemplate transactionTemplate;
	private final ObjectMapper objectMapper;
	private String lastFingerprint = "";

	public LocalDemoGoodsSynchronizer(
		@Value("${demo.images.root}") String imageRoot,
		JdbcTemplate jdbcTemplate,
		TransactionTemplate transactionTemplate,
		ObjectMapper objectMapper
	) {
		this.imageRoot = Path.of(imageRoot).toAbsolutePath().normalize();
		this.metadataPath = this.imageRoot.resolve("product-metadata.json");
		this.jdbcTemplate = jdbcTemplate;
		this.transactionTemplate = transactionTemplate;
		this.objectMapper = objectMapper;
	}

	@EventListener(ApplicationReadyEvent.class)
	public void synchronizeOnStartup() {
		synchronize();
	}

	@Scheduled(fixedDelayString = "${demo.images.sync-delay-ms:5000}")
	public void synchronizePeriodically() {
		synchronize();
	}

	private synchronized void synchronize() {
		try {
			List<DemoImage> images = scanImages();
			ProductMetadataFile existingFile = readMetadata();
			ProductMetadataFile mergedFile = mergeMetadata(images, existingFile);
			byte[] metadataBytes = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(mergedFile);
			String fingerprint = fingerprint(images, metadataBytes);
			if (fingerprint.equals(lastFingerprint)) {
				return;
			}

			if (existingFile == null || !existingFile.products().equals(mergedFile.products())) {
				writeMetadataAtomically(metadataBytes);
			}

			transactionTemplate.executeWithoutResult(status -> replaceImportedGoods(images, mergedFile.products()));
			lastFingerprint = fingerprint;
			log.info("Synchronized {} local image products with detail metadata.", images.size());
		} catch (IOException | RuntimeException exception) {
			log.error("Unable to synchronize local demo goods.", exception);
		}
	}

	private List<DemoImage> scanImages() throws IOException {
		if (!Files.isDirectory(imageRoot)) {
			return List.of();
		}

		try (Stream<Path> files = Files.walk(imageRoot, 3)) {
			return files
				.filter(Files::isRegularFile)
				.filter(this::isSupportedImage)
				.map(this::toDemoImage)
				.filter(image -> image != null)
				.sorted(Comparator.comparing(DemoImage::relativePath))
				.toList();
		}
	}

	private ProductMetadataFile readMetadata() throws IOException {
		if (!Files.isRegularFile(metadataPath)) {
			return null;
		}
		return objectMapper.readValue(metadataPath.toFile(), ProductMetadataFile.class);
	}

	private ProductMetadataFile mergeMetadata(List<DemoImage> images, ProductMetadataFile existingFile) {
		Map<String, ProductMetadata> existingByPath = new LinkedHashMap<>();
		if (existingFile != null && existingFile.products() != null) {
			for (ProductMetadata product : existingFile.products()) {
				existingByPath.put(product.relativePath(), product);
			}
		}

		List<ProductMetadata> products = images.stream()
			.map(image -> existingByPath.getOrDefault(image.relativePath(), generateMetadata(image)))
			.sorted(Comparator.comparing(ProductMetadata::relativePath))
			.toList();

		Instant generatedAt = existingFile != null && existingFile.products().equals(products)
			? existingFile.generatedAt()
			: Instant.now();
		return new ProductMetadataFile(1, generatedAt, products);
	}

	private ProductMetadata generateMetadata(DemoImage image) {
		long seed = stableNumber("metadata/" + image.relativePath());
		String characterName = displayName(image.characterFolder());
		String fileStem = removeExtension(image.fileName());
		int price = 12_000 + (int) (seed % 18) * 1_000;
		int shippingFee = seed % 4 == 0 ? 0 : 3_000 + (int) (seed % 3) * 1_000;
		int saleMode = (int) (seed % 5);
		String saleType = saleMode == 1 || saleMode == 2 ? "PREORDER" : "STANDARD";
		Instant saleStartAt;
		Instant saleEndAt;
		if (saleMode == 2) {
			saleStartAt = DEMO_ANCHOR.plusSeconds(30L * 24 * 60 * 60);
			saleEndAt = DEMO_ANCHOR.plusSeconds(90L * 24 * 60 * 60);
		} else if (saleMode == 3) {
			saleStartAt = DEMO_ANCHOR.minusSeconds(90L * 24 * 60 * 60);
			saleEndAt = DEMO_ANCHOR.minusSeconds(10L * 24 * 60 * 60);
		} else {
			saleStartAt = DEMO_ANCHOR.minusSeconds(30L * 24 * 60 * 60);
			saleEndAt = DEMO_ANCHOR.plusSeconds(365L * 24 * 60 * 60);
		}

		List<OptionGroupMetadata> optionGroups = generateOptionGroups(seed);
		List<VariantMetadata> variants = generateVariants(image.relativePath(), seed, optionGroups, saleMode == 4);
		return new ProductMetadata(
			image.relativePath(),
			characterName + " 이미지 굿즈 " + fileStem,
			price,
			characterName + "의 이미지 " + fileStem + "을 활용한 더미 굿즈입니다.",
			saleType,
			saleStartAt,
			saleEndAt,
			new ShippingMetadata(
				shippingFee,
				"Project Cyan 배송",
				seed % 6 == 0 ? "국내ㆍ해외" : "국내",
				"결제 단계에서 지역에 따른 추가 배송비가 발생할 수 있습니다."
			),
			new NoticeMetadata(
				"이미지 기반으로 자동 생성된 로컬 개발용 상품입니다.",
				"판매 기간 내 주문은 장바구니 단계까지 자유롭게 변경할 수 있습니다.",
				saleType.equals("PREORDER")
					? "예약 판매 종료 후 순차적으로 출고될 예정입니다."
					: "구매일로부터 1~3 영업일 이내 출고 예정입니다."
			),
			optionGroups,
			variants
		);
	}

	private List<OptionGroupMetadata> generateOptionGroups(long seed) {
		return switch ((int) (seed % 4)) {
			case 1 -> List.of(new OptionGroupMetadata("finish", "마감", List.of("무광", "유광")));
			case 2 -> List.of(new OptionGroupMetadata("size", "사이즈", List.of("S", "M", "L")));
			case 3 -> List.of(
				new OptionGroupMetadata("size", "사이즈", List.of("S", "M", "L")),
				new OptionGroupMetadata("frame", "프레임", List.of("블랙", "화이트"))
			);
			default -> List.of();
		};
	}

	private List<VariantMetadata> generateVariants(
		String relativePath,
		long seed,
		List<OptionGroupMetadata> optionGroups,
		boolean forceSoldOut
	) {
		List<Map<String, String>> selections = new ArrayList<>();
		buildSelections(optionGroups, 0, new LinkedHashMap<>(), selections);
		if (selections.isEmpty()) {
			selections.add(Map.of());
		}

		List<VariantMetadata> variants = new ArrayList<>();
		for (int index = 0; index < selections.size(); index++) {
			Map<String, String> selection = selections.get(index);
			long variantSeed = stableNumber(relativePath + "/variant/" + index);
			int additionalPrice = optionGroups.isEmpty() ? 0 : (int) (variantSeed % 4) * 1_000;
			int stock = forceSoldOut ? 0 : 3 + (int) (variantSeed % 28);
			variants.add(new VariantMetadata(
				"V" + (index + 1),
				selection,
				additionalPrice,
				stock,
				true
			));
		}
		return variants;
	}

	private void buildSelections(
		List<OptionGroupMetadata> groups,
		int index,
		Map<String, String> current,
		List<Map<String, String>> result
	) {
		if (index >= groups.size()) {
			result.add(Map.copyOf(current));
			return;
		}
		OptionGroupMetadata group = groups.get(index);
		for (String value : group.values()) {
			current.put(group.key(), value);
			buildSelections(groups, index + 1, current, result);
		}
		current.remove(group.key());
	}

	private void replaceImportedGoods(List<DemoImage> images, List<ProductMetadata> products) {
		deleteImportedRows();
		Map<String, DemoImage> imagesByPath = new LinkedHashMap<>();
		for (DemoImage image : images) {
			imagesByPath.put(image.relativePath(), image);
		}

		List<Object[]> categories = new ArrayList<>();
		List<Object[]> artists = new ArrayList<>();
		List<Object[]> goods = new ArrayList<>();
		List<Object[]> stocks = new ArrayList<>();
		List<Object[]> groups = new ArrayList<>();
		List<Object[]> values = new ArrayList<>();
		List<Object[]> variants = new ArrayList<>();
		List<Object[]> variantValues = new ArrayList<>();
		Set<String> seenCategories = new java.util.HashSet<>();
		Set<String> seenArtists = new java.util.HashSet<>();

		for (ProductMetadata product : products) {
			DemoImage image = imagesByPath.get(product.relativePath());
			if (image == null) {
				continue;
			}
			long categoryId = stableId(CATEGORY_ID_BASE, "category/" + image.gameFolder());
			long artistId = stableId(ARTIST_ID_BASE, "artist/" + image.gameFolder() + "/" + image.characterFolder());
			long goodsId = stableId(GOODS_ID_BASE, "goods/" + image.relativePath());
			String gameName = displayName(image.gameFolder());
			String characterName = displayName(image.characterFolder());
			int totalStock = product.variants().stream()
				.filter(VariantMetadata::active)
				.mapToInt(VariantMetadata::stock)
				.sum();

			if (seenCategories.add(image.gameFolder())) {
				categories.add(new Object[] { categoryId, gameName });
			}
			if (seenArtists.add(image.gameFolder() + "/" + image.characterFolder())) {
				artists.add(new Object[] { artistId, characterName, gameName });
			}

			goods.add(new Object[] {
				goodsId, artistId, categoryId, product.name(), product.price(), product.description(),
				imageUrl(image), false, false, salesStatus(product, totalStock), Timestamp.from(image.modifiedAt()),
				product.saleType(), Timestamp.from(product.saleStartAt()), Timestamp.from(product.saleEndAt()),
				product.shipping().fee(), product.shipping().carrier(), product.shipping().scope(),
				product.shipping().note(), product.notices().intro(), product.notices().cancel(),
				product.notices().delivery()
			});
			stocks.add(new Object[] { goodsId, totalStock });

			Map<String, Long> optionValueIds = new LinkedHashMap<>();
			for (int groupIndex = 0; groupIndex < product.optionGroups().size(); groupIndex++) {
				OptionGroupMetadata group = product.optionGroups().get(groupIndex);
				long groupId = stableId(OPTION_GROUP_ID_BASE, product.relativePath() + "/group/" + group.key());
				groups.add(new Object[] { groupId, goodsId, group.key(), group.name(), groupIndex });
				for (int valueIndex = 0; valueIndex < group.values().size(); valueIndex++) {
					String value = group.values().get(valueIndex);
					long valueId = stableId(
						OPTION_VALUE_ID_BASE,
						product.relativePath() + "/group/" + group.key() + "/value/" + value
					);
					values.add(new Object[] { valueId, groupId, value, valueIndex });
					optionValueIds.put(group.key() + '\0' + value, valueId);
				}
			}

			for (VariantMetadata variant : product.variants()) {
				long variantId = stableId(VARIANT_ID_BASE, product.relativePath() + "/variant/" + variant.key());
				variants.add(new Object[] {
					variantId, goodsId, goodsId + "-" + variant.key(), variant.additionalPrice(),
					variant.stock(), variant.active()
				});
				for (Map.Entry<String, String> selection : variant.selections().entrySet()) {
					Long valueId = optionValueIds.get(selection.getKey() + '\0' + selection.getValue());
					if (valueId != null) {
						variantValues.add(new Object[] { variantId, valueId });
					}
				}
			}
		}

		jdbcTemplate.batchUpdate("insert into goods_category (category_id, category_name) values (?, ?)", categories);
		jdbcTemplate.batchUpdate("insert into artist (artist_id, artist_name, group_name) values (?, ?, ?)", artists);
		jdbcTemplate.batchUpdate(
			"""
			insert into goods (
				goods_id, artist_id, category_id, goods_name, price, description,
				main_image_url, ai_pick_default, is_best_seller, sales_status, created_at,
				sale_type, sale_start_at, sale_end_at, shipping_fee, shipping_carrier,
				shipping_scope, shipping_note, notice_intro, notice_cancel, notice_delivery
			) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			""",
			goods
		);
		jdbcTemplate.batchUpdate("insert into goods_stock (goods_id, current_stock) values (?, ?)", stocks);
		jdbcTemplate.batchUpdate(
			"insert into goods_option_group (option_group_id, goods_id, option_key, option_name, display_order) values (?, ?, ?, ?, ?)",
			groups
		);
		jdbcTemplate.batchUpdate(
			"insert into goods_option_value (option_value_id, option_group_id, value_name, display_order) values (?, ?, ?, ?)",
			values
		);
		jdbcTemplate.batchUpdate(
			"insert into goods_variant (variant_id, goods_id, sku, additional_price, stock_count, active) values (?, ?, ?, ?, ?, ?)",
			variants
		);
		jdbcTemplate.batchUpdate(
			"insert into goods_variant_value (variant_id, option_value_id) values (?, ?)",
			variantValues
		);
	}

	private void deleteImportedRows() {
		long goodsEnd = GOODS_ID_BASE + ID_RANGE;
		long artistEnd = ARTIST_ID_BASE + ID_RANGE;
		long categoryEnd = CATEGORY_ID_BASE + ID_RANGE;
		jdbcTemplate.update("delete from goods where goods_id >= ? and goods_id < ?", GOODS_ID_BASE, goodsEnd);
		jdbcTemplate.update("delete from artist where artist_id >= ? and artist_id < ?", ARTIST_ID_BASE, artistEnd);
		jdbcTemplate.update("delete from goods_category where category_id >= ? and category_id < ?", CATEGORY_ID_BASE, categoryEnd);
		jdbcTemplate.update("delete from goods where goods_id between 2001 and 2024");
	}

	private String salesStatus(ProductMetadata product, int totalStock) {
		if (totalStock <= 0) {
			return "SOLD_OUT";
		}
		if (DEMO_ANCHOR.isBefore(product.saleStartAt())) {
			return "UPCOMING";
		}
		if (DEMO_ANCHOR.isAfter(product.saleEndAt())) {
			return "ENDED";
		}
		return product.saleType().equals("PREORDER") ? "RESERVATION" : "ON_SALE";
	}

	private boolean isSupportedImage(Path path) {
		String fileName = path.getFileName().toString();
		int extensionIndex = fileName.lastIndexOf('.');
		return extensionIndex >= 0
			&& IMAGE_EXTENSIONS.contains(fileName.substring(extensionIndex + 1).toLowerCase(Locale.ROOT));
	}

	private DemoImage toDemoImage(Path file) {
		Path relative = imageRoot.relativize(file);
		if (relative.getNameCount() != 3) {
			return null;
		}
		try {
			return new DemoImage(
				relative.toString().replace('\\', '/'),
				relative.getName(0).toString(),
				relative.getName(1).toString(),
				relative.getName(2).toString(),
				Files.size(file),
				Files.getLastModifiedTime(file).toInstant()
			);
		} catch (IOException exception) {
			log.warn("Unable to read local demo image metadata: {}", file, exception);
			return null;
		}
	}

	private void writeMetadataAtomically(byte[] bytes) throws IOException {
		Path temporary = metadataPath.resolveSibling(metadataPath.getFileName() + ".tmp");
		Files.write(temporary, bytes);
		try {
			Files.move(
				temporary,
				metadataPath,
				StandardCopyOption.REPLACE_EXISTING,
				StandardCopyOption.ATOMIC_MOVE
			);
		} catch (AtomicMoveNotSupportedException exception) {
			Files.move(temporary, metadataPath, StandardCopyOption.REPLACE_EXISTING);
		}
	}

	private String fingerprint(List<DemoImage> images, byte[] metadataBytes) {
		MessageDigest digest = sha256();
		for (DemoImage image : images) {
			digest.update((image.relativePath() + '\0' + image.size() + '\0' + image.modifiedAt() + '\n')
				.getBytes(StandardCharsets.UTF_8));
		}
		digest.update(metadataBytes);
		return HexFormat.of().formatHex(digest.digest());
	}

	private long stableId(long base, String value) {
		return base + stableNumber(value);
	}

	private long stableNumber(String value) {
		byte[] hash = sha256().digest(value.getBytes(StandardCharsets.UTF_8));
		long number = 0;
		for (int index = 0; index < Long.BYTES; index++) {
			number = (number << 8) | Byte.toUnsignedLong(hash[index]);
		}
		return Math.floorMod(number, ID_RANGE);
	}

	private MessageDigest sha256() {
		try {
			return MessageDigest.getInstance("SHA-256");
		} catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 is unavailable.", exception);
		}
	}

	private String displayName(String value) {
		String[] parts = value.replace('-', '_').split("_");
		List<String> names = new ArrayList<>();
		for (String part : parts) {
			if (!part.isBlank()) {
				names.add(part.substring(0, 1).toUpperCase(Locale.ROOT) + part.substring(1));
			}
		}
		return String.join(" ", names);
	}

	private String removeExtension(String fileName) {
		int extensionIndex = fileName.lastIndexOf('.');
		return extensionIndex < 0 ? fileName : fileName.substring(0, extensionIndex);
	}

	private String imageUrl(DemoImage image) {
		return "http://localhost:8080/demo-source/"
			+ encode(image.gameFolder()) + "/"
			+ encode(image.characterFolder()) + "/"
			+ encode(image.fileName());
	}

	private String encode(String segment) {
		return URLEncoder.encode(segment, StandardCharsets.UTF_8).replace("+", "%20");
	}

	private record DemoImage(
		String relativePath,
		String gameFolder,
		String characterFolder,
		String fileName,
		long size,
		Instant modifiedAt
	) {
	}

	private record ProductMetadataFile(int version, Instant generatedAt, List<ProductMetadata> products) {
	}

	private record ProductMetadata(
		String relativePath,
		String name,
		int price,
		String description,
		String saleType,
		Instant saleStartAt,
		Instant saleEndAt,
		ShippingMetadata shipping,
		NoticeMetadata notices,
		List<OptionGroupMetadata> optionGroups,
		List<VariantMetadata> variants
	) {
	}

	private record ShippingMetadata(int fee, String carrier, String scope, String note) {
	}

	private record NoticeMetadata(String intro, String cancel, String delivery) {
	}

	private record OptionGroupMetadata(String key, String name, List<String> values) {
	}

	private record VariantMetadata(
		String key,
		Map<String, String> selections,
		int additionalPrice,
		int stock,
		boolean active
	) {
	}
}
