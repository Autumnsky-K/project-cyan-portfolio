package com.projectcyan.goods;

import java.time.Instant;
import java.util.List;

public record GoodsDetailResponse(
	Long goodsId,
	String name,
	Integer price,
	String imageUrl,
	List<String> tags,
	String description,
	Long artistId,
	Integer stockCount,
	String artistName,
	String categoryName,
	String salesStatus,
	Boolean isBestSeller,
	Boolean aiPickDefault,
	String saleType,
	Instant saleStartAt,
	Instant saleEndAt,
	String purchaseState,
	String purchaseMessage,
	GoodsShippingResponse shipping,
	List<GoodsOptionGroupResponse> optionGroups,
	List<GoodsVariantResponse> variants,
	GoodsNoticesResponse notices
) {
	public static GoodsDetailResponse from(Goods goods) {
		return from(
			goods,
			new GoodsDetailMetadata(
				"STANDARD",
				null,
				null,
				new GoodsShippingResponse(3000, "Project Cyan Delivery", "국내", null),
				new GoodsNoticesResponse(null, null, null),
				List.of(),
				List.of()
			),
			goods.getStockCount() != null && goods.getStockCount() > 0 ? "AVAILABLE" : "SOLD_OUT",
			goods.getStockCount() != null && goods.getStockCount() > 0
				? "구매 가능한 상품입니다."
				: "품절된 상품입니다."
		);
	}

	public static GoodsDetailResponse from(
		Goods goods,
		GoodsDetailMetadata metadata,
		String purchaseState,
		String purchaseMessage
	) {
		return new GoodsDetailResponse(
			goods.getGoodsId(),
			goods.getGoodsName(),
			goods.getPrice(),
			goods.getMainImageUrl(),
			goods.getTags().stream().map(Tag::getTagName).toList(),
			goods.getDescription(),
			goods.getArtist() == null ? null : goods.getArtist().getArtistId(),
			goods.getStockCount(),
			goods.getArtist() == null ? null : goods.getArtist().getArtistName(),
			goods.getCategory() == null ? null : goods.getCategory().getCategoryName(),
			goods.getSalesStatus(),
			goods.getBestSeller(),
			goods.getAiPickDefault(),
			metadata.saleType(),
			metadata.saleStartAt(),
			metadata.saleEndAt(),
			purchaseState,
			purchaseMessage,
			metadata.shipping(),
			metadata.optionGroups(),
			metadata.variants(),
			metadata.notices()
		);
	}
}
