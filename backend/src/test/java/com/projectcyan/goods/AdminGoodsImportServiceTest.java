package com.projectcyan.goods;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.util.List;

import com.projectcyan.storage.StorageDirectoryIndexService;
import com.projectcyan.storage.SupabaseStorageObject;
import com.projectcyan.storage.SupabaseStorageService;
import com.projectcyan.storage.SupabaseStorageWriteResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

class AdminGoodsImportServiceTest {

	private AdminGoodsService adminGoodsService;
	private GoodsRepository goodsRepository;
	private ArtistRepository artistRepository;
	private GoodsCategoryRepository goodsCategoryRepository;
	private SupabaseStorageService supabaseStorageService;
	private StorageDirectoryIndexService storageDirectoryIndexService;
	private AdminGoodsImportService adminGoodsImportService;

	@BeforeEach
	void setUp() {
		adminGoodsService = mock(AdminGoodsService.class);
		goodsRepository = mock(GoodsRepository.class);
		artistRepository = mock(ArtistRepository.class);
		goodsCategoryRepository = mock(GoodsCategoryRepository.class);
		supabaseStorageService = mock(SupabaseStorageService.class);
		storageDirectoryIndexService = mock(StorageDirectoryIndexService.class);
		adminGoodsImportService = new AdminGoodsImportService(
			adminGoodsService,
			goodsRepository,
			artistRepository,
			goodsCategoryRepository,
			supabaseStorageService,
			storageDirectoryIndexService
		);

		Artist artist = mock(Artist.class);
		when(artist.getArtistId()).thenReturn(7L);
		when(artist.getArtistName()).thenReturn("라이덴");
		when(artistRepository.findAllByOrderByArtistNameAsc()).thenReturn(List.of(artist));

		GoodsCategory category = mock(GoodsCategory.class);
		when(category.getCategoryId()).thenReturn(3L);
		when(category.getCategoryName()).thenReturn("스탠드");
		when(goodsCategoryRepository.findAllByOrderByCategoryNameAsc()).thenReturn(List.of(category));
	}

	@Test
	void previewsLocalImageFolderAndForcesHiddenStatus() {
		AdminGoodsImportPreview preview = adminGoodsImportService.preview(
			csvFile("""
				상품ID,상품명,가격,아티스트명,카테고리명,재고,판매상태,이미지폴더,태그,상세설명,베스트,AI추천
				,라이덴 스탠드,18000,라이덴,스탠드,15,ON_SALE,,라이덴,상세,FALSE,FALSE
				"""),
			List.of(imageFile("upload-root/genshin/raiden/main.webp")),
			List.of("upload-root/genshin/raiden/main.webp"),
			true
		);

		assertThat(preview.hasErrors()).isFalse();
		assertThat(preview.imageSource()).isEqualTo("LOCAL");
		assertThat(preview.imageBatchId()).isNotBlank();
		assertThat(preview.imageFolders()).containsExactly("genshin/raiden");
		assertThat(preview.rows()).hasSize(1);
		assertThat(preview.rows().getFirst().salesStatus()).isEqualTo("HIDDEN");
		assertThat(preview.rows().getFirst().imageFolder()).isEqualTo("genshin/raiden");
		assertThat(preview.rows().getFirst().mainImageUrl()).startsWith("local-import://");
	}

	@Test
	void assignsBlankImageFoldersFromLocalFolderQueueInOrder() {
		AdminGoodsImportPreview preview = adminGoodsImportService.preview(
			csvFile("""
				상품ID,상품명,가격,아티스트명,카테고리명,재고,판매상태,이미지폴더,태그,상세설명,베스트,AI추천
				,라이덴 A,18000,라이덴,스탠드,15,HIDDEN,,라이덴,상세,FALSE,FALSE
				,라이덴 B,19000,라이덴,스탠드,8,HIDDEN,,라이덴,상세,FALSE,FALSE
				"""),
			List.of(
				imageFile("upload-root/genshin/b/main.webp"),
				imageFile("upload-root/genshin/a/main.webp")
			),
			List.of(
				"upload-root/genshin/b/main.webp",
				"upload-root/genshin/a/main.webp"
			),
			true
		);

		assertThat(preview.hasErrors()).isFalse();
		assertThat(preview.rows()).extracting(AdminGoodsImportRow::imageFolder)
			.containsExactly("genshin/a", "genshin/b");
	}

	@Test
	void previewsChunkedLocalImageBatch() {
		String batchId = adminGoodsImportService.createLocalImageBatch();
		int firstCount = adminGoodsImportService.appendLocalImageBatch(
			batchId,
			List.of(imageFile("genshin/raiden/main.webp")),
			List.of("genshin/raiden/main.webp")
		);
		int secondCount = adminGoodsImportService.appendLocalImageBatch(
			batchId,
			List.of(imageFile("genshin/raiden/1.webp")),
			List.of("genshin/raiden/1.webp")
		);

		AdminGoodsImportPreview preview = adminGoodsImportService.preview(
			csvFile("""
				상품ID,상품명,가격,아티스트명,카테고리명,재고,판매상태,이미지폴더,태그,상세설명,베스트,AI추천
				,라이덴 스탠드,18000,라이덴,스탠드,15,HIDDEN,genshin/raiden,라이덴,상세,FALSE,FALSE
				"""),
			batchId,
			true
		);

		assertThat(firstCount).isEqualTo(1);
		assertThat(secondCount).isEqualTo(2);
		assertThat(preview.hasErrors()).isFalse();
		assertThat(preview.imageBatchId()).isEqualTo(batchId);
		assertThat(preview.rows().getFirst().mainImageUrl()).contains("/genshin/raiden/main.webp");
		assertThat(preview.rows().getFirst().extraImageUrls()).hasSize(1);
	}

	@Test
	void previewsLocalImageFolderWithoutMainAndMovesOverflowImagesToDetail() {
		AdminGoodsImportPreview preview = adminGoodsImportService.preview(
			csvFile("""
				상품ID,상품명,가격,아티스트명,카테고리명,재고,판매상태,이미지폴더,태그,상세설명,베스트,AI추천
				,라이덴 스탠드,18000,라이덴,스탠드,15,HIDDEN,genshin/raiden,라이덴,상세,FALSE,FALSE
				"""),
			List.of(
				imageFile("upload-root/genshin/raiden/3.webp"),
				imageFile("upload-root/genshin/raiden/1.webp"),
				imageFile("upload-root/genshin/raiden/6.webp"),
				imageFile("upload-root/genshin/raiden/2.webp"),
				imageFile("upload-root/genshin/raiden/5.webp"),
				imageFile("upload-root/genshin/raiden/4.webp")
			),
			List.of(
				"upload-root/genshin/raiden/3.webp",
				"upload-root/genshin/raiden/1.webp",
				"upload-root/genshin/raiden/6.webp",
				"upload-root/genshin/raiden/2.webp",
				"upload-root/genshin/raiden/5.webp",
				"upload-root/genshin/raiden/4.webp"
			),
			true
		);

		AdminGoodsImportRow row = preview.rows().getFirst();

		assertThat(preview.hasErrors()).isFalse();
		assertThat(row.mainImageUrl()).contains("/genshin/raiden/1.webp");
		assertThat(row.extraImageUrls()).hasSize(4);
		assertThat(row.detailImageUrls()).hasSize(1);
		assertThat(row.detailImageUrls().getFirst()).contains("/genshin/raiden/6.webp");
	}

	@Test
	void blocksLocalPreviewWhenCsvAndFolderTreeDoNotMatch() {
		AdminGoodsImportPreview preview = adminGoodsImportService.preview(
			csvFile("""
				상품ID,상품명,가격,아티스트명,카테고리명,재고,판매상태,이미지폴더,태그,상세설명,베스트,AI추천
				,라이덴 스탠드,18000,라이덴,스탠드,15,HIDDEN,genshin/raiden,라이덴,상세,FALSE,FALSE
				"""),
			List.of(
				imageFile("upload-root/genshin/raiden/main.webp"),
				imageFile("upload-root/genshin/nahida/main.webp")
			),
			List.of(
				"upload-root/genshin/raiden/main.webp",
				"upload-root/genshin/nahida/main.webp"
			),
			true
		);

		assertThat(preview.hasErrors()).isTrue();
		assertThat(preview.errors()).anySatisfy(message -> assertThat(message).contains("CSV 행에 배정되지 않은 로컬 이미지 폴더"));
	}

	@Test
	void uploadsLocalBatchBeforeImportingGoods() {
		AdminGoodsImportPreview preview = adminGoodsImportService.preview(
			csvFile("""
				상품ID,상품명,가격,아티스트명,카테고리명,재고,판매상태,이미지폴더,태그,상세설명,베스트,AI추천
				,라이덴 스탠드,18000,라이덴,스탠드,15,ON_SALE,genshin/raiden,라이덴,상세,FALSE,FALSE
				"""),
			List.of(
				imageFile("upload-root/genshin/raiden/main.webp"),
				imageFile("upload-root/genshin/raiden/1.webp"),
				imageFile("upload-root/genshin/raiden/2.webp"),
				imageFile("upload-root/genshin/raiden/3.webp"),
				imageFile("upload-root/genshin/raiden/4.webp"),
				imageFile("upload-root/genshin/raiden/5.webp")
			),
			List.of(
				"upload-root/genshin/raiden/main.webp",
				"upload-root/genshin/raiden/1.webp",
				"upload-root/genshin/raiden/2.webp",
				"upload-root/genshin/raiden/3.webp",
				"upload-root/genshin/raiden/4.webp",
				"upload-root/genshin/raiden/5.webp"
			),
			true
		);
		when(supabaseStorageService.uploadObjectBySizePolicyWithResult(
			eq("goods-image"),
			eq("goods"),
			anyString(),
			any(MultipartFile.class),
			anyBoolean()
		)).thenAnswer(invocation -> {
			String relativePath = invocation.getArgument(2);
			String fileName = relativePath.substring(relativePath.lastIndexOf('/') + 1);
			return new SupabaseStorageWriteResult(new SupabaseStorageObject(
				"goods-image",
				"goods/" + relativePath,
				fileName,
				"https://storage.example/goods/" + relativePath,
				12L,
				null
			), true);
		});

		int importedCount = adminGoodsImportService.importRows(
			preview.rows(),
			preview.imageSource(),
			preview.imageBatchId()
		);

		ArgumentCaptor<AdminGoodsRequest> requestCaptor = ArgumentCaptor.forClass(AdminGoodsRequest.class);
		verify(adminGoodsService).createGoods(requestCaptor.capture());
		verify(storageDirectoryIndexService, times(6)).recordUploadedImage(any(SupabaseStorageObject.class), eq(true));
		assertThat(importedCount).isEqualTo(1);
		assertThat(requestCaptor.getValue().salesStatus()).isEqualTo("HIDDEN");
		assertThat(requestCaptor.getValue().imageUrl()).isEqualTo("https://storage.example/goods/genshin/raiden/main.webp");
		assertThat(requestCaptor.getValue().extraImageUrls()).containsExactly(
			"https://storage.example/goods/genshin/raiden/1.webp",
			"https://storage.example/goods/genshin/raiden/2.webp",
			"https://storage.example/goods/genshin/raiden/3.webp",
			"https://storage.example/goods/genshin/raiden/4.webp"
		);
		assertThat(requestCaptor.getValue().description())
			.contains("상세")
			.contains("https://storage.example/goods/genshin/raiden/5.webp")
			.contains("<img");
	}

	private MockMultipartFile csvFile(String text) {
		return new MockMultipartFile(
			"file",
			"goods.csv",
			"text/csv",
			text.stripIndent().getBytes(StandardCharsets.UTF_8)
		);
	}

	private MockMultipartFile imageFile(String relativePath) {
		return new MockMultipartFile(
			"imageFiles",
			relativePath,
			"image/webp",
			"webp".getBytes(StandardCharsets.UTF_8)
		);
	}
}
