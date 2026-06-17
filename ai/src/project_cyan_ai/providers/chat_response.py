import json
import re
from typing import Any, Protocol
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from project_cyan_ai.schemas.ws import (
    AddToCartAction,
    ActionPayload,
    FullTextMessage,
    HighlightAction,
    NavigateAction,
)
from project_cyan_ai.settings import get_settings

RECOMMENDATION_KEYWORDS = ("추천", "보여줘", "상품")
CART_KEYWORDS = ("장바구니", "담아줘")
MOCK_GOODS_ID = "1002"
OLV_REQUEST_TIMEOUT_SECONDS = 10.0
ANTHROPIC_VERSION = "2023-06-01"
CLAUDE_REQUEST_TIMEOUT_SECONDS = 30.0
CLAUDE_MAX_TOKENS = 1024
OPENAI_REQUEST_TIMEOUT_SECONDS = 30.0
AI_FALLBACK_TEXT = "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요."
OLV_FALLBACK_TEXT = AI_FALLBACK_TEXT
DEFAULT_CLAUDE_BASE_URL = "https://api.anthropic.com"
DEFAULT_CLAUDE_MODEL = "claude-3-haiku-20240307"
DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1"
DEFAULT_OPENAI_MODEL = "gpt-5.4-mini"
ACTION_TAG_PATTERN = re.compile(
    r"\[ACTION:(?P<name>[A-Za-z][A-Za-z0-9]*)\s*"
    r"(?P<attrs>(?:[^\]\"]|\"[^\"]*\")*)\]"
)
ACTION_ATTR_PATTERN = re.compile(
    r"(?P<key>[A-Za-z][A-Za-z0-9]*)=\"(?P<value>[^\"]*)\""
)


class ChatResponseProvider(Protocol):
    def build_response(self, text: str) -> FullTextMessage:
        """Build a server response for a validated chat text input."""
        ...


class OlvGatewayClient(Protocol):
    def generate_text(self, text: str) -> str:
        """Return raw LLM text from an OLV-compatible gateway."""
        ...


class ClaudeClient(Protocol):
    def generate_text(self, text: str) -> str:
        """Return raw LLM text from Anthropic Claude."""
        ...


class OpenAiClient(Protocol):
    def generate_text(self, text: str) -> str:
        """Return raw LLM text from an OpenAI Responses-compatible API."""
        ...


class HttpOlvGatewayClient:
    def __init__(
        self,
        gateway_url: str,
        api_key: str | None = None,
        timeout_seconds: float = OLV_REQUEST_TIMEOUT_SECONDS,
    ):
        self.gateway_url = gateway_url
        self.api_key = api_key
        self.timeout_seconds = timeout_seconds

    def generate_text(self, text: str) -> str:
        payload = json.dumps({"text": text}).encode("utf-8")
        headers = {"Content-Type": "application/json; charset=utf-8"}

        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        request = Request(
            self.gateway_url,
            data=payload,
            headers=headers,
            method="POST",
        )

        with urlopen(request, timeout=self.timeout_seconds) as response:
            response_payload = json.loads(response.read().decode("utf-8"))

        return extract_olv_text(response_payload)


class HttpClaudeClient:
    def __init__(
        self,
        base_url: str,
        api_key: str | None,
        model: str,
        timeout_seconds: float = CLAUDE_REQUEST_TIMEOUT_SECONDS,
    ):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model
        self.timeout_seconds = timeout_seconds

    def generate_text(self, text: str) -> str:
        if not self.api_key:
            raise ValueError("Claude API key is missing")

        payload = json.dumps(
            {
                "model": self.model,
                "max_tokens": CLAUDE_MAX_TOKENS,
                "messages": [{"role": "user", "content": text}],
            }
        ).encode("utf-8")
        headers = {
            "Content-Type": "application/json; charset=utf-8",
            "x-api-key": self.api_key,
            "anthropic-version": ANTHROPIC_VERSION,
        }

        request = Request(
            self._messages_url(),
            data=payload,
            headers=headers,
            method="POST",
        )

        with urlopen(request, timeout=self.timeout_seconds) as response:
            response_payload = json.loads(response.read().decode("utf-8"))

        return extract_claude_text(response_payload)

    def _messages_url(self) -> str:
        if self.base_url.endswith("/v1/messages"):
            return self.base_url

        return f"{self.base_url}/v1/messages"


class HttpOpenAiResponsesClient:
    def __init__(
        self,
        base_url: str,
        api_key: str | None,
        model: str,
        timeout_seconds: float = OPENAI_REQUEST_TIMEOUT_SECONDS,
    ):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model
        self.timeout_seconds = timeout_seconds

    def generate_text(self, text: str) -> str:
        if not self.api_key:
            raise ValueError("LLM API key is missing")

        payload = json.dumps(
            {
                "model": self.model,
                "input": text,
            }
        ).encode("utf-8")
        headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": f"Bearer {self.api_key}",
        }

        request = Request(
            self._responses_url(),
            data=payload,
            headers=headers,
            method="POST",
        )

        with urlopen(request, timeout=self.timeout_seconds) as response:
            response_payload = json.loads(response.read().decode("utf-8"))

        return extract_openai_text(response_payload)

    def _responses_url(self) -> str:
        if self.base_url.endswith("/responses"):
            return self.base_url

        return f"{self.base_url}/responses"


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


def extract_olv_text(payload: Any) -> str:
    if isinstance(payload, str):
        return payload

    if not isinstance(payload, dict):
        return ""

    for key in ("text", "message", "response"):
        value = payload.get(key)
        if isinstance(value, str):
            return value

    choices = payload.get("choices")
    if isinstance(choices, list) and choices:
        first_choice = choices[0]
        if isinstance(first_choice, dict):
            message = first_choice.get("message")
            if isinstance(message, dict) and isinstance(message.get("content"), str):
                return message["content"]

            if isinstance(first_choice.get("text"), str):
                return first_choice["text"]

    return ""


def extract_claude_text(payload: Any) -> str:
    if not isinstance(payload, dict):
        return ""

    content = payload.get("content")
    if isinstance(content, str):
        return content

    if not isinstance(content, list):
        return ""

    text_parts = []
    for content_block in content:
        if not isinstance(content_block, dict):
            continue

        if content_block.get("type") == "text" and isinstance(
            content_block.get("text"),
            str,
        ):
            text_parts.append(content_block["text"])

    return "".join(text_parts)


def extract_openai_text(payload: Any) -> str:
    if not isinstance(payload, dict):
        return ""

    output_text = payload.get("output_text")
    if isinstance(output_text, str):
        return output_text

    output = payload.get("output")
    if isinstance(output, list):
        text_parts = []
        for output_item in output:
            if not isinstance(output_item, dict):
                continue

            content = output_item.get("content")
            if not isinstance(content, list):
                continue

            for content_item in content:
                if not isinstance(content_item, dict):
                    continue

                text = content_item.get("text")
                if isinstance(text, str):
                    text_parts.append(text)

        return "".join(text_parts)

    choices = payload.get("choices")
    if isinstance(choices, list) and choices:
        first_choice = choices[0]
        if isinstance(first_choice, dict):
            message = first_choice.get("message")
            if isinstance(message, dict) and isinstance(message.get("content"), str):
                return message["content"]

            if isinstance(first_choice.get("text"), str):
                return first_choice["text"]

    return ""


def build_action(action_name: str, attrs: dict[str, str]) -> ActionPayload | None:
    try:
        if action_name == "navigate":
            return NavigateAction(path=attrs["path"])

        if action_name == "highlight":
            return HighlightAction(selector=attrs["selector"])

        if action_name == "addToCart":
            return AddToCartAction(goodsId=attrs["goodsId"])
    except (KeyError, ValueError):
        return None

    return None


def parse_action_tags(text: str) -> FullTextMessage:
    actions: list[ActionPayload] = []

    for match in ACTION_TAG_PATTERN.finditer(text):
        attrs = {
            attr_match.group("key"): attr_match.group("value")
            for attr_match in ACTION_ATTR_PATTERN.finditer(match.group("attrs"))
        }
        action = build_action(match.group("name"), attrs)

        if action is not None:
            actions.append(action)

    clean_text = ACTION_TAG_PATTERN.sub("", text)
    clean_text = re.sub(r"[ \t]{2,}", " ", clean_text)
    clean_text = re.sub(r" *\n *", "\n", clean_text).strip()

    return FullTextMessage(text=clean_text, actions=actions)


class OlvChatResponseProvider:
    def __init__(self, client: OlvGatewayClient | None = None):
        self.client = client

    def build_response(self, text: str) -> FullTextMessage:
        if self.client is None:
            return FullTextMessage(text=AI_FALLBACK_TEXT, actions=[])

        try:
            raw_text = self.client.generate_text(text)
        except (HTTPError, TimeoutError, URLError, OSError, ValueError):
            return FullTextMessage(text=AI_FALLBACK_TEXT, actions=[])

        if not raw_text.strip():
            return FullTextMessage(text=AI_FALLBACK_TEXT, actions=[])

        return parse_action_tags(raw_text)


class ClaudeChatResponseProvider:
    def __init__(self, client: ClaudeClient | None = None):
        self.client = client

    def build_response(self, text: str) -> FullTextMessage:
        if self.client is None:
            return FullTextMessage(text=AI_FALLBACK_TEXT, actions=[])

        try:
            raw_text = self.client.generate_text(text)
        except (HTTPError, TimeoutError, URLError, OSError, ValueError):
            return FullTextMessage(text=AI_FALLBACK_TEXT, actions=[])

        if not raw_text.strip():
            return FullTextMessage(text=AI_FALLBACK_TEXT, actions=[])

        return parse_action_tags(raw_text)


class OpenAiChatResponseProvider:
    def __init__(self, client: OpenAiClient | None = None):
        self.client = client

    def build_response(self, text: str) -> FullTextMessage:
        if self.client is None:
            return FullTextMessage(text=AI_FALLBACK_TEXT, actions=[])

        try:
            raw_text = self.client.generate_text(text)
        except (HTTPError, TimeoutError, URLError, OSError, ValueError):
            return FullTextMessage(text=AI_FALLBACK_TEXT, actions=[])

        if not raw_text.strip():
            return FullTextMessage(text=AI_FALLBACK_TEXT, actions=[])

        return parse_action_tags(raw_text)


def get_chat_response_provider(
    provider_name: str | None = None,
) -> ChatResponseProvider:
    settings = get_settings()
    provider_name = (provider_name or settings.ai_provider).strip()

    if provider_name == "mock":
        return MockChatResponseProvider()

    if provider_name == "claude":
        client = HttpClaudeClient(
            base_url=settings.llm_base_url or DEFAULT_CLAUDE_BASE_URL,
            api_key=settings.llm_api_key,
            model=settings.llm_model or DEFAULT_CLAUDE_MODEL,
        )

        return ClaudeChatResponseProvider(client=client)

    if provider_name == "openai":
        client = HttpOpenAiResponsesClient(
            base_url=settings.llm_base_url or DEFAULT_OPENAI_BASE_URL,
            api_key=settings.llm_api_key,
            model=settings.llm_model or DEFAULT_OPENAI_MODEL,
        )

        return OpenAiChatResponseProvider(client=client)

    if provider_name == "olv":
        gateway_url = settings.olv_gateway_url
        api_key = settings.olv_api_key
        client = HttpOlvGatewayClient(gateway_url, api_key) if gateway_url else None

        return OlvChatResponseProvider(client=client)

    raise ValueError(f"Unsupported chat response provider: {provider_name}")
