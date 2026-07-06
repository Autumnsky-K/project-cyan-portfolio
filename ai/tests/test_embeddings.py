import json

from project_cyan_ai.embeddings import OpenAiEmbeddingsClient, extract_openai_embeddings


class FakeHttpResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


def test_embed_batch_sends_model_and_input(monkeypatch):
    captured = {}

    def fake_urlopen(request, timeout):
        captured["url"] = request.full_url
        captured["body"] = json.loads(request.data.decode("utf-8"))
        captured["headers"] = request.headers
        return FakeHttpResponse(
            {
                "data": [
                    {"index": 0, "embedding": [0.1, 0.2]},
                    {"index": 1, "embedding": [0.3, 0.4]},
                ]
            }
        )

    monkeypatch.setattr("project_cyan_ai.embeddings.urlopen", fake_urlopen)

    client = OpenAiEmbeddingsClient(
        base_url="https://api.openai.com/v1",
        api_key="test-key",
        model="text-embedding-3-small",
    )
    result = client.embed_batch(["첫 번째 문장", "두 번째 문장"])

    assert result == [[0.1, 0.2], [0.3, 0.4]]
    assert captured["url"] == "https://api.openai.com/v1/embeddings"
    assert captured["body"] == {
        "model": "text-embedding-3-small",
        "input": ["첫 번째 문장", "두 번째 문장"],
    }
    assert captured["headers"]["Authorization"] == "Bearer test-key"


def test_embed_returns_single_vector(monkeypatch):
    monkeypatch.setattr(
        "project_cyan_ai.embeddings.urlopen",
        lambda request, timeout: FakeHttpResponse({"data": [{"index": 0, "embedding": [0.5, 0.6]}]}),
    )

    client = OpenAiEmbeddingsClient("https://api.openai.com/v1", "test-key", "text-embedding-3-small")
    assert client.embed("포토카드") == [0.5, 0.6]


def test_embed_batch_returns_none_without_api_key():
    client = OpenAiEmbeddingsClient("https://api.openai.com/v1", None, "text-embedding-3-small")
    assert client.embed_batch(["텍스트"]) is None


def test_embed_batch_returns_none_on_http_error(monkeypatch):
    def fake_urlopen(request, timeout):
        raise OSError("network down")

    monkeypatch.setattr("project_cyan_ai.embeddings.urlopen", fake_urlopen)

    client = OpenAiEmbeddingsClient("https://api.openai.com/v1", "test-key", "text-embedding-3-small")
    assert client.embed_batch(["텍스트"]) is None


def test_embed_batch_returns_none_when_response_count_mismatches(monkeypatch):
    monkeypatch.setattr(
        "project_cyan_ai.embeddings.urlopen",
        lambda request, timeout: FakeHttpResponse({"data": [{"index": 0, "embedding": [0.1]}]}),
    )

    client = OpenAiEmbeddingsClient("https://api.openai.com/v1", "test-key", "text-embedding-3-small")
    assert client.embed_batch(["첫 번째", "두 번째"]) is None


def test_extract_openai_embeddings_sorts_by_index():
    payload = {
        "data": [
            {"index": 1, "embedding": [0.3, 0.4]},
            {"index": 0, "embedding": [0.1, 0.2]},
        ]
    }
    assert extract_openai_embeddings(payload) == [[0.1, 0.2], [0.3, 0.4]]


def test_extract_openai_embeddings_rejects_malformed_payload():
    assert extract_openai_embeddings({"data": "not-a-list"}) is None
    assert extract_openai_embeddings({"data": [{"embedding": "not-a-list"}]}) is None
    assert extract_openai_embeddings("not-a-dict") is None
