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

    def build_response(self, text: str) -> FullTextMessage:
        if not has_product_intent(text):
            return self.delegate.build_response(text)

        candidates = self.catalog_client.search_candidates(text)
        if candidates is None:
            return self.delegate.build_response(text)
        if not candidates:
            return FullTextMessage(
                text="조건에 맞는 판매 가능한 상품을 찾지 못했어요.",
                actions=[],
            )

        if isinstance(self.delegate, MockChatResponseProvider):
            return build_mock_catalog_response(text, candidates)

        prompt = build_catalog_prompt(text, candidates)
        response = self.delegate.build_response(prompt)
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
