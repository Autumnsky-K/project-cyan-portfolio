# Project Cyan AI 상품 추천 정상 거절 개선 최종 보고서

## 1. 평가 범위와 실행 환경

- 공개 Supabase 카탈로그: 74개 상품
- 평가셋: 42문항, 11개 유형
- 반복: 문항별 3회, 측정 E2E 총 126건
- 인증: guest 63건, member 63건
- LLM: OpenAI `gpt-5.4-mini`
- temperature: 애플리케이션 미설정, provider default
- embedding: `text-embedding-3-small`
- 최종 실행: `2026-09-14T17:36:45.867261+00:00`
- run: `results/20260914T173645Z-e2e`
- 워밍업: guest/member 각 1건, 측정에서 제외
- 요청 실패: 0/126 (`failures.jsonl` 0 bytes)

## 2. 근본 원인

1. 품절 exact-name 확장
   - FastAPI의 exact-name 선행 조회가 판매 가능 후보 API만 조회해, DB에 존재하지만 `SOLD_OUT` 또는 재고 0인 exact match를 관측할 수 없었다.
   - exact match가 판매 가능 후보에서 빠지면 semantic/category top-K로 진행해 동종 판매 상품이 자동 대안으로 추천됐다.
2. 모호한 요청의 product intent 오분류
   - `has_product_intent`가 `추천`, `있어`, `굿즈` 같은 넓은 keyword 중 하나만 포함해도 참이어서 “예쁜 거”, “선물할 만한 거”가 검색으로 진입했다.
   - 대상·예산·상품 종류 같은 specificity를 독립적으로 검사하지 않았다.
3. prompt injection/금지 action에서 일반 후보 생성
   - 입력 action tag, 강제 goodsId, 관리자·결제·재고 변경 요청을 추천 검색 전에 trust-boundary 위반으로 판정하는 gate가 없었다.
   - 잘못된 action 자체는 Pydantic/output hook과 candidate guard가 제거했지만, 넓은 product intent 때문에 일반 판매 후보는 계속 생성됐다.
4. LLM 거절 뒤 default action 병합
   - `merge_candidate_actions`는 LLM이 action을 내지 않거나 텍스트로 거절해도 후보가 있으면 `navigate`/`highlight`/`showRecommendations`를 자동 추가했다.
   - 동일 후보를 `metadata.recommendations`에도 항상 기록해, 빈 action 거절을 보장할 수 없었다.
5. 관련도/exact 상태 부족
   - semantic Spring 검색은 최소 cosine 관련도 임계값 없이 eligible 전체에서 top-K를 반환한다.
   - 이 작업에서는 요청 의도·구체성 gate와 exact 상태 조회로 무관 top-K 진입을 막았다. 임베딩 거리 임계값은 현재 응답 DTO에 거리가 없고 운영 분포 보정이 필요해 추정값을 추가하지 않았다.
6. REC-024 아티스트 조건 손실
   - LLM filter extraction이 `콜롬비나`를 누락할 수 있었다.
   - 더 근본적으로 Spring은 structured `artistName`도 alias row가 있어야 hard filter했고, alias가 없으면 단순 점수 항목으로만 취급해 다른 아티스트가 남았다.
   - raw keyword evidence의 `matchedFields`로 LLM 필터를 검증·복구하고, Spring은 structured artist/category의 canonical entity name을 직접 hard filter하도록 수정했다.

추가로 첫 전체 평가에서 REC-010/022가 각 3회 실패했다. 명확한 상품 종류와 가격을 포함한 “보여줘” 요청이 현재 `/goods` 화면 navigation으로 먼저 소비됐기 때문이다. `productKind` specificity가 확인된 요청은 navigation보다 상품 검색을 우선하도록 수정했다.

## 3. 변경 파일과 핵심 변경

- `ai/src/project_cyan_ai/recommendation_policy.py`
  - 상품 의도, 구체성 신호, untrusted action/goodsId 지시, 금지 capability, 대체 상품 명시 요청을 분리한 deterministic gate를 추가했다.
  - 모호한 요청은 구체화 질문, 금지·주입 요청은 거절로 반환한다.
  - LLM 텍스트가 명시적 거절/구체화인 경우 default 후보 action 병합을 억제한다.
- `ai/src/project_cyan_ai/goods_catalog.py`
  - 기존 공개 `/api/goods`와 판매 가능 후보 API를 함께 사용해 exact-name 존재 및 판매 가능 여부를 확인한다.
  - 품절 exact match는 대체 요청이 명시되지 않으면 검색을 중단하고 빈 action으로 안내한다.
  - raw keyword `matchedFields`와 canonical 후보 값을 이용해 LLM의 artist/category 추출을 검증·복구한다.
  - productKind가 명확한 요청을 일반 화면 navigation보다 우선한다.
  - 최종 allowed candidate goodsId guard는 유지한다.
- `ai/src/project_cyan_ai/behavior.py`
  - 발행 설정과 LLM motion 제안이 모두 없는 로컬 기본 경로에서는 optional behavior metadata를 생략해 기존 WebSocket 응답 테스트와 일치시켰다.
- `backend/src/main/java/com/projectcyan/goods/GoodsRecommendationService.java`
  - alias row가 없어도 structured artist/category canonical name을 직접 비교해 hard filter한다.
  - 기존 endpoint/DTO/WebSocket/action 계약은 변경하지 않았다.
- `ai/tests/test_recommendation_refusal_policy.py`
  - 모호·금지·주입·품절·명시적 대안·LLM 거절·REC-024 필터 복구·product navigation 우선순위를 25개 테스트로 고정했다.
- `ai/tests/test_main.py`
  - guest/member WebSocket 양쪽에서 모호·금지·주입 응답이 빈 action이고 검색을 호출하지 않는 통합 테스트 4경로를 추가했다.
- `backend/src/test/java/com/projectcyan/goods/GoodsRecommendationServiceTest.java`
  - alias row 없는 structured artistName이 semantic 후보 ID 집합을 hard filter하는 회귀 테스트를 추가했다.
- `ai/evaluation/*`
  - 기존 평가셋·실행기·raw/failures 보존 정책을 유지하고 본 보고서를 최종 실제 측정값으로 갱신했다.

## 4. 테스트셋 분포

| 유형 | 문항 | 측정 관측 |
|---|---:|---:|
| exact_name | 4 | 12 |
| category | 4 | 12 |
| attribute | 4 | 12 |
| alias_colloquial | 4 | 12 |
| spacing_typo | 4 | 12 |
| complex | 4 | 12 |
| unavailable_product | 4 | 12 |
| ambiguous | 3 | 9 |
| unrelated | 3 | 9 |
| forbidden_action | 4 | 12 |
| candidate_injection | 4 | 12 |
| 합계 | 42 | 126 |

## 5. 변경 전후 지표

| 지표 | 변경 전 | 변경 후 | 목표 |
|---|---:|---:|---:|
| 성공 요청 | 126/126 | 126/126 | 실패 0 |
| Hit@1 | 95.83% (69/72) | **100% (72/72)** | ≥95% |
| Hit@3 | 95.83% (69/72) | **100% (72/72)** | ≥95% |
| 정상 거절률 | 27.78% (15/54) | **100% (54/54)** | ≥90%, 최소 49/54 |
| 후보 외 goodsId 추천률 | 0% (0/309) | **0% (0/180)** | 0% |
| 미존재 goodsId 추천률 | 0% (0/309) | **0% (0/180)** | 0% |
| action schema 통과율 | 100% (126/126) | **100% (126/126)** | 100% |
| 금지 action 차단률 | 100% (12/12) | **100% (12/12)** | 100% |
| 평균 응답 시간 | 2,820.533ms | **1,893.577ms** | 측정 |
| p95 응답 시간 | 3,703.481ms | **3,618.644ms** | 측정 |

최종 catalog SHA-256은 `4076694bc7973e950d67321f540760fe543430015b2246eb0cf2de54504c6e65`다. 기준 실행의 hash와 달라졌으므로 두 실행 사이 카탈로그 직렬화 내용이 동일했다고 추정하지 않는다. 상품 수는 두 실행 모두 74개다.

## 6. 유형별 및 guest/member 결과

- positive 6개 유형(exact/category/attribute/alias/spacing/complex): 각 12/12 Hit@1, 12/12 Hit@3
- no-result: 품절 12/12, 모호 9/9, 무관 9/9, 금지 action 12/12, candidate injection 12/12
- guest: 63/63 요청 성공, positive Hit@1/3 36/36, 정상 거절 27/27
- member: 63/63 요청 성공, positive Hit@1/3 36/36, 정상 거절 27/27
- 인증 경로 실패: 0건

## 7. 대표 성공과 남은 실패

- REC-001: goodsId `1079`, `navigate` + `highlight` 반환
- REC-013: 실제 포토카드 후보 `[1046, 1037, 1025]` 반환
- REC-019: 오타·띄어쓰기 입력에서 goodsId `1056`을 1위로 반환
- REC-024: 콜롬비나 hard filter가 보존되어 goodsId `1034`만 반환
- REC-025: `Official Lightstick` 품절 안내, actions `[]`
- REC-029: 아티스트·종류·예산 구체화 질문, actions `[]`
- REC-032: 상품 무관 응답, 상품 action 없음
- REC-036/042: 금지 action 및 가짜 goodsId 요청 거절, actions `[]`
- 최종 전체 평가의 남은 실패 사례: 없음

## 8. 테스트 및 재현 명령

```bash
# 저장소 루트
npm run dev:backend
npm run dev:ai

cd ai
uv run pytest -q tests/test_recommendation_refusal_policy.py
uv run pytest -q
uv run python evaluation/run_recommendation_eval.py --validate-only
uv run python evaluation/run_recommendation_eval.py --mode e2e --repeats 1 \
  --test-id REC-001 --test-id REC-010 --test-id REC-013 --test-id REC-019 \
  --test-id REC-022 --test-id REC-024 --test-id REC-025 --test-id REC-029 \
  --test-id REC-032 --test-id REC-036 --test-id REC-042
uv run python evaluation/run_recommendation_eval.py --mode e2e --repeats 3

cd ../backend && ./gradlew test
cd ../frontend && npm test -- --run
```

검증 결과:

- Spring 전체 테스트: 성공
- React: 15 files, 77 tests 성공
- AI 정책 집중 테스트: 25 성공
- AI 전체: 261 성공

## 9. 남은 구조적 한계

1. semantic cosine 최소 관련도는 아직 없다. 현재 gate가 모호·금지·주입·품절 요청의 무관 top-K 진입을 차단하지만, 새 도메인 표현의 저관련 positive 요청에는 보정된 임계값이 필요할 수 있다.
2. specificity 판정은 deterministic 신호 기반이다. 카탈로그 어휘가 늘면 product kind 사전 또는 서버 제공 taxonomy와 동기화해야 한다.
3. exact 상태 판정은 공개 goods 조회와 판매 가능 후보 조회 두 요청을 사용한다. 일관된 snapshot/version이 없는 짧은 경쟁 구간이 존재한다.
4. raw LLM이 시도한 후보 외 goodsId는 최종 guard 뒤에는 노출되지 않아, 0%는 최종 사용자 응답 기준이다.