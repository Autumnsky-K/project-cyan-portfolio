import json

from fastapi.testclient import TestClient

from project_cyan_ai.goods_embedding_batch import (
    GoodsEmbeddingBatchJob,
    build_embedding_input_text,
    compute_source_text_hash,
)
from project_cyan_ai.main import app

client = TestClient(app)


class FakeCatalogClient:
    def __init__(self, candidates):
        self.candidates = candidates

    def load_all_candidates(self):
        return self.candidates


class FakeEmbeddingsClient:
    def __init__(self, vectors_by_text):
        self.vectors_by_text = vectors_by_text
        self.received_batches = []

    def embed_batch(self, texts):
        self.received_batches.append(texts)
        if any(text not in self.vectors_by_text for text in texts):
            return None
        return [self.vectors_by_text[text] for text in texts]


def test_build_embedding_input_text_combines_available_fields():
    candidate = {
        "name": "Artist A Photocard",
        "artistName": "Artist A",
        "groupName": "Group One",
        "categoryName": "Photocard",
        "tags": ["PHOTOCARD", "LIMITED"],
        "description": "한정판 포토카드입니다.",
    }
    text = build_embedding_input_text(candidate)
    assert text == (
        "Artist A Photocard\nArtist A\nGroup One\nPhotocard\n"
        "PHOTOCARD, LIMITED\n한정판 포토카드입니다."
    )


def test_build_embedding_input_text_skips_missing_fields():
    candidate = {"name": "Artist A Photocard", "tags": []}
    assert build_embedding_input_text(candidate) == "Artist A Photocard"


def test_compute_source_text_hash_is_stable_sha256():
    hash_value = compute_source_text_hash("Artist A Photocard")
    assert hash_value == compute_source_text_hash("Artist A Photocard")
    assert len(hash_value) == 64
    assert hash_value != compute_source_text_hash("Artist B Photocard")


def test_batch_job_pushes_embeddings_for_each_candidate(monkeypatch):
    catalog_client = FakeCatalogClient([
        {"goodsId": 1, "name": "Artist A Photocard"},
        {"goodsId": 2, "name": "Artist B Album"},
    ])
    embeddings_client = FakeEmbeddingsClient({
        "Artist A Photocard": [0.1, 0.2],
        "Artist B Album": [0.3, 0.4],
    })
    captured_requests = []

    def fake_urlopen(request, timeout):
        captured_requests.append(json.loads(request.data.decode("utf-8")))

        class _Response:
            def __enter__(self_inner):
                return self_inner

            def __exit__(self_inner, *args):
                return False

            def read(self_inner):
                return b"{}"

        return _Response()

    monkeypatch.setattr("project_cyan_ai.goods_embedding_batch.urlopen", fake_urlopen)

    job = GoodsEmbeddingBatchJob(
        catalog_client=catalog_client,
        embeddings_client=embeddings_client,
        spring_api_url="http://backend.test/api",
        service_token="secret-token",
        embedding_model="text-embedding-3-small",
    )
    result = job.run()

    assert result == {"catalogItemCount": 2, "embeddedCount": 2}
    assert len(captured_requests) == 1
    pushed = captured_requests[0]
    assert {item["goodsId"] for item in pushed} == {1, 2}
    assert all(item["embeddingModel"] == "text-embedding-3-small" for item in pushed)


def test_batch_job_skips_candidates_without_goods_id_or_text():
    catalog_client = FakeCatalogClient([
        {"goodsId": None, "name": "Missing id"},
        {"goodsId": 3, "name": ""},
    ])
    embeddings_client = FakeEmbeddingsClient({})

    job = GoodsEmbeddingBatchJob(
        catalog_client=catalog_client,
        embeddings_client=embeddings_client,
        spring_api_url="http://backend.test/api",
    )
    result = job.run()

    assert result == {"catalogItemCount": 2, "embeddedCount": 0}


def test_batch_job_skips_push_when_embedding_batch_fails():
    catalog_client = FakeCatalogClient([{"goodsId": 1, "name": "Artist A Photocard"}])
    embeddings_client = FakeEmbeddingsClient({})

    job = GoodsEmbeddingBatchJob(
        catalog_client=catalog_client,
        embeddings_client=embeddings_client,
        spring_api_url="http://backend.test/api",
    )
    result = job.run()

    assert result == {"catalogItemCount": 1, "embeddedCount": 0}


def test_recompute_endpoint_requires_service_token(monkeypatch):
    monkeypatch.setenv("PROJECT_CYAN_INTERNAL_SERVICE_TOKEN", "secret-token")
    monkeypatch.setenv("PROJECT_CYAN_OPENAI_API_KEY", "test-key")

    response = client.post("/internal/goods-embeddings/recompute")

    assert response.status_code == 401


def test_recompute_endpoint_requires_embeddings_api_key(monkeypatch):
    monkeypatch.setenv("PROJECT_CYAN_INTERNAL_SERVICE_TOKEN", "")
    monkeypatch.setenv("PROJECT_CYAN_OPENAI_API_KEY", "")

    response = client.post("/internal/goods-embeddings/recompute")

    assert response.status_code == 503
