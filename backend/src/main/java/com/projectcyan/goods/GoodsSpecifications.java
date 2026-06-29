package com.projectcyan.goods;

import java.util.Collection;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

final class GoodsSpecifications {

	private GoodsSpecifications() {
	}

	static Specification<Goods> hasGoodsIds(Collection<Long> goodsIds) {
		return (root, query, builder) -> {
			if (goodsIds == null || goodsIds.isEmpty()) {
				return builder.conjunction();
			}
			return root.get("goodsId").in(goodsIds);
		};
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

	static Specification<Goods> hasArtists(Collection<Long> artistIds) {
		return (root, query, builder) -> {
			if (artistIds == null || artistIds.isEmpty()) {
				return builder.conjunction();
			}
			return root.join("artist", JoinType.LEFT).get("artistId").in(artistIds);
		};
	}

	static Specification<Goods> hasCategory(Long categoryId) {
		return (root, query, builder) -> categoryId == null
			? builder.conjunction()
			: builder.equal(root.join("category", JoinType.LEFT).get("categoryId"), categoryId);
	}

	static Specification<Goods> hasCategories(Collection<Long> categoryIds) {
		return (root, query, builder) -> {
			if (categoryIds == null || categoryIds.isEmpty()) {
				return builder.conjunction();
			}
			return root.join("category", JoinType.LEFT).get("categoryId").in(categoryIds);
		};
	}

	static Specification<Goods> hasSalesStatus(String salesStatus) {
		return (root, query, builder) -> salesStatus == null || salesStatus.isBlank()
			? builder.conjunction()
			: builder.equal(builder.upper(root.get("salesStatus")), salesStatus.trim().toUpperCase());
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

	static Specification<Goods> hasTags(Collection<String> tagNames) {
		return (root, query, builder) -> {
			if (tagNames == null || tagNames.isEmpty()) {
				return builder.conjunction();
			}
			if (query != null) {
				query.distinct(true);
			}
			Join<Goods, Tag> tags = root.joinSet("tags", JoinType.LEFT);
			return builder.upper(tags.get("tagName")).in(
				tagNames.stream()
					.filter(tagName -> tagName != null && !tagName.isBlank())
					.map(tagName -> tagName.trim().toUpperCase())
					.toList()
			);
		};
	}
}
