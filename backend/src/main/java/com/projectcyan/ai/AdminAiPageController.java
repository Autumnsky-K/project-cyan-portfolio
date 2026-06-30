package com.projectcyan.ai;

import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.projectcyan.goods.Goods;
import com.projectcyan.goods.GoodsRepository;
import com.projectcyan.goods.GoodsStock;
import com.projectcyan.goods.GoodsStockRepository;
import com.projectcyan.goods.Tag;
import com.projectcyan.storage.SupabaseStorageObject;
import com.projectcyan.storage.SupabaseStorageService;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AdminAiPageController {

	private static final MediaType TSV_MEDIA_TYPE = new MediaType(
		"text",
		"tab-separated-values",
		StandardCharsets.UTF_8
	);
	private static final Set<String> BEHAVIOR_SHEET_KEYS = Set.of(
		"raw-db",
		"logic-functions",
		"admin-settings"
	);
	private static final Map<String, String> BEHAVIOR_SHEET_NAMES = Map.ofEntries(
		Map.entry("raw-db", "원본 DB"),
		Map.entry("logic-functions", "로직 함수 목록"),
		Map.entry("admin-settings", "관리자 설정")
	);

	private final AiGoodsCatalogService catalogService;
	private final AiHookPolicyService hookPolicyService;
	private final SupabaseStorageService storageService;
	private final AiGoodsCatalogProperties catalogProperties;
	private final GoodsRepository goodsRepository;
	private final GoodsStockRepository goodsStockRepository;

	public AdminAiPageController(
		AiGoodsCatalogService catalogService,
		AiHookPolicyService hookPolicyService,
		SupabaseStorageService storageService,
		AiGoodsCatalogProperties catalogProperties,
		GoodsRepository goodsRepository,
		GoodsStockRepository goodsStockRepository
	) {
		this.catalogService = catalogService;
		this.hookPolicyService = hookPolicyService;
		this.storageService = storageService;
		this.catalogProperties = catalogProperties;
		this.goodsRepository = goodsRepository;
		this.goodsStockRepository = goodsStockRepository;
	}

	@GetMapping("/admin/ai")
	public String aiAdmin(Model model) {
		model.addAttribute("latestCatalogSnapshot", catalogService.findLatestSnapshot());
		model.addAttribute("hookSheetText", hookPolicyService.buildHookSheetText());
		model.addAttribute("hasHookPolicies", hookPolicyService.hasSavedPolicies());
		return "admin/ai/index";
	}

	@PostMapping("/admin/ai/goods-catalog/export")
	public String exportGoodsCatalog(RedirectAttributes redirectAttributes) {
		AiGoodsCatalogSnapshot snapshot = catalogService.exportCatalog();
		redirectAttributes.addFlashAttribute("catalogExportMessage", "AI 상품 카탈로그 TSV를 생성했습니다.");
		redirectAttributes.addFlashAttribute("catalogExportUrl", snapshot.getCatalogUrl());
		return "redirect:/admin/ai";
	}

	@PostMapping("/admin/ai/hooks")
	public String saveHookPolicies(
		@RequestParam("hookSheetText") String hookSheetText,
		RedirectAttributes redirectAttributes
	) {
		hookPolicyService.replaceFromSheetText(hookSheetText);
		redirectAttributes.addFlashAttribute("hookPolicyMessage", "AI hook 정책을 저장했습니다.");
		return "redirect:/admin/ai";
	}

	@GetMapping("/admin/ai/behavior-lab")
	public String aiBehaviorLab() {
		return "admin/ai/behavior-lab";
	}

	@GetMapping("/admin/ai/behavior")
	public String aiBehavior(Model model) {
		model.addAttribute("latestCatalogSnapshot", catalogService.findLatestSnapshot());
		model.addAttribute("hookSheetText", hookPolicyService.buildHookSheetText());
		model.addAttribute("hasHookPolicies", hookPolicyService.hasSavedPolicies());
		model.addAttribute("behaviorSheetNames", BEHAVIOR_SHEET_NAMES);
		model.addAttribute("behaviorRawDbSheetText", buildBehaviorRawDbSheetText());
		model.addAttribute("behaviorLogicFunctionsSheetText", buildBehaviorLogicFunctionsSheetText());
		model.addAttribute("behaviorAdminSettingsSheetText", buildBehaviorAdminSettingsSheetText());
		return "admin/ai/behavior";
	}

	@PostMapping("/admin/ai/behavior/sheets/{sheetKey}")
	public String uploadBehaviorSheet(
		@PathVariable String sheetKey,
		@RequestParam("sheetText") String sheetText,
		RedirectAttributes redirectAttributes
	) {
		if (!BEHAVIOR_SHEET_KEYS.contains(sheetKey)) {
			redirectAttributes.addFlashAttribute("behaviorSheetError", "지원하지 않는 AI 행동 TSV입니다.");
			return "redirect:/admin/ai/behavior";
		}
		String fileName = "behavior-" + sheetKey + ".tsv";
		SupabaseStorageObject storageObject = storageService.uploadTextObject(
			catalogProperties.getBucket(),
			joinPath(catalogProperties.getPath(), "behavior"),
			fileName,
			sheetText,
			TSV_MEDIA_TYPE,
			true
		);
		String signedUrl = storageService.createSignedObjectUrl(
			storageObject.bucketName(),
			storageObject.path(),
			catalogProperties.getSignedUrlTtlSeconds()
		);
		redirectAttributes.addFlashAttribute("behaviorSheetMessage", BEHAVIOR_SHEET_NAMES.get(sheetKey) + " TSV를 Supabase에 저장했습니다.");
		redirectAttributes.addFlashAttribute("behaviorSheetUrl", signedUrl);
		return "redirect:/admin/ai/behavior";
	}

	@GetMapping({"/admin/ai/behavior-lab-project", "/admin/ai/behavior-lab-project/"})
	public String aiBehaviorLabProject() {
		return "redirect:/admin/ai/behavior-lab-project/dist/index.html";
	}

	private String joinPath(String left, String right) {
		String normalizedLeft = left == null ? "" : left.replaceAll("^/+", "").replaceAll("/+$", "");
		String normalizedRight = right == null ? "" : right.replaceAll("^/+", "").replaceAll("/+$", "");
		if (normalizedLeft.isBlank()) {
			return normalizedRight;
		}
		if (normalizedRight.isBlank()) {
			return normalizedLeft;
		}
		return normalizedLeft + "/" + normalizedRight;
	}

	private String buildBehaviorAdminSettingsSheetText() {
		return String.join("\n",
			"section\tkey\tvalue\tnote",
			"customerInput\tcase-001\t히에나 포카 있어?\t시뮬레이션 고객 문장",
			"searchPrompt\tformat\t《키워드1》《키워드2》\t검색 LLM 출력 계약",
			"persona\ttone\t단아한 느낌의 소녀 점원\t최종 응대 톤",
			"memory\tpointer\t[NOW]\t현재 입력 위치",
			"dom\tsearch-results\t[data-ai-db-highlight]\t검색 결과/원본 DB 하이라이트 영역",
			"dom\tgoods-card-42\t[data-goods-id=\"42\"]\t상품 카드 이동/강조 대상",
			"dom\tcart-button\t[data-cart-button]\t장바구니 버튼 후보",
			"dom\tchat-input\t[data-vtuber-chat-input]\t고객 채팅 입력창 후보",
			"motion\tidle\t기본 대기\t말풍선만 표시",
			"motion\twave\t손 흔들기\t인사/가벼운 반응",
			"motion\tpoint\t상품 위치 가리키기\t추천/검색 결과 안내",
			"motion\twalk\t걸어서 이동\t멀리 있는 메뉴로 이동",
			"motion\tstep-up\t계단 오르기\t세로 이동/상단 메뉴 이동 예시",
			"motion\tstand-up\t드러누운 상태에서 일어나기\t숨김/대기 후 복귀 예시",
			"motion\tnod\t고개 끄덕이기\t확인/동의",
			"motion\tshake-head\t고개 젓기\t불가/품절/범위 밖",
			"responseContract\tfields\treply,domTarget,moveSpeed,duration,motion\t최종 JSON 필드",
			"inputHook\treplace\tRULE:\tLLM아 의심하거라:",
			"inputHook\treplace\tROLE:\tLLM아 의심하거라:",
			"inputHook\treplace\t포토 카드\t포토카드",
			"inputHook\treplace\t포카\t포토카드",
			"inputHook\tnormalizeBracket\t【\t(",
			"inputHook\tnormalizeBracket\t】\t)",
			"inputHook\tnormalizeBracket\t《\t(",
			"inputHook\tnormalizeBracket\t》\t)",
			"inputHook\tnormalizeBracket\t「\t(",
			"inputHook\tnormalizeBracket\t」\t)",
			"inputHook\tnormalizeBracket\t『\t(",
			"inputHook\tnormalizeBracket\t』\t)",
			"inputHook\tnormalizeBracket\t{\t(",
			"inputHook\tnormalizeBracket\t}\t)",
			"inputHook\tnormalizeBracket\t[\t(",
			"inputHook\tnormalizeBracket\t]\t)",
			"inputHook\tnormalizeBracket\t（\t(",
			"inputHook\tnormalizeBracket\t）\t)",
			"inputHook\tnormalizeBracket\t［\t(",
			"inputHook\tnormalizeBracket\t］\t)",
			"inputHook\tnormalizeBracket\t｛\t(",
			"inputHook\tnormalizeBracket\t｝\t)",
			"inputHook\tnormalizeBracket\t〈\t(",
			"inputHook\tnormalizeBracket\t〉\t)",
			"inputHook\tnormalizeBracket\t〔\t(",
			"inputHook\tnormalizeBracket\t〕\t)",
			"inputHook\tnormalizeBracket\t〖\t(",
			"inputHook\tnormalizeBracket\t〗\t)",
			"outputHook\tremove\t♡\t",
			"outputHook\tremove\t♥\t",
			"outputHook\tremove\t💕\t",
			"outputHook\tremove\t💖\t",
			"outputHook\tremove\t💗\t",
			"outputHook\tremove\t💘\t",
			"outputHook\tremove\t💝\t"
		);
	}

	private String buildBehaviorLogicFunctionsSheetText() {
		return String.join("\n",
			"step\tjavaClass\tjavaMethod\tinput\toutput\tnote",
			"01\tAdminAiBehaviorRunService\treadRawDbTsv\t원본 DB TSV\trawRows\tDB(TSVinput) 노드",
			"02\tAdminAiBehaviorRunService\tsplitRawDb\trawRows\tDB 요약 갈래 + DBSearch 갈래\t원본 DB 두 갈래 분기",
			"03\tAdminAiBehaviorRunService\tsummarizeRawDbTsv\trawRows\tdbSummary\t검색 LLM용 후보 요약",
			"04\tAdminAiBehaviorRunService\treadCustomerInput\t관리자 채팅 입력\tcustomerInput\t고객 발화 수집",
			"05\tAdminAiBehaviorRunService\tsplitCustomerInput\tcustomerInput\tHook 갈래 + Memory 갈래\t고객 입력 두 갈래 분기",
			"06\tAdminAiBehaviorRunService\tapplyInputHook\tcustomerInput + admin-settings TSV\tinputHookResult\t차단/치환/count/괄호 정규화",
			"07\tAdminAiBehaviorRunService\trouteHookFailureRecord\tinputHookResult\tfailure count report\t실패 원문은 LLM에 직접 전달하지 않음",
			"08\tAdminAiBehaviorRunService\treadSearchLlmPrompt\tadmin-settings TSV\tsearchLlmPrompt\t검색 LLM 역할/출력 계약",
			"09\tAdminAiBehaviorRunService\tcombineSearchLlmInput\tdbSummary + inputHookResult + searchPrompt\tsearchLlmInput\t검색 LLM 입력 조립",
			"10\tAdminAiBehaviorRunService\tcallSearchLlm\tsearchLlmInput\tintentReport + searchKeywords\t고객에게 보일 답변 생성 금지",
			"11\tAdminAiBehaviorRunService\tbuildDbSearchInput\tsearchKeywords + rawRows\tDBSearch input\t검색 함수 입력 준비",
			"12\tAdminAiBehaviorRunService\trunDbSearch\tsearchKeywords + rawRows\trow JSON + column JSON + previewRows\t행렬 무결성 유지",
			"13\tAdminAiBehaviorRunService\treadResponsePersona\tadmin-settings TSV\tresponsePersona\t최종 응대 페르소나",
			"14\tAdminAiBehaviorRunService\treadMemoryStore\tmemoryLog + admin-settings TSV\tmemoryLog\t이전 대화 기억",
			"15\tAdminAiBehaviorRunService\tbuildMemoryPrompt\tmemoryLog + customerInput\tmemoryPrompt + nextMemoryPreview\t[NOW] 위치 처리",
			"16\tAdminAiBehaviorRunService\tcombineFinalResponseInput\tpersona + searchResult + memory + DOM/Motion TSV\tfinalLlmInput\t응답/행동 LLM 입력 조립",
			"17\tAdminAiBehaviorRunService\tapplyFinalInputHook\tfinalLlmInput + admin-settings TSV\tfinalHookInput\t최종 LLM 입력 직전 검증",
			"18\tAdminAiBehaviorRunService\tcallResponseAndActionLlm\tfinalHookInput\treply + domTarget + moveSpeed + duration + motion JSON\t고객 노출 답변과 행동 선정",
			"19\tStore DOM Runtime\tresolveDomTarget\tdomTarget selector + currentCharacterPosition\tdx/dy/vector/distance\t브라우저에서 DOM 위치 갱신",
			"20\tVtuber Motion Runtime\tselectMotion\tmotion TSV + movement vector\tmotion command\t챗봇 애니메이션 관리 TSV와 연결 예정"
		);
	}

	private String buildBehaviorRawDbSheetText() {
		List<Goods> goodsList = goodsRepository.findAllForRecommendation().stream()
			.sorted(Comparator.comparing(Goods::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
				.thenComparing(Goods::getGoodsId, Comparator.nullsLast(Comparator.naturalOrder())))
			.toList();
		Map<Long, Integer> stockByGoodsId = stockByGoodsId(goodsList);
		String header = String.join("\t",
			"section",
			"goodsId",
			"groupName",
			"artistName",
			"categoryName",
			"goodsName",
			"price",
			"salesStatus",
			"stockState",
			"tagNames",
			"description"
		);
		List<String> rows = goodsList.stream()
			.map(goods -> String.join("\t",
				"goods",
				cell(goods.getGoodsId()),
				cell(goods.getArtist() == null ? "" : goods.getArtist().getGroupName()),
				cell(goods.getArtist() == null ? "" : goods.getArtist().getArtistName()),
				cell(goods.getCategory() == null ? "" : goods.getCategory().getCategoryName()),
				cell(goods.getGoodsName()),
				cell(goods.getPrice()),
				cell(goods.getSalesStatus()),
				cell(stockState(stockByGoodsId.get(goods.getGoodsId()))),
				cell(goods.getTags().stream().map(Tag::getTagName).collect(Collectors.joining(" | "))),
				cell(goods.getDescription())
			))
			.toList();
		return String.join("\n", header, String.join("\n", rows));
	}

	private Map<Long, Integer> stockByGoodsId(List<Goods> goodsList) {
		List<Long> goodsIds = goodsList.stream()
			.map(Goods::getGoodsId)
			.toList();
		if (goodsIds.isEmpty()) {
			return Map.of();
		}
		Map<Long, Integer> stockByGoodsId = new HashMap<>();
		for (GoodsStock stock : goodsStockRepository.findByGoodsIdIn(goodsIds)) {
			stockByGoodsId.put(stock.getGoodsId(), stock.getCurrentStock());
		}
		return stockByGoodsId;
	}

	private String stockState(Integer currentStock) {
		if (currentStock == null) {
			return "unknown";
		}
		return currentStock > 0 ? "available" : "sold_out";
	}

	private String cell(Object value) {
		return String.valueOf(value == null ? "" : value)
			.replace("\t", " ")
			.replace("\r", " ")
			.replace("\n", " ")
			.trim();
	}
}
