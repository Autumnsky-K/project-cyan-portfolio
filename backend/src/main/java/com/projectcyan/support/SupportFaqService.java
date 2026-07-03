package com.projectcyan.support;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SupportFaqService {

	private static final int MAX_CATEGORY_LENGTH = 40;
	private static final int MAX_QUESTION_LENGTH = 200;
	private static final int MAX_ANSWER_LENGTH = 4000;

	private final SupportFaqRepository supportFaqRepository;

	public SupportFaqService(SupportFaqRepository supportFaqRepository) {
		this.supportFaqRepository = supportFaqRepository;
	}

	@Transactional(readOnly = true)
	public List<SupportFaqResponse> findVisibleFaqs() {
		return supportFaqRepository.findByVisibleTrueOrderBySortOrderAscFaqIdAsc()
			.stream()
			.map(SupportFaqResponse::from)
			.toList();
	}

	@Transactional(readOnly = true)
	public List<SupportFaqResponse> findAdminFaqs() {
		return supportFaqRepository.findAllByOrderBySortOrderAscFaqIdAsc()
			.stream()
			.map(SupportFaqResponse::from)
			.toList();
	}

	@Transactional
	public SupportFaqResponse create(String category, String question, String answer, Integer sortOrder, boolean visible) {
		SupportFaq faq = new SupportFaq(
			normalizeCategory(category),
			normalizeQuestion(question),
			normalizeAnswer(answer),
			normalizeSortOrder(sortOrder),
			visible
		);
		return SupportFaqResponse.from(supportFaqRepository.save(faq));
	}

	@Transactional
	public SupportFaqResponse update(Long faqId, String category, String question, String answer, Integer sortOrder, boolean visible) {
		SupportFaq faq = supportFaqRepository.findById(faqId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "FAQ 항목을 찾을 수 없습니다."));
		faq.update(
			normalizeCategory(category),
			normalizeQuestion(question),
			normalizeAnswer(answer),
			normalizeSortOrder(sortOrder),
			visible
		);
		return SupportFaqResponse.from(faq);
	}

	@Transactional
	public void delete(Long faqId) {
		if (!supportFaqRepository.existsById(faqId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "FAQ 항목을 찾을 수 없습니다.");
		}
		supportFaqRepository.deleteById(faqId);
	}

	private String normalizeCategory(String category) {
		String value = normalizeRequiredText(category, "카테고리를 입력해주세요.");
		if (value.length() > MAX_CATEGORY_LENGTH) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "카테고리는 40자 이하여야 합니다.");
		}
		return value;
	}

	private String normalizeQuestion(String question) {
		String value = normalizeRequiredText(question, "질문을 입력해주세요.");
		if (value.length() > MAX_QUESTION_LENGTH) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "질문은 200자 이하여야 합니다.");
		}
		return value;
	}

	private String normalizeAnswer(String answer) {
		String value = normalizeRequiredText(answer, "답변을 입력해주세요.");
		if (value.length() > MAX_ANSWER_LENGTH) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "답변은 4000자 이하여야 합니다.");
		}
		return value;
	}

	private String normalizeRequiredText(String text, String errorMessage) {
		String value = text == null ? "" : text.trim();
		if (value.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, errorMessage);
		}
		return value;
	}

	private int normalizeSortOrder(Integer sortOrder) {
		if (sortOrder == null || sortOrder < 0) {
			return 100;
		}
		return sortOrder;
	}
}
