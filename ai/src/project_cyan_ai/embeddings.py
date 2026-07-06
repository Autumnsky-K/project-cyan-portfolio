import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

EMBEDDINGS_REQUEST_TIMEOUT_SECONDS = 30.0


class OpenAiEmbeddingsClient:
    def __init__(
        self,
        base_url: str,
        api_key: str | None,
        model: str,
        timeout_seconds: float = EMBEDDINGS_REQUEST_TIMEOUT_SECONDS,
    ):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model
        self.timeout_seconds = timeout_seconds

    def embed(self, text: str) -> list[float] | None:
        result = self.embed_batch([text])
        return result[0] if result else None

    def embed_batch(self, texts: list[str]) -> list[list[float]] | None:
        if not self.api_key or not texts:
            return None

        payload = json.dumps({"model": self.model, "input": texts}).encode("utf-8")
        headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": f"Bearer {self.api_key}",
        }
        request = Request(
            self._embeddings_url(),
            data=payload,
            headers=headers,
            method="POST",
        )
        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                response_payload = json.loads(response.read().decode("utf-8"))
        except (HTTPError, TimeoutError, URLError, OSError, ValueError):
            return None

        embeddings = extract_openai_embeddings(response_payload)
        if embeddings is None or len(embeddings) != len(texts):
            return None
        return embeddings

    def _embeddings_url(self) -> str:
        if self.base_url.endswith("/embeddings"):
            return self.base_url
        return f"{self.base_url}/embeddings"


def extract_openai_embeddings(payload: Any) -> list[list[float]] | None:
    if not isinstance(payload, dict):
        return None
    data = payload.get("data")
    if not isinstance(data, list):
        return None

    indexed_embeddings: list[tuple[int, list[float]]] = []
    for position, item in enumerate(data):
        if not isinstance(item, dict):
            return None
        embedding = item.get("embedding")
        if not isinstance(embedding, list):
            return None
        try:
            values = [float(value) for value in embedding]
        except (TypeError, ValueError):
            return None
        index = item.get("index")
        indexed_embeddings.append((index if isinstance(index, int) else position, values))

    indexed_embeddings.sort(key=lambda entry: entry[0])
    return [embedding for _, embedding in indexed_embeddings]
