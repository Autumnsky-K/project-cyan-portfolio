package com.projectcyan.goods;

import java.util.List;

public record AdminGoodsImportRow(
	int rowNumber,
	String goodsId,
	String name,
	String price,
	String artistName,
	String categoryName,
	String stockCount,
	String salesStatus,
	String imageFolder,
	String tagsText,
	String description,
	String bestSeller,
	String aiPickDefault,
	Long resolvedGoodsId,
	Long resolvedArtistId,
	Long resolvedCategoryId,
	String mainImageUrl,
	List<String> extraImageUrls,
	List<String> detailImageUrls,
	List<String> errors
) {
	public boolean valid() {
		return errors == null || errors.isEmpty();
	}

	public String modeLabel() {
		return resolvedGoodsId == null ? "신규" : "수정";
	}
}
