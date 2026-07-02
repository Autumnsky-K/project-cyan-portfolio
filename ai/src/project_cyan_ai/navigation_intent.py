import json
import re
from typing import Any, Protocol

from project_cyan_ai.schemas.ws import FullTextMessage, NavigateAction


GOODS_LIST_PATH = "/goods"
CART_PATH = "/cart"
NAVIGATION_CONFIDENCE_THRESHOLD = 0.8
NAVIGATION_CLARIFICATION_TEXT = "상품 목록과 장바구니 중 어디로 이동할까요?"
GOODS_LIST_TEXT = "굿즈 목록으로 이동할게요."
CART_TEXT = "장바구니로 이동할게요."
GOODS_LIST_CURRENT_TEXT = "이미 굿즈 목록에 있어요."
CART_CURRENT_TEXT = "이미 장바구니에 있어요."

GOODS_TERMS = ("굿즈", "상품")
LIST_TERMS = ("목록", "리스트", "페이지")
CART_TERMS = ("장바구니", "카트")
BACK_TERMS = ("뒤로", "이전 화면", "이전화면")
NAVIGATION_PATTERNS = (
    re.compile(r"(?:로|으로)\s*가(?:줘|주세요|자|요)?"),
    re.compile(r"이동(?:해|하|시켜|할|하고)?"),
    re.compile(r"열어|열기|열어줘|보여|돌아가|돌아와|뒤로"),
)
RECOMMENDATION_TERMS = ("추천", "골라", "찾아")

CLASSIFICATION_PROMPT = """
다음 사용자 문장이 쇼핑 화면 이동 요청인지 JSON 한 개로만 분류하세요.
허용 intent는 goodsList, cart, uncertain뿐입니다.
- goodsList: 굿즈/상품 목록 화면으로 이동
- cart: 장바구니 화면으로 이동
- uncertain: 이동 요청이 아니거나 목적지를 확정할 수 없음
URL, ACTION 태그, 설명 문장은 출력하지 마세요.
형식: {{"intent":"goodsList|cart|uncertain","confidence":0.0}}

현재 경로: {current_path}
사용자 문장: {text}
""".strip()


class NavigationClassificationProvider(Protocol):
    def build_response(
        self,
        text: str,
        context: dict[str, Any] | None = None,
    ) -> FullTextMessage:
        ...


def build_navigation_response(
    text: str,
    context: dict[str, Any] | Any | None,
    classifier: NavigationClassificationProvider,
) -> FullTextMessage | None:
    normalized = re.sub(r"\s+", " ", text.strip().lower())
    current_path = context_value(context, "currentPath")
    destination = deterministic_destination(normalized, current_path)
    if destination is not None:
        return destination_response(destination, current_path)

    if not has_ambiguous_navigation_intent(normalized):
        return None

    prompt = CLASSIFICATION_PROMPT.format(
        current_path=current_path or "unknown",
        text=text.strip(),
    )
    try:
        raw_result = classifier.build_response(prompt).text
    except (OSError, TimeoutError, TypeError, ValueError):
        return FullTextMessage(text=NAVIGATION_CLARIFICATION_TEXT, actions=[])

    intent, confidence = parse_classification(raw_result)
    if confidence < NAVIGATION_CONFIDENCE_THRESHOLD:
        return FullTextMessage(text=NAVIGATION_CLARIFICATION_TEXT, actions=[])
    if intent == "goodsList":
        return destination_response(GOODS_LIST_PATH, current_path)
    if intent == "cart":
        return destination_response(CART_PATH, current_path)
    return FullTextMessage(text=NAVIGATION_CLARIFICATION_TEXT, actions=[])


def deterministic_destination(normalized: str, current_path: str | None) -> str | None:
    if any(term in normalized for term in RECOMMENDATION_TERMS):
        return None
    if not has_navigation_cue(normalized):
        return None
    if any(term in normalized for term in CART_TERMS):
        return CART_PATH
    if (
        any(term in normalized for term in LIST_TERMS)
        or "굿즈 페이지" in normalized
        or "상품 페이지" in normalized
    ):
        return GOODS_LIST_PATH
    if any(term in normalized for term in BACK_TERMS):
        if is_goods_detail_path(current_path) or current_path == GOODS_LIST_PATH:
            return GOODS_LIST_PATH
        if current_path == CART_PATH:
            return CART_PATH
    return None


def has_ambiguous_navigation_intent(normalized: str) -> bool:
    return has_navigation_cue(normalized) and not any(
        term in normalized for term in RECOMMENDATION_TERMS
    )


def is_navigation_intent_candidate(text: str) -> bool:
    normalized = re.sub(r"\s+", " ", text.strip().lower())
    return has_ambiguous_navigation_intent(normalized)


def has_navigation_cue(normalized: str) -> bool:
    return any(pattern.search(normalized) for pattern in NAVIGATION_PATTERNS)


def destination_response(destination: str, current_path: str | None) -> FullTextMessage:
    if destination == GOODS_LIST_PATH:
        if current_path == GOODS_LIST_PATH:
            return FullTextMessage(text=GOODS_LIST_CURRENT_TEXT, actions=[])
        return FullTextMessage(
            text=GOODS_LIST_TEXT,
            actions=[NavigateAction(path=GOODS_LIST_PATH)],
        )
    if current_path == CART_PATH:
        return FullTextMessage(text=CART_CURRENT_TEXT, actions=[])
    return FullTextMessage(
        text=CART_TEXT,
        actions=[NavigateAction(path=CART_PATH)],
    )


def parse_classification(raw_text: str) -> tuple[str, float]:
    candidate = raw_text.strip()
    if candidate.startswith("```"):
        candidate = re.sub(r"^```(?:json)?\s*|\s*```$", "", candidate, flags=re.IGNORECASE)
    try:
        payload = json.loads(candidate)
    except (json.JSONDecodeError, TypeError):
        return "uncertain", 0.0
    if not isinstance(payload, dict):
        return "uncertain", 0.0
    intent = payload.get("intent")
    confidence = payload.get("confidence")
    if intent not in {"goodsList", "cart", "uncertain"}:
        return "uncertain", 0.0
    if not isinstance(confidence, (int, float)) or isinstance(confidence, bool):
        return "uncertain", 0.0
    return intent, max(0.0, min(float(confidence), 1.0))


def context_value(context: dict[str, Any] | Any | None, key: str) -> Any:
    if isinstance(context, dict):
        return context.get(key)
    return getattr(context, key, None) if context is not None else None


def is_goods_detail_path(path: str | None) -> bool:
    return bool(path and re.fullmatch(r"/goods/\d+", path))
