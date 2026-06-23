# AI 상품 추천용 RAG-lite API 요청서

> 목적: 기존 goods 페이지의 필터 동작을 깨지 않고, AI 서버가 최신 상품 카탈로그를 안전하게 조회해 추천 근거로 사용할 수 있는 additive API를 요청한다.

---

## 1. 배경

현재 AI 서버는 백엔드 goods API를 도구처럼 호출한 뒤, 조회된 상품 결과 안에서만 추천 문장과 `[ACTION]`을 생성한다.

기존 `GET /api/goods`는 goods 페이지의 필터 UI에 맞춰 여러 조건을 `AND`로 조합하는 것이 자연스럽다. 예를 들어 `q=aespa&tag=PHOTOCARD`는 "aespa 검색 결과 중 PHOTOCARD 태그 상품"처럼 교집합으로 좁히는 동작이다.

AI 추천 검색은 목적이 다르다. 사용자의 자연어 요청은 "에스파 포토카드 추천해줘"처럼 아티스트, 카테고리, 태그, 선호 표현이 한 문장에 섞여 들어온다. 이 요청을 기존 필터 API에 그대로 넣으면 조건이 과도하게 좁아져 결과가 비어질 수 있다.

따라서 기존 `GET /api/goods`의 동작은 유지하고, AI 추천 후보 검색용 API를 additive로 추가해주기를 요청한다.

---

## 2. 요청 요약

### 새 endpoint

```text
GET /api/goods/recommendation-candidates
```

### 목표

- 자연어 검색어를 받아 AI 추천 후보 상품을 넓게 반환한다.
- 기존 goods 페이지 필터 API의 `AND` 동작은 변경하지 않는다.
- 응답은 기존 goods 요약 객체 필드를 유지하고, AI 추천 근거에 필요한 필드만 additive로 포함한다.
- 품절 또는 판매 불가 상품은 기본적으로 추천 후보에서 제외한다.
- AI가 임의 `goodsId`를 만들지 않도록, 추천 ACTION에 쓸 수 있는 실제 `goodsId` 후보를 제공한다.

---

## 3. 요청 API 상세

### `GET /api/goods/recommendation-candidates`

- 설명: AI 추천 후보 상품 검색
- 인증 필요: N
- 요청 query:

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `q` | string | N | 사용자 자연어 또는 검색어. 예: `에스파 포토카드`, `5만원 이하 키링` |
| `artistName` | string | N | AI가 추출한 아티스트명. 예: `aespa`, `에스파` |
| `categoryName` | string | N | AI가 추출한 카테고리명. 예: `포토카드`, `키링` |
| `tags` | string | N | comma-separated 태그 후보. 예: `PHOTOCARD,AESPA` |
| `maxPrice` | integer | N | 최대 가격 KRW. 예: `50000` |
| `excludeGoodsIds` | string | N | comma-separated 제외 상품 ID. 장바구니 중복 추천 방지용 |
| `page` | integer | N | 기본 `0` |
| `size` | integer | N | 기본 `10`, 최대 `20` 권장 |
| `sort` | string | N | 기본 추천 정렬. 예: `relevance,desc` |

### 검색 동작 요구사항

- `q`, `artistName`, `categoryName`, `tags`는 추천 후보를 찾기 위한 **확장 검색**으로 처리한다.
- 기존 `GET /api/goods`처럼 모든 조건을 무조건 `AND`로 묶지 않는다.
- 권장 검색 방식:
  - 상품명, 아티스트명, 카테고리명, 태그명을 대상으로 keyword 검색
  - `artistName`과 `tags`는 exact match 또는 alias match에 가산점 부여
  - `maxPrice`, 판매 상태, 재고 여부, `excludeGoodsIds`는 hard filter로 적용
- 한글/영문 alias는 가능하면 백엔드에서 처리한다.
  - 예: `에스파` ↔ `aespa`
  - 예: `포토카드` ↔ `PHOTOCARD`
- 결과가 0건이어도 200과 빈 page를 반환한다.

---

## 4. Alias / 동의어 처리 요청

AI 추천 검색 품질을 위해 한글명, 영문명, 줄임말, 태그명을 같은 의미로 처리할 수 있는 alias 처리가 필요하다.

### v1 구현 선택지

처음부터 별도 관리 시스템을 만들 필요는 없다. 구현 부담에 따라 아래 둘 중 하나를 선택할 수 있다.

| 방식 | 설명 | 장점 | 단점 |
|------|------|------|------|
| 코드 상수 map | 백엔드 코드에 alias map을 둔다 | 빠르게 구현 가능 | alias 추가 시 코드 수정/배포 필요 |
| DB alias 테이블 | alias를 DB 데이터로 관리한다 | 운영 중 추가 가능, 추천 품질 개선 쉬움 | 테이블/초기 데이터/관리 방식 필요 |

팀 프로젝트 1차 구현은 코드 상수 map으로 시작해도 충분하다. 다만 RAG-lite 추천을 계속 고도화할 예정이라면 DB alias 테이블을 권장한다.

### 권장 alias 테이블

```text
search_alias
- aliasId
- aliasText
- normalizedAlias
- artistId
- groupId
- categoryId
- tagId
```

필드 설명:

| 이름 | 타입 | 설명 |
|------|------|------|
| `aliasId` | bigint | alias PK |
| `aliasText` | string | 사용자가 입력할 수 있는 표현. 예: `에스파`, `포카`, `photocard` |
| `normalizedAlias` | string | NFKC, trim, lowercase가 적용된 Spring 조회 키 |
| `artistId` | bigint/null | `artist.artist_id` FK |
| `groupId` | bigint/null | `artist_group.group_id` FK |
| `categoryId` | bigint/null | `goods_category.category_id` FK |
| `tagId` | bigint/null | `tag.tag_id` FK |

예시 데이터:

| aliasText | artistId | groupId | categoryId | tagId |
|-----------|----------|---------|------------|-------|
| `에스파` | null | aespa 그룹 ID | null | null |
| `aespa` | null | aespa 그룹 ID | null | null |
| `포카` | null | null | Photocard 카테고리 ID | null |
| `포토카드` | null | null | Photocard 카테고리 ID | null |
| `photocard` | null | null | Photocard 카테고리 ID | null |
| `키링` | null | null | 키링 카테고리 ID | null |

권장 제약:

```sql
check (num_nonnulls(artist_id, group_id, category_id, tag_id) = 1)
```

### 현재 Spring 구현이 기대하는 실제 DB 컬럼

Supabase에서 테이블을 직접 생성할 때 아래 snake_case 컬럼명을 사용한다.

```text
search_alias
- alias_id bigint primary key
- alias_text text not null
- normalized_alias text not null
- artist_id bigint null references artist(artist_id)
- group_id bigint null references artist_group(group_id)
- category_id bigint null references goods_category(category_id)
- tag_id bigint null references tag(tag_id)
```

- alias 하나는 아티스트, 아티스트 그룹, 카테고리, 태그 중 정확히 하나에 연결한다.
- Spring은 `public.search_alias`와 `artist_id`, `group_id`, `category_id`, `tag_id` FK 컬럼이 존재한다고 가정한다.
- 이 테이블은 Spring JDBC 전용으로 사용하고 Supabase Data API의 `anon`, `authenticated` 역할에는 노출하지 않는 것을 권장한다.

### recommendation-candidates에서의 사용 방식

`GET /api/goods/recommendation-candidates`는 요청의 `q`, `artistName`, `categoryName`, `tags`에서 alias를 찾아 canonical 조건으로 확장한다.

예:

```text
사용자 요청: 에스파 포토카드
추출/확장:
- 에스파 -> aespa의 `group_id`
- 포토카드 -> Photocard의 `category_id`
```

이후 백엔드는 alias 차원별 조건을 적용한다.

- 같은 차원의 여러 alias는 OR로 처리한다.
- 그룹, 카테고리, 태그처럼 서로 다른 차원은 AND로 처리한다.
- 따라서 aespa 그룹 소속 아티스트의 상품이면서 Photocard 카테고리인 상품만 후보가 된다.
- alias로 인식되지 않은 원문은 상품명/카테고리/아티스트명/그룹명/태그 관련도에 사용한다.

단, 가격, 재고, 판매 상태, `excludeGoodsIds`는 hard filter로 유지한다.

---

## 5. 응답 형태

기존 페이지 객체 규약을 따른다.

```json
{
  "content": [
    {
      "goodsId": 42,
      "name": "aespa OST 포토카드 세트",
      "price": 35000,
      "imageUrl": "https://cdn.example.com/goods/42.jpg",
      "tags": ["PHOTOCARD", "AESPA"],
      "artistName": "aespa",
      "categoryName": "포토카드",
      "salesStatus": "ON_SALE",
      "stockCount": 120,
      "recommendationReason": "aespa와 포토카드 조건에 모두 맞는 상품입니다.",
      "matchedFields": ["artistName", "tags"]
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1
}
```

### 동결 또는 기존 의존 필드

아래 필드는 기존 goods 계약과 호환되어야 한다.

- `goodsId`
- `name`
- `price`
- `imageUrl`
- `tags`

### AI 추천용 additive 필드

아래 필드는 있으면 AI 추천 품질이 좋아진다.

| 이름 | 타입 | 설명 |
|------|------|------|
| `artistName` | string/null | 추천 설명과 아티스트 매칭에 사용 |
| `categoryName` | string/null | 추천 설명과 카테고리 매칭에 사용 |
| `salesStatus` | string/null | 판매 가능 여부 판단에 사용 |
| `stockCount` | integer/null | 품절 상품 ACTION 방지에 사용 |
| `recommendationReason` | string/null | 백엔드가 계산한 짧은 매칭 근거 |
| `matchedFields` | string[] | 어떤 필드가 검색어와 맞았는지. 예: `artistName`, `tags`, `categoryName`, `name` |

---

## 6. 필터와 정렬 정책 제안

### hard filter

아래 조건은 추천 후보에서 제외하는 데 사용한다.

- `maxPrice`보다 비싼 상품
- `excludeGoodsIds`에 포함된 상품
- 판매 불가 상품
- 재고가 0인 상품

판매 상태 값이 아직 완전히 동결되지 않았다면, 백엔드 담당자가 현재 사용하는 판매 가능 상태만 문서화해주면 AI 서버가 그 값을 기준으로 처리한다.

### relevance 정렬

추천용 기본 정렬은 `relevance,desc`를 권장한다.

가산점 예시:

- artistName exact 또는 alias match
- tag exact 또는 alias match
- categoryName match
- goods name keyword match
- `aiPickDefault = true`
- `isBestSeller = true`
- 가격 조건에 가까움

정확한 점수 산식은 백엔드 내부 구현으로 두고, API에는 노출하지 않아도 된다.

---

## 7. AI 서버 사용 흐름

AI 서버는 다음 순서로 사용할 예정이다.

1. 사용자 메시지와 현재 장바구니 context를 받는다.
2. 사용자 문장에서 검색 의도를 추출한다.
   - 예: `에스파 포토카드 추천해줘`
   - `q=에스파 포토카드`
   - `artistName=에스파`
   - `tags=PHOTOCARD`
3. `GET /api/goods/recommendation-candidates`를 호출한다.
4. 응답 `content` 안의 상품만 LLM 추천 context로 전달한다.
5. 최종 답변에 `[ACTION:navigate]`, `[ACTION:highlight]`, 명시적 담기 요청 시 `[ACTION:addToCart]`를 생성한다.
6. AI 서버는 응답에 포함되지 않은 `goodsId`의 ACTION을 제거한다.

---

## 8. 예시 요청

### 에스파 포토카드 추천

```text
GET /api/goods/recommendation-candidates?q=에스파%20포토카드&artistName=에스파&tags=PHOTOCARD&page=0&size=10
```

### 5만원 이하 키링 추천

```text
GET /api/goods/recommendation-candidates?q=키링&categoryName=키링&maxPrice=50000&page=0&size=10
```

### 장바구니 상품 제외

```text
GET /api/goods/recommendation-candidates?q=aespa&excludeGoodsIds=42,1002&page=0&size=10
```

---

## 9. 테스트 요청

백엔드에서 아래 케이스를 확인해주면 AI 서버 쪽 통합이 안정적이다.

- `q=aespa` 또는 `artistName=aespa`로 aespa 상품이 반환된다.
- `q=에스파` 또는 `artistName=에스파`로 aespa 상품이 반환된다.
- `q=에스파 포카`로 aespa 포토카드 상품이 반환된다.
- `tags=PHOTOCARD`로 포토카드 상품이 반환된다.
- `q=포카` 또는 `q=포토카드`가 `PHOTOCARD` 태그 상품으로 확장된다.
- `q=에스파 포토카드&tags=PHOTOCARD`가 0건으로 과도하게 좁혀지지 않는다.
- `maxPrice=50000`이면 50000원 초과 상품은 제외된다.
- `excludeGoodsIds=42`이면 `goodsId=42` 상품은 제외된다.
- 품절 또는 판매 불가 상품은 기본 추천 후보에서 제외된다.
- 응답은 항상 페이지 객체 형태이며, 0건이면 `content: []`와 `totalElements: 0`을 반환한다.

---

## 10. API 계약 반영 메모

이 요청은 기존 필드 삭제, 이름 변경, 타입 변경이 없는 additive 변경이다.

구현 시 `docs/api-contract.md`에 아래 내용을 추가하면 된다.

- `GET /api/goods/recommendation-candidates`
- 요청 query 목록
- 응답 페이지 객체와 goods 요약 필드
- alias 처리 정책 또는 `search_alias` 테이블을 도입할 경우 그 목적과 필드
- 변경 로그 additive 항목

기존 `GET /api/goods`의 필터 동작은 변경하지 않는다.
