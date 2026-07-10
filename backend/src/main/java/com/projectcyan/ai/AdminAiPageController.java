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
		"admin-settings",
		"motion-list"
	);
	private static final Map<String, String> BEHAVIOR_SHEET_NAMES = Map.ofEntries(
		Map.entry("raw-db", "원본 DB"),
		Map.entry("logic-functions", "로직 함수 목록"),
		Map.entry("admin-settings", "관리자 설정"),
		Map.entry("motion-list", "모션 목록")
	);

	private final AiHookPolicyService hookPolicyService;
	private final SupabaseStorageService storageService;
	private final AiGoodsCatalogProperties catalogProperties;
	private final GoodsRepository goodsRepository;
	private final GoodsStockRepository goodsStockRepository;

	public AdminAiPageController(
		AiHookPolicyService hookPolicyService,
		SupabaseStorageService storageService,
		AiGoodsCatalogProperties catalogProperties,
		GoodsRepository goodsRepository,
		GoodsStockRepository goodsStockRepository
	) {
		this.hookPolicyService = hookPolicyService;
		this.storageService = storageService;
		this.catalogProperties = catalogProperties;
		this.goodsRepository = goodsRepository;
		this.goodsStockRepository = goodsStockRepository;
	}

	@GetMapping("/admin/ai")
	public String aiAdmin() {
		return "redirect:/admin/ai/behavior";
	}

	@PostMapping("/admin/ai/behavior/hooks")
	public String saveHookPolicies(
		@RequestParam("hookSheetText") String hookSheetText,
		RedirectAttributes redirectAttributes
	) {
		hookPolicyService.replaceFromSheetText(hookSheetText);
		redirectAttributes.addFlashAttribute("hookPolicyMessage", "AI hook 정책을 저장했습니다.");
		return "redirect:/admin/ai/behavior";
	}

	@GetMapping("/admin/ai/behavior-lab")
	public String aiBehaviorLab() {
		return "admin/ai/behavior-lab";
	}

	@GetMapping("/admin/ai/behavior")
	public String aiBehavior(Model model) {
		model.addAttribute("hookSheetText", hookPolicyService.buildHookSheetText());
		model.addAttribute("hasHookPolicies", hookPolicyService.hasSavedPolicies());
		model.addAttribute("behaviorSheetNames", BEHAVIOR_SHEET_NAMES);
		model.addAttribute("behaviorRawDbSheetText", buildBehaviorRawDbSheetText());
		model.addAttribute("behaviorLogicFunctionsSheetText", buildBehaviorLogicFunctionsSheetText());
		model.addAttribute("behaviorAdminSettingsSheetText", buildBehaviorAdminSettingsSheetText());
		model.addAttribute("behaviorMotionListSheetText", buildBehaviorMotionListSheetText());
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
			"motion\thook-blocked\tHook 차단 반응\t욕설/영문/특수문자 Hook 차단",
			"motion\tsearch-miss\t검색 실패 안내\t검색결과 없음/의도 파악 실패",
			"motion\tguide-success\t안내 성공 발화\t추천/검색/이동 안내 성공",
			"motion\tcart-add\t장바구니 이벤트\t장바구니 담기",
			"responseContract\tfields\ttext,actions,metadata.behavior\tWebSocket 최종 필드"
		);
	}

	private String buildBehaviorMotionListSheetText() {
		return String.join("\n",
			"motionKey\tlabel\tmodelMode\tfileKey\ttrigger\tloop\tpriority\tnote",
			"idle\t기본 대기\t2d,3d\t-\t대기\ttrue\t10\t기본 fallback",
			"wave\t손 흔들기\t2d,3d\twave\t인사\tfalse\t20\t자산 없으면 idle",
			"point\t상품 위치 가리키기\t2d,3d\tpoint\t추천\tfalse\t30\t자산 없으면 idle",
			"nod\t고개 끄덕이기\t2d,3d\tnod\t확인\tfalse\t40\t자산 없으면 idle",
			"shake-head\t고개 젓기\t2d,3d\tshake_head\t불가/오류\tfalse\t50\t자산 없으면 idle",
			"hook-blocked\tHook 차단 반응\t3d\teventConfused\t욕설/영문/특수문자 Hook 차단\tfalse\t60\t우울 회전 모션",
			"search-miss\t검색 실패 안내\t3d\ttalkHandRaised\t검색결과 없음/의도 파악 실패\tfalse\t70\t손을 올리고 말하는 모션",
			"guide-success\t안내 성공 발화\t3d\ttalkHandOnHip,eventConfident\t추천/검색/이동 안내 성공\tfalse\t80\thip 계열 2개 중 랜덤",
			"cart-add\t장바구니 이벤트\t3d\teventSecretDeal\t장바구니 담기\tfalse\t90\tScheming Hand Rub"
		);
	}

	private String buildBehaviorLogicFunctionsSheetText() {
		return String.join("\n",
			"step\truntime\tmethod\tinput\toutput\tnote",
			"01\tBehaviorEngine\tloadCatalog\tSpring DB/API\tcatalog metadata\t실제 상품 원본",
			"02\tBehaviorEngine\tsplitCatalog\tcatalog\t요약 갈래 + 검색 갈래\t두 갈래 분기",
			"03\tBehaviorEngine\tsummarizeCatalog\tcatalog metadata\tdbSummary\t검색 LLM용 요약",
			"04\tBehaviorEngine\treadCustomerInput\t관리자/클라이언트 입력\tcustomerInput\t고객 발화 수집",
			"05\tBehaviorEngine\tsplitCustomerInput\tcustomerInput\tHook 갈래 + Memory 갈래\t입력 분기",
			"06\tBehaviorEngine\tapplyInputHook\tcustomerInput + canonical hook\tnormalizedInput\t운영 Hook 적용",
			"07\tBehaviorEngine\trecordHookResult\tHook 결과\tpolicy IDs\t위반 기록",
			"08\tBehaviorEngine\tloadSearchPrompt\tadmin-settings TSV\tsearchPrompt\t검색 LLM 설정",
			"09\tBehaviorEngine\tcombineSearchInput\t검색 설정 + 고객 입력\tsearchInput\t검색 입력 조립",
			"10\tBehaviorEngine\tcallSearchLlm\tsearchInput\tkeywords + intent\tfaithful18 전용",
			"11\tBehaviorEngine\tbuildSearchRequest\tkeywords + 고객 입력\tSpring query\t검색 API 준비",
			"12\tBehaviorEngine\tsearchCandidates\tSpring query\tcandidate goodsId\t실제 DB/API 검색",
			"13\tBehaviorEngine\tloadPersona\tadmin-settings TSV\tpersona\t최종 응대 톤",
			"14\tBehaviorEngine\treadMemory\t세션 + 개인화\tmemory context\t기존 기억 조회",
			"15\tBehaviorEngine\tbuildMemoryContext\tmemory + input\tmemory prompt\t기억 결합",
			"16\tBehaviorEngine\tcombineFinalInput\tpersona + candidates + memory\tfinal input\t최종 입력 조립",
			"17\tBehaviorEngine\tapplyFinalHook\tfinal input\tvalidated input\t최종 입력 검증",
			"18\tBehaviorEngine\tbuildFinalResponse\tvalidated input\ttext + actions + behavior\t고객 노출과 모션 검증"
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
