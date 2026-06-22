package com.projectcyan.goods;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

final class GoodsSpecifications {

	private GoodsSpecifications() {
	}

	static Specification<Goods> containsKeyword(String keyword) {
		return (root, query, builder) -> {
			if (keyword == null || keyword.isBlank()) {
				return builder.conjunction();
			}
			String like = "%" + keyword.trim().toLowerCase() + "%";
			Join<Goods, Artist> artist = root.join("artist", JoinType.LEFT);
			Join<Goods, GoodsCategory> category = root.join("category", JoinType.LEFT);
			return builder.or(
				builder.like(builder.lower(root.get("goodsName")), like),
				builder.like(builder.lower(artist.get("artistName")), like),
				builder.like(builder.lower(category.get("categoryName")), like)
			);
		};
	}

	static Specification<Goods> hasArtist(Long artistId) {
		return (root, query, builder) -> artistId == null
			? builder.conjunction()
			: builder.equal(root.join("artist", JoinType.LEFT).get("artistId"), artistId);
	}

	static Specification<Goods> hasCategory(Long categoryId) {
		return (root, query, builder) -> categoryId == null
			? builder.conjunction()
			: builder.equal(root.join("category", JoinType.LEFT).get("categoryId"), categoryId);
	}

	static Specification<Goods> hasTag(String tag) {
		return (root, query, builder) -> {
			if (tag == null || tag.isBlank()) {
				return builder.conjunction();
			}
			if (query != null) {
				query.distinct(true);
			}
			Join<Goods, Tag> tags = root.joinSet("tags", JoinType.LEFT);
			return builder.equal(builder.upper(tags.get("tagName")), tag.trim().toUpperCase());
		};
	}
}
