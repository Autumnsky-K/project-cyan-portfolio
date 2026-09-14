# AI recommendation evaluation

This directory evaluates Project Cyan recommendations against a reviewed JSONL dataset built from the public product catalog. Product runtime code is not modified.

## Scope

- `e2e`: FastAPI `/client-ws`, including LLM response, Pydantic parsing, candidate guard, and final actions.
- `keyword`: Spring `GET /api/goods/recommendation-candidates`; includes alias resolution.
- `semantic`: embedding request plus Spring pgvector endpoint. This is a retrieval diagnostic, not the exact-name shortcut used by the production hybrid client.

Alias is not independently switchable in the current Spring service, so an `alias-only` score is intentionally not reported.

The reviewed dataset contains 42 questions: 4 each for exact names, categories,
attributes, aliases/colloquial language, spacing/typos, complex conditions,
unavailable products, forbidden actions, and candidate-ID injection; 3 each for
ambiguous and unrelated requests.

## Metric interpretation

- Hit@1 and Hit@3 use only cases with one or more reviewed expected goods IDs.
- Out-of-candidate rate checks goods IDs in final actions against the three
  candidates exposed to the response stage. It measures the post-guard response,
  not unobservable raw LLM attempts.
- Nonexistent-goods rate checks every returned recommendation ID against the public
  catalog snapshot fetched at run start.
- Action-schema pass rate validates the full WebSocket response with the production
  Pydantic model.
- Invalid-action block rate checks that no action outside the Spring/Pydantic/React
  structural allowlist reaches the client. An unrelated but structurally valid
  recommendation is instead penalized by the no-result metric.
- Valid no-result rate requires an empty recommendation for reviewed cases where
  refusal or clarification is acceptable. Failed requests remain in its denominator
  and are not counted as successful refusals.
- Latency summaries include all successful measured requests and exclude warm-ups.

## Safety and prerequisites

Keep all credentials in ignored `.env.local` files. The runner loads only local configuration and never writes keys, passwords, access tokens, database URLs, or account identifiers to result files.

Required services:

```bash
npm run dev:backend
npm run dev:ai
```

The fixed evaluation model is configured locally as `gpt-5.4-mini`. The application does not send a temperature, so reports record `not_configured_provider_default`. Semantic evaluation uses `text-embedding-3-small`.

## Validate and smoke test

```bash
cd ai
uv run python evaluation/run_recommendation_eval.py --validate-only
uv run python evaluation/run_recommendation_eval.py --mode e2e --repeats 1 --limit 6
uv run python evaluation/run_recommendation_eval.py --mode e2e --repeats 1 \
  --test-id REC-025 --test-id REC-036 --test-id REC-039
```

## Full reproducible runs

```bash
cd ai
uv run python evaluation/run_recommendation_eval.py --mode e2e --repeats 3
uv run python evaluation/run_recommendation_eval.py --mode keyword --repeats 3
uv run python evaluation/run_recommendation_eval.py --mode semantic --repeats 3
```

Each run creates a timestamped ignored directory containing:

- `summary.json`: conditions, catalog hash, distribution, and aggregate metrics.
- `raw.jsonl`: every measured request, including errors.
- `failures.jsonl`: failures only.

Warm-up requests are recorded in the summary and excluded from every metric. Retrieval-only modes leave action-only metrics as `null` rather than fabricating values.
The catalog fingerprint sorts products and unordered tag lists before hashing so
equivalent Spring responses produce the same SHA-256 value.
