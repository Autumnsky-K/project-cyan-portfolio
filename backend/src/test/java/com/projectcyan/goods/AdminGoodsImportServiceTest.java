package com.projectcyan.goods;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
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
				,라이덴 스탠드,18000,라이덴,스탠드,15,ON_SALE,genshin/raiden,라이덴,상세,FALSE,FALSE
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
		assertThat(preview.rows().getFirst().mainImageUrl()).startsWith("local-import://");
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
		assertThat(preview.errors()).anySatisfy(message -> assertThat(message).contains("CSV에 없는 로컬 이미지 폴더"));
	}

	@Test
	void uploadsLocalBatchBeforeImportingGoods() {
		AdminGoodsImportPreview preview = adminGoodsImportService.preview(
			csvFile("""
				상품ID,상품명,가격,아티스트명,카테고리명,재고,판매상태,이미지폴더,태그,상세설명,베스트,AI추천
				,라이덴 스탠드,18000,라이덴,스탠드,15,ON_SALE,genshin/raiden,라이덴,상세,FALSE,FALSE
				"""),
			List.of(imageFile("upload-root/genshin/raiden/main.webp")),
			List.of("upload-root/genshin/raiden/main.webp"),
			true
		);
		when(supabaseStorageService.uploadObjectBySizePolicyWithResult(
			eq("goods-image"),
			eq("goods"),
			eq("genshin/raiden/main.webp"),
			any(MultipartFile.class),
			anyBoolean()
		)).thenReturn(new SupabaseStorageWriteResult(new SupabaseStorageObject(
			"goods-image",
			"goods/genshin/raiden/main.webp",
			"main.webp",
			"https://storage.example/goods/genshin/raiden/main.webp",
			12L,
			null
		), true));

		int importedCount = adminGoodsImportService.importRows(
			preview.rows(),
			preview.imageSource(),
			preview.imageBatchId()
		);

		ArgumentCaptor<AdminGoodsRequest> requestCaptor = ArgumentCaptor.forClass(AdminGoodsRequest.class);
		verify(adminGoodsService).createGoods(requestCaptor.capture());
		verify(storageDirectoryIndexService).recordUploadedImage(any(SupabaseStorageObject.class), eq(true));
		assertThat(importedCount).isEqualTo(1);
		assertThat(requestCaptor.getValue().salesStatus()).isEqualTo("HIDDEN");
		assertThat(requestCaptor.getValue().imageUrl()).isEqualTo("https://storage.example/goods/genshin/raiden/main.webp");
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
