package com.projectcyan.goods;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import com.projectcyan.common.ApiErrorException;
import com.projectcyan.member.DigitalLibraryItemResponse;
import com.projectcyan.member.DigitalLibraryService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DigitalGoodsPurchaseServiceTest {

	private GoodsRepository goodsRepository;
	private DigitalGoodsEntitlementGrantService entitlementGrantService;
	private DigitalLibraryService digitalLibraryService;
	private DigitalGoodsPurchaseService service;

	@BeforeEach
	void setUp() {
		goodsRepository = mock(GoodsRepository.class);
		entitlementGrantService = mock(DigitalGoodsEntitlementGrantService.class);
		digitalLibraryService = mock(DigitalLibraryService.class);
		service = new DigitalGoodsPurchaseService(
			goodsRepository,
			entitlementGrantService,
			digitalLibraryService
		);
	}

	@Test
	void claimsFreeDigitalGoodsAndReturnsLibraryItem() {
		Goods goods = goods(42L, 0, "ON_SALE", GoodsFulfillmentType.DIGITAL);
		DigitalLibraryItemResponse libraryItem = new DigitalLibraryItemResponse(
			10L,
			42L,
			"Free Voice",
			"CYAN",
			"Voice Pack",
			0,
			null,
			null,
			null,
			null,
			true,
			1,
			1,
			30,
			List.of()
		);
		when(goodsRepository.findById(42L)).thenReturn(Optional.of(goods));
		when(digitalLibraryService.findLibrary(7L, 42L)).thenReturn(List.of(libraryItem));

		DigitalLibraryItemResponse response = service.claim(7L, 42L);

		assertThat(response).isSameAs(libraryItem);
		verify(entitlementGrantService).grantFreeGoods(7L, 42L);
	}

	@Test
	void rejectsPaidDigitalGoods() {
		Goods goods = goods(42L, 1000, "ON_SALE", GoodsFulfillmentType.DIGITAL);
		when(goodsRepository.findById(42L)).thenReturn(Optional.of(goods));

		assertThatThrownBy(() -> service.claim(7L, 42L))
			.isInstanceOf(ApiErrorException.class)
			.extracting(exception -> ((ApiErrorException) exception).getCode())
			.isEqualTo("DIGITAL_PURCHASE_PAYMENT_REQUIRED");
	}

	private Goods goods(Long goodsId, Integer price, String salesStatus, GoodsFulfillmentType fulfillmentType) {
		Goods goods = mock(Goods.class);
		GoodsCategory category = mock(GoodsCategory.class);
		when(category.getFulfillmentType()).thenReturn(fulfillmentType);
		when(goods.getGoodsId()).thenReturn(goodsId);
		when(goods.getPrice()).thenReturn(price);
		when(goods.getSalesStatus()).thenReturn(salesStatus);
		when(goods.getCategory()).thenReturn(category);
		return goods;
	}
}
