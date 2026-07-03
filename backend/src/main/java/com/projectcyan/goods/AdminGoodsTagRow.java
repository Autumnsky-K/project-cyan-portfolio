package com.projectcyan.goods;

public record AdminGoodsTagRow(
	Long tagId,
	String tagName,
	long goodsCount
) {
	static AdminGoodsTagRow from(Tag tag, long goodsCount) {
		return new AdminGoodsTagRow(tag.getTagId(), tag.getTagName(), goodsCount);
	}
}
