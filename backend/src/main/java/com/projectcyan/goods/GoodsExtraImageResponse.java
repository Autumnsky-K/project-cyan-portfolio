package com.projectcyan.goods;

public record GoodsExtraImageResponse(
	Long imageId,
	String imageUrl,
	String altText,
	Integer sortOrder
) {
	public static GoodsExtraImageResponse from(GoodsExtraImage image) {
		return new GoodsExtraImageResponse(
			image.getImageId(),
			image.getImageUrl(),
			image.getAltText(),
			image.getSortOrder()
		);
	}
}
