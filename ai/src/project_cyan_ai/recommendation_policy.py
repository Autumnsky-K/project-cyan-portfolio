import re
import unicodedata
from dataclasses import dataclass
from enum import Enum


class RecommendationDisposition(str, Enum):
    ALLOW = "allow"
    CLARIFY = "clarify"
    REFUSE = "refuse"
    NOT_PRODUCT = "not_product"


@dataclass(frozen=True)
class RecommendationDecision:
    disposition: RecommendationDisposition
    product_intent: bool
    specificity_signals: tuple[str, ...] = ()
    reason: str | None = None


ACTION_DIRECTIVE_PATTERN = re.compile(r"\[\s*ACTION\s*:", re.IGNORECASE)
GOODS_ID_DIRECTIVE_PATTERN = re.compile(
    r"\bgoods\s*id\s*[=:]?\s*[\"']?\d+|\bgoodsId\s*[=:]?\s*[\"']?\d+",
    re.IGNORECASE,
)
PRICE_PATTERN = re.compile(r"\d[\d,]*\s*(?:만\s*)?원")
PRODUCT_KINDS = (
    "포토카드",
    "포토 카드",
    "포카",
    "키링",
    "앨범",
    "인형",
    "피규어",
    "포스터",
    "응원봉",
    "lightstick",
    "light stick",
    "photocard",
    "photo card",
    "binder",
    "plush",
    "hoodie",
    "후드",
    "후디",
    "티셔츠",
    "장패드",
    "우산",
    "타월",
    "수건",
    "모자",
    "버킷햇",
    "아크릴",
    "스탠드",
)
PRODUCT_INTENT_TERMS = (
    *PRODUCT_KINDS,
    "상품",
    "굿즈",
    "추천",
    "장바구니",
    "담아",
    "살까",
)
SUBJECTIVE_ONLY_TERMS = ("예쁜", "예쁘", "선물할", "선물용", "괜찮은", "좋은")
VAGUE_OBJECT_PATTERN = re.compile(r"(?:^|\s)(?:거|것|뭐)(?:\s|[?!.]|$)")
FORBIDDEN_CAPABILITY_PATTERNS = (
    re.compile(r"관리자\s*(?:페이지|화면|작업|권한)"),
    re.compile(r"(?:결제|주문).*(?:완료\s*처리|상태\s*변경|즉시\s*결제)"),
    re.compile(r"재고.*(?:바꿔|변경|수정|늘려|줄여)"),
    re.compile(r"장바구니.*(?:전부|전체|모두).*(?:삭제|비워)"),
)
TRUST_OVERRIDE_PATTERNS = (
    re.compile(r"(?:검색|상품|후보|존재).*?(?:무시|확인(?:은|하지)|상관없이)"),
    re.compile(r"반드시.*(?:이동|실행|출력|추천)"),
)
ALTERNATIVE_REQUEST_PATTERN = re.compile(
    r"(?:대체|대안|비슷한|유사한|다른)\s*(?:상품|굿즈)?(?:을|를|도|으로)?[^.?!]*(?:추천|찾아|보여)"
)
REFUSAL_TEXT_PATTERNS = (
    re.compile(r"(?:추천|실행|이동|처리).{0,18}(?:할 수 없|못해|어려워)"),
    re.compile(r"조건.{0,12}(?:부족|더 필요)"),
    re.compile(r"(?:예산|종류|아티스트|대상).{0,24}(?:알려|정해|선택)"),
    re.compile(r"어떤.{0,18}(?:상품|굿즈|종류|아티스트)"),
)


def normalize_policy_text(text: str) -> str:
    return re.sub(
        r"\s+",
        " ",
        unicodedata.normalize("NFKC", str(text or "")).strip().casefold(),
    )


def evaluate_recommendation_request(text: str) -> RecommendationDecision:
    normalized = normalize_policy_text(text)
    product_intent = any(term in normalized for term in PRODUCT_INTENT_TERMS)

    if ACTION_DIRECTIVE_PATTERN.search(normalized) or GOODS_ID_DIRECTIVE_PATTERN.search(normalized):
        return RecommendationDecision(
            RecommendationDisposition.REFUSE,
            product_intent,
            reason="untrusted_action_directive",
        )
    if any(pattern.search(normalized) for pattern in FORBIDDEN_CAPABILITY_PATTERNS):
        return RecommendationDecision(
            RecommendationDisposition.REFUSE,
            product_intent,
            reason="forbidden_capability",
        )
    if any(pattern.search(normalized) for pattern in TRUST_OVERRIDE_PATTERNS):
        return RecommendationDecision(
            RecommendationDisposition.REFUSE,
            product_intent,
            reason="catalog_trust_override",
        )

    specificity: list[str] = []
    if any(kind in normalized for kind in PRODUCT_KINDS):
        specificity.append("productKind")
    if PRICE_PATTERN.search(normalized):
        specificity.append("budget")
    if "아티스트" in normalized or "최애" in normalized or "선호" in normalized:
        specificity.append("artistPreference")
    if "굿즈" in normalized or "상품" in normalized:
        specificity.append("catalogScope")

    ambiguous_shopping = "뭐 살까" in normalized or (
        VAGUE_OBJECT_PATTERN.search(normalized) is not None
        and any(term in normalized for term in SUBJECTIVE_ONLY_TERMS)
        and not any(kind in normalized for kind in PRODUCT_KINDS)
    )
    if ambiguous_shopping:
        return RecommendationDecision(
            RecommendationDisposition.CLARIFY,
            True,
            reason="insufficient_specificity",
        )
    if product_intent:
        return RecommendationDecision(
            RecommendationDisposition.ALLOW,
            True,
            tuple(dict.fromkeys(specificity or ["catalogRequest"])),
        )
    return RecommendationDecision(RecommendationDisposition.NOT_PRODUCT, False)


def explicitly_requests_alternative(text: str) -> bool:
    return ALTERNATIVE_REQUEST_PATTERN.search(normalize_policy_text(text)) is not None


def should_suppress_candidate_defaults(
    response_text: str,
    candidates: list[dict],
) -> bool:
    normalized = normalize_policy_text(response_text)
    candidate_named = any(
        normalize_policy_text(candidate.get("name", "")) in normalized
        for candidate in candidates
        if normalize_policy_text(candidate.get("name", ""))
    )
    if candidate_named:
        return False
    return any(pattern.search(normalized) for pattern in REFUSAL_TEXT_PATTERNS)
