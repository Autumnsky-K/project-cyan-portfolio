# AI 추천 품질 테스트 가이드

> 목적: AI 담당자와 Spring 상품 API 담당자가 같은 기준으로 챗봇 추천 품질을 검증하고,
> 기존 `GET /api/goods/recommendation-candidates` 검색 품질을 개선하기 위한 작업 가이드입니다.
> 이 문서는 새 API 제안이 아니라 현재 AI용 Spring 상품 추천 API의 품질 개선 기준입니다.

---

## 1. 목적과 책임 분리

챗봇 추천은 두 영역이 함께 맞아야 안정적으로 동작합니다.

| 영역 | 책임 |
|------|------|
| AI 서버 | 사용자 메시지를 Spring 추천 API에 전달하고, 반환된 후보 안에서만 답변과 ACTION을 생성한다. |
| Spring 상품 API | 자연어 `q`를 검색 가능한 term과 alias로 해석하고, 판매 가능한 상품 후보를 반환한다. |

권장 원칙:

- AI 서버는 검색 엔진이 아니라 추천 후보를 말로 풀어주는 계층으로 둔다.
- Spring은 `q`, `artistName`, `categoryName`, `tags`를 해석해 상품 후보를 찾는 기준점이 된다.
- 상품 후보가 0건이면 AI는 임의 `goodsId`를 만들지 않는다.
- AI 응답의 `navigate`, `highlight`, `addToCart` ACTION은 Spring 응답 `content` 안의 `goodsId`만 사용한다.

---

## 2. `search_alias` 구조와 해석 규칙

현재 추천 검색은 `search_alias.normalized_alias`를 통해 사용자 표현을 canonical 조건으로 확장합니다.

### 2.1 기준 컬럼

| 컬럼 | 타입 | nullable | 설명 |
|------|------|----------|------|
| `alias_id` | bigint | N | alias PK |
| `alias_text` | text | N | 사용자가 입력할 수 있는 원문 표현 |
| `normalized_alias` | text | N | NFKC, trim, lowercase 등 정규화된 검색 키 |
| `artist_id` | bigint | Y | `artist.artist_id` 연결 |
| `category_id` | bigint | Y | `goods_category.category_id` 연결 |
| `tag_id` | bigint | Y | `tag.tag_id` 연결 |
| `group_id` | bigint | Y | `artist_group.group_id` 연결 |

권장 데이터 규칙:

- alias 하나는 가능하면 `artist_id`, `group_id`, `category_id`, `tag_id` 중 정확히 하나에만 연결합니다.
- `artist_id`와 `group_id`는 같은 의미가 아닙니다.
- `Artist A`가 `Group One`에 속해 있어도 `Artist A` alias를 `group_id`로 취급하지 않습니다.

### 2.2 아티스트와 그룹 검색 정책

| 사용자 표현 | 권장 검색 범위 |
|-------------|----------------|
| `Artist A 상품 추천해줘` | Artist A 직접 상품 우선 |
| `Artist A의 포토카드 있어?` | Artist A + Photocard |
| `Group One 상품 추천해줘` | Group One 전체 상품 |
| `Group One 포토카드 있어?` | Group One + Photocard |
| `Artist A 관련 굿즈 추천해줘` | Artist A 직접 상품 우선, 부족하면 Group One 보조 추천 가능 |
| `Artist A가 속한 그룹 굿즈 추천해줘` | Group One 상품 |

Spring 구현 지침:

- `artist_id` alias는 해당 artist 상품으로 제한합니다.
- `group_id` alias는 해당 group 소속 artist 상품으로 제한합니다.
- artist와 group alias가 동시에 잡히면 의도가 충돌하지 않는지 확인합니다.
- 명시적 `Artist A` 요청에 같은 그룹의 `Artist B` 상품을 기본으로 섞지 않습니다.

---

## 3. 챗봇 추천 테스트 케이스

테스트 문장의 상품명과 artist명은 실제 seed/test 스타일인 `Artist A`, `Artist B`, `Artist C`, `Group One`, `Photocard`, `Keyring` 중심으로 작성합니다.

### 3.1 P0 핵심 추천 시나리오

| # | 사용자 메시지 | Spring 검색 의도 | 예상 응답 | 예상 ACTION | Spring API 기대 |
|---|---------------|------------------|-----------|-------------|-----------------|
| 1 | `상품 추천해줘` | 인기/기본 추천 | 요즘 많이 보는 상품으로 `{상품명}`을 추천해요. | `navigate`, `highlight` | 판매 가능 후보 반환 |
| 2 | `제일 인기 많은 굿즈 보여줘` | 조회수/베스트셀러 추천 | 가장 많이 본 상품은 `{상품명}`이에요. | `navigate`, `highlight` | 인기 정렬 또는 가산점 반영 |
| 3 | `많이 본 상품 추천해줘` | view 기반 추천 | 많은 사용자가 본 상품 중 `{상품명}`을 추천해요. | `navigate`, `highlight` | 인기 후보 반환 |
| 4 | `Artist A 굿즈 추천해줘` | artist alias | Artist A 상품으로 `{상품명}`을 추천해요. | `navigate`, `highlight` | Artist A 상품만 우선 반환 |
| 5 | `Artist C 상품 있어?` | artist alias | Artist C 상품으로 `{상품명1}`, `{상품명2}`가 있어요. | 후보 ACTION 또는 첫 후보 ACTION | Artist C 후보 반환 |
| 6 | `포토카드 찾아줘` | category/tag alias | 포토카드 상품으로 `{상품명}`을 추천해요. | `navigate`, `highlight` | Photocard 후보 반환 |
| 7 | `포토카드는 누구의 상품이 있어?` | category/tag alias + artist 요약 | 포토카드는 `{artistName 목록}` 상품이 있어요. | `navigate`, `highlight` | 조사 제거 후 Photocard 후보 반환 |
| 8 | `인형 굿즈 추천해줘` | category/tag alias | 인형 상품으로 `{상품명}`을 추천해요. | `navigate`, `highlight` | Plush 후보 반환 |
| 9 | `키링 있어?` | category/tag alias | 키링 상품으로 `{상품명}`이 있어요. | `navigate`, `highlight` | Keyring 후보 반환 |
| 10 | `3만원 이하 굿즈 추천해줘` | `maxPrice=30000` | 3만원 이하 상품으로 `{상품명}`을 추천해요. | `navigate`, `highlight` | 가격 hard filter 적용 |
| 11 | `5만원 이하 Artist A 굿즈 추천해줘` | artist + `maxPrice=50000` | 5만원 이하 Artist A 상품으로 `{상품명}`을 추천해요. | `navigate`, `highlight` | Artist A + 가격 filter |
| 12 | `품절 아닌 상품 추천해줘` | 판매 가능 상품 | 구매 가능한 상품으로 `{상품명}`을 추천해요. | `navigate`, `highlight` | 판매 가능/재고 있음만 반환 |

### 3.2 장바구니 후속 명령

| # | 사용자 메시지 | 사전 조건 | 예상 응답 | 예상 ACTION | Spring API 기대 |
|---|---------------|-----------|-----------|-------------|-----------------|
| 13 | `이거 장바구니에 담아줘` | 직전 추천 1개 | 방금 추천한 상품을 장바구니에 담을게요. | `addToCart(goodsId)` | 추가 조회 불필요 |
| 14 | `둘 다 담아줘` | 직전 추천 2개 | 방금 추천한 2개 상품을 장바구니에 담을게요. | `addToCart` 2개 | 추가 조회 불필요 |
| 15 | `둘 다 담아줘` | 직전 추천 3개 이상 | 어떤 상품을 담을지 모르겠어요. 1번 2번처럼 번호로 알려주세요. | 없음 | 추가 조회 불필요 |
| 16 | `첫 번째 담아줘` | 직전 추천 2개 이상 | 방금 추천한 상품을 장바구니에 담을게요. | 첫 후보 `addToCart` | 추가 조회 불필요 |
| 17 | `2번 담아줘` | 직전 추천 2개 이상 | 방금 추천한 상품을 장바구니에 담을게요. | 두 번째 후보 `addToCart` | 추가 조회 불필요 |
| 18 | `1번 3번 담아줘` | 직전 추천 3개 이상 | 방금 추천한 2개 상품을 장바구니에 담을게요. | 1번, 3번 `addToCart` | 추가 조회 불필요 |
| 19 | `전부 담아줘` | 직전 추천 있음 | 방금 추천한 `{N}`개 상품을 장바구니에 담을게요. | 후보 전체 `addToCart` | 추가 조회 불필요 |
| 20 | `세 개 다 담아줘` | 직전 추천 3개 | 방금 추천한 3개 상품을 장바구니에 담을게요. | 후보 전체 `addToCart` | 추가 조회 불필요 |
| 21 | `둘 다 담아줘` | 직전 추천 없음 | 담을 상품을 찾지 못했어요. 먼저 추천받을 상품을 알려주세요. | 없음 | 추가 조회 불필요 |

### 3.3 아이돌 팬 예상 요청

| # | 사용자 메시지 | Spring 검색 의도 | 예상 응답 | 예상 ACTION | Spring API 기대 |
|---|---------------|------------------|-----------|-------------|-----------------|
| 22 | `Artist A 포토카드 추천해줘` | artist + category/tag | Artist A 포토카드로 `{상품명}`을 추천해요. | `navigate`, `highlight` | Artist A + Photocard |
| 23 | `Artist B 인형 있어?` | artist + category/tag | Artist B 인형 상품으로 `{상품명}`이 있어요. | `navigate`, `highlight` | Artist B + Plush |
| 24 | `Group One 굿즈 보여줘` | group alias | Group One 관련 상품으로 `{상품명}`을 추천해요. | `navigate`, `highlight` | Group One 후보 |
| 25 | `Group One 포토카드 있어?` | group + category/tag | Group One 포토카드로 `{상품명}`이 있어요. | `navigate`, `highlight` | Group One + Photocard |
| 26 | `내 최애 Artist C 굿즈 추천해줘` | artist alias | Artist C 팬이라면 `{상품명}`을 추천해요. | `navigate`, `highlight` | Artist C 후보 |
| 27 | `응원봉 있어?` | category/tag alias | 응원봉 상품으로 `{상품명}`이 있어요. | `navigate`, `highlight` | Lightstick 후보 |
| 28 | `앨범 추천해줘` | category/tag alias | 앨범 상품으로 `{상품명}`을 추천해요. | `navigate`, `highlight` | Album 후보 |
| 29 | `랜덤 포카 있어?` | tag/category keyword | 랜덤 포토카드 상품으로 `{상품명}`이 있어요. | `navigate`, `highlight` | Random/Photocard 후보 |
| 30 | `생일 선물로 좋은 굿즈 추천해줘` | gift intent | 선물용으로 `{상품명}`을 추천해요. | `navigate`, `highlight` | 인기/가성비 후보 |
| 31 | `입문 팬에게 좋은 굿즈 추천해줘` | beginner intent | 처음 구매하기 좋은 상품으로 `{상품명}`을 추천해요. | `navigate`, `highlight` | 가격/인기 후보 |
| 32 | `소장용 굿즈 추천해줘` | collectible intent | 소장용으로 `{상품명}`을 추천해요. | `navigate`, `highlight` | Photocard/Poster 등 후보 |
| 33 | `가성비 좋은 굿즈 추천해줘` | price-sensitive | 가격 부담이 적은 `{상품명}`을 추천해요. | `navigate`, `highlight` | 낮은 가격 가산 |
| 34 | `비싼 거 말고 추천해줘` | price-sensitive | 부담 적은 가격대의 `{상품명}`을 추천해요. | `navigate`, `highlight` | 낮은 가격 가산 |
| 35 | `제일 저렴한 포토카드 보여줘` | category + price sort | 가장 저렴한 포토카드로 `{상품명}`이 있어요. | `navigate`, `highlight` | `price,asc` 또는 가격 가산 |
| 36 | `품절 아닌 Artist A 상품만 보여줘` | artist + saleable only | 구매 가능한 Artist A 상품으로 `{상품명}`이 있어요. | `navigate`, `highlight` | Artist A + 재고/판매상태 |
| 37 | `새로 나온 굿즈 있어?` | newest sort | 최근 등록된 상품으로 `{상품명}`이 있어요. | `navigate`, `highlight` | 최신순 또는 createdAt 가산 |
| 38 | `베스트셀러 보여줘` | best seller | 베스트셀러 상품으로 `{상품명}`을 추천해요. | `navigate`, `highlight` | best seller 가산 |
| 39 | `지금 살 수 있는 것만 보여줘` | saleable only | 현재 구매 가능한 상품으로 `{상품명}`이 있어요. | `navigate`, `highlight` | 판매 가능/재고 있음 |
| 40 | `포스터랑 포토카드 중 뭐가 좋아?` | compare categories | 소장 목적이면 포토카드, 장식용이면 포스터가 좋아요. `{상품명}`을 추천해요. | 후보 ACTION | Poster/Photocard 후보 |
| 41 | `Artist A랑 Artist B 굿즈 비교해줘` | compare artists | Artist A는 `{상품명}`, Artist B는 `{상품명}`이 있어요. | 후보 ACTION | 두 artist 후보 |
| 42 | `장바구니에 있는 것 빼고 추천해줘` | exclude cart | 이미 담긴 상품은 제외하고 `{상품명}`을 추천해요. | `navigate`, `highlight` | `excludeGoodsIds` 적용 |

### 3.4 실패/복구 시나리오

| # | 사용자 메시지 | 조건 | 예상 응답 | 예상 ACTION | Spring API 기대 |
|---|---------------|------|-----------|-------------|-----------------|
| 43 | `없는아티스트 굿즈 추천해줘` | 후보 0건 | 조건에 맞는 판매 가능한 상품을 찾지 못했어요. 다른 아티스트나 상품 유형으로 다시 찾아볼까요? | 없음 | 빈 page |
| 44 | `포토카드는 누구의 상품이 있어?` | 조사 포함 | 포토카드는 `{artistName 목록}` 상품이 있어요. | 후보 ACTION | `포토카드` alias 복원 |
| 45 | `포토카드가 있어?` | 조사 `가` 포함 | 포토카드 상품으로 `{상품명}`이 있어요. | 후보 ACTION | `포토카드` alias 복원 |
| 46 | `키링은 누구 거 있어?` | 조사 `은` 포함 | 키링은 `{artistName 목록}` 상품이 있어요. | 후보 ACTION | `키링` alias 복원 |
| 47 | `Artist A의 포토카드 있어?` | 소유격 `의` 포함 | Artist A 포토카드로 `{상품명}`이 있어요. | 후보 ACTION | Artist A + Photocard |
| 48 | `추천해줘` | 조건 없음 | 요즘 많이 보는 상품으로 `{상품명}`을 추천해요. | `navigate`, `highlight` | 기본 후보 |
| 49 | `뭐 살까?` | 모호한 추천 | 인기 상품 중 `{상품명}`을 추천해요. | `navigate`, `highlight` | 기본 후보 |
| 50 | `아무거나 담아줘` | 최근 후보 없음 | 먼저 추천받을 상품을 알려주세요. | 없음 | 추가 조회 불필요 |

---

## 4. Spring 상품 API 개선 작업

개선 대상은 `GET /api/goods/recommendation-candidates`입니다.

### 4.1 한국어 조사/어미 정규화

현재 실패하기 쉬운 예:

| 원문 | 추가해야 할 검색 term |
|------|-----------------------|
| `포토카드는` | `포토카드` |
| `포토카드가` | `포토카드` |
| `키링은` | `키링` |
| `상품이` | `상품` |
| `Artist A의` | `Artist A` |

구현 지침:

- 원본 term은 유지합니다.
- 조사 제거 term을 추가합니다.
- multi-word phrase 생성은 유지합니다.
- stopword 제거는 검색 의도 훼손 없이 보수적으로 적용합니다.

권장 조사 후보:

```text
은, 는, 이, 가, 을, 를, 의, 에, 에서, 으로, 로, 과, 와, 도, 만
```

### 4.2 alias 우선 해석

`search_alias` 매칭 결과가 있으면 FK 기반 조건을 우선합니다.

| alias FK | 검색 조건 |
|----------|-----------|
| `artist_id` | `goods.artist_id = artist_id` |
| `group_id` | `goods.artist.group_id = group_id` |
| `category_id` | `goods.category_id = category_id` |
| `tag_id` | `goods_tag.tag_id = tag_id` |

조건 결합:

- 같은 차원의 여러 alias는 OR입니다.
- 서로 다른 차원은 AND입니다.
- 예: `Group One 포토카드` → `group_id = Group One` AND `category/tag = Photocard`

### 4.3 fallback field scoring

alias가 없거나 일부 term만 alias로 잡힌 경우에도 필드 기반 점수 계산을 유지합니다.

대상 필드:

```text
goods.goods_name
artist.artist_name
artist_group.group_name
goods_category.category_name
tag.tag_name
```

SQL 또는 JPA 검색에서 broad match를 쓸 수 있습니다.

```sql
lower(goods.goods_name) like '%' || :term || '%'
or lower(artist.artist_name) like '%' || :term || '%'
or lower(artist_group.group_name) like '%' || :term || '%'
or lower(goods_category.category_name) like '%' || :term || '%'
or lower(tag.tag_name) like '%' || :term || '%'
```

주의:

- broad match는 fallback 또는 relevance scoring 용도입니다.
- alias FK 조건이 잡힌 경우에는 alias 조건을 우선합니다.
- `Artist A` 요청을 `Group One` 전체 요청으로 자동 확장하지 않습니다.

### 4.4 hard filter 유지

아래 조건은 relevance와 무관하게 반드시 제외 조건으로 유지합니다.

- 판매 불가 상품 제외
- 재고 0 이하 제외
- `maxPrice` 초과 제외
- `excludeGoodsIds` 제외
- `size` 최대 20

---

## 5. Spring API 품질 검증용 핵심 케이스

아래 케이스는 Spring 상품 API 담당자가 단위 테스트 또는 통합 테스트로 고정해야 합니다.

| # | 요청 query | 기대 |
|---|------------|------|
| 1 | `q=포토카드 찾아줘` | Photocard 후보 반환 |
| 2 | `q=포토카드는 누구의 상품이 있어?` | `포토카드` alias 인식, Photocard 후보 반환 |
| 3 | `q=포토카드가 있어?` | `포토카드` alias 인식 |
| 4 | `q=Artist A의 포토카드 있어?` | Artist A + Photocard 후보 반환 |
| 5 | `q=키링은 누구 거 있어?` | `키링` alias 인식, Keyring 후보 반환 |
| 6 | `q=Group One 포토카드` | Group One + Photocard 후보 반환 |
| 7 | `q=3만원 이하 포토카드` | `maxPrice=30000` 적용 또는 가격 조건 반영 |
| 8 | `q=품절 아닌 포토카드` | 판매 가능/재고 있음만 반환 |
| 9 | `q=Artist A 상품 추천해줘` | Artist A 직접 상품 우선 |
| 10 | `q=Artist A 관련 굿즈 추천해줘` | Artist A 우선, 부족 시 Group One 보조 가능 |

검증 포인트:

- 0건이면 HTTP 200과 빈 page를 반환합니다.
- 응답은 기존 page shape를 유지합니다.
- `goodsId`, `name`, `price`, `imageUrl`, `tags`는 유지합니다.
- AI용 additive 필드인 `artistName`, `categoryName`, `salesStatus`, `stockCount`, `recommendationReason`, `matchedFields`를 유지합니다.

---

## 6. 완료 기준

Spring 상품 API 개선 완료 기준:

- 조사 포함 질의가 alias로 복원됩니다.
- `artist_id`와 `group_id` 검색 정책이 분리됩니다.
- `Group One 포토카드`처럼 group + category/tag 조합이 반환됩니다.
- `Artist A의 포토카드 있어?`처럼 소유격이 포함된 질의가 반환됩니다.
- hard filter가 유지됩니다.
- AI 서버는 Spring 응답 후보 안에서만 ACTION을 생성합니다.

AI 통합 완료 기준:

- 후보 0건이면 임의 상품을 추천하지 않습니다.
- 후보가 있으면 실제 `goodsId`만 ACTION에 사용합니다.
- “둘 다”, “1번 3번”, “전부” 같은 후속 장바구니 명령은 최근 추천 후보를 기준으로 처리합니다.

---

## 부록 A. DB 검증용 SQL 예시

### A.1 `search_alias` 컬럼 확인

```sql
select
  column_name,
  data_type,
  character_maximum_length as max_length,
  column_default as default_value,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'search_alias'
order by ordinal_position;
```

### A.2 `search_alias` FK/constraint 확인

```sql
select
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.table_schema = kcu.table_schema
left join information_schema.constraint_column_usage ccu
  on tc.constraint_name = ccu.constraint_name
 and tc.table_schema = ccu.table_schema
where tc.table_schema = 'public'
  and tc.table_name = 'search_alias'
order by tc.constraint_type, tc.constraint_name, kcu.ordinal_position;
```

### A.3 alias 차원별 연결 현황

```sql
select
  alias_id,
  alias_text,
  normalized_alias,
  artist_id,
  group_id,
  category_id,
  tag_id
from public.search_alias
order by alias_id;
```

### A.4 artist/group/category/tag 이름 목록

```sql
select artist_id, artist_name, group_id
from public.artist
order by artist_id;

select group_id, group_name
from public.artist_group
order by group_id;

select category_id, category_name
from public.goods_category
order by category_id;

select tag_id, tag_name
from public.tag
order by tag_id;
```

### A.5 추천 검색 대상 상품 확인

```sql
select
  g.goods_id,
  g.goods_name,
  a.artist_name,
  ag.group_name,
  gc.category_name,
  g.price,
  g.sales_status,
  gs.current_stock
from public.goods g
left join public.artist a on a.artist_id = g.artist_id
left join public.artist_group ag on ag.group_id = a.group_id
left join public.goods_category gc on gc.category_id = g.category_id
left join public.goods_stock gs on gs.goods_id = g.goods_id
order by g.goods_id;
```
