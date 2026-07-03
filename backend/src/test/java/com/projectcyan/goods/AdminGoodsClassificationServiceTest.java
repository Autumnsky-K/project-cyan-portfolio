package com.projectcyan.goods;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.projectcyan.admin.SupabaseUsageCounter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.web.server.ResponseStatusException;

class AdminGoodsClassificationServiceTest {

	private GoodsCategoryRepository goodsCategoryRepository;
	private TagRepository tagRepository;
	private GoodsRepository goodsRepository;
	private AdminGoodsClassificationService service;

	@BeforeEach
	void setUp() {
		goodsCategoryRepository = mock(GoodsCategoryRepository.class);
		tagRepository = mock(TagRepository.class);
		goodsRepository = mock(GoodsRepository.class);
		service = new AdminGoodsClassificationService(
			goodsCategoryRepository,
			tagRepository,
			goodsRepository,
			new SupabaseUsageCounter()
		);
	}

	@Test
	void createsCategoryWithFulfillmentType() {
		when(goodsCategoryRepository.findByCategoryNameIgnoreCase("디지털 굿즈")).thenReturn(Optional.empty());
		when(goodsCategoryRepository.nextCategoryId()).thenReturn(12L);
		when(goodsCategoryRepository.save(any(GoodsCategory.class))).thenAnswer(invocation -> invocation.getArgument(0));

		GoodsCategory savedCategory = service.createCategory(" 디지털 굿즈 ", "DIGITAL");

		ArgumentCaptor<GoodsCategory> categoryCaptor = ArgumentCaptor.forClass(GoodsCategory.class);
		verify(goodsCategoryRepository).save(categoryCaptor.capture());
		assertThat(savedCategory.getCategoryId()).isEqualTo(12L);
		assertThat(categoryCaptor.getValue().getCategoryName()).isEqualTo("디지털 굿즈");
		assertThat(categoryCaptor.getValue().getFulfillmentType()).isEqualTo(GoodsFulfillmentType.DIGITAL);
	}

	@Test
	void rejectsDuplicateCategoryName() {
		GoodsCategory existingCategory = new GoodsCategory(3L, "포토카드", GoodsFulfillmentType.PHYSICAL);
		when(goodsCategoryRepository.findByCategoryNameIgnoreCase("포토카드")).thenReturn(Optional.of(existingCategory));

		assertThatThrownBy(() -> service.createCategory("포토카드", "PHYSICAL"))
			.isInstanceOf(ResponseStatusException.class)
			.hasMessageContaining("이미 존재하는 카테고리명");

		verify(goodsCategoryRepository, never()).save(any());
	}

	@Test
	void rejectsDeletingCategoryUsedByGoods() {
		GoodsCategory existingCategory = new GoodsCategory(3L, "포토카드", GoodsFulfillmentType.PHYSICAL);
		when(goodsCategoryRepository.findById(3L)).thenReturn(Optional.of(existingCategory));
		when(goodsRepository.countByCategoryCategoryId(3L)).thenReturn(2L);

		assertThatThrownBy(() -> service.deleteCategory(3L))
			.isInstanceOf(ResponseStatusException.class)
			.hasMessageContaining("상품에 사용 중인 카테고리");

		verify(goodsCategoryRepository, never()).delete(any());
	}

	@Test
	void createsTagWithNextId() {
		when(tagRepository.findByTagNameIgnoreCase("예약")).thenReturn(Optional.empty());
		when(tagRepository.nextTagId()).thenReturn(21L);
		when(tagRepository.save(any(Tag.class))).thenAnswer(invocation -> invocation.getArgument(0));

		Tag savedTag = service.createTag(" 예약 ");

		ArgumentCaptor<Tag> tagCaptor = ArgumentCaptor.forClass(Tag.class);
		verify(tagRepository).save(tagCaptor.capture());
		assertThat(savedTag.getTagId()).isEqualTo(21L);
		assertThat(tagCaptor.getValue().getTagName()).isEqualTo("예약");
	}

	@Test
	void rejectsDeletingTagUsedByGoods() {
		Tag existingTag = new Tag(9L, "한정");
		when(tagRepository.findById(9L)).thenReturn(Optional.of(existingTag));
		when(tagRepository.countGoodsByTagId(9L)).thenReturn(1L);

		assertThatThrownBy(() -> service.deleteTag(9L))
			.isInstanceOf(ResponseStatusException.class)
			.hasMessageContaining("상품에 사용 중인 태그");

		verify(tagRepository, never()).delete(any());
	}
}
