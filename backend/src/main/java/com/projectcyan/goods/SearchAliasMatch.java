package com.projectcyan.goods;

public record SearchAliasMatch(
	String normalizedAlias,
	Long artistId,
	Long groupId,
	Long categoryId,
	Long tagId,
	String tagName
) {
}
