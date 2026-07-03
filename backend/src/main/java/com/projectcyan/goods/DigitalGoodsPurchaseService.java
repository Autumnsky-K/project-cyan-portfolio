package com.projectcyan.goods;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

import com.projectcyan.common.ApiErrorException;
import com.projectcyan.member.DigitalLibraryItemResponse;
import com.projectcyan.member.DigitalLibraryService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DigitalGoodsPurchaseService {

	private static final Set<String> SALEABLE_STATUSES = Set.of("ON_SALE", "AVAILABLE", "SALE");

	private final GoodsRepository goodsRepository;
	private final DigitalGoodsEntitlementGrantService entitlementGrantService;
	private final DigitalLibraryService digitalLibraryService;

	public DigitalGoodsPurchaseService(
		GoodsRepository goodsRepository,
		DigitalGoodsEntitlementGrantService entitlementGrantService,
		DigitalLibraryService digitalLibraryService
	) {
		this.goodsRepository = goodsRepository;
		this.entitlementGrantService = entitlementGrantService;
		this.digitalLibraryService = digitalLibraryService;
	}

	@Transactional
	public DigitalLibraryItemResponse claim(Long memberId, Long goodsId) {
		if (memberId == null) {
			throw new ApiErrorException("AUTH_UNAUTHORIZED", "로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
		}
		Goods goods = goodsRepository.findById(goodsId)
			.orElseThrow(() -> new ApiErrorException("GOODS_NOT_FOUND", "Goods not found.", HttpStatus.NOT_FOUND));
		if (!GoodsVisibility.isPubliclyVisible(goods)) {
			throw new ApiErrorException("GOODS_NOT_FOUND", "Goods not found.", HttpStatus.NOT_FOUND);
		}
		if (!isDigitalGoods(goods)) {
			throw new ApiErrorException(
				"DIGITAL_PURCHASE_INVALID",
				"디지털 상품만 바로 등록할 수 있습니다.",
				HttpStatus.BAD_REQUEST
			);
		}
		if (!isSaleable(goods)) {
			throw new ApiErrorException("GOODS_NOT_SALE", "현재 구매할 수 없는 상품입니다.", HttpStatus.BAD_REQUEST);
		}
		if (goods.getPrice() == null || goods.getPrice() != 0) {
			throw new ApiErrorException(
				"DIGITAL_PURCHASE_PAYMENT_REQUIRED",
				"결제 처리가 필요한 디지털 상품입니다.",
				HttpStatus.BAD_REQUEST
			);
		}

		entitlementGrantService.grantFreeGoods(memberId, goods.getGoodsId());
		List<DigitalLibraryItemResponse> libraryItems = digitalLibraryService.findLibrary(memberId, goods.getGoodsId());
		return libraryItems.stream()
			.findFirst()
			.orElseThrow(() -> new ApiErrorException(
				"DIGITAL_PURCHASE_FAILED",
				"디지털 상품 권한을 등록하지 못했습니다.",
				HttpStatus.INTERNAL_SERVER_ERROR
			));
	}

	@Transactional(readOnly = true)
	public Optional<DigitalLibraryItemResponse> findPurchased(Long memberId, Long goodsId) {
		if (memberId == null || goodsId == null) {
			return Optional.empty();
		}
		return digitalLibraryService.findLibrary(memberId, goodsId).stream().findFirst();
	}

	private boolean isDigitalGoods(Goods goods) {
		return goods.getCategory() != null
			&& goods.getCategory().getFulfillmentType() == GoodsFulfillmentType.DIGITAL;
	}

	private boolean isSaleable(Goods goods) {
		String salesStatus = goods.getSalesStatus() == null
			? ""
			: goods.getSalesStatus().trim().toUpperCase(Locale.ROOT);
		return SALEABLE_STATUSES.contains(salesStatus);
	}
}
