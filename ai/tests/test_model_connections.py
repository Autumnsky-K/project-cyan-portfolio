from project_cyan_ai.providers.chat_response import (
    HttpCodexOAuthClient,
    HttpOpenAiResponsesClient,
    OpenAiChatResponseProvider,
    extract_codex_sse_text,
    get_chat_response_provider,
)
from project_cyan_ai.runtime_config import RuntimeModelConnection, _model_connection_reference


def test_runtime_openai_profile_overrides_environment(monkeypatch):
    monkeypatch.setenv("PROJECT_CYAN_AI_PROVIDER", "mock")
    connection = RuntimeModelConnection(
        profile_id=3,
        profile_version=7,
        provider="OPENAI",
        connection_type="API_KEY",
        base_url="https://api.openai.com/v1",
        model="gpt-test",
        credential={"apiKey": "sk-runtime"},
    )

    provider = get_chat_response_provider(enable_shopping_tools=False, runtime_connection=connection)

    assert isinstance(provider, OpenAiChatResponseProvider)
    assert isinstance(provider.client, HttpOpenAiResponsesClient)
    assert provider.client.api_key == "sk-runtime"
    assert provider.client.model == "gpt-test"


def test_manifest_connection_reference_contains_no_credential_fields():
    reference = _model_connection_reference({"profileId": 3, "profileVersion": 7, "apiKey": "must-ignore"})

    assert reference == {"profileId": 3, "profileVersion": 7}


def test_codex_oauth_profile_uses_account_credential():
    connection = RuntimeModelConnection(
        profile_id=9,
        profile_version=2,
        provider="CODEX_OAUTH",
        connection_type="OAUTH",
        base_url="https://chatgpt.com/backend-api/codex/responses",
        model="gpt-5.4",
        credential={"access": "access-token", "account_id": "account-1"},
    )

    provider = get_chat_response_provider(enable_shopping_tools=False, runtime_connection=connection)

    assert isinstance(provider, OpenAiChatResponseProvider)
    assert isinstance(provider.client, HttpCodexOAuthClient)
    assert provider.client.access_token == "access-token"
    assert provider.shopping_tools is None


def test_codex_sse_parser_returns_delta_text_and_rejects_error():
    body = '\n'.join(
        [
            'event: response.output_text.delta',
            'data: {"type":"response.output_text.delta","delta":"안녕"}',
            '',
            'data: {"type":"response.output_text.delta","delta":"하세요"}',
            '',
            'data: [DONE]',
        ]
    )

    assert extract_codex_sse_text(body) == "안녕하세요"
