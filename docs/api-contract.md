# SM Universe · API 계약 (Week 1 동결본)

> **이 문서가 팀의 단일 진실(single source of truth)이다. 코드보다 이 문서가 먼저다.**
> 저장 위치: `/docs/api-contract.md`
> 버전: `v0.1.0 (초안)` · 버전 규칙: 주.부.수 (§0.1) · 동결 목표일: `2026-06-18`

---

## 0. 읽는 법 / 변경 규칙

이 문서는 "각 도메인이 서로에게 약속하는 인터페이스"만 적는다. 내부 구현(테이블 컬럼명, 서비스 로직)은 적지 않는다.

**동결(freeze) vs 추가(additive) 규칙 — 가장 중요**

- **동결 필드**: 옆 도메인(프론트·AI·다른 백엔드)이 당장 의존하는 필드. 한 번 적으면 함부로 못 바꾼다.
- **필드 "추가"는 자유** — 남을 깨뜨리지 않으니 PR로 바로 반영하고 이 문서만 갱신한다.
- **필드 "삭제·이름변경·타입변경"은 팀 합의 필요** — 남을 깨뜨린다. 슬랙에 공지 + 이 문서 변경 로그(§5)에 기록.

**처음엔 "옆 사람이 화면/추천을 만들 수 있는 최소한"만 적는다.** 나머지는 만들면서 붙인다.

체크박스 표기: `[ ]` 미정 · `[x]` 동결 완료

### 0.1 버전 규칙 (주.부.수)

문서 버전은 `주.부.수`(MAJOR.MINOR.PATCH) 세 자리로 매긴다. **기준은 "이 변경으로 남의 코드가 깨지나?"** 다.

| 자리 | 언제 올리나 | 예 | 남이 고쳐야 하나? |
|------|-------------|-----|-------------------|
| **수 (PATCH)** | additive 필드 추가, 오타·설명 보정 | `v0.1.0 → v0.1.1` | 아니오 (안 깨짐) |
| **부 (MINOR)** | breaking — 필드 삭제·이름변경·타입변경, status 값 변경 | `v0.1.1 → v0.2.0` | **예** (맞춰 수정) |
| **주 (MAJOR)** | 전체 동결 선언 (Week 1 종료) | `→ v1.0.0` | — (이후 변경 최소화) |

규칙 세 줄 요약:

1. **additive(추가)** → 버전 안 올림. §5 변경 로그에 한 줄만 적고 PR 반영.
2. **breaking(삭제·변경)** → **부**를 올림(`v0.2.0`, `v0.3.0`). 슬랙 공지 + §5 로그 필수.
3. **Week 1 끝에 "전체 동결"** → **주**를 `v1.0.0`으로. 4주 프로젝트에선 사실상 처음이자 마지막 major.

> 진행 예시: `v0.1.0`(초안) → 굿즈 필드 추가 `v0.1.1` → `price` 타입 변경(breaking) `v0.2.0` → Week 1 동결 `v1.0.0` → 통합 중 주문 status 값 추가(breaking) `v1.1.0`
>
> 부담되면 patch 없이 **major/부 두 단계만** 써도 충분하다 (additive=로그만 / breaking=부 올림 / 동결=`v1.0.0`).

---

## 1. 전역 규약 (모든 도메인 공통)

### 1.1 ⚠️ 키스톤 결정 — `userId` 타입 (반드시 가장 먼저)

이 한 줄이 회원·장바구니·주문·추천의 FK와 모든 회원 관련 API에 퍼진다. **코딩 시작 전에 못 박는다.**

- [ ] 인증 방식: `Supabase Auth` / `Spring 자체 인증` → 선택: `__________`
- [ ] `userId` 타입: `uuid` / `bigint(int8)` → 선택: `__________`
- [ ] 결정일: `__________` · 결정자: `__________`

> 결정 전까지 회원 의존 API는 코딩 보류. 나머지 도메인은 §3 목업으로 선행 착수 가능.

### 1.2 Base URL & 공통 헤더

- Base URL(개발):
    Spring `http://localhost:8080/api`
    React `http://localhost:5173`
- Base URL(배포): `__________`
- 모든 요청/응답 `Content-Type: application/json; charset=utf-8`
- 인증 필요 API 헤더: `Authorization: Bearer <token>`  *(인증 방식 결정 후 확정)*

### 1.3 공통 응답 형태

성공 시 **리소스를 그대로** 반환하고 HTTP 상태코드로 결과를 표현한다. (불필요한 envelope 중첩 금지)

- 단건: 객체 하나 `{ ... }`
- 목록: 배열 `[ { ... }, { ... } ]` 또는 페이지 객체(§1.5)
- 생성 성공: `201`, 조회: `200`, 내용 없음: `204`

### 1.4 에러 형태 (동결)

에러는 아래 형태로 통일한다. 프론트는 `code`로 분기, `message`는 사용자 노출용.

```json
{
  "code": "GOODS_NOT_FOUND",
  "message": "해당 상품을 찾을 수 없습니다.",
  "status": 404
}
```

- 검증 실패 `400` / 인증 실패 `401` / 권한 없음 `403` / 없음 `404` / 서버 `500`
- `code`는 `대문자_스네이크` (도메인별로 자유롭게 추가, 충돌 안 나게 접두어 권장: `GOODS_*`, `ORDER_*`)

### 1.5 페이지네이션 / 정렬 (목록 공통)

- 쿼리 파라미터: `?page=0&size=20&sort=createdAt,desc`
- 페이지 응답 형태:

```json
{
  "content": [ /* 항목 배열 */ ],
  "page": 0,
  "size": 20,
  "totalElements": 137,
  "totalPages": 7
}
```

### 1.6 공통 타입 약속 (동결)

- **JSON 키는 camelCase 영문** 사용 (DB 컬럼이 한글/스네이크여도 API에선 영문 camelCase로 매핑)
- **금액**: 정수 KRW, 필드명 `price`, 단위 "원" (소수점·통화기호 없음). 예: `35000`
- **날짜시간**: ISO 8601 UTC 문자열. 예: `"2026-06-11T09:00:00Z"`
- **도메인 PK**: 별도 명시 없으면 `bigint(int8)` (예: `goodsId`, `orderId`)
- **`userId`**: §1.1 키스톤 따름

---

## 2. 상태 머신 (status 값 동결)

`status`는 ③ 주문/결제가 쓰고 ①②⑤가 읽으므로 계약이다. 허용 값과 전이 규칙을 고정한다.

### 2.1 주문 status

허용 값: `PENDING` → `PAID` → `PREPARING` → `SHIPPED` → `DONE` / (취소) `CANCELED`

- 전이 규칙(예): `PENDING→PAID`, `PAID→PREPARING`, `PENDING→CANCELED` 허용 / 역방향 금지
- *(팀이 최종 확정해 채울 것)*

### 2.2 결제 status (카카오페이 테스트모드)

허용 값: `READY` → `APPROVED` / `CANCELED` / `FAILED`

- CID: `TC0ONETIME` · 신규 `Secret_Key` API 사용 (구 `Admin_Key` 금지)
- `Secret_Key`는 **Spring 서버에만** 보관 (프론트 노출 금지)
- 흐름: `ready 요청 → 리다이렉트 → approve + 검증 → 주문 status 갱신`

---

## 3. 도메인별 엔드포인트

### ▣ 엔드포인트 기록 템플릿 (복사해서 사용)

```
#### [METHOD] /api/path
- 담당:
- 설명:
- 인증 필요: Y / N
- 요청: (path / query / body)
- 응답 (동결 필드):
- 추가 가능 필드:
- 상태: [ ] 미정  [ ] 동결
- 비고:
```

---

### 3.1 회원 (members) — 담당: `__________`

> ⚠️ §1.1 키스톤 결정 후 작성. 그 전까지 응답의 `userId` 타입은 `TBD`로 둔다.

```
#### [POST] /api/members/signup
- 설명: 회원 가입
- 인증 필요: N
- 요청 body: { email, password, nickname }
- 응답 (동결 필드): { userId(TBD), email, nickname }
- 상태: [ ] 미정
```

*(로그인, 내 정보, 선호 아이돌 저장 등 추가)*

---

### 3.2 굿즈 (goods) — 담당: `__________` ★ 예시 (이 패턴을 복사하세요)

```
#### [GET] /api/goods
- 설명: 상품 목록 (태그 필터 가능)
- 인증 필요: N
- 요청 query: ?tag=PHOTOCARD&page=0&size=20&sort=createdAt,desc
- 응답 (동결 필드): 페이지 객체(§1.5), content = goods 요약 배열
- 상태: [x] 동결
```

`goods` 요약 객체 (목록·카드·AI 추천이 의존 → **동결**):

```json
{
  "goodsId": 42,
  "name": "aespa OST 포토카드 세트",
  "price": 35000,
  "imageUrl": "https://cdn.example.com/goods/42.jpg",
  "tags": ["PHOTOCARD", "AESPA"]
}
```

```
#### [GET] /api/goods/{goodsId}
- 설명: 상품 상세
- 인증 필요: N
- 요청 path: goodsId (bigint(int8))
- 응답 (동결 필드): 위 요약 + 아래 추가 필드
- 상태: [x] 동결
```

`goods` 상세 추가 필드:

```json
{
  "goodsId": 42,
  "name": "aespa OST 포토카드 세트",
  "price": 35000,
  "imageUrl": "https://cdn.example.com/goods/42.jpg",
  "tags": ["PHOTOCARD", "AESPA"],
  "description": "한정판 포토카드 8종 세트",
  "artistId": 7,
  "stockCount": 120
}
```

- **추가 가능 필드**: `discountRate`, `images[]`(다중 이미지), `releaseDate` 등 — 자유 추가
- **비고**: `goodsId`는 AI `[ACTION]`과 DOM `data-goods-id`(§4)에서 그대로 사용된다. **절대 타입/이름 변경 금지.**

---

### 3.3 아티스트 (artists) — 담당: `__________`

> AI가 "왜 이 굿즈가 의미 있나"를 설명하는 근거 공급. 추천이 `artistId`로 연결되므로 그 필드는 동결.

```
#### [GET] /api/artists/{artistId}
- 설명: 아티스트 상세 (lore 포함)
- 인증 필요: N
- 응답 (동결 필드): { artistId, name, imageUrl }
- 추가 가능 필드: { lore, debutDate, collections[] }
- 상태: [ ] 미정
```

*(목록, 컬렉션 등 추가)*

---

### 3.4 주문/결제 (orders) — 담당: `__________`

> §2 상태 머신을 따른다. Week 1은 더미 주문으로 카카오 테스트 선행.

```
#### [POST] /api/orders
- 설명: 주문 생성 (체크아웃 시작)
- 인증 필요: Y
- 요청 body: { items: [ { goodsId, quantity } ] }
- 응답 (동결 필드): { orderId, status, totalPrice, createdAt }
- 상태: [ ] 미정
```

```
#### [POST] /api/payments/ready
- 설명: 카카오페이 결제 준비 (ready)
- 응답 (동결 필드): { redirectUrl, tid }
- 상태: [ ] 미정
```

*(approve 콜백, 주문 내역 조회 등 추가)*

---

### 3.5 AI 플랫폼 (ai) — 담당: `__________`

> 캐릭터 아일랜드 ↔ OLV WebSocket. REST가 아니라 **WebSocket 메시지 형태**가 계약이다.

- WebSocket 엔드포인트: `/client-ws` *(OLV 표준)*
- 클라이언트 → 서버 메시지: `{ "type": "text-input", "text": "예산 5만원으로 최애 선물 골라줘" }`
- 서버 → 클라이언트 메시지(동결 필드): `{ "type": "...", "text": "...", "actions": [ ... ] }`
- `actions` 배열 형식은 §4 따름

*(정확한 메시지 타입은 OLV 코드 확인 후 채울 것)*

---

## 4. `[ACTION]` 프로토콜 + DOM 약속 (④ ↔ ⑤ 계약)

> 캐릭터가 모든 도메인 화면을 조작하려면 공통 규약이 필요하다. 이것은 OLV의 "LLM 출력 → 키워드 추출 → Live2D" 파이프라인의 **확장**이다.

### 4.1 `[ACTION]` 태그 형식

LLM 응답 텍스트 안에 인라인으로 삽입 → 캐릭터 아일랜드가 파싱해 실행하고, 사용자에게 보이는 말풍선에서는 제거한다.

```
[ACTION:액션이름 키="값" 키2="값2"]
```

예) `"이 포토카드 세트 어때요? [ACTION:navigate path="/goods/42"] 한번 보여드릴게요!"`

### 4.2 DOM 약속 (모든 도메인 화면이 지킬 것 — 동결)

- 본문 컨테이너: `#content` (AJAX 교체 대상)
- 캐릭터 컨테이너: `#vtuber` (절대 안 건드림, 페이지 전환에도 유지)
- 상품 카드: 루트 요소에 `data-goods-id="42"`
- 아티스트 카드: `data-artist-id="7"`
- 장바구니 담기 버튼: `data-add-to-cart="42"`

### 4.3 지원 액션 목록 (MVP 3종만 완벽히)

| 액션 | 형식 | 동작 | 의존 |
|------|------|------|------|
| 이동 | `[ACTION:navigate path="/goods/42"]` | 해당 경로로 AJAX 본문 교체 | 라우팅 규약 |
| 하이라이트 | `[ACTION:highlight selector="[data-goods-id='42']"]` | 해당 카드 강조 효과 | `data-goods-id` |
| 담기 | `[ACTION:addToCart goodsId="42"]` | 장바구니 담기 API 호출 | 장바구니 API |

- **스트레치(MVP 아님)**: 감정 표정 전환, STT 음성 입력 — Week 1 계약에서 제외

---

## 5. 변경 로그

모든 변경을 여기 기록한다. **종류(additive/breaking)와 버전(§0.1)을 함께 적는다.**

- additive(추가): 버전 유지 또는 수(patch)만 ↑
- breaking(삭제·이름변경·타입변경·status 변경): 부(minor) ↑ + 슬랙 공지 필수

| 날짜 | 버전 | 도메인 | 종류 | 변경 내용 | 합의자 |
|------|------|--------|------|-----------|--------|
| 2026-06-11 | v0.1.0 | 전체 | — | 초안 작성 | 전원 |
| 2026-06-1X | v0.1.1 | (예) goods | additive | `discountRate` 필드 추가 | 굿즈 |
| 2026-06-1X | v0.2.0 | (예) goods | breaking | `price` 타입 String→int 변경 | 전원 |
|  |  |  |  |  |  |
