import hashlib
import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from project_cyan_ai.embeddings import OpenAiEmbeddingsClient
from project_cyan_ai.goods_catalog import TsvGoodsCatalogClient

GOODS_EMBEDDING_PUSH_TIMEOUT_SECONDS = 10.0
DEFAULT_EMBEDDING_BATCH_SIZE = 100
EMBEDDING_INPUT_FIELDS = ("name", "artistName", "groupName", "categoryName")


def build_embedding_input_text(candidate: dict[str, Any]) -> str:
    parts = [candidate.get(field) for field in EMBEDDING_INPUT_FIELDS]
    tags = candidate.get("tags")
    if isinstance(tags, list) and tags:
        parts.append(", ".join(str(tag) for tag in tags))
    parts.append(candidate.get("description"))
    return "\n".join(str(part).strip() for part in parts if part and str(part).strip())


def compute_source_text_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


class GoodsEmbeddingBatchJob:
    def __init__(
        self,
        catalog_client: TsvGoodsCatalogClient,
        embeddings_client: OpenAiEmbeddingsClient,
        spring_api_url: str,
        service_token: str | None = None,
        embedding_model: str = "text-embedding-3-small",
        batch_size: int = DEFAULT_EMBEDDING_BATCH_SIZE,
        timeout_seconds: float = GOODS_EMBEDDING_PUSH_TIMEOUT_SECONDS,
    ):
        self.catalog_client = catalog_client
        self.embeddings_client = embeddings_client
        self.spring_api_url = spring_api_url.rstrip("/")
        self.service_token = service_token
        self.embedding_model = embedding_model
        self.batch_size = max(1, batch_size)
        self.timeout_seconds = timeout_seconds

    def run(self) -> dict[str, int]:
        candidates = self.catalog_client.load_all_candidates()
        items = self._embeddable_items(candidates)

        embedded_count = 0
        for batch_start in range(0, len(items), self.batch_size):
            batch = items[batch_start:batch_start + self.batch_size]
            embeddings = self.embeddings_client.embed_batch([text for _, text, _ in batch])
            if embeddings is None:
                continue
            payload = [
                {
                    "goodsId": goods_id,
                    "embedding": embedding,
                    "embeddingModel": self.embedding_model,
                    "sourceTextHash": source_hash,
                }
                for (goods_id, _, source_hash), embedding in zip(batch, embeddings)
            ]
            if self._push(payload):
                embedded_count += len(payload)

        return {"catalogItemCount": len(candidates), "embeddedCount": embedded_count}

    def _embeddable_items(
        self,
        candidates: list[dict[str, Any]],
    ) -> list[tuple[int, str, str]]:
        items = []
        for candidate in candidates:
            goods_id = candidate.get("goodsId")
            if goods_id is None:
                continue
            text = build_embedding_input_text(candidate)
            if not text:
                continue
            items.append((goods_id, text, compute_source_text_hash(text)))
        return items

    def _push(self, payload: list[dict[str, Any]]) -> bool:
        headers = {"Content-Type": "application/json; charset=utf-8"}
        if self.service_token:
            headers["X-Project-Cyan-Service-Token"] = self.service_token
        request = Request(
            f"{self.spring_api_url}/ai/goods-embeddings",
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                response.read()
            return True
        except (HTTPError, TimeoutError, URLError, OSError, ValueError):
            return False
