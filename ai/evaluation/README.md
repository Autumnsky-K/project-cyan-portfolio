# AI 상품 추천 평가

이 디렉터리는 공개 상품 카탈로그를 기준으로 직접 검토한 JSONL 평가셋을 사용해 Project Cyan의 상품 추천 품질을 확인한다. 평가 도구는 실제 추천 경로를 호출해 결과를 측정하며, 상품 추천 런타임 코드는 변경하지 않는다.

최종 개선 내용과 전체 평가 결과는 [`FINAL_EVALUATION_REPORT.md`](./FINAL_EVALUATION_REPORT.md)에서 확인할 수 있다.

## 평가 목적

상품을 추천해야 하는 요청에는 정확한 상품을 제시하고, 품절 상품·조건이 부족한 요청·허용되지 않은 동작 요청에는 상품을 노출하지 않는지 확인한다. 또한 최종 응답의 상품 ID와 화면 동작이 실제 후보 및 공개 카탈로그 범위를 벗어나지 않는지 검증한다.

## 평가 모드

- `e2e`: FastAPI `/client-ws`를 호출해 LLM 응답, Pydantic 파싱, 후보 검증과 최종 action까지 전체 흐름을 평가한다.
- `keyword`: Spring `GET /api/goods/recommendation-candidates`를 호출해 alias 해석을 포함한 키워드 검색 결과를 평가한다.
- `semantic`: 임베딩 생성과 Spring pgvector 엔드포인트를 사용해 시맨틱 검색 결과를 진단한다. 운영 하이브리드 클라이언트의 exact-name 단축 경로는 포함하지 않는다.

현재 Spring 서비스에서는 alias 검색만 별도로 켜거나 끌 수 없으므로 `alias-only` 점수는 제공하지 않는다.

평가셋은 총 42문항, 11개 유형으로 구성했다. 정확한 상품명, 카테고리, 속성, alias·구어체, 띄어쓰기·오타, 복합 조건, 품절 상품, 허용되지 않은 action, 후보 상품 ID 주입 유형은 각각 4문항이며, 모호한 요청과 상품에 관계없는 요청은 각각 3문항이다.

## 지표 해석

- **Hit@1 / Hit@3**: 검토된 정답 상품 ID가 하나 이상 있는 문항만 대상으로, 첫 번째 또는 상위 3개 추천에 정답이 포함됐는지 측정한다.
- **후보 외 상품 ID 추천률**: 응답 단계에 전달된 후보 3개와 최종 action의 상품 ID를 비교한다. 관측할 수 없는 LLM 원문이 아니라 후보 검증을 거친 최종 응답을 기준으로 한다.
- **미존재 상품 추천률**: 반환된 모든 추천 상품 ID가 실행 시작 시 조회한 공개 카탈로그에 실제로 존재하는지 확인한다.
- **Action schema 통과율**: 전체 WebSocket 응답이 운영 Pydantic 모델의 형식과 일치하는지 검증한다.
- **금지 action 차단률**: Spring·Pydantic·React에서 허용한 구조 이외의 action이 클라이언트까지 전달되지 않는지 확인한다. 형식은 유효하지만 요청과 무관한 추천은 정상 거절률에서 실패로 처리한다.
- **정상 거절률**: 거절 또는 추가 질문이 허용된 문항에서 추천 결과가 비어 있는지 확인한다. 요청 자체가 실패한 경우에도 분모에 포함하며 정상 거절로 계산하지 않는다.
- **응답 시간**: 성공한 측정 요청 전체를 대상으로 계산하며 워밍업 요청은 제외한다.

## 보안과 실행 전 준비

인증정보는 Git에서 제외된 `.env.local` 파일에만 저장한다. 평가 실행기는 로컬 설정만 불러오며 키, 비밀번호, access token, 데이터베이스 URL과 계정 식별자를 결과 파일에 기록하지 않는다.

평가 전에 다음 서비스를 실행한다.

```bash
npm run dev:backend
npm run dev:ai
```

평가 모델은 로컬 환경에서 `gpt-5.4-mini`로 고정한다. 애플리케이션은 temperature를 별도로 전달하지 않으므로 보고서에는 `not_configured_provider_default`로 기록한다. 시맨틱 평가는 `text-embedding-3-small`을 사용한다.

## 평가셋 검증과 smoke test

```bash
cd ai
uv run python evaluation/run_recommendation_eval.py --validate-only
uv run python evaluation/run_recommendation_eval.py --mode e2e --repeats 1 --limit 6
uv run python evaluation/run_recommendation_eval.py --mode e2e --repeats 1 \
  --test-id REC-025 --test-id REC-036 --test-id REC-039
```

## 전체 평가 재현

```bash
cd ai
uv run python evaluation/run_recommendation_eval.py --mode e2e --repeats 3
uv run python evaluation/run_recommendation_eval.py --mode keyword --repeats 3
uv run python evaluation/run_recommendation_eval.py --mode semantic --repeats 3
```

각 실행은 Git에서 제외된 결과 디렉터리에 실행 시각별 폴더를 만들고 다음 파일을 저장한다.

- `summary.json`: 실행 조건, 카탈로그 해시, 문항 분포와 전체 지표
- `raw.jsonl`: 오류를 포함한 모든 측정 요청의 결과
- `failures.jsonl`: 실패한 요청만 모은 결과

워밍업 요청은 `summary.json`에 기록하지만 모든 지표 계산에서 제외한다. 검색 결과만 확인하는 모드에서는 생성할 수 없는 action 지표를 임의로 만들지 않고 `null`로 기록한다.

카탈로그 fingerprint는 상품을 ID 순으로 정렬하고 순서 의미가 없는 태그 목록도 정렬한 뒤 SHA-256으로 계산한다. 따라서 Spring 응답의 항목 순서만 달라지고 실제 상품 내용이 같다면 동일한 해시가 생성된다.
