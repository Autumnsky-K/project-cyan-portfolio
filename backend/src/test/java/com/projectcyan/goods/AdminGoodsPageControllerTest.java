package com.projectcyan.goods;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.util.List;

import com.projectcyan.storage.SupabaseStorageService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

class AdminGoodsPageControllerTest {

	@Test
	void downloadsImportTemplateForCurrentLocalFolderFlow() {
		GoodsService goodsService = mock(GoodsService.class);
		when(goodsService.findGoodsFilters()).thenReturn(new GoodsFiltersResponse(
			List.of(new GoodsFilterOptionResponse("라이덴", "7")),
			List.of(new GoodsFilterOptionResponse("스탠드", "3")),
			List.of()
		));
		AdminGoodsPageController controller = new AdminGoodsPageController(
			goodsService,
			mock(AdminGoodsService.class),
			mock(GoodsRepository.class),
			mock(GoodsStockRepository.class),
			mock(SupabaseStorageService.class),
			mock(AdminGoodsImportService.class),
			"http://localhost:5173"
		);

		ResponseEntity<byte[]> response = controller.downloadImportTemplate();

		String csv = new String(response.getBody(), StandardCharsets.UTF_8);
		assertThat(csv).startsWith("\uFEFF상품ID,상품명,가격,아티스트명,카테고리명,재고,판매상태,이미지폴더,태그,상세설명,베스트,AI추천");
		assertThat(csv)
			.contains("#(로컬 폴더 동시 등록 시 공란 가능)")
			.contains("일괄등록은 항상 HIDDEN 저장")
			.contains("이미지 정렬순 5장 이후는 상세설명에 이미지 HTML로 자동 첨부")
			.contains("#라이덴")
			.contains("#스탠드");
	}
}
