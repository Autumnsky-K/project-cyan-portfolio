import json
from urllib.parse import urlparse

from project_cyan_ai.goods_catalog import (
    HttpGoodsCatalogClient,
    HttpSemanticGoodsCatalogClient,
    build_semantic_or_fallback_goods_catalog_client,
)


class FakeHttpResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


class FakeEmbeddingsClient:
    def __init__(self, vector):
        self.vector = vector
        self.received_texts = []

    def embed(self, text):
        self.received_texts.append(text)
        return self.vector


class FailingEmbeddingsClient:
    def embed(self, text):
        return None


def test_semantic_client_sends_query_embedding_and_filters(monkeypatch):
    captured = {}

    def fake_urlopen(request, timeout):
        captured["url"] = request.full_url
        captured["body"] = json.loads(request.data.decode("utf-8"))
        return FakeHttpResponse({"content": [{"goodsId": 1, "name": "Album"}]})

    monkeypatch.setattr("project_cyan_ai.goods_catalog.urlopen", fake_urlopen)

    client = HttpSemanticGoodsCatalogClient(
        "http://backend.test/api",
        FakeEmbeddingsClient([0.1, 0.2, 0.3]),
    )
    result = client.search_candidates(
        "Artist A 앨범 50,000원 이하 추천해줘",
        favorite_artists=[{"artistId": 5, "name": "Artist E"}],
        category_name="앨범",
        artist_name="Artist A",
    )

    assert urlparse(captured["url"]).path == "/api/goods/recommendation-candidates/semantic-search"
    assert captured["body"] == {
        "queryEmbedding": [0.1, 0.2, 0.3],
        "size": 10,
        "categoryName": "앨범",
        "artistName": "Artist A",
        "maxPrice": 50000,
        "preferredArtistIds": [5],
    }
    assert result == [{"goodsId": 1, "name": "Album"}]


def test_semantic_client_returns_none_when_embedding_fails():
    client = HttpSemanticGoodsCatalogClient("http://backend.test/api", FailingEmbeddingsClient())
    assert client.search_candidates("추천해줘") is None


def test_semantic_client_returns_none_on_http_error(monkeypatch):
    def fake_urlopen(request, timeout):
        raise OSError("network down")

    monkeypatch.setattr("project_cyan_ai.goods_catalog.urlopen", fake_urlopen)

    client = HttpSemanticGoodsCatalogClient("http://backend.test/api", FakeEmbeddingsClient([0.1]))
    assert client.search_candidates("추천해줘") is None


def test_factory_falls_back_to_http_client_without_api_key():
    client = build_semantic_or_fallback_goods_catalog_client(
        "http://backend.test/api",
        None,
        "https://api.openai.com/v1",
        "text-embedding-3-small",
    )
    assert isinstance(client, HttpGoodsCatalogClient)


def test_factory_uses_semantic_client_with_api_key():
    client = build_semantic_or_fallback_goods_catalog_client(
        "http://backend.test/api",
        "test-key",
        "https://api.openai.com/v1",
        "text-embedding-3-small",
    )
    assert isinstance(client, HttpSemanticGoodsCatalogClient)
    assert client.embeddings_client.api_key == "test-key"
