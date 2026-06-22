package com.projectcyan.goods;

public record SearchAliasMatch(
	String normalizedAlias,
	Long artistId,
	Long categoryId,
	Long tagId,
	String tagName
) {
}
