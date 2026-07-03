package com.projectcyan.goods;

import java.util.List;

import com.projectcyan.admin.SupabaseUsageCounter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AdminGoodsClassificationService {

	private static final int MAX_NAME_LENGTH = 50;

	private final GoodsCategoryRepository goodsCategoryRepository;
	private final TagRepository tagRepository;
	private final GoodsRepository goodsRepository;
	private final SupabaseUsageCounter supabaseUsageCounter;

	public AdminGoodsClassificationService(
		GoodsCategoryRepository goodsCategoryRepository,
		TagRepository tagRepository,
		GoodsRepository goodsRepository,
		SupabaseUsageCounter supabaseUsageCounter
	) {
		this.goodsCategoryRepository = goodsCategoryRepository;
		this.tagRepository = tagRepository;
		this.goodsRepository = goodsRepository;
		this.supabaseUsageCounter = supabaseUsageCounter;
	}

	@Transactional(readOnly = true)
	public List<AdminGoodsCategoryRow> findCategoryRows() {
		return goodsCategoryRepository.findAllByOrderByCategoryNameAsc().stream()
			.map(category -> AdminGoodsCategoryRow.from(
				category,
				goodsRepository.countByCategoryCategoryId(category.getCategoryId())
			))
			.toList();
	}

	@Transactional(readOnly = true)
	public List<AdminGoodsTagRow> findTagRows() {
		return tagRepository.findAllByOrderByTagNameAsc().stream()
			.map(tag -> AdminGoodsTagRow.from(tag, tagRepository.countGoodsByTagId(tag.getTagId())))
			.toList();
	}

	public GoodsCategory createCategory(String categoryName, String fulfillmentType) {
		String normalizedName = normalizeName(categoryName, "카테고리명");
		assertUniqueCategoryName(normalizedName, null);
		GoodsCategory category = new GoodsCategory(
			goodsCategoryRepository.nextCategoryId(),
			normalizedName,
			GoodsFulfillmentType.from(fulfillmentType)
		);
		GoodsCategory savedCategory = goodsCategoryRepository.save(category);
		supabaseUsageCounter.recordWrite("굿즈 카테고리 등록");
		return savedCategory;
	}

	public GoodsCategory updateCategory(Long categoryId, String categoryName, String fulfillmentType) {
		GoodsCategory category = findCategory(categoryId);
		String normalizedName = normalizeName(categoryName, "카테고리명");
		assertUniqueCategoryName(normalizedName, categoryId);
		category.update(normalizedName, GoodsFulfillmentType.from(fulfillmentType));
		supabaseUsageCounter.recordWrite("굿즈 카테고리 수정");
		return category;
	}

	public void deleteCategory(Long categoryId) {
		GoodsCategory category = findCategory(categoryId);
		long goodsCount = goodsRepository.countByCategoryCategoryId(categoryId);
		if (goodsCount > 0) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "상품에 사용 중인 카테고리는 삭제할 수 없습니다.");
		}
		goodsCategoryRepository.delete(category);
		supabaseUsageCounter.recordWrite("굿즈 카테고리 삭제");
	}

	public Tag createTag(String tagName) {
		String normalizedName = normalizeName(tagName, "태그명");
		assertUniqueTagName(normalizedName, null);
		Tag tag = new Tag(tagRepository.nextTagId(), normalizedName);
		Tag savedTag = tagRepository.save(tag);
		supabaseUsageCounter.recordWrite("굿즈 태그 등록");
		return savedTag;
	}

	public Tag updateTag(Long tagId, String tagName) {
		Tag tag = findTag(tagId);
		String normalizedName = normalizeName(tagName, "태그명");
		assertUniqueTagName(normalizedName, tagId);
		tag.update(normalizedName);
		supabaseUsageCounter.recordWrite("굿즈 태그 수정");
		return tag;
	}

	public void deleteTag(Long tagId) {
		Tag tag = findTag(tagId);
		long goodsCount = tagRepository.countGoodsByTagId(tagId);
		if (goodsCount > 0) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "상품에 사용 중인 태그는 삭제할 수 없습니다.");
		}
		tagRepository.delete(tag);
		supabaseUsageCounter.recordWrite("굿즈 태그 삭제");
	}

	private GoodsCategory findCategory(Long categoryId) {
		if (categoryId == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "카테고리 ID가 없습니다.");
		}
		return goodsCategoryRepository.findById(categoryId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."));
	}

	private Tag findTag(Long tagId) {
		if (tagId == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "태그 ID가 없습니다.");
		}
		return tagRepository.findById(tagId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "태그를 찾을 수 없습니다."));
	}

	private void assertUniqueCategoryName(String categoryName, Long currentCategoryId) {
		goodsCategoryRepository.findByCategoryNameIgnoreCase(categoryName).ifPresent(existing -> {
			if (!existing.getCategoryId().equals(currentCategoryId)) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 존재하는 카테고리명입니다.");
			}
		});
	}

	private void assertUniqueTagName(String tagName, Long currentTagId) {
		tagRepository.findByTagNameIgnoreCase(tagName).ifPresent(existing -> {
			if (!existing.getTagId().equals(currentTagId)) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 존재하는 태그명입니다.");
			}
		});
	}

	private String normalizeName(String rawName, String label) {
		if (rawName == null || rawName.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + "을 입력해 주세요.");
		}
		String normalizedName = rawName.trim();
		if (normalizedName.length() > MAX_NAME_LENGTH) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + "은 50자 이하로 입력해 주세요.");
		}
		return normalizedName;
	}
}
