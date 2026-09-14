#!/usr/bin/env python3
"""Reproducible recommendation evaluation for Project Cyan.

The runner never writes secret values. It records failures as first-class observations
and supports the production WebSocket path plus retrieval-only diagnostics.
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import math
import os
import re
import statistics
import sys
import time
from collections import Counter
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from pydantic import ValidationError
from websockets.asyncio.client import connect

from project_cyan_ai.embeddings import OpenAiEmbeddingsClient
from project_cyan_ai.schemas.ws import FullTextMessage


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATASET = Path(__file__).with_name("recommendation_questions.jsonl")
DEFAULT_RESULTS = Path(__file__).with_name("results")
GOODS_PATH = re.compile(r"^/goods/(\d+)$")
SHOPPING_PATH = re.compile(r"^/(?:goods(?:/\d+)?|cart)$")
GOODS_SELECTOR = re.compile(r"data-goods-id=['\"](\d+)['\"]")
GOODS_SELECTOR_FULL = re.compile(r"^\[data-goods-id=(['\"])\d+\1\]$")
SUPPORTED_ACTIONS = {"navigate", "highlight", "addToCart", "showRecommendations"}


@dataclass(frozen=True)
class EvalCase:
    test_id: str
    category: str
    user_query: str
    expected_goods_ids: list[int]
    acceptable_no_result: bool
    expected_action: list[str]
    user_type: str
    evaluation_note: str


def load_dotenv(path: Path, protected_keys: set[str]) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
            value = value[1:-1]
        normalized_key = key.strip()
        if normalized_key not in protected_keys:
            os.environ[normalized_key] = value


def load_environment() -> None:
    # Explicit process variables win over files, while later local files override
    # shared defaults (for example frontend/.env.local over .env.development).
    protected_keys = set(os.environ)
    for path in (
        ROOT / "frontend/.env.development",
        ROOT / "frontend/.env.local",
        ROOT / "backend/.env.local",
        ROOT / "ai/.env",
        ROOT / "ai/.env.local",
    ):
        load_dotenv(path, protected_keys)


def load_cases(path: Path) -> list[EvalCase]:
    cases = []
    with path.open(encoding="utf-8") as dataset:
        for line_number, raw_line in enumerate(dataset, start=1):
            if not raw_line.strip():
                continue
            try:
                value = json.loads(raw_line)
                case = EvalCase(**value)
            except (ValueError, TypeError) as exc:
                raise ValueError(f"Invalid JSONL at line {line_number}: {exc}") from exc
            cases.append(case)
    validate_cases(cases)
    return cases


def validate_cases(cases: list[EvalCase]) -> None:
    if not cases:
        raise ValueError("Dataset is empty")
    ids = [case.test_id for case in cases]
    if len(ids) != len(set(ids)):
        raise ValueError("test_id values must be unique")
    for case in cases:
        if case.user_type not in {"guest", "member"}:
            raise ValueError(f"{case.test_id}: unsupported user_type")
        if any(not isinstance(goods_id, int) or goods_id <= 0 for goods_id in case.expected_goods_ids):
            raise ValueError(f"{case.test_id}: expected_goods_ids must be positive integers")
        if any(action not in SUPPORTED_ACTIONS for action in case.expected_action):
            raise ValueError(f"{case.test_id}: unsupported expected_action")


def request_json(
    url: str,
    *,
    method: str = "GET",
    payload: Any | None = None,
    headers: dict[str, str] | None = None,
    timeout: float = 30.0,
) -> Any:
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    request_headers = {"Accept": "application/json", **(headers or {})}
    if body is not None:
        request_headers["Content-Type"] = "application/json; charset=utf-8"
    request = Request(url, data=body, headers=request_headers, method=method)
    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_catalog(spring_url: str) -> tuple[list[dict[str, Any]], str]:
    goods: list[dict[str, Any]] = []
    page = 0
    while True:
        query = urlencode({"page": page, "size": 100, "sort": "createdAt,desc"})
        payload = request_json(f"{spring_url}/goods?{query}")
        content = payload.get("content", []) if isinstance(payload, dict) else []
        goods.extend(item for item in content if isinstance(item, dict))
        if page + 1 >= int(payload.get("totalPages", 0)):
            break
        page += 1
    canonical_goods = []
    for item in goods:
        normalized = dict(item)
        if isinstance(normalized.get("tags"), list):
            normalized["tags"] = sorted(normalized["tags"])
        canonical_goods.append(normalized)
    canonical_goods.sort(key=lambda item: int(item["goodsId"]))
    canonical = json.dumps(
        canonical_goods,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )
    return goods, hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def authenticate_member() -> str:
    url = os.environ.get("VITE_SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "")
    email = os.environ.get("PROJECT_CYAN_EVAL_EMAIL", "")
    password = os.environ.get("PROJECT_CYAN_EVAL_PASSWORD", "")
    if not all((url, key, email, password)):
        raise ValueError("Member evaluation credentials or Supabase public settings are missing")
    payload = request_json(
        f"{url}/auth/v1/token?grant_type=password",
        method="POST",
        payload={"email": email, "password": password},
        headers={"apikey": key},
    )
    token = payload.get("access_token") if isinstance(payload, dict) else None
    if not isinstance(token, str) or not token:
        raise ValueError("Supabase did not return an access token")
    return token


def action_goods_ids(actions: list[dict[str, Any]]) -> list[int]:
    values: list[int] = []
    for action in actions:
        action_type = action.get("type")
        if action_type == "addToCart" and str(action.get("goodsId", "")).isdigit():
            values.append(int(action["goodsId"]))
        elif action_type == "navigate":
            match = GOODS_PATH.match(str(action.get("path", "")))
            if match:
                values.append(int(match.group(1)))
        elif action_type == "highlight":
            match = GOODS_SELECTOR.search(str(action.get("selector", "")))
            if match:
                values.append(int(match.group(1)))
        elif action_type == "showRecommendations":
            values.extend(int(value) for value in action.get("goodsIds", []) if str(value).isdigit())
    return list(dict.fromkeys(values))


def response_goods_ids(payload: dict[str, Any]) -> list[int]:
    recommendations = payload.get("metadata", {}).get("recommendations", [])
    ids = [
        int(item["goodsId"])
        for item in recommendations
        if isinstance(item, dict) and str(item.get("goodsId", "")).isdigit()
    ]
    return list(dict.fromkeys(ids or action_goods_ids(payload.get("actions", []))))


def exposes_invalid_action(actions: list[dict[str, Any]]) -> bool:
    """Mirror the server/client structural allowlist for an observable bad effect."""
    for action in actions:
        if not isinstance(action, dict):
            return True
        action_type = action.get("type")
        if action_type == "navigate":
            if not SHOPPING_PATH.fullmatch(str(action.get("path", ""))):
                return True
        elif action_type == "highlight":
            if not GOODS_SELECTOR_FULL.fullmatch(str(action.get("selector", ""))):
                return True
        elif action_type == "addToCart":
            if not str(action.get("goodsId", "")).isdigit():
                return True
        elif action_type == "showRecommendations":
            goods_ids = action.get("goodsIds")
            if (
                not isinstance(goods_ids, list)
                or not 2 <= len(goods_ids) <= 20
                or len({str(value) for value in goods_ids}) != len(goods_ids)
                or any(not isinstance(value, str) or not value.isdigit() for value in goods_ids)
            ):
                return True
        else:
            return True
    return False


async def receive_json(socket, timeout: float) -> dict[str, Any]:
    raw = await asyncio.wait_for(socket.recv(), timeout=timeout)
    value = json.loads(raw)
    if not isinstance(value, dict):
        raise ValueError("WebSocket message is not an object")
    return value


async def run_e2e_case(
    case: EvalCase,
    ws_url: str,
    access_token: str | None,
    timeout: float,
) -> dict[str, Any]:
    async with connect(ws_url, open_timeout=timeout, close_timeout=5) as socket:
        await receive_json(socket, timeout)
        await receive_json(socket, timeout)
        if case.user_type == "member":
            if not access_token:
                raise ValueError("Member access token is unavailable")
            await socket.send(json.dumps({"type": "auth", "accessToken": access_token}))
        request_payload = {
            "type": "text-input",
            "text": case.user_query,
            "context": {"cartItems": [], "recentRecommendations": [], "currentPath": "/goods"},
        }
        started = time.perf_counter()
        await socket.send(json.dumps(request_payload, ensure_ascii=False))
        response = await receive_json(socket, timeout)
        latency_ms = (time.perf_counter() - started) * 1000
    schema_pass = True
    schema_error = None
    try:
        FullTextMessage.model_validate(response)
    except ValidationError as exc:
        schema_pass = False
        schema_error = str(exc)
    actions = response.get("actions", []) if isinstance(response.get("actions"), list) else []
    return {
        "latency_ms": round(latency_ms, 3),
        "response_text": response.get("text"),
        "actions": actions,
        "action_types": [action.get("type") for action in actions if isinstance(action, dict)],
        "recommended_goods_ids": response_goods_ids(response),
        "candidate_goods_ids": [
            int(item["goodsId"])
            for item in response.get("metadata", {}).get("recommendations", [])
            if isinstance(item, dict) and str(item.get("goodsId", "")).isdigit()
        ],
        "schema_pass": schema_pass,
        "schema_error": schema_error,
    }


def keyword_candidates(case: EvalCase, spring_url: str, timeout: float) -> dict[str, Any]:
    query = {"q": case.user_query, "page": 0, "size": 10, "sort": "relevance,desc"}
    started = time.perf_counter()
    payload = request_json(
        f"{spring_url}/goods/recommendation-candidates?{urlencode(query)}",
        timeout=timeout,
    )
    latency_ms = (time.perf_counter() - started) * 1000
    content = payload.get("content", []) if isinstance(payload, dict) else []
    ids = [int(item["goodsId"]) for item in content if str(item.get("goodsId", "")).isdigit()]
    return {
        "latency_ms": round(latency_ms, 3),
        "recommended_goods_ids": ids,
        "candidate_goods_ids": ids,
        "retrieval_items": content,
        "schema_pass": None,
    }


def semantic_candidates(
    case: EvalCase,
    spring_url: str,
    embeddings: OpenAiEmbeddingsClient,
    timeout: float,
) -> dict[str, Any]:
    started = time.perf_counter()
    vector = embeddings.embed(case.user_query)
    if vector is None:
        raise ValueError("Embedding request failed")
    payload = request_json(
        f"{spring_url}/goods/recommendation-candidates/semantic-search",
        method="POST",
        payload={"queryEmbedding": vector, "size": 10},
        timeout=timeout,
    )
    latency_ms = (time.perf_counter() - started) * 1000
    content = payload.get("content", []) if isinstance(payload, dict) else []
    ids = [int(item["goodsId"]) for item in content if str(item.get("goodsId", "")).isdigit()]
    return {
        "latency_ms": round(latency_ms, 3),
        "recommended_goods_ids": ids,
        "candidate_goods_ids": ids,
        "retrieval_items": content,
        "schema_pass": None,
    }


def percentile(values: list[float], percentile_value: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    position = (len(ordered) - 1) * percentile_value
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return round(ordered[lower], 3)
    interpolated = ordered[lower] + (ordered[upper] - ordered[lower]) * (position - lower)
    return round(interpolated, 3)


def calculate_metrics(observations: list[dict[str, Any]], catalog_ids: set[int], mode: str) -> dict[str, Any]:
    successful = [item for item in observations if item["status"] == "ok"]
    positive = [item for item in observations if item["expected_goods_ids"]]
    no_result = [
        item for item in observations
        if item["acceptable_no_result"] and not item["expected_goods_ids"]
    ]
    hit1 = sum(
        item["status"] == "ok"
        and bool(set(item["recommended_goods_ids"][:1]) & set(item["expected_goods_ids"]))
        for item in positive
    )
    hit3 = sum(
        item["status"] == "ok"
        and bool(set(item["recommended_goods_ids"][:3]) & set(item["expected_goods_ids"]))
        for item in positive
    )
    recommended_ids = [goods_id for item in successful for goods_id in item["recommended_goods_ids"]]
    action_ids = [goods_id for item in successful for goods_id in item.get("action_goods_ids", [])]
    candidate_ids = {
        (item["test_id"], item["repeat"]): set(item.get("candidate_goods_ids", []))
        for item in successful
    }
    outside_count = sum(
        goods_id not in candidate_ids[(item["test_id"], item["repeat"])]
        for item in successful
        for goods_id in item.get("action_goods_ids", [])
    )
    forbidden = [item for item in observations if item["category"] == "forbidden_action"]
    latencies = [float(item["latency_ms"]) for item in successful if item.get("latency_ms") is not None]
    schema_items = [item for item in observations if mode == "e2e"]
    return {
        "successful_requests": len(successful),
        "failed_requests": len(observations) - len(successful),
        "hit_at_1": round(hit1 / len(positive), 6) if positive else None,
        "hit_at_1_denominator": len(positive),
        "hit_at_3": round(hit3 / len(positive), 6) if positive else None,
        "hit_at_3_denominator": len(positive),
        "out_of_candidate_goods_id_rate": (
            round(outside_count / len(action_ids), 6) if mode == "e2e" and action_ids else None
        ),
        "out_of_candidate_goods_id_denominator": len(action_ids) if mode == "e2e" else None,
        "nonexistent_goods_rate": (
            round(sum(goods_id not in catalog_ids for goods_id in recommended_ids) / len(recommended_ids), 6)
            if recommended_ids else None
        ),
        "nonexistent_goods_denominator": len(recommended_ids),
        "action_schema_pass_rate": (
            round(sum(item.get("schema_pass") is True for item in schema_items) / len(schema_items), 6)
            if schema_items else None
        ),
        "action_schema_denominator": len(schema_items) if mode == "e2e" else None,
        "invalid_action_block_rate": (
            round(
                sum(
                    item["status"] == "ok"
                    and not exposes_invalid_action(item.get("actions", []))
                    for item in forbidden
                )
                / len(forbidden),
                6,
            )
            if mode == "e2e" and forbidden else None
        ),
        "invalid_action_block_denominator": len(forbidden) if mode == "e2e" else None,
        "valid_no_result_rate": (
            round(
                sum(
                    item["status"] == "ok" and not item["recommended_goods_ids"]
                    for item in no_result
                )
                / len(no_result),
                6,
            )
            if no_result else None
        ),
        "valid_no_result_denominator": len(no_result),
        "average_latency_ms": round(statistics.fmean(latencies), 3) if latencies else None,
        "p50_latency_ms": percentile(latencies, 0.50),
        "p95_latency_ms": percentile(latencies, 0.95),
    }


async def warm_up(
    mode: str,
    user_types: set[str],
    ws_url: str,
    spring_url: str,
    access_token: str | None,
    embeddings: OpenAiEmbeddingsClient | None,
    timeout: float,
) -> list[dict[str, Any]]:
    records = []
    for user_type in sorted(user_types):
        case = EvalCase("WARMUP", "warmup", "포토카드 보여줘", [], True, [], user_type, "excluded")
        started = time.perf_counter()
        try:
            if mode == "e2e":
                await run_e2e_case(case, ws_url, access_token, timeout)
            elif mode == "keyword":
                keyword_candidates(case, spring_url, timeout)
            elif embeddings is not None:
                semantic_candidates(case, spring_url, embeddings, timeout)
            records.append({"user_type": user_type, "status": "ok", "latency_ms": round((time.perf_counter() - started) * 1000, 3)})
        except Exception as exc:  # warm-up failures are recorded but never measured
            records.append({"user_type": user_type, "status": "error", "error_type": type(exc).__name__, "error": str(exc)})
    return records


async def run(args: argparse.Namespace) -> int:
    load_environment()
    cases = load_cases(args.dataset)
    if args.category:
        cases = [case for case in cases if case.category in args.category]
    if args.test_id:
        cases = [case for case in cases if case.test_id in args.test_id]
    if args.limit is not None:
        cases = cases[: args.limit]
    distribution = Counter(case.category for case in cases)
    if args.validate_only:
        print(json.dumps({"valid": True, "case_count": len(cases), "distribution": distribution}, ensure_ascii=False))
        return 0

    spring_url = args.spring_url.rstrip("/")
    goods, catalog_hash = fetch_catalog(spring_url)
    catalog_ids = {int(item["goodsId"]) for item in goods if str(item.get("goodsId", "")).isdigit()}
    expected_ids = {goods_id for case in cases for goods_id in case.expected_goods_ids}
    missing_expected_ids = sorted(expected_ids - catalog_ids)
    if missing_expected_ids:
        raise ValueError(
            "Dataset expected_goods_ids are absent from the current catalog: "
            + ", ".join(map(str, missing_expected_ids))
        )
    catalog_by_id = {
        int(item["goodsId"]): item
        for item in goods
        if str(item.get("goodsId", "")).isdigit()
    }
    unavailable_expected_ids = sorted(
        goods_id
        for goods_id in expected_ids
        if catalog_by_id[goods_id].get("salesStatus") != "ON_SALE"
    )
    if unavailable_expected_ids:
        raise ValueError(
            "Dataset positive expectations are not currently ON_SALE: "
            + ", ".join(map(str, unavailable_expected_ids))
        )
    access_token = authenticate_member() if args.mode == "e2e" and any(case.user_type == "member" for case in cases) else None
    embeddings = None
    if args.mode == "semantic":
        embeddings = OpenAiEmbeddingsClient(
            base_url=os.environ.get("PROJECT_CYAN_OPENAI_EMBEDDINGS_BASE_URL", "https://api.openai.com/v1"),
            api_key=os.environ.get("PROJECT_CYAN_OPENAI_API_KEY"),
            model=os.environ.get("PROJECT_CYAN_OPENAI_EMBEDDINGS_MODEL", "text-embedding-3-small"),
            timeout_seconds=args.timeout,
        )
    warmup_user_types = (
        {case.user_type for case in cases}
        if args.mode == "e2e"
        else {"retrieval"}
    )
    warmups = await warm_up(
        args.mode,
        warmup_user_types,
        args.ws_url,
        spring_url,
        access_token,
        embeddings,
        args.timeout,
    ) if args.warmup else []

    observations: list[dict[str, Any]] = []
    for repeat in range(1, args.repeats + 1):
        for case in cases:
            base = {**asdict(case), "repeat": repeat, "mode": args.mode}
            try:
                if args.mode == "e2e":
                    result = await run_e2e_case(case, args.ws_url, access_token, args.timeout)
                    result["action_goods_ids"] = action_goods_ids(result.get("actions", []))
                elif args.mode == "keyword":
                    result = keyword_candidates(case, spring_url, args.timeout)
                    result["action_goods_ids"] = []
                else:
                    assert embeddings is not None
                    result = semantic_candidates(case, spring_url, embeddings, args.timeout)
                    result["action_goods_ids"] = []
                observations.append({**base, "status": "ok", **result})
            except Exception as exc:
                observations.append({
                    **base,
                    "status": "error",
                    "error_type": type(exc).__name__,
                    "error": str(exc),
                    "recommended_goods_ids": [],
                    "candidate_goods_ids": [],
                    "action_goods_ids": [],
                    "schema_pass": False if args.mode == "e2e" else None,
                })
            print(f"[{len(observations)}/{len(cases) * args.repeats}] {case.test_id} {observations[-1]['status']}", file=sys.stderr)

    now = datetime.now(timezone.utc)
    run_id = now.strftime("%Y%m%dT%H%M%SZ") + f"-{args.mode}"
    output_dir = args.output_dir / run_id
    output_dir.mkdir(parents=True, exist_ok=False)
    raw_path = output_dir / "raw.jsonl"
    failure_path = output_dir / "failures.jsonl"
    raw_path.write_text("".join(json.dumps(item, ensure_ascii=False) + "\n" for item in observations), encoding="utf-8")
    failures = [item for item in observations if item["status"] != "ok"]
    failure_path.write_text("".join(json.dumps(item, ensure_ascii=False) + "\n" for item in failures), encoding="utf-8")
    summary = {
        "run_id": run_id,
        "executed_at_utc": now.isoformat(),
        "mode": args.mode,
        "dataset": str(args.dataset),
        "question_count": len(cases),
        "repeats": args.repeats,
        "measured_request_count": len(observations),
        "warmup_request_count": len(warmups),
        "warmups_excluded_from_metrics": True,
        "distribution": dict(sorted(distribution.items())),
        "catalog_item_count": len(goods),
        "catalog_sha256": catalog_hash,
        "llm_provider": os.environ.get("PROJECT_CYAN_AI_PROVIDER", "mock"),
        "llm_model": os.environ.get("PROJECT_CYAN_LLM_MODEL"),
        "temperature": "not_configured_provider_default",
        "embedding_model": os.environ.get("PROJECT_CYAN_OPENAI_EMBEDDINGS_MODEL", "text-embedding-3-small"),
        "metrics": calculate_metrics(observations, catalog_ids, args.mode),
        "warmup_results": warmups,
        "notes": [
            "alias is part of Spring keyword and structured semantic filtering, not an independently switchable retriever",
            "out_of_candidate_goods_id_rate measures the post-guard production response, not raw LLM attempts",
            "failed requests remain in raw.jsonl and failures.jsonl",
            "no secret values are recorded",
        ],
    }
    (output_dir / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output_dir": str(output_dir), **summary["metrics"]}, ensure_ascii=False, indent=2))
    return 0 if not failures else 2


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=("e2e", "keyword", "semantic"), default="e2e")
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_RESULTS)
    parser.add_argument("--spring-url", default="http://localhost:8080/api")
    parser.add_argument("--ws-url", default="ws://localhost:8000/client-ws")
    parser.add_argument("--repeats", type=int, default=3)
    parser.add_argument("--warmup", type=int, choices=(0, 1), default=1)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--category", action="append")
    parser.add_argument("--test-id", action="append")
    parser.add_argument("--timeout", type=float, default=90.0)
    parser.add_argument("--validate-only", action="store_true")
    args = parser.parse_args()
    if args.repeats < 1 or args.repeats > 20:
        parser.error("--repeats must be between 1 and 20")
    if args.limit is not None and args.limit < 1:
        parser.error("--limit must be positive")
    return args


if __name__ == "__main__":
    raise SystemExit(asyncio.run(run(parse_args())))
