import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from project_cyan_ai.main import app
from project_cyan_ai.providers import (
    ClaudeChatResponseProvider,
    MockChatResponseProvider,
    OlvChatResponseProvider,
    OpenAiChatResponseProvider,
    get_chat_response_provider,
    parse_action_tags,
)
from project_cyan_ai.schemas.ws import (
    AddToCartAction,
    ClientTextInput,
    FullTextMessage,
    HighlightAction,
    NavigateAction,
)
from project_cyan_ai.settings import get_settings

client = TestClient(app)
mock_provider = MockChatResponseProvider()


@pytest.fixture(autouse=True)
def isolate_ai_settings(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    for env_name in (
        "PROJECT_CYAN_AI_PROVIDER",
        "PROJECT_CYAN_LLM_BASE_URL",
        "PROJECT_CYAN_LLM_API_KEY",
        "PROJECT_CYAN_LLM_MODEL",
        "PROJECT_CYAN_CLAUDE_BASE_URL",
        "PROJECT_CYAN_CLAUDE_API_KEY",
        "PROJECT_CYAN_CLAUDE_MODEL",
        "PROJECT_CYAN_OLV_GATEWAY_URL",
        "PROJECT_CYAN_OLV_API_KEY",
    ):
        monkeypatch.delenv(env_name, raising=False)


class FakeOlvClient:
    def __init__(
        self,
        response_text: str | None = None,
        error: Exception | None = None,
    ):
        self.response_text = response_text
        self.error = error
        self.received_texts: list[str] = []

    def generate_text(self, text: str) -> str:
        self.received_texts.append(text)

        if self.error is not None:
            raise self.error

        return self.response_text or ""


class FakeClaudeClient:
    def __init__(
        self,
        response_text: str | None = None,
        error: Exception | None = None,
    ):
        self.response_text = response_text
        self.error = error
        self.received_texts: list[str] = []

    def generate_text(self, text: str) -> str:
        self.received_texts.append(text)

        if self.error is not None:
            raise self.error

        return self.response_text or ""


class FakeOpenAiClient:
    def __init__(
        self,
        response_text: str | None = None,
        error: Exception | None = None,
    ):
        self.response_text = response_text
        self.error = error
        self.received_texts: list[str] = []

    def generate_text(self, text: str) -> str:
        self.received_texts.append(text)

        if self.error is not None:
            raise self.error

        return self.response_text or ""


def test_health_returns_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_client_text_input_requires_frozen_type():
    with pytest.raises(ValidationError):
        ClientTextInput.model_validate({"type": "ping", "text": "안녕"})


def test_full_text_message_preserves_server_contract_shape():
    message = FullTextMessage(text="안녕")

    assert message.model_dump() == {
        "type": "full-text",
        "text": "안녕",
        "actions": [],
    }


def test_full_text_message_accepts_mvp_action_payloads():
    message = FullTextMessage(
        text="추천 상품을 보여드릴게요",
        actions=[
            NavigateAction(path="/goods/1002"),
            HighlightAction(selector="[data-goods-id='1002']"),
            AddToCartAction(goodsId="1002"),
        ],
    )

    assert message.model_dump() == {
        "type": "full-text",
        "text": "추천 상품을 보여드릴게요",
        "actions": [
            {"type": "navigate", "path": "/goods/1002"},
            {"type": "highlight", "selector": "[data-goods-id='1002']"},
            {"type": "addToCart", "goodsId": "1002"},
        ],
    }


def test_full_text_message_rejects_unknown_action_payload():
    with pytest.raises(ValidationError):
        FullTextMessage.model_validate(
            {
                "type": "full-text",
                "text": "안녕",
                "actions": [{"type": "unknown", "value": "1002"}],
            }
        )


def test_full_text_message_rejects_action_missing_required_field():
    with pytest.raises(ValidationError):
        FullTextMessage.model_validate(
            {
                "type": "full-text",
                "text": "안녕",
                "actions": [{"type": "navigate"}],
            }
        )


def test_full_text_message_rejects_extra_action_field():
    with pytest.raises(ValidationError):
        FullTextMessage.model_validate(
            {
                "type": "full-text",
                "text": "안녕",
                "actions": [
                    {"type": "addToCart", "goodsId": "1002", "path": "/goods/1002"}
                ],
            }
        )


def test_chat_response_provider_factory_returns_mock_provider_by_default():
    assert isinstance(get_chat_response_provider(), MockChatResponseProvider)


def test_chat_response_provider_factory_uses_env_provider(monkeypatch):
    monkeypatch.setenv("PROJECT_CYAN_AI_PROVIDER", "claude")
    monkeypatch.setenv("PROJECT_CYAN_LLM_API_KEY", "local-secret")

    assert isinstance(get_chat_response_provider(), ClaudeChatResponseProvider)


def test_chat_response_provider_factory_uses_openai_provider(monkeypatch):
    monkeypatch.setenv("PROJECT_CYAN_AI_PROVIDER", "openai")
    monkeypatch.setenv("PROJECT_CYAN_LLM_API_KEY", "local-secret")

    assert isinstance(get_chat_response_provider(), OpenAiChatResponseProvider)


def test_chat_response_provider_factory_keeps_experimental_olv_provider(
    monkeypatch,
):
    monkeypatch.setenv("PROJECT_CYAN_AI_PROVIDER", "olv")
    monkeypatch.setenv(
        "PROJECT_CYAN_OLV_GATEWAY_URL",
        "http://olv-gateway.test/chat",
    )

    assert isinstance(get_chat_response_provider(), OlvChatResponseProvider)


def test_settings_loads_ai_env_file_from_working_directory(tmp_path, monkeypatch):
    env_file = tmp_path / ".env"
    env_file.write_text(
        "\n".join(
            [
                "PROJECT_CYAN_AI_PROVIDER=claude",
                "PROJECT_CYAN_LLM_BASE_URL=https://api.example.test/v1",
                "PROJECT_CYAN_LLM_API_KEY=local-secret",
                "PROJECT_CYAN_LLM_MODEL=test-model",
            ]
        ),
        encoding="utf-8",
    )
    monkeypatch.chdir(tmp_path)

    settings = get_settings()

    assert settings.ai_provider == "claude"
    assert settings.llm_base_url == "https://api.example.test/v1"
    assert settings.llm_api_key == "local-secret"
    assert settings.llm_model == "test-model"


def test_mock_provider_echoes_plain_text_input():
    response = mock_provider.build_response("안녕")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "받은 메시지: 안녕",
        "actions": [],
    }


def test_mock_provider_returns_recommendation_actions():
    response = mock_provider.build_response("상품 추천 보여줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
        "actions": [
            {"type": "navigate", "path": "/goods/1002"},
            {"type": "highlight", "selector": "[data-goods-id='1002']"},
        ],
    }


def test_mock_provider_returns_add_to_cart_action():
    response = mock_provider.build_response("장바구니에 담아줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
        "actions": [
            {"type": "addToCart", "goodsId": "1002"},
        ],
    }


def test_mock_provider_combines_actions_when_keywords_overlap():
    response = mock_provider.build_response("추천 상품을 장바구니에 담아줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
        "actions": [
            {"type": "navigate", "path": "/goods/1002"},
            {"type": "highlight", "selector": "[data-goods-id='1002']"},
            {"type": "addToCart", "goodsId": "1002"},
        ],
    }


def test_parse_action_tags_removes_tags_and_builds_actions():
    response = parse_action_tags(
        '이 상품을 추천해요. [ACTION:navigate path="/goods/1002"] '
        '[ACTION:highlight selector="[data-goods-id=\'1002\']"]'
        '[ACTION:addToCart goodsId="1002"]'
    )

    assert response.model_dump() == {
        "type": "full-text",
        "text": "이 상품을 추천해요.",
        "actions": [
            {"type": "navigate", "path": "/goods/1002"},
            {"type": "highlight", "selector": "[data-goods-id='1002']"},
            {"type": "addToCart", "goodsId": "1002"},
        ],
    }


def test_parse_action_tags_ignores_invalid_actions():
    response = parse_action_tags(
        '안내할게요. [ACTION:unknown value="1002"] '
        '[ACTION:navigate] [ACTION:addToCart goodsId="1002"]'
    )

    assert response.model_dump() == {
        "type": "full-text",
        "text": "안내할게요.",
        "actions": [
            {"type": "addToCart", "goodsId": "1002"},
        ],
    }


def test_olv_provider_uses_client_and_parses_actions():
    fake_client = FakeOlvClient('좋아요. [ACTION:navigate path="/goods/1002"]')
    provider = OlvChatResponseProvider(client=fake_client)

    response = provider.build_response("상품 추천해줘")

    assert fake_client.received_texts == ["상품 추천해줘"]
    assert response.model_dump() == {
        "type": "full-text",
        "text": "좋아요.",
        "actions": [
            {"type": "navigate", "path": "/goods/1002"},
        ],
    }


def test_olv_provider_falls_back_when_client_is_missing():
    response = OlvChatResponseProvider().build_response("상품 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요.",
        "actions": [],
    }


def test_olv_provider_falls_back_without_leaking_error_details():
    provider = OlvChatResponseProvider(
        client=FakeOlvClient(error=OSError("secret-url-token"))
    )

    response = provider.build_response("상품 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요.",
        "actions": [],
    }
    assert "secret-url-token" not in response.text


def test_claude_provider_uses_client_and_parses_actions():
    fake_client = FakeClaudeClient('추천입니다 [ACTION:navigate path="/goods/42"]')
    provider = ClaudeChatResponseProvider(client=fake_client)

    response = provider.build_response("상품 추천해줘")

    assert fake_client.received_texts == ["상품 추천해줘"]
    assert response.model_dump() == {
        "type": "full-text",
        "text": "추천입니다",
        "actions": [
            {"type": "navigate", "path": "/goods/42"},
        ],
    }


def test_claude_provider_falls_back_when_client_is_missing():
    response = ClaudeChatResponseProvider().build_response("상품 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요.",
        "actions": [],
    }


def test_claude_provider_falls_back_without_leaking_error_details():
    provider = ClaudeChatResponseProvider(
        client=FakeClaudeClient(error=OSError("secret-api-key"))
    )

    response = provider.build_response("상품 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요.",
        "actions": [],
    }
    assert "secret-api-key" not in response.text


def test_claude_provider_falls_back_on_empty_response():
    provider = ClaudeChatResponseProvider(client=FakeClaudeClient(""))

    response = provider.build_response("상품 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요.",
        "actions": [],
    }


def test_openai_provider_uses_client_and_parses_actions():
    fake_client = FakeOpenAiClient('좋아요 [ACTION:addToCart goodsId="42"]')
    provider = OpenAiChatResponseProvider(client=fake_client)

    response = provider.build_response("장바구니에 담아줘")

    assert fake_client.received_texts == ["장바구니에 담아줘"]
    assert response.model_dump() == {
        "type": "full-text",
        "text": "좋아요",
        "actions": [
            {"type": "addToCart", "goodsId": "42"},
        ],
    }


def test_openai_provider_falls_back_when_client_is_missing():
    response = OpenAiChatResponseProvider().build_response("상품 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요.",
        "actions": [],
    }


def test_openai_provider_falls_back_without_leaking_error_details():
    provider = OpenAiChatResponseProvider(
        client=FakeOpenAiClient(error=OSError("secret-api-key"))
    )

    response = provider.build_response("상품 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요.",
        "actions": [],
    }
    assert "secret-api-key" not in response.text


def test_client_ws_sends_initial_messages():
    with client.websocket_connect("/client-ws") as websocket:
        greeting = websocket.receive_json()
        config = websocket.receive_json()

    assert greeting == {
        "type": "full-text",
        "text": "Connection established",
        "actions": [],
    }

    assert config["type"] == "set-model-and-conf"
    assert config["model_info"] == {}
    assert config["conf_name"] == "project-cyan-ai"
    assert config["conf_uid"] == "default"
    assert isinstance(config["client_uid"], str)
    assert config["client_uid"]


def test_client_ws_echoes_valid_text_input():
    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json({"type": "text-input", "text": "안녕"})
        response = websocket.receive_json()

    assert response == {
        "type": "full-text",
        "text": "받은 메시지: 안녕",
        "actions": [],
    }


def test_client_ws_returns_recommendation_mock_actions():
    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json({"type": "text-input", "text": "상품 추천 보여줘"})
        response = websocket.receive_json()

    assert response == {
        "type": "full-text",
        "text": "추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
        "actions": [
            {"type": "navigate", "path": "/goods/1002"},
            {"type": "highlight", "selector": "[data-goods-id='1002']"},
        ],
    }


def test_client_ws_returns_add_to_cart_mock_action():
    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json({"type": "text-input", "text": "장바구니에 담아줘"})
        response = websocket.receive_json()

    assert response == {
        "type": "full-text",
        "text": "추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
        "actions": [
            {"type": "addToCart", "goodsId": "1002"},
        ],
    }


def test_client_ws_combines_mock_actions_when_keywords_overlap():
    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json(
            {"type": "text-input", "text": "추천 상품을 장바구니에 담아줘"}
        )
        response = websocket.receive_json()

    assert response == {
        "type": "full-text",
        "text": "추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
        "actions": [
            {"type": "navigate", "path": "/goods/1002"},
            {"type": "highlight", "selector": "[data-goods-id='1002']"},
            {"type": "addToCart", "goodsId": "1002"},
        ],
    }


def test_client_ws_rejects_unsupported_message_type():
    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json({"type": "ping", "text": "안녕"})
        response = websocket.receive_json()

    assert response == {
        "type": "error",
        "message": "Unsupported message type.",
    }


def test_client_ws_rejects_invalid_text_input():
    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json({"type": "text-input"})
        response = websocket.receive_json()

    assert response == {
        "type": "error",
        "message": "Invalid text-input message.",
    }
