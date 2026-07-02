# SM Universe · API 계약 (Week 1 동결본)

> **이 문서가 팀의 단일 진실(single source of truth)이다. 코드보다 이 문서가 먼저다.**
> 저장 위치: `/docs/api-contract.md`
> 버전: `v0.2.9` · 버전 규칙: 주.부.수 (§0.1) · 동결 목표일: `2026-06-18`

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

- [x] 인증 방식: `Supabase Auth` / `Spring 자체 인증` → 선택: `Supabase Auth`
- [x] `userId` 타입: `uuid` / `bigint(int8)` → 선택: `uuid`
- [x] 결정일: `2026-06-16` · 결정자: 팀 합의

> `userId`는 Supabase `auth.users.id`이며, `public.member.member_uuid`와 동일한 값으로 저장한다.

### 1.2 Base URL & 공통 헤더

- Base URL(개발):
    Spring `http://localhost:8080/api`
    React `http://localhost:5173`
- Base URL(배포): `__________`
- 모든 요청/응답 `Content-Type: application/json; charset=utf-8`
- 인증 필요 API 헤더: `Authorization: Bearer <Supabase access_token>`
- Spring은 Supabase JWKS로 access token을 검증하고, JWT `sub`를 `public.member.member_uuid`로 사용한다.

인증 실패:

```json
{
  "code": "AUTH_UNAUTHORIZED",
  "message": "로그인이 필요합니다.",
  "status": 401
}
```

토큰은 유효하지만 회원 row가 없을 때:

```json
{
  "code": "MEMBER_NOT_REGISTERED",
  "message": "회원 정보가 등록되어 있지 않습니다.",
  "status": 403
}
```

토큰은 유효하지만 탈퇴 처리된 회원일 때:

```json
{
  "code": "MEMBER_WITHDRAWN",
  "message": "계정을 찾을 수 없습니다. 먼저 회원가입을 진행해 주세요.",
  "status": 403
}
```

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

> 회원 인증은 Supabase Auth로 통일한다. 일반 이메일/비밀번호 가입과 소셜 로그인 모두
> Supabase `auth.users.id`를 `public.member.member_uuid`에 저장한다.

```
#### [POST] /api/members/signup
- 설명: 이메일/비밀번호 회원 가입 (프론트는 Spring API를 호출하고, Spring이 Supabase Auth Admin API로 유저를 생성)
- 인증 필요: N
- 요청 body: { email, password, name, phone, address, agreements }
- 응답 (동결 필드): { userId(uuid), email, name }
- 실패: 활성 회원이 이미 사용하는 이메일은 `{code:"MEMBER_EMAIL_ALREADY_EXISTS", message:"이미 가입된 이메일 주소입니다. 로그인하거나 비밀번호를 찾아주세요.", status:409}` 반환
- 실패: 활성 회원이 이미 사용하는 휴대폰번호는 `{code:"MEMBER_PHONE_ALREADY_EXISTS", message:"이미 가입된 휴대폰 번호입니다. 기존 계정으로 로그인해주세요.", status:409}` 반환
- 상태: [x] 동결
```

```
#### [POST] /api/members/signup/availability
- 설명: 회원가입 1단계에서 이메일/휴대폰번호 중복 여부 확인
- 인증 필요: N
- 요청 body: { email, phone }
- 응답 (동결 필드): { available(boolean), emailExists(boolean), phoneExists(boolean) }
- 비고: 프론트는 available=false이면 다음 단계로 이동하지 않고 중복 안내 팝업을 표시한다. 탈퇴 회원의 이메일/휴대폰번호는 중복으로 보지 않는다.
- 상태: [x] 동결
```

```
#### [POST] /api/members/password-reset/eligibility
- 설명: 비밀번호 재설정 메일 발송 전 이메일 가입 여부 확인
- 인증 필요: N
- 요청 body: { email }
- 응답 (동결 필드): { exists(boolean) }
- 비고: 프론트는 exists=false이면 Supabase resetPasswordForEmail을 호출하지 않는다. 탈퇴 회원 이메일은 exists=false로 본다.
- 상태: [x] 동결
```

```
#### [GET] /api/members/me
- 설명: 로그인 회원의 현재 회원 정보 조회
- 인증 필요: Y
- 요청 header: `Authorization: Bearer <Supabase access_token>`
- 응답 (동결 필드): { memberId(bigint), memberUuid(uuid), email, name, phone, memberGrade }
- 비고: `memberGrade`는 `public.member.member_grade` 값을 그대로 반환한다.
- 상태: [x] additive
```

```
#### [PATCH] /api/members/me
- 설명: 로그인 회원의 개인정보 수정
- 인증 필요: Y
- 요청 body: { name, phone, address }
- 응답 (동결 필드): { memberId(bigint), memberUuid(uuid), email, name, phone, address }
- 실패: 이미 가입된 휴대폰번호는 `{code:"MEMBER_PHONE_ALREADY_EXISTS", message:"이미 가입된 휴대폰 번호입니다. 다른 번호를 입력해주세요.", status:409}` 반환
- 비고: phone은 `010-0000-0000` 형식으로 정규화한다.
- 상태: [x] 동결
```

```
#### [DELETE] /api/members/me
- 설명: 로그인 회원 탈퇴 처리
- 인증 필요: Y
- 요청: 없음
- 응답: 204 No Content
- 비고: 주문/결제 이력 참조 무결성을 유지하기 위해 회원 row는 탈퇴 상태로 익명화하고 Supabase Auth 사용자를 삭제한다.
- 상태: [x] 동결
```

```
#### [GET] /api/members/me/favorite-artists
- 설명: 로그인 사용자가 선호 아티스트로 등록한 목록 조회
- 인증 필요: Y
- 요청 header: `Authorization: Bearer <Supabase access_token>`
- 응답: 배열 `{ artistId, name, imageUrl }`
- 비고: `member_artist.member_id`는 인증된 회원에서 결정하며, access token과 내부 prompt에는 저장하지 않는다.
- 상태: [x] additive
```

`public.member` 동기화:

- `member_uuid`: Supabase `auth.users.id`와 동일한 uuid
- `member_id`: 서비스 내부 bigint PK
- `login_provider`: `EMAIL`, `KAKAO` 등 인증 제공자
- `login_id`: 이메일 가입 시 이메일 기반 값, 소셜 로그인 시 provider 기반 fallback
- `password_hash`: Supabase Auth가 비밀번호를 관리하므로 `null`

*(내 정보, 선호 아이돌 저장 등 추가)*

---

### 3.2 굿즈 (goods) — 담당: `__________` ★ 예시 (이 패턴을 복사하세요)

```
#### [GET] /api/goods
- 설명: 상품 목록 (태그 필터 가능)
- 인증 필요: N
- 요청 query: `?tag=PHOTOCARD&page=0&size=20&sort=createdAt,desc`
- 추가 query: `goodsIds` (comma-separated 상품 ID, 즐겨찾기 등 특정 상품 목록 조회)
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

#### [GET] /api/goods/{goodsId}/reviews
- 설명: 상품 리뷰 목록 조회
- 인증 필요: N
- 요청 query: `page=0&size=5&sort=newest|rating`
- 응답: 페이지 객체, content = `{ reviewId, rating, authorName, optionLabel, content, createdAt }`
- 상태: [x] 동결

#### [GET] /api/goods/{goodsId}/reviews/summary
- 설명: 상품 리뷰 평점 요약 조회
- 인증 필요: N
- 응답: `{ averageRating, reviewCount, ratingFiveCount, ratingFourCount, ratingThreeCount, ratingTwoCount, ratingOneCount }`
- 상태: [x] 동결

#### [GET] /api/goods/{goodsId}/reviews/my
- 설명: 로그인 사용자의 해당 상품 리뷰 조회
- 인증 필요: Y
- 응답: `200 { reviewId, memberId, rating, authorName, optionLabel, content, createdAt, updatedAt, ownedByCurrentMember }` 또는 `204 No Content`
- 상태: [x] additive

#### [POST] /api/goods/{goodsId}/reviews
- 설명: 로그인 사용자의 상품 리뷰 작성. 구매 여부는 검증하지 않으며 한 사용자당 상품별 1개만 허용
- 인증 필요: Y
- 요청 body: `{ rating, content, optionLabel }`
- 응답: `201 { reviewId, memberId, rating, authorName, optionLabel, content, createdAt, updatedAt, ownedByCurrentMember }`
- 상태: [x] additive

#### [PATCH] /api/goods/{goodsId}/reviews/{reviewId}
- 설명: 로그인 사용자의 본인 리뷰 수정
- 인증 필요: Y
- 요청 body: `{ rating, content, optionLabel }`
- 응답: `{ reviewId, memberId, rating, authorName, optionLabel, content, createdAt, updatedAt, ownedByCurrentMember }`
- 상태: [x] additive

#### [DELETE] /api/goods/{goodsId}/reviews/{reviewId}
- 설명: 로그인 사용자의 본인 리뷰 삭제
- 인증 필요: Y
- 응답: `204 No Content`
- 상태: [x] additive

#### [POST] /api/goods/{goodsId}/views
- 설명: 로그인 사용자의 상품 상세 조회 이력 기록
- 인증 필요: Y
- 요청 path: `goodsId` (bigint)
- 요청 header: `Authorization: Bearer <Supabase access_token>`
- 응답: `204 No Content`
- 동작: 같은 회원과 상품의 최근 10분 이내 조회가 있으면 중복 저장하지 않고 `204`를 반환한다.
- 상태: [x] additive

#### [GET] /api/goods/favorites
- 설명: 로그인 사용자의 계정별 즐겨찾기 상품 목록 조회
- 인증 필요: Y
- 요청 header: `Authorization: Bearer <Supabase access_token>`
- 응답: goods 요약 배열
- 정렬: 즐겨찾기 추가일 최신순
- 상태: [x] additive

#### [POST] /api/goods/{goodsId}/favorites
- 설명: 로그인 사용자의 계정별 즐겨찾기 상품 추가
- 인증 필요: Y
- 요청 path: `goodsId` (bigint)
- 요청 header: `Authorization: Bearer <Supabase access_token>`
- 응답: `204 No Content`
- 동작: 이미 추가된 상품이면 중복 저장하지 않고 `204`를 반환한다.
- 상태: [x] additive

#### [DELETE] /api/goods/{goodsId}/favorites
- 설명: 로그인 사용자의 계정별 즐겨찾기 상품 제거
- 인증 필요: Y
- 요청 path: `goodsId` (bigint)
- 요청 header: `Authorization: Bearer <Supabase access_token>`
- 응답: `204 No Content`
- 상태: [x] additive

#### [GET] /api/goods/recommendation-candidates
- 설명: AI 답변의 근거로 사용할 판매 가능한 상품 후보 조회
- 인증 필요: N
- 요청 query:
  - `q`: 사용자 자연어 또는 검색어
  - `artistName`: AI가 추출한 아티스트명
  - `categoryName`: AI가 추출한 카테고리명
  - `tags`: comma-separated 태그 후보
  - `maxPrice`: 최대 가격 KRW
  - `excludeGoodsIds`: comma-separated 제외 상품 ID
  - `preferredArtistIds`: comma-separated 선호 아티스트 ID 후보. 필터가 아니라 관련도 가산점으로만 사용
  - `page`: 기본 `0`
  - `size`: 기본 `10`, 최대 `20`
  - `sort`: `relevance,desc` 기본, `price,asc|desc` 지원
- 응답: 페이지 객체, content = 기존 goods 요약 호환 필드 + `{ artistId, artistName, categoryName, salesStatus, stockCount, recommendationReason, matchedFields }`
- 동작:
  - AI 서버는 사용자 입력을 `q`로 그대로 전달할 수 있으며, Spring이 `q` 안의 `search_alias`를 해석한다.
  - `search_alias`는 개별 아티스트, 아티스트 그룹, 카테고리, 태그 FK 구조를 사용한다.
  - 같은 차원의 alias 후보는 OR, 서로 다른 차원의 조건은 AND로 상품을 제한한다.
  - alias로 인식되지 않은 검색어는 상품명·아티스트명·그룹명·카테고리명·태그 관련도 점수에 사용한다.
  - `preferredArtistIds`는 순위 가산점으로만 사용하며 명시 검색어·카테고리·가격·재고 조건을 대체하지 않는다.
  - 가격, 재고, 판매 상태, 제외 ID는 hard filter로 적용한다.
  - 결과가 없으면 `200`과 빈 페이지를 반환한다.
- 상태: [x] additive

---

### 3.3 장바구니 (cart) — 담당: `__________`

#### [GET] /api/cart
- 설명: 로그인 사용자의 계정별 장바구니 조회
- 인증 필요: Y
- 요청 header: `Authorization: Bearer <Supabase access_token>`
- 응답: `{ cartId, items, totalQuantity, totalPrice }`
- `items[]`: `{ cartItemId, goodsId, name, price, imageUrl, tags, artistId, artistName, categoryId, categoryName, salesStatus, stockCount, quantity, subtotal, purchaseState, purchaseMessage }`
- 상태: [x] additive

#### [POST] /api/cart/items
- 설명: 로그인 사용자의 장바구니 상품 추가. 같은 상품이 이미 있으면 수량 증가
- 인증 필요: Y
- 요청 body: `{ goodsId, quantity }`
- 응답: 갱신된 장바구니 객체
- 비고: Spring은 DB의 상품 가격, 재고, 판매 상태를 기준으로 검증한다.
- 상태: [x] additive

#### [PATCH] /api/cart/items/{cartItemId}
- 설명: 로그인 사용자의 장바구니 상품 수량 변경
- 인증 필요: Y
- 요청 path: `cartItemId` (bigint)
- 요청 body: `{ quantity }`
- 응답: 갱신된 장바구니 객체
- 상태: [x] additive

#### [DELETE] /api/cart/items/{cartItemId}
- 설명: 로그인 사용자의 장바구니 상품 삭제
- 인증 필요: Y
- 요청 path: `cartItemId` (bigint)
- 응답: `204 No Content`
- 상태: [x] additive

#### [DELETE] /api/cart/items
- 설명: 로그인 사용자의 장바구니 전체 비우기
- 인증 필요: Y
- 응답: `204 No Content`
- 상태: [x] additive

---

### 3.4 아티스트 (artists) — 담당: `__________`

> AI가 "왜 이 굿즈가 의미 있나"를 설명하는 근거 공급. 추천이 `artistId`로 연결되므로 그 필드는 동결.

```
#### [GET] /api/artists
- 설명: 아티스트 목록 (이름/컬렉션 검색 가능)
- 인증 필요: N
- 요청 query: ?q=aespa&page=0&size=20&sort=name,asc
- 응답 (동결 필드): 페이지 객체(§1.5), content = artist 요약 배열
- 추가 가능 필드: { lore, debutDate, collections[] }
- 상태: [x] 동결
```

`artist` 요약 객체 (아티스트 카드·굿즈 상세·AI 추천 설명이 의존 → **동결**):

```json
{
  "artistId": 7,
  "name": "aespa",
  "imageUrl": "https://cdn.example.com/artists/7.jpg"
}
```

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

### 3.5 주문/결제 (orders) — 담당: `__________`

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

### 3.6 AI 플랫폼 (ai) — 담당: `강승민`

> 캐릭터 아일랜드 ↔ OLV WebSocket. REST가 아니라 **WebSocket 메시지 형태**가 계약이다.

- WebSocket 엔드포인트: `/client-ws` *(OLV 표준)*
- 클라이언트 → 서버 인증 메시지: `{ "type": "auth", "accessToken": "<Supabase access_token>" }`
- 클라이언트 → 서버 메시지: `{ "type": "text-input", "text": "예산 5만원으로 최애 선물 골라줘" }`
- 클라이언트 → 서버 메시지 추가 가능 필드: `sessionId` (저장된 채팅 세션 ID, optional), `context.cartItems` (현재 장바구니 요약, optional)
- 서버 → 클라이언트 메시지(동결 필드): `{ "type": "...", "text": "...", "actions": [ ... ] }`
- 서버 → 클라이언트 메시지 추가 가능 필드: `metadata.recommendations` (추천 저장용 상품 ID·사유·순위, optional), `metadata.authRequired`, `metadata.authReason`, `metadata.loginPath` (로그인 CTA, optional)
- `actions` 배열 형식은 §4 따름
- WebSocket `actions` 항목은 `[ACTION]` 태그를 JSON 객체로 표현한다. 예: `{ "type": "navigate", "path": "/goods/42" }`
- `auth.accessToken`은 로그인 사용자의 Supabase access token이며, AI 서버는 연결 메모리에만 보관하고 DB·로그에 저장하지 않는다.
- `metadata.recommendations[]` 항목은 `{ goodsId, recommendationReason, rankOrder }` 형태이며, AI 서버는 채팅 이력 저장 시 `virtual_recommendation` 저장에 사용할 수 있다.
- 로그인 필요 응답은 기존 `full-text` 형태와 빈 `actions`를 유지하고 다음 additive metadata를 포함한다.

```json
{
  "type": "full-text",
  "text": "로그인하면 이전 대화와 회원 정보를 참고할 수 있어요.",
  "actions": [],
  "metadata": {
    "authRequired": true,
    "authReason": "accountPersonalization | chatHistory | persistence | guestLimit",
    "loginPath": "/login"
  }
}
```

- `authReason`은 회원 찜·구매 기반 추천 `accountPersonalization`, 이전 세션 대화 `chatHistory`, 다음 접속을 위한 저장·기억 `persistence`, 게스트 이용 한도 `guestLimit` 중 하나다.
- `text`는 HTML이 아닌 plain text로 취급한다. 클라이언트는 HTML 삽입 렌더링을 사용하지 않는다.
- `text-input.text`는 trim 후 비어 있으면 invalid이며, 최대 1,000자까지 허용한다.
- `sessionId`는 로그인 사용자의 Spring 채팅 세션 ID다. 인증되지 않은 요청의 `sessionId`는 저장에 사용하지 않는다.
- `context.cartItems`는 optional이며, 최대 50개까지 허용한다.
- 로그인 사용자는 WebSocket 연결 후 auth 메시지를 먼저 보낸 뒤 `text-input`에는 access token을 반복 전송하지 않는다.
- AI 서버는 같은 `sessionId`의 이전 USER/ASSISTANT 메시지를 최근 20개까지 유지해 후속 LLM 요청에 주입한다.
- WebSocket 재연결 시 현재 세션 메시지를 Spring에서 한 번 복원하며, 다른 세션의 원문은 직접 주입하지 않고 세션 요약만 사용한다.
- 비로그인 사용자는 일반 질문, 상품 검색·추천, 현재 연결의 대화 맥락, 상품 이동·하이라이트, 게스트 장바구니 `addToCart`를 이용할 수 있다.
- 비로그인 메시지와 응답은 PostgreSQL에 저장하지 않으며 개인화 컨텍스트 API와 회원 API를 호출하지 않는다. 최근 USER/ASSISTANT 메시지는 현재 WebSocket 연결 메모리에 최대 20개만 유지한다.
- 비로그인 사용자는 schema와 input hook을 통과해 실제 LLM 또는 상품 추천 처리로 전달되는 요청을 연결당 최대 10회 사용할 수 있다. 로그인 필요 요청과 차단된 입력은 횟수에 포함하지 않는다.
- 11번째 요청부터 LLM이나 추천 처리를 호출하지 않고 `authReason: "guestLimit"` CTA를 반환한다. 이 제한은 MVP 연결 단위이므로 WebSocket 재연결 시 카운터가 초기화된다.
- 인증 메시지를 받거나 연결이 종료되면 익명 대화, 요청 카운터, 연결 내 최근 추천 후보를 폐기하며 로그인 세션에 이전하지 않는다.

#### [GET] /api/ai/goods-catalog/latest
- 설명: AI 서버가 최신 TSV 상품 카탈로그 URL을 조회
- 인증 필요: N
- 응답:
  - `catalogUrl`: AI 서버가 다운로드할 TSV URL
  - `generatedAt`: TSV 생성 시각
  - `urlExpiresAt`: URL 만료 시각
  - `itemCount`: TSV 상품 수
  - `fileSizeBytes`: TSV byte 크기
  - `storageBucket`: Storage bucket
  - `storagePath`: Storage object path
- 상태: [x] additive

#### [GET] /api/ai/hooks
- 설명: AI 서버가 입력/출력 hook filter에 적용할 활성 정책 목록 조회
- 인증 필요: N
- 응답: 배열
  - `hook`: `input` 또는 `output`
  - `check`: 검사 이름 (`maxLength`, `forbiddenWords`, `specialCharRatio`, `numberRatio`, `englishRatio`, `actionScope`)
  - `threshold`: 검사 기준값 문자열 (`500`, `30%`, `navigate,highlight,addToCart` 등)
  - `action`: 위반 시 동작 (`stop`, `review`, `rewrite`, `filter`)
  - `message`: 차단/확인/교체 시 사용자에게 보낼 문장
  - `enabled`: 활성 여부
  - `priority`: 적용 순서
  - `updatedAt`: 마지막 변경 시각
- 비고: WebSocket 메시지 형태는 바꾸지 않고, hook 위반 시에도 `{ type: "full-text", text, actions: [] }` 형태로 응답한다.
- 상태: [x] additive

#### [GET] /api/ai/personalization-context
- 설명: AI 서버가 로그인 회원의 추천·대화 개인화 컨텍스트를 통합 조회
- 인증 필요: Y
- 요청 query:
  - `recentSessionLimit`: 최근 대화 세션 수, 기본값 및 최대값 `3`
  - `excludeSessionId`: 현재 대화에서 제외할 세션 ID (optional)
- 응답:
  - `favoriteArtists`: 배열 `{ artistId, name, imageUrl }`
  - `favoriteGoods`: 상품 요약 배열
  - `cartItems`: 장바구니 상품 배열
  - `recentPurchasedGoods`: 최대 20개 배열 `{ goodsId, name, artistName, price, quantity, orderStatus, purchasedAt }`
  - `recentChatSessions`: 오래된 순서의 배열 `{ sessionId, startedAt, endedAt, summary, needsSummary }`
- 구매 이력은 주문 상태가 `PAID`, `PREPARING`, `SHIPPED`, `DONE`인 상품만 포함한다.
- `needsSummary`는 요약이 없거나 저장된 `sourceLastMessageId` 이후 USER/ASSISTANT 메시지가 존재함을 뜻한다.
- 회원 ID는 query로 받지 않고 인증된 회원에서 결정한다.
- 상태: [x] additive

#### 초기 구성
- WebSocket endpoint: /client-ws
- 인증 메시지: { type: "auth", accessToken: string }
- 입력 메시지: { type: "text-input", text: string }
- 입력 메시지 optional context:

```json
{
  "context": {
    "cartItems": [
      {
        "goodsId": 42,
        "name": "aespa OST 포토카드 세트",
        "quantity": 1,
        "tags": ["PHOTOCARD", "AESPA"],
        "artistName": "aespa",
        "categoryName": "포토카드"
      }
    ]
  }
}
```

- 출력 메시지: { type: string, text: string, actions: array, metadata?: object }
- 초기 MVP에서 actions는 빈 배열 허용

*(정확한 메시지 타입은 OLV 코드 확인 후 채울 것)*

---

### 3.7 가상 채팅 이력 (virtual chat) — 담당: `강승민`

> 로그인 사용자와 AI 챗봇의 대화 이력을 Spring API가 저장한다. 프론트는 세션 생성만 담당하고, 메시지·추천 저장 요청은 AI 서버가 Supabase access token을 전달해 Spring API로 수행한다. 비로그인 사용자는 v1에서 저장하지 않는다.

#### [POST] /api/virtual-chat/sessions
- 설명: 로그인 사용자의 AI 채팅 세션 생성
- 인증 필요: Y
- 요청 body: `{ guideId?, title?, sourceScreen? }`
- 응답: `201 { sessionId, guideId, title, sourceScreen, startedAt, endedAt }`
- 비고: `memberId`는 요청 body로 받지 않고 인증된 회원에서 결정한다.
- 상태: [x] additive

#### [GET] /api/virtual-chat/sessions
- 설명: 로그인 사용자의 AI 채팅 세션 목록 조회
- 인증 필요: Y
- 요청 query: `page`, `size`, `sort=startedAt,desc`
- 응답: 페이지 객체, content = `{ sessionId, guideId, title, sourceScreen, startedAt, endedAt }`
- 상태: [x] additive

#### [GET] /api/virtual-chat/sessions/{sessionId}/messages
- 설명: 로그인 사용자의 특정 AI 채팅 세션 메시지 조회
- 인증 필요: Y
- 응답: 배열 `{ messageId, sessionId, speaker, messageText, action, actions, metadata, createdAt }`
- 권한: 세션 소유 회원만 조회 가능
- 상태: [x] additive

#### [POST] /api/virtual-chat/sessions/{sessionId}/messages
- 설명: AI 채팅 메시지와 해당 메시지에서 발생한 상품 추천 이력 저장
- 인증 필요: Y
- 호출 주체: AI 서버. 프론트는 이 API를 직접 호출해 메시지·추천 payload를 저장하지 않는다.
- 요청 body:
  - `speaker`: `USER`, `ASSISTANT`, `SYSTEM`
  - `messageText`: 저장할 plain text 메시지
  - `action`: 대표 action 이름 또는 null
  - `actions`: WebSocket 응답 actions 배열 또는 null
  - `metadata`: 운영 메타데이터 또는 null
  - `recommendations`: optional 배열 `{ goodsId, requestText, recommendationReason, rankOrder }`
- 응답: `201 { messageId, sessionId, speaker, messageText, action, actions, metadata, createdAt }`
- 권한: 세션 소유 회원만 저장 가능하며, 추천 이력의 `memberId`도 인증된 회원에서 결정한다.
- 비고: AI 서버가 전달한 `Authorization: Bearer <Supabase access_token>`을 Spring이 최종 검증한다.
- 상태: [x] additive

#### [PUT] /api/virtual-chat/sessions/{sessionId}/summary
- 설명: AI 서버가 생성한 세션별 구조화 요약을 생성 또는 갱신
- 인증 필요: Y
- 요청 body:
  - `summary`: `{ summary, preferences, dislikedItems, constraints, mentionedGoodsIds, unresolvedRequests }`
  - `sourceMessageCount`: 요약에 반영된 USER/ASSISTANT 메시지 수
  - `sourceLastMessageId`: 요약에 반영된 마지막 메시지 ID
- 응답: `200 { sessionId, summary, summaryVersion, sourceMessageCount, sourceLastMessageId, createdAt, updatedAt }`
- 제한: `summary` 1,000자, 각 문자열 배열 최대 10개·항목당 200자, `mentionedGoodsIds` 최대 20개
- 권한: 세션 소유 회원만 저장 가능하며 다른 회원의 세션은 `404`로 처리한다.
- 비고: 동일 세션 요청은 `virtual_chat_session_summary` 레코드를 upsert한다.
- 상태: [x] additive

#### [PATCH] /api/virtual-chat/sessions/{sessionId}/end
- 설명: 로그인 사용자의 AI 채팅 세션 종료 시각 기록
- 인증 필요: Y
- 응답: `204 No Content`
- 권한: 세션 소유 회원만 종료 가능
- 상태: [x] additive

DB 저장 정책:
- `virtual_chat_session.member_id`로 사용자별 세션을 구분한다.
- `virtual_chat_message.actions_json`에는 WebSocket `actions` 배열을 JSON으로 저장한다.
- `virtual_chat_message.metadata_json`에는 모델명, 저장 실패 원인 등 비계약 운영 정보를 저장할 수 있다.
- `virtual_recommendation.message_id`는 추천을 포함한 assistant 메시지에 연결한다.
- 채팅 원문은 PostgreSQL에 유지하고 세션 요약은 `virtual_chat_session_summary.summary_json` JSONB에 저장한다.
- 요약에는 USER/ASSISTANT 메시지만 반영하며 Storage 파일은 채팅의 주 저장소로 사용하지 않는다.
- Supabase token, service role key, LLM 내부 prompt, 불필요한 장바구니 전체 context는 저장하지 않는다.

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

- ACTION 실행 대상은 숫자 `goodsId` 기반 값만 허용한다.
  - `navigate.path`: `/goods/{goodsId}`
  - `highlight.selector`: `[data-goods-id='{goodsId}']` 또는 `[data-goods-id="{goodsId}"]`
  - `addToCart.goodsId`: 숫자 문자열
- **스트레치(MVP 아님)**: 감정 표정 전환, STT 음성 입력 — Week 1 계약에서 제외

---

## 5. 변경 로그

모든 변경을 여기 기록한다. **종류(additive/breaking)와 버전(§0.1)을 함께 적는다.**

- additive(추가): 버전 유지 또는 수(patch)만 ↑
- breaking(삭제·이름변경·타입변경·status 변경): 부(minor) ↑ + 슬랙 공지 필수

### 예시
| 날짜 | 버전 | 도메인 | 종류 | 변경 내용 | 합의자 |
|------|------|--------|------|-----------|--------|
| 2026-06-11 | v0.1.0 | 전체 | — | 초안 작성 | 전원 |
| 2026-06-12 | v0.1.0 | artists | additive | `GET /api/artists` 목록 계약 및 artist 요약 객체 추가 | 아티스트 |
| 2026-06-1X | v0.1.1 | (예) goods | additive | `discountRate` 필드 추가 | 굿즈 |
| 2026-06-1X | v0.2.0 | (예) goods | breaking | `price` 타입 String→int 변경 | 전원 |
| 2026-06-18 | v0.1.3 | goods | additive | 상품 상세에 판매 기간, 구매 상태, 배송, 옵션 그룹, variant, 안내 필드를 추가하고 `GET /api/goods/{goodsId}/related`를 추가 | Codex |
| 2026-06-19 | v0.1.4 | goods | additive | 상품 요약에 평균 별점과 리뷰 수를 추가하고 리뷰 목록 및 요약 조회 API를 추가 | Codex |
| 2026-06-24 | v0.2.0 | goods/member | additive | 로그인 사용자의 상품 리뷰 작성·수정·삭제와 내 리뷰 조회 API 추가 (`GET /reviews/my`, `POST/PATCH/DELETE /reviews`) | Codex |
| 2026-07-01 | v0.2.9 | member | additive | 현재 회원 조회 `GET /api/members/me` 응답에 `memberGrade`를 추가하고 `public.member.member_grade` 값을 노출 | Codex |
|  |  |  |  |  |  |

### 로그 기록

| 날짜 | 버전 | 도메인 | 종류 | 변경 내용 | 합의자 |
|------|------|--------|------|-----------|--------|
| 2026-06-11 | v0.1.0 | 전체 | — | 초안 작성 | 전원 |
| 2026-06-12 | v0.1.1 | ai | additive | ai websocket 입/출력 계약 추가 | 강승민 |
| 2026-06-15 | v0.1.2 | goods | additive | `GET /api/goods`에 다중 선택 필터용 `categoryIds`, `artistIds`, `tags` query 추가. 기존 `categoryId`, `artistId`, `tag` query는 호환 유지 | Codex |
| 2026-06-15 | v0.1.3 | ai | additive | WebSocket ACTION 응답 객체 형태 추가 (`navigate`, `highlight`, `addToCart`) | 강승민 |
| 2026-06-16 | v0.1.4 | member | breaking | 인증 방식을 Supabase Auth로 확정하고 `userId`를 uuid로 동결 | 팀 합의 |
| 2026-06-18 | v0.1.5 | goods | additive | 상품 상세에 판매 기간, 구매 상태, 배송, 옵션 그룹, variant, 안내 필드를 추가하고 `GET /api/goods/{goodsId}/related`를 추가 | Codex |
| 2026-06-19 | v0.1.6 | ai | additive | WebSocket `text-input` 요청에 optional `context.cartItems` 장바구니 요약 추가 | 강승민 |
| 2026-06-19 | v0.1.7 | goods | additive | 상품 요약에 평균 별점과 리뷰 수를 추가하고 리뷰 목록 및 요약 조회 API를 추가 | Codex |
| 2026-06-22 | v0.1.8 | goods/ai | additive | AI 추천 후보용 `GET /api/goods/recommendation-candidates`와 Spring 카탈로그 기반 ACTION 검증 추가 | Codex |
| 2026-06-22 | v0.1.8 | goods | additive | 추천 검색 alias에 아티스트 그룹 FK를 추가하고 그룹·카테고리 등 서로 다른 검색 차원을 AND로 적용 | Codex |
| 2026-06-22 | v0.1.9 | member | additive | 이메일 회원가입 요청에 `address`, `agreements`를 추가하고 Spring이 Supabase Auth Admin API로 유저를 생성하도록 회원가입 책임을 명시 | Codex |
| 2026-06-22 | v0.1.10 | auth | additive | 인증 필요 API의 Bearer 토큰을 Supabase `access_token`으로 명시하고 프론트 공통 Spring API 클라이언트 기준을 추가 | Codex |
| 2026-06-23 | v0.1.11 | auth | additive | Spring API에서 Supabase JWKS 기반 JWT 검증과 현재 회원 컨텍스트를 사용하는 인증 기준 추가 | 강승민 |
| 2026-06-23 | v0.1.12 | goods | additive | `GET /api/goods`에 `goodsIds` 필터를 추가하고 즐겨찾기 목록이 상품 상세 API 대신 상품 목록 API를 사용하도록 변경 | Codex |
| 2026-06-23 | v0.2.0 | goods/member | additive | 로그인 회원의 상품 상세 조회를 기록하는 `POST /api/goods/{goodsId}/views` 추가, 동일 상품 10분 중복 기록 방지 | Codex |
| 2026-06-23 | v0.1.12 | goods | correction | 상품 상세 조회를 현재 관리자·DB의 상품 기본 정보와 재고 기준으로 정리하고 미구현 판매 기간·배송·공지·옵션 의존 제거 | Codex |
| 2026-06-23 | v0.2.0 | goods | breaking | 상품 상세 응답에서 미구현 `saleType`, 판매 기간, 배송, 공지, 옵션 그룹, variant 필드를 제거 | Codex |
| 2026-06-24 | v0.2.0 | member | additive | 회원가입 시 휴대폰번호를 `010-0000-0000` 형식으로 정규화하고 중복 휴대폰번호를 `MEMBER_PHONE_ALREADY_EXISTS`로 거절 | Codex |
| 2026-06-24 | v0.2.0 | member | additive | 비밀번호 재설정 메일 발송 전 이메일 가입 여부를 확인하는 `POST /api/members/password-reset/eligibility` 추가 | Codex |
| 2026-06-24 | v0.2.0 | goods/member | additive | 계정별 상품 즐겨찾기 조회·추가·삭제 API (`GET /api/goods/favorites`, `POST/DELETE /api/goods/{goodsId}/favorites`) 추가 | Codex |
| 2026-06-24 | v0.2.0 | cart/member | additive | 계정별 장바구니 조회·추가·수량 변경·삭제 API (`GET /api/cart`, `POST/PATCH/DELETE /api/cart/items`) 추가 | Codex |
| 2026-06-26 | v0.2.0 | member | additive | 회원가입 1단계 중복 확인 API `POST /api/members/signup/availability` 추가 및 중복 이메일 오류 코드 명시 | Codex |
| 2026-06-26 | v0.2.0 | member | additive | 로그인 회원 개인정보 수정 API `PATCH /api/members/me` 추가 | Codex |
| 2026-06-29 | v0.2.2 | member | additive | 로그인 회원 탈퇴 API `DELETE /api/members/me` 추가 | Codex |
| 2026-06-24 | v0.2.1 | ai | additive | WebSocket plain text 입력 한도와 ACTION 실행 대상 allow-list 보안 규칙 추가 | 강승민 |
| 2026-06-25 | v0.2.2 | ai/goods | additive | AI 서버가 최신 TSV 상품 카탈로그 URL을 조회하는 `GET /api/ai/goods-catalog/latest` 추가 | 강승민 |
| 2026-06-25 | v0.2.3 | ai | additive | AI input/output hook 정책 조회 API `GET /api/ai/hooks` 추가 | 강승민 |
| 2026-06-25 | v0.2.4 | ai/virtual-chat | additive | 로그인 사용자의 AI 채팅 세션·메시지·추천 이력 저장 API와 WebSocket optional `sessionId` 추가 | 강승민 |
| 2026-06-25 | v0.2.5 | ai/virtual-chat | additive | AI WebSocket 응답에 추천 이력 저장용 optional `metadata.recommendations` 추가 | 강승민 |
| 2026-06-26 | v0.2.6 | ai/virtual-chat | additive | WebSocket `auth` 메시지를 추가하고 메시지·추천 이력 저장 주체를 프론트 직접 호출에서 AI 서버 경유 호출로 정리 | 강승민 |
| 2026-06-26 | v0.2.7 | ai/member/goods | additive | 회원 선호 아티스트 조회 API `GET /api/members/me/favorite-artists`와 AI 추천 후보 `preferredArtistIds`, `artistId` 응답 필드 추가 | 강승민 |
| 2026-06-29 | v0.2.8 | ai/virtual-chat | additive | 통합 개인화 컨텍스트 조회와 PostgreSQL JSONB 기반 세션 요약 upsert API 추가 | 강승민 |
| 2026-06-29 | v0.2.9 | ai/cart | additive | 비로그인 WebSocket 대화·10회 연결 한도·결정적 로그인 CTA metadata와 로그인 후 게스트 장바구니 병합 정책 추가 | 강승민 |
| 2026-06-30 | v0.2.9 | member | additive | 탈퇴 상태 회원의 인증 API 접근을 `MEMBER_WITHDRAWN` 403으로 거절하도록 명시 | Codex |
| 2026-06-30 | v0.2.9 | member | additive | 회원가입·중복확인·비밀번호 재설정 eligibility에서 탈퇴 회원을 기존 회원 중복으로 보지 않도록 명시 | Codex |
| 2026-06-30 | v0.2.9 | member | correction | 탈퇴 회원 로그인 차단 안내 문구를 “계정을 찾을 수 없습니다. 먼저 회원가입을 진행해 주세요.”로 변경 | Codex |
|  |  |  |  |  |  |
