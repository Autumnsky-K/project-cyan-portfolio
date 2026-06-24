import json
import re
from typing import Any, Protocol
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from project_cyan_ai.providers.chat_response import (
    ChatResponseProvider,
    MockChatResponseProvider,
)
from project_cyan_ai.schemas.ws import (
    AddToCartAction,
    FullTextMessage,
    HighlightAction,
    NavigateAction,
)

GOODS_SEARCH_TIMEOUT_SECONDS = 2.0
PRODUCT_INTENT_KEYWORDS = (
    "상품",
    "굿즈",
    "추천",
    "포카",
    "포토카드",
    "키링",
    "앨범",
    "인형",
    "장바구니",
)
TEN_THOUSAND_WON_PATTERN = re.compile(r"(\d+)\s*만\s*원")
WON_PATTERN = re.compile(r"(\d[\d,]*)\s*원")
GOODS_PATH_PATTERN = re.compile(r"^/goods/(\d+)$")
GOODS_SELECTOR_PATTERN = re.compile(r"data-goods-id=['\"](\d+)['\"]")
UNQUALIFIED_ALL_RECOMMENDATION_KEYWORDS = ("전부", "모두", "전체")
FOLLOW_UP_EMPTY_TEXT = "담을 상품을 찾지 못했어요. 먼저 추천받을 상품을 알려주세요."
FOLLOW_UP_AMBIGUOUS_TEXT = "추천한 상품이 여러 개라서 어떤 상품을 담을지 모르겠어요. 1번 2번처럼 번호로 알려주세요."
KOREAN_NUMBER_WORDS = {
    "첫": 1,
    "한": 1,
    "하나": 1,
    "두": 2,
    "둘": 2,
    "세": 3,
    "셋": 3,
    "네": 4,
    "넷": 4,
    "다섯": 5,
    "여섯": 6,
    "일곱": 7,
    "여덟": 8,
    "아홉": 9,
    "열": 10,
    "열한": 11,
    "열하나": 11,
    "열두": 12,
    "열둘": 12,
    "열세": 13,
    "열셋": 13,
    "열네": 14,
    "열넷": 14,
    "열다섯": 15,
    "열여섯": 16,
    "열일곱": 17,
    "열여덟": 18,
    "열아홉": 19,
    "스무": 20,
    "스물": 20,
}
KOREAN_NUMBER_WORD_PATTERN = "|".join(
    re.escape(word)
    for word in sorted(KOREAN_NUMBER_WORDS, key=len, reverse=True)
)
DIGIT_SELECTION_PATTERN = re.compile(r"(\d+)\s*(?:번|번째)")
KOREAN_SELECTION_PATTERN = re.compile(
    rf"({KOREAN_NUMBER_WORD_PATTERN})\s*(?:번째|째)"
)
DIGIT_COUNT_ALL_PATTERN = re.compile(r"(\d+)\s*개\s*다")
KOREAN_COUNT_ALL_PATTERN = re.compile(
    rf"({KOREAN_NUMBER_WORD_PATTERN})\s*(?:개\s*)?다"
)


class GoodsCatalogClient(Protocol):
    def search_candidates(self, text: str) -> list[dict[str, Any]] | None:
        """Return candidates, an empty result, or None when Spring is unavailable."""
        ...


class HttpGoodsCatalogClient:
    def __init__(
        self,
        spring_api_url: str,
        timeout_seconds: float = GOODS_SEARCH_TIMEOUT_SECONDS,
    ):
        self.spring_api_url = spring_api_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    def search_candidates(self, text: str) -> list[dict[str, Any]] | None:
        query = {"q": text, "page": 0, "size": 10, "sort": "relevance,desc"}
        max_price = extract_max_price(text)
        if max_price is not None:
            query["maxPrice"] = max_price

        request = Request(
            f"{self.spring_api_url}/goods/recommendation-candidates?{urlencode(query)}",
            headers={"Accept": "application/json"},
            method="GET",
        )
        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except (HTTPError, TimeoutError, URLError, OSError, ValueError):
            return None

        content = payload.get("content") if isinstance(payload, dict) else None
        return content if isinstance(content, list) else []


class CatalogGroundedChatResponseProvider:
    def __init__(
        self,
        delegate: ChatResponseProvider,
        catalog_client: GoodsCatalogClient,
    ):
        self.delegate = delegate
        self.catalog_client = catalog_client
        self.recent_recommendation_candidates: list[dict[str, Any]] = []

    def build_response(
        self,
        text: str,
        context: dict[str, Any] | None = None,
    ) -> FullTextMessage:
        follow_up_response = build_follow_up_cart_response(
            text,
            self.recent_recommendation_candidates,
        )
        if follow_up_response is not None:
            return follow_up_response

        if not has_product_intent(text):
            return self.delegate.build_response(text, context)

        candidates = self.catalog_client.search_candidates(text)
        if candidates is None:
            return self.delegate.build_response(text, context)
        self.recent_recommendation_candidates = normalize_recent_candidates(candidates)
        if not candidates:
            return FullTextMessage(
                text="조건에 맞는 판매 가능한 상품을 찾지 못했어요.",
                actions=[],
            )

        if isinstance(self.delegate, MockChatResponseProvider):
            return build_mock_catalog_response(text, candidates)

        prompt = build_catalog_prompt(text, candidates)
        response = self.delegate.build_response(prompt, context)
        allowed_goods_ids = {
            str(candidate["goodsId"])
            for candidate in candidates
            if candidate.get("goodsId") is not None
        }
        return FullTextMessage(
            text=response.text,
            actions=[
                action
                for action in response.actions
                if action_goods_id(action) in allowed_goods_ids
            ],
        )


def has_product_intent(text: str) -> bool:
    return any(keyword in text for keyword in PRODUCT_INTENT_KEYWORDS)


def build_follow_up_cart_response(
    text: str,
    recent_candidates: list[dict[str, Any]],
) -> FullTextMessage | None:
    result = select_follow_up_candidates(text, recent_candidates)
    if result is None:
        return None

    status, selection = result
    if status == "ambiguous":
        return FullTextMessage(text=FOLLOW_UP_AMBIGUOUS_TEXT, actions=[])

    if not selection:
        return FullTextMessage(text=FOLLOW_UP_EMPTY_TEXT, actions=[])

    count = len(selection)
    response_text = (
        "방금 추천한 상품을 장바구니에 담을게요."
        if count == 1
        else f"방금 추천한 {count}개 상품을 장바구니에 담을게요."
    )
    return FullTextMessage(
        text=response_text,
        actions=[AddToCartAction(goodsId=str(candidate["goodsId"])) for candidate in selection],
    )


def select_follow_up_candidates(
    text: str,
    recent_candidates: list[dict[str, Any]],
) -> tuple[str, list[dict[str, Any]]] | None:
    normalized_text = re.sub(r"\s+", " ", text.strip().lower())
    if not is_cart_follow_up_text(normalized_text):
        return None

    selected_indexes = extract_selected_indexes(normalized_text)
    if selected_indexes:
        return "selected", [
            recent_candidates[index]
            for index in selected_indexes
            if index < len(recent_candidates)
        ]

    expected_count = extract_count_qualified_all(normalized_text)
    if expected_count is not None:
        if not recent_candidates:
            return "selected", []
        if expected_count == len(recent_candidates):
            return "selected", recent_candidates
        return "ambiguous", []

    if any(keyword in normalized_text for keyword in UNQUALIFIED_ALL_RECOMMENDATION_KEYWORDS):
        return "selected", recent_candidates

    return None


def extract_selected_indexes(normalized_text: str) -> list[int]:
    numbers = [
        int(match.group(1))
        for match in DIGIT_SELECTION_PATTERN.finditer(normalized_text)
    ]
    numbers.extend(
        KOREAN_NUMBER_WORDS[match.group(1)]
        for match in KOREAN_SELECTION_PATTERN.finditer(normalized_text)
    )
    return to_zero_based_unique_indexes(numbers)


def extract_count_qualified_all(normalized_text: str) -> int | None:
    digit_match = DIGIT_COUNT_ALL_PATTERN.search(normalized_text)
    if digit_match:
        return int(digit_match.group(1))

    korean_match = KOREAN_COUNT_ALL_PATTERN.search(normalized_text)
    if korean_match:
        return KOREAN_NUMBER_WORDS[korean_match.group(1)]

    return None


def to_zero_based_unique_indexes(numbers: list[int]) -> list[int]:
    indexes = []
    seen = set()
    for number in numbers:
        index = number - 1
        if index < 0 or index in seen:
            continue
        indexes.append(index)
        seen.add(index)
    return indexes


def is_cart_follow_up_text(normalized_text: str) -> bool:
    return "담" in normalized_text or "장바구니" in normalized_text


def normalize_recent_candidates(candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    recent_candidates = []
    for candidate in candidates:
        if candidate.get("goodsId") is None:
            continue
        recent_candidates.append(
            {
                key: candidate.get(key)
                for key in (
                    "goodsId",
                    "name",
                    "price",
                    "tags",
                    "artistName",
                    "categoryName",
                )
            }
        )
    return recent_candidates


def extract_max_price(text: str) -> int | None:
    ten_thousand_match = TEN_THOUSAND_WON_PATTERN.search(text)
    if ten_thousand_match:
        return int(ten_thousand_match.group(1)) * 10_000

    won_match = WON_PATTERN.search(text)
    if won_match:
        return int(won_match.group(1).replace(",", ""))

    return None


def build_catalog_prompt(text: str, candidates: list[dict[str, Any]]) -> str:
    compact_candidates = [
        {
            key: candidate.get(key)
            for key in (
                "goodsId",
                "name",
                "price",
                "tags",
                "artistName",
                "categoryName",
                "stockCount",
                "recommendationReason",
            )
        }
        for candidate in candidates
    ]
    return (
        f"사용자 요청:\n{text}\n\n"
        "Spring 상품 API가 반환한 추천 가능 상품 JSON:\n"
        f"{json.dumps(compact_candidates, ensure_ascii=False)}\n\n"
        "위 JSON 안의 상품만 추천하세요. JSON에 없는 goodsId를 만들지 마세요. "
        "추천 시 실제 goodsId로 ACTION 태그를 생성하세요."
    )


def build_mock_catalog_response(
    text: str,
    candidates: list[dict[str, Any]],
) -> FullTextMessage:
    first = candidates[0]
    goods_id = str(first["goodsId"])
    actions = [
        NavigateAction(path=f"/goods/{goods_id}"),
        HighlightAction(selector=f"[data-goods-id='{goods_id}']"),
    ]
    if "장바구니" in text or "담아" in text:
        actions.append(AddToCartAction(goodsId=goods_id))
    return FullTextMessage(
        text=f"{first.get('name', '추천 상품')}을 추천해요.",
        actions=actions,
    )


def action_goods_id(action: Any) -> str | None:
    if isinstance(action, AddToCartAction):
        return action.goodsId
    if isinstance(action, NavigateAction):
        match = GOODS_PATH_PATTERN.match(action.path)
        return match.group(1) if match else None
    if isinstance(action, HighlightAction):
        match = GOODS_SELECTOR_PATTERN.search(action.selector)
        return match.group(1) if match else None
    return None
