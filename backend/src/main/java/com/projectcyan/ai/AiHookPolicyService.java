package com.projectcyan.ai;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.projectcyan.common.ApiErrorException;

@Service
public class AiHookPolicyService {

	static final String TSV_HEADER = "hook\tcheck\tthreshold\taction\tmessage\treplacement";

	private static final Set<String> HOOKS = Set.of("input", "output");
	private static final Set<String> CHECKS = Set.of(
		"maxLength",
		"forbiddenWords",
		"specialCharRatio",
		"numberRatio",
		"englishRatio",
		"actionScope",
		"literalText"
	);
	private static final Set<String> ACTIONS = Set.of("stop", "review", "rewrite", "filter", "replace", "remove");

	private final AiHookPolicyRepository repository;

	public AiHookPolicyService(AiHookPolicyRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public List<AiHookPolicyResponse> findActivePolicies() {
		return repository.findByEnabledTrueOrderByPriorityAscPolicyIdAsc().stream()
			.map(AiHookPolicyResponse::from)
			.toList();
	}

	@Transactional(readOnly = true)
	public String buildHookSheetText() {
		List<AiHookPolicy> policies = repository.findAllByOrderByPriorityAscPolicyIdAsc();
		return policies.stream()
			.map(this::toTsvRow)
			.collect(Collectors.joining("\n", TSV_HEADER + "\n", ""));
	}

	@Transactional(readOnly = true)
	public boolean hasSavedPolicies() {
		return repository.count() > 0;
	}

	@Transactional
	public void replaceFromSheetText(String sheetText) {
		List<AiHookPolicy> policies = parseSheetText(sheetText);
		repository.deleteAllInBatch();
		repository.saveAll(policies);
	}

	List<AiHookPolicy> parseSheetText(String sheetText) {
		if (!StringUtils.hasText(sheetText)) {
			throw validationError("AI hook TSV content is empty.");
		}

		String[] lines = sheetText.strip().split("\\R");
		if (lines.length < 2) {
			throw validationError("AI hook TSV must include a header and at least one policy row.");
		}

		List<AiHookPolicy> policies = new ArrayList<>();
		for (int index = 1; index < lines.length; index++) {
			if (!StringUtils.hasText(lines[index])) {
				continue;
			}
			String[] cells = lines[index].split("\\t", -1);
			if (cells.length < 4) {
				throw validationError("AI hook TSV row " + (index + 1) + " must include at least 4 columns.");
			}
			String hook = normalize(cells[0]);
			String check = normalize(cells[1]);
			String threshold = normalize(cells[2]);
			String action = normalize(cells[3]);
			String message = cells.length >= 5 ? normalize(cells[4]) : "";
			String replacement = cells.length >= 6 ? normalize(cells[5]) : "";
			validatePolicy(hook, check, threshold, action, message, replacement);
			policies.add(AiHookPolicy.create(hook, check, threshold, action, message, replacement, true, policies.size() + 1));
		}

		if (policies.isEmpty()) {
			throw validationError("AI hook TSV must include at least one policy row.");
		}

		return policies;
	}

	public String defaultHookSheetText() {
		return String.join("\n",
			TSV_HEADER,
			"input\tmaxLength\t500\tstop\t입력이 너무 길어요. 500자 이하로 다시 입력해주세요.\t",
			"input\tspecialCharRatio\t30%\treview\t특수문자가 많아요. 상품명이나 요청 내용을 다시 확인해주세요.\t",
			"input\tnumberRatio\t45%\treview\t숫자가 많아요. 주문번호나 가격 문의인지 다시 알려주세요.\t",
			"input\tenglishRatio\t70%\treview\t영문 입력이 많아요. 상품명인지 다시 확인해주세요.\t",
			"input\tliteralText\t포카\treplace\t\t포토카드",
			"output\tliteralText\t♡\tremove\t\t",
			"output\tforbiddenWords\t관리자 목록\trewrite\t안내가 부적절해 다시 정리했어요.\t",
			"output\tactionScope\tnavigate,highlight,addToCart\tfilter\t허용된 화면 동작만 실행할게요.\t"
		);
	}

	private String toTsvRow(AiHookPolicy policy) {
		return String.join("\t",
			tsvCell(policy.getHook()),
			tsvCell(policy.getCheck()),
			tsvCell(policy.getThreshold()),
			tsvCell(policy.getAction()),
			tsvCell(policy.getMessage()),
			tsvCell(policy.getReplacement())
		);
	}

	private void validatePolicy(String hook, String check, String threshold, String action, String message, String replacement) {
		if (!HOOKS.contains(hook)) {
			throw validationError("Unsupported AI hook: " + hook);
		}
		if (!CHECKS.contains(check)) {
			throw validationError("Unsupported AI hook check: " + check);
		}
		if (!ACTIONS.contains(action)) {
			throw validationError("Unsupported AI hook action: " + action);
		}
		if (!StringUtils.hasText(threshold)) {
			throw validationError("AI hook threshold is required.");
		}
		boolean transform = "replace".equals(action) || "remove".equals(action);
		if (!transform && !StringUtils.hasText(message)) {
			throw validationError("AI hook message is required.");
		}
		if (transform && !"literalText".equals(check)) {
			throw validationError("AI hook transform actions require literalText check.");
		}
		if ("replace".equals(action) && !StringUtils.hasText(replacement)) {
			throw validationError("AI hook replacement is required for replace action.");
		}
	}

	private String normalize(String value) {
		return value == null ? "" : value.trim();
	}

	private String tsvCell(String value) {
		return value == null ? "" : value
			.replaceAll("[\\t\\n\\r]+", " ")
			.replaceAll("\\s+", " ")
			.trim();
	}

	private ApiErrorException validationError(String message) {
		return new ApiErrorException("AI_HOOK_POLICY_INVALID", message, HttpStatus.BAD_REQUEST);
	}
}
