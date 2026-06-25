import csv
import json
import re
import time
import unicodedata
from typing import Any, Protocol
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from project_cyan_ai.providers.chat_response import (
    ChatResponseProvider,
    MockChatResponseProvider,
)
from project_cyan_ai.schemas.ws import (
    AddToCartAction,
    FullTextMessage,
    HighlightAction,
    NavigateAction,
)

GOODS_SEARCH_TIMEOUT_SECONDS = 2.0
GOODS_CATALOG_TIMEOUT_SECONDS = 2.0
DEFAULT_CANDIDATE_SIZE = 10
PRODUCT_INTENT_KEYWORDS = (
    "상품",
    "굿즈",
    "추천",
    "포카",
    "포토카드",
    "키링",
    "앨범",
    "인형",
    "장바구니",
    "찾아줘",
    "있어",
)
AVAILABLE_STATUSES = {"", "ON_SALE", "AVAILABLE", "SALE"}
KOREAN_PARTICLES = (
    "에서는",
    "에게서",
    "으로",
    "에서",
    "에게",
    "한테",
    "은",
    "는",
    "이",
    "가",
    "을",
    "를",
    "의",
    "에",
    "로",
    "과",
    "와",
    "도",
    "만",
)
CATEGORY_ALIASES = {
    "photocard": {
        "포토카드",
        "포카",
        "photocard",
        "photo card",
        "card",
    },
    "keyring": {"키링", "keyring", "key ring"},
    "album": {"앨범", "album"},
    "plush": {"인형", "plush", "doll"},
    "poster": {"포스터", "poster"},
    "lightstick": {"응원봉", "lightstick", "light stick"},
    "hoodie": {"후디", "hoodie"},
    "towel": {"타월", "수건", "towel"},
    "stand": {"스탠드", "아크릴", "acrylic", "stand"},
    "hat": {"모자", "버킷햇", "hat", "bucket hat"},
}
TEN_THOUSAND_WON_PATTERN = re.compile(r"(\d+)\s*만\s*원")
WON_PATTERN = re.compile(r"(\d[\d,]*)\s*원")
GOODS_PATH_PATTERN = re.compile(r"^/goods/(\d+)$")
GOODS_SELECTOR_PATTERN = re.compile(r"data-goods-id=['\"](\d+)['\"]")
UNQUALIFIED_ALL_RECOMMENDATION_KEYWORDS = ("전부", "모두", "전체")
FOLLOW_UP_EMPTY_TEXT = "담을 상품을 찾지 못했어요. 먼저 추천받을 상품을 알려주세요."
FOLLOW_UP_AMBIGUOUS_TEXT = "추천한 상품이 여러 개라서 어떤 상품을 담을지 모르겠어요. 1번 2번처럼 번호로 알려주세요."
KOREAN_NUMBER_WORDS = {
    "첫": 1,
    "한": 1,
    "하나": 1,
    "두": 2,
    "둘": 2,
    "세": 3,
    "셋": 3,
    "네": 4,
    "넷": 4,
    "다섯": 5,
    "여섯": 6,
    "일곱": 7,
    "여덟": 8,
    "아홉": 9,
    "열": 10,
    "열한": 11,
    "열하나": 11,
    "열두": 12,
    "열둘": 12,
    "열세": 13,
    "열셋": 13,
    "열네": 14,
    "열넷": 14,
    "열다섯": 15,
    "열여섯": 16,
    "열일곱": 17,
    "열여덟": 18,
    "열아홉": 19,
    "스무": 20,
    "스물": 20,
}
KOREAN_NUMBER_WORD_PATTERN = "|".join(
    re.escape(word)
    for word in sorted(KOREAN_NUMBER_WORDS, key=len, reverse=True)
)
DIGIT_SELECTION_PATTERN = re.compile(r"(\d+)\s*(?:번|번째)")
KOREAN_SELECTION_PATTERN = re.compile(
    rf"({KOREAN_NUMBER_WORD_PATTERN})\s*(?:번째|째)"
)
DIGIT_COUNT_ALL_PATTERN = re.compile(r"(\d+)\s*개\s*다")
KOREAN_COUNT_ALL_PATTERN = re.compile(
    rf"({KOREAN_NUMBER_WORD_PATTERN})\s*(?:개\s*)?다"
)


class GoodsCatalogClient(Protocol):
    def search_candidates(self, text: str) -> list[dict[str, Any]] | None:
        """Return candidates, an empty result, or None when Spring is unavailable."""
        ...


class HttpGoodsCatalogClient:
    def __init__(
        self,
        spring_api_url: str,
        timeout_seconds: float = GOODS_SEARCH_TIMEOUT_SECONDS,
    ):
        self.spring_api_url = spring_api_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    def search_candidates(self, text: str) -> list[dict[str, Any]] | None:
        query = {"q": text, "page": 0, "size": 10, "sort": "relevance,desc"}
        max_price = extract_max_price(text)
        if max_price is not None:
            query["maxPrice"] = max_price

        request = Request(
            f"{self.spring_api_url}/goods/recommendation-candidates?{urlencode(query)}",
            headers={"Accept": "application/json"},
            method="GET",
        )
        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except (HTTPError, TimeoutError, URLError, OSError, ValueError):
            return None

        content = payload.get("content") if isinstance(payload, dict) else None
        return content if isinstance(content, list) else []


class TsvGoodsCatalogClient:
    def __init__(
        self,
        catalog_url: str,
        timeout_seconds: float = GOODS_CATALOG_TIMEOUT_SECONDS,
        cache_ttl_seconds: int = 300,
        candidate_size: int = DEFAULT_CANDIDATE_SIZE,
    ):
        self.catalog_url = catalog_url
        self.timeout_seconds = timeout_seconds
        self.cache_ttl_seconds = max(0, cache_ttl_seconds)
        self.candidate_size = max(1, min(candidate_size, 20))
        self._cached_candidates: list[dict[str, Any]] | None = None
        self._cache_expires_at = 0.0

    def search_candidates(self, text: str) -> list[dict[str, Any]] | None:
        try:
            candidates = self._load_candidates()
        except (OSError, UnicodeDecodeError, csv.Error, ValueError):
            return None

        return filter_tsv_candidates(text, candidates, self.candidate_size)

    def _load_candidates(self) -> list[dict[str, Any]]:
        now = time.monotonic()
        if self._cached_candidates is not None and now < self._cache_expires_at:
            return self._cached_candidates

        raw_tsv = self._read_catalog()
        candidates = parse_goods_catalog_tsv(raw_tsv)
        self._cached_candidates = candidates
        self._cache_expires_at = now + self.cache_ttl_seconds
        return candidates

    def _read_catalog(self) -> str:
        if self.catalog_url.startswith(("http://", "https://")):
            request = Request(
                self.catalog_url,
                headers={"Accept": "text/tab-separated-values,text/plain,*/*"},
                method="GET",
            )
            with urlopen(request, timeout=self.timeout_seconds) as response:
                return response.read().decode("utf-8")

        with open(self.catalog_url, encoding="utf-8") as catalog_file:
            return catalog_file.read()


class MetadataTsvGoodsCatalogClient(TsvGoodsCatalogClient):
    def __init__(
        self,
        metadata_url: str,
        timeout_seconds: float = GOODS_CATALOG_TIMEOUT_SECONDS,
        cache_ttl_seconds: int = 300,
        candidate_size: int = DEFAULT_CANDIDATE_SIZE,
    ):
        super().__init__(
            metadata_url,
            timeout_seconds=timeout_seconds,
            cache_ttl_seconds=cache_ttl_seconds,
            candidate_size=candidate_size,
        )
        self.metadata_url = metadata_url

    def _read_catalog(self) -> str:
        catalog_url = self._read_catalog_url()
        request = Request(
            catalog_url,
            headers={"Accept": "text/tab-separated-values,text/plain,*/*"},
            method="GET",
        )
        with urlopen(request, timeout=self.timeout_seconds) as response:
            return response.read().decode("utf-8")

    def _read_catalog_url(self) -> str:
        request = Request(
            self.metadata_url,
            headers={"Accept": "application/json"},
            method="GET",
        )
        with urlopen(request, timeout=self.timeout_seconds) as response:
            payload = json.loads(response.read().decode("utf-8"))
        catalog_url = payload.get("catalogUrl") if isinstance(payload, dict) else None
        if not isinstance(catalog_url, str) or not catalog_url.strip():
            raise ValueError("Catalog metadata response does not include catalogUrl.")
        return catalog_url


class CatalogGroundedChatResponseProvider:
    def __init__(
        self,
        delegate: ChatResponseProvider,
        catalog_client: GoodsCatalogClient,
    ):
        self.delegate = delegate
        self.catalog_client = catalog_client
        self.recent_recommendation_candidates: list[dict[str, Any]] = []

    def build_response(
        self,
        text: str,
        context: dict[str, Any] | None = None,
    ) -> FullTextMessage:
        follow_up_response = build_follow_up_cart_response(
            text,
            self.recent_recommendation_candidates,
        )
        if follow_up_response is not None:
            return follow_up_response

        if not has_product_intent(text):
            return self.delegate.build_response(text, context)

        candidates = self.catalog_client.search_candidates(text)
        if candidates is None:
            return self.delegate.build_response(text, context)
        self.recent_recommendation_candidates = normalize_recent_candidates(candidates)
        if not candidates:
            return FullTextMessage(
                text="조건에 맞는 판매 가능한 상품을 찾지 못했어요.",
                actions=[],
            )

        if isinstance(self.delegate, MockChatResponseProvider):
            return build_mock_catalog_response(text, candidates)

        prompt = build_catalog_prompt(text, candidates)
        response = self.delegate.build_response(prompt, context)
        allowed_goods_ids = {
            str(candidate["goodsId"])
            for candidate in candidates
            if candidate.get("goodsId") is not None
        }
        return FullTextMessage(
            text=response.text,
            actions=[
                action
                for action in response.actions
                if action_goods_id(action) in allowed_goods_ids
            ],
        )


def has_product_intent(text: str) -> bool:
    return any(keyword in text for keyword in PRODUCT_INTENT_KEYWORDS)


def parse_goods_catalog_tsv(raw_tsv: str) -> list[dict[str, Any]]:
    rows = csv.DictReader(raw_tsv.splitlines(), delimiter="\t")
    candidates: list[dict[str, Any]] = []
    for row in rows:
        if not row:
            continue
        goods_id = first_present(row, "goodsId", "goods_id")
        name = first_present(row, "name", "goodsName", "goods_name")
        if not goods_id or not name:
            continue

        candidate = {
            "goodsId": coerce_int(goods_id),
            "name": name,
            "price": coerce_price(first_present(row, "price")),
            "imageUrl": empty_to_none(first_present(row, "imageUrl", "mainImageUrl", "main_image_url")),
            "tags": parse_tags(first_present(row, "tags", "tagNames", "tag_names")),
            "artistName": empty_to_none(first_present(row, "artistName", "artist_name")),
            "categoryName": empty_to_none(first_present(row, "categoryName", "category_name")),
            "salesStatus": empty_to_none(first_present(row, "salesStatus", "sales_status")),
            "stockCount": coerce_int(first_present(row, "stockCount", "currentStock", "current_stock")),
            "recommendationReason": None,
            "matchedFields": [],
            "groupName": empty_to_none(first_present(row, "groupName", "group_name")),
            "aiPickDefault": coerce_bool(first_present(row, "aiPickDefault", "ai_pick_default")),
            "bestSeller": coerce_bool(first_present(row, "bestSeller", "isBestSeller", "is_best_seller")),
            "description": empty_to_none(first_present(row, "description")),
        }
        candidates.append(candidate)
    return candidates


def filter_tsv_candidates(
    text: str,
    candidates: list[dict[str, Any]],
    candidate_size: int = DEFAULT_CANDIDATE_SIZE,
) -> list[dict[str, Any]]:
    query = build_tsv_query(text, candidates)
    scored_candidates = []
    for candidate in candidates:
        score, matched_fields = score_tsv_candidate(candidate, query)
        if score <= 0:
            continue
        response_candidate = public_candidate(candidate, matched_fields)
        scored_candidates.append((score, response_candidate))

    scored_candidates.sort(
        key=lambda item: (
            -item[0],
            not bool_value(item[1].get("aiPickDefault")),
            not bool_value(item[1].get("bestSeller")),
            int(item[1].get("goodsId") or 0),
        ),
    )
    return [
        strip_internal_candidate_fields(candidate)
        for _, candidate in scored_candidates[:candidate_size]
    ]


def build_tsv_query(text: str, candidates: list[dict[str, Any]]) -> dict[str, Any]:
    normalized_text = normalize_text(text)
    terms = normalized_terms(text)
    category_keys = {
        key
        for key, aliases in CATEGORY_ALIASES.items()
        if any(alias in terms or normalize_text(alias) in normalized_text for alias in aliases)
    }
    artist_names = {
        candidate["artistName"]
        for candidate in candidates
        if candidate.get("artistName")
        and normalize_text(candidate["artistName"]) in normalized_text
    }
    group_names = {
        candidate["groupName"]
        for candidate in candidates
        if candidate.get("groupName")
        and normalize_text(candidate["groupName"]) in normalized_text
    }
    direct_artist_groups = {
        candidate["groupName"]
        for candidate in candidates
        if candidate.get("artistName") in artist_names and candidate.get("groupName")
    }
    return {
        "text": normalized_text,
        "terms": terms,
        "categoryKeys": category_keys,
        "artistNames": artist_names,
        "groupNames": group_names,
        "relatedArtist": "관련" in normalized_text,
        "directArtistGroups": direct_artist_groups,
        "maxPrice": extract_max_price(text),
        "requiresAvailable": requires_available_filter(normalized_text),
        "hasConditions": bool(category_keys or artist_names or group_names or extract_max_price(text)),
    }


def score_tsv_candidate(
    candidate: dict[str, Any],
    query: dict[str, Any],
) -> tuple[int, list[str]]:
    if not is_available_candidate(candidate):
        return 0, []
    max_price = query["maxPrice"]
    price = candidate.get("price")
    if max_price is not None and price is not None and price > max_price:
        return 0, []

    matched_fields: set[str] = set()
    score = 0

    artist_names = query["artistNames"]
    group_names = query["groupNames"]
    category_keys = query["categoryKeys"]
    related_artist = query["relatedArtist"]

    if artist_names:
        if candidate.get("artistName") in artist_names:
            score += 120
            matched_fields.add("artistName")
        elif related_artist and candidate.get("groupName") in query["directArtistGroups"]:
            score += 45
            matched_fields.add("artistGroup")
        else:
            return 0, []

    if group_names:
        if candidate.get("groupName") in group_names:
            score += 100
            matched_fields.add("artistGroup")
        else:
            return 0, []

    if category_keys:
        if candidate_matches_category(candidate, category_keys):
            score += 90
            matched_fields.update(category_matched_fields(candidate, category_keys))
        else:
            return 0, []

    for term in query["terms"]:
        field_score, field_matches = score_term_match(candidate, term)
        score += field_score
        matched_fields.update(field_matches)

    if max_price is not None and price is not None:
        score += max(1, 8 - abs(max_price - price) // 10_000)
        matched_fields.add("price")

    if not query["hasConditions"] and not matched_fields:
        score += 10
        matched_fields.add("name")

    if bool_value(candidate.get("aiPickDefault")):
        score += 8
    if bool_value(candidate.get("bestSeller")):
        score += 6

    return score, sorted(matched_fields)


def score_term_match(candidate: dict[str, Any], term: str) -> tuple[int, set[str]]:
    if len(term) < 2 or term in {"상품", "굿즈", "추천", "찾아줘", "있어", "누구", "거", "관련"}:
        return 0, set()

    score = 0
    matched_fields: set[str] = set()
    fields = (
        ("name", candidate.get("name")),
        ("artistName", candidate.get("artistName")),
        ("artistGroup", candidate.get("groupName")),
        ("categoryName", candidate.get("categoryName")),
        ("description", candidate.get("description")),
    )
    for field_name, value in fields:
        normalized_value = normalize_text(value or "")
        if term and term in normalized_value:
            score += 35 if field_name != "description" else 8
            matched_fields.add(field_name)

    normalized_tags = [normalize_text(tag) for tag in candidate.get("tags") or []]
    if any(term in tag or tag in term for tag in normalized_tags):
        score += 40
        matched_fields.add("tags")

    return score, matched_fields


def candidate_matches_category(candidate: dict[str, Any], category_keys: set[str]) -> bool:
    candidate_terms = {
        normalize_text(candidate.get("categoryName") or ""),
        *(normalize_text(tag) for tag in candidate.get("tags") or []),
        normalize_text(candidate.get("name") or ""),
    }
    for key in category_keys:
        aliases = {normalize_text(alias) for alias in CATEGORY_ALIASES[key]}
        if any(
            alias in candidate_term or candidate_term in aliases
            for alias in aliases
            for candidate_term in candidate_terms
            if candidate_term
        ):
            return True
    return False


def category_matched_fields(candidate: dict[str, Any], category_keys: set[str]) -> set[str]:
    matched_fields = set()
    category_name = normalize_text(candidate.get("categoryName") or "")
    tags = [normalize_text(tag) for tag in candidate.get("tags") or []]
    for key in category_keys:
        aliases = {normalize_text(alias) for alias in CATEGORY_ALIASES[key]}
        if any(alias in category_name or category_name == alias for alias in aliases):
            matched_fields.add("categoryName")
        if any(any(alias in tag or tag in aliases for alias in aliases) for tag in tags):
            matched_fields.add("tags")
    return matched_fields or {"name"}


def is_available_candidate(candidate: dict[str, Any]) -> bool:
    status = normalize_text(candidate.get("salesStatus") or "").upper()
    if status not in AVAILABLE_STATUSES:
        return False
    stock_count = candidate.get("stockCount")
    return stock_count is None or stock_count > 0


def requires_available_filter(normalized_text: str) -> bool:
    return any(keyword in normalized_text for keyword in ("품절 아닌", "살 수", "구매 가능"))


def normalized_terms(text: str) -> set[str]:
    normalized = normalize_text(text)
    tokens = [strip_korean_particle(token) for token in re.split(r"[\s,]+", normalized)]
    tokens = [token for token in tokens if token]
    terms = set(tokens)
    for start in range(len(tokens)):
        phrase = []
        for end in range(start, min(len(tokens), start + 4)):
            phrase.append(tokens[end])
            terms.add(" ".join(phrase))
    return terms


def strip_korean_particle(token: str) -> str:
    for particle in KOREAN_PARTICLES:
        if token.endswith(particle) and len(token) > len(particle):
            return token[: -len(particle)]
    return token


def normalize_text(value: str) -> str:
    return re.sub(
        r"\s+",
        " ",
        unicodedata.normalize("NFKC", str(value or "")).strip().lower(),
    )


def public_candidate(candidate: dict[str, Any], matched_fields: list[str]) -> dict[str, Any]:
    response_candidate = dict(candidate)
    response_candidate["matchedFields"] = matched_fields
    response_candidate["recommendationReason"] = recommendation_reason(matched_fields)
    return response_candidate


def strip_internal_candidate_fields(candidate: dict[str, Any]) -> dict[str, Any]:
    return {
        key: candidate.get(key)
        for key in (
            "goodsId",
            "name",
            "price",
            "imageUrl",
            "tags",
            "artistName",
            "categoryName",
            "salesStatus",
            "stockCount",
            "recommendationReason",
            "matchedFields",
        )
    }


def recommendation_reason(matched_fields: list[str]) -> str:
    if not matched_fields:
        return "추천 우선순위가 높은 판매 가능 상품입니다."
    return ", ".join(matched_fields) + " 조건과 일치하는 상품입니다."


def first_present(row: dict[str, Any], *keys: str) -> str | None:
    for key in keys:
        value = row.get(key)
        if value is not None and str(value).strip() != "":
            return str(value).strip()
    return None


def empty_to_none(value: str | None) -> str | None:
    if value is None or value.strip() == "":
        return None
    return value


def parse_tags(value: str | None) -> list[str]:
    if not value:
        return []
    return [tag.strip() for tag in re.split(r"[,|]", value) if tag.strip()]


def coerce_price(value: str | None) -> int | None:
    if value is None:
        return None
    try:
        return int(float(value.replace(",", "")))
    except ValueError:
        return None


def coerce_int(value: str | None) -> int | None:
    if value is None:
        return None
    try:
        return int(float(value.replace(",", "")))
    except ValueError:
        return None


def coerce_bool(value: str | None) -> bool:
    return str(value or "").strip().lower() in {"true", "1", "yes", "y"}


def bool_value(value: Any) -> bool:
    return value is True or str(value).strip().lower() in {"true", "1", "yes", "y"}


def build_follow_up_cart_response(
    text: str,
    recent_candidates: list[dict[str, Any]],
) -> FullTextMessage | None:
    result = select_follow_up_candidates(text, recent_candidates)
    if result is None:
        return None

    status, selection = result
    if status == "ambiguous":
        return FullTextMessage(text=FOLLOW_UP_AMBIGUOUS_TEXT, actions=[])

    if not selection:
        return FullTextMessage(text=FOLLOW_UP_EMPTY_TEXT, actions=[])

    count = len(selection)
    response_text = (
        "방금 추천한 상품을 장바구니에 담을게요."
        if count == 1
        else f"방금 추천한 {count}개 상품을 장바구니에 담을게요."
    )
    return FullTextMessage(
        text=response_text,
        actions=[AddToCartAction(goodsId=str(candidate["goodsId"])) for candidate in selection],
    )


def select_follow_up_candidates(
    text: str,
    recent_candidates: list[dict[str, Any]],
) -> tuple[str, list[dict[str, Any]]] | None:
    normalized_text = re.sub(r"\s+", " ", text.strip().lower())
    if not is_cart_follow_up_text(normalized_text):
        return None

    selected_indexes = extract_selected_indexes(normalized_text)
    if selected_indexes:
        return "selected", [
            recent_candidates[index]
            for index in selected_indexes
            if index < len(recent_candidates)
        ]

    expected_count = extract_count_qualified_all(normalized_text)
    if expected_count is not None:
        if not recent_candidates:
            return "selected", []
        if expected_count == len(recent_candidates):
            return "selected", recent_candidates
        return "ambiguous", []

    if any(keyword in normalized_text for keyword in UNQUALIFIED_ALL_RECOMMENDATION_KEYWORDS):
        return "selected", recent_candidates

    return None


def extract_selected_indexes(normalized_text: str) -> list[int]:
    numbers = [
        int(match.group(1))
        for match in DIGIT_SELECTION_PATTERN.finditer(normalized_text)
    ]
    numbers.extend(
        KOREAN_NUMBER_WORDS[match.group(1)]
        for match in KOREAN_SELECTION_PATTERN.finditer(normalized_text)
    )
    return to_zero_based_unique_indexes(numbers)


def extract_count_qualified_all(normalized_text: str) -> int | None:
    digit_match = DIGIT_COUNT_ALL_PATTERN.search(normalized_text)
    if digit_match:
        return int(digit_match.group(1))

    korean_match = KOREAN_COUNT_ALL_PATTERN.search(normalized_text)
    if korean_match:
        return KOREAN_NUMBER_WORDS[korean_match.group(1)]

    return None


def to_zero_based_unique_indexes(numbers: list[int]) -> list[int]:
    indexes = []
    seen = set()
    for number in numbers:
        index = number - 1
        if index < 0 or index in seen:
            continue
        indexes.append(index)
        seen.add(index)
    return indexes


def is_cart_follow_up_text(normalized_text: str) -> bool:
    return "담" in normalized_text or "장바구니" in normalized_text


def normalize_recent_candidates(candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    recent_candidates = []
    for candidate in candidates:
        if candidate.get("goodsId") is None:
            continue
        recent_candidates.append(
            {
                key: candidate.get(key)
                for key in (
                    "goodsId",
                    "name",
                    "price",
                    "tags",
                    "artistName",
                    "categoryName",
                )
            }
        )
    return recent_candidates


def extract_max_price(text: str) -> int | None:
    ten_thousand_match = TEN_THOUSAND_WON_PATTERN.search(text)
    if ten_thousand_match:
        return int(ten_thousand_match.group(1)) * 10_000

    won_match = WON_PATTERN.search(text)
    if won_match:
        return int(won_match.group(1).replace(",", ""))

    return None


def build_catalog_prompt(text: str, candidates: list[dict[str, Any]]) -> str:
    compact_candidates = [
        {
            key: candidate.get(key)
            for key in (
                "goodsId",
                "name",
                "price",
                "tags",
                "artistName",
                "categoryName",
                "stockCount",
                "recommendationReason",
            )
        }
        for candidate in candidates
    ]
    return (
        f"사용자 요청:\n{text}\n\n"
        "Spring 상품 API가 반환한 추천 가능 상품 JSON:\n"
        f"{json.dumps(compact_candidates, ensure_ascii=False)}\n\n"
        "위 JSON 안의 상품만 추천하세요. JSON에 없는 goodsId를 만들지 마세요. "
        "추천 시 실제 goodsId로 ACTION 태그를 생성하세요."
    )


def build_mock_catalog_response(
    text: str,
    candidates: list[dict[str, Any]],
) -> FullTextMessage:
    first = candidates[0]
    goods_id = str(first["goodsId"])
    actions = [
        NavigateAction(path=f"/goods/{goods_id}"),
        HighlightAction(selector=f"[data-goods-id='{goods_id}']"),
    ]
    if "장바구니" in text or "담아" in text:
        actions.append(AddToCartAction(goodsId=goods_id))
    return FullTextMessage(
        text=f"{first.get('name', '추천 상품')}을 추천해요.",
        actions=actions,
    )


def action_goods_id(action: Any) -> str | None:
    if isinstance(action, AddToCartAction):
        return action.goodsId
    if isinstance(action, NavigateAction):
        match = GOODS_PATH_PATTERN.match(action.path)
        return match.group(1) if match else None
    if isinstance(action, HighlightAction):
        match = GOODS_SELECTOR_PATTERN.search(action.selector)
        return match.group(1) if match else None
    return None
