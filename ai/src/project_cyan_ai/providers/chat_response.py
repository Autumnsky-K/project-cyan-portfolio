from typing import Protocol

from project_cyan_ai.schemas.ws import (
    AddToCartAction,
    FullTextMessage,
    HighlightAction,
    NavigateAction,
)

RECOMMENDATION_KEYWORDS = ("추천", "보여줘", "상품")
CART_KEYWORDS = ("장바구니", "담아줘")
MOCK_GOODS_ID = "42"
DEFAULT_CHAT_RESPONSE_PROVIDER = "mock"


class ChatResponseProvider(Protocol):
    def build_response(self, text: str) -> FullTextMessage:
        """Build a server response for a validated chat text input."""
        ...


class MockChatResponseProvider:
    def build_response(self, text: str) -> FullTextMessage:
        actions = []

        if any(keyword in text for keyword in RECOMMENDATION_KEYWORDS):
            actions.extend(
                [
                    NavigateAction(path=f"/goods/{MOCK_GOODS_ID}"),
                    HighlightAction(selector=f"[data-goods-id='{MOCK_GOODS_ID}']"),
                ]
            )

        if any(keyword in text for keyword in CART_KEYWORDS):
            actions.append(AddToCartAction(goodsId=MOCK_GOODS_ID))

        if actions:
            return FullTextMessage(
                text="추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
                actions=actions,
            )

        return FullTextMessage(
            text=f"받은 메시지: {text}",
            actions=[],
        )


def get_chat_response_provider(
    provider_name: str = DEFAULT_CHAT_RESPONSE_PROVIDER,
) -> ChatResponseProvider:
    if provider_name == "mock":
        return MockChatResponseProvider()

    raise ValueError(f"Unsupported chat response provider: {provider_name}")
