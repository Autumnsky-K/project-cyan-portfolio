import csv
import json
import re
import time
import unicodedata
from typing import Any, Protocol
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from project_cyan_ai.embeddings import OpenAiEmbeddingsClient
from project_cyan_ai.favorite_artists import favorite_artist_ids
from project_cyan_ai.goods_filter_extraction import GoodsFilterExtractionProvider
from project_cyan_ai.navigation_intent import build_navigation_response
from project_cyan_ai.personalization_context import build_personalized_prompt
from project_cyan_ai.providers.chat_response import (
    ChatResponseProvider,
    MockChatResponseProvider,
)
from project_cyan_ai.schemas.ws import (
    AddToCartAction,
    FullTextMessage,
    HighlightAction,
    NavigateAction,
    ShowRecommendationsAction,
)

GOODS_SEARCH_TIMEOUT_SECONDS = 2.0
GOODS_CATALOG_TIMEOUT_SECONDS = 2.0
DEFAULT_CANDIDATE_SIZE = 10
MAX_RECOMMENDATION_HISTORY_TURNS = 10
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
GENERIC_RECOMMENDATION_TERMS = {
    *PRODUCT_INTENT_KEYWORDS,
    "추천해줘",
    "보여줘",
    "찾아줘",
}
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
FOLLOW_UP_NAVIGATION_EMPTY_TEXT = "먼저 추천받을 상품을 알려주세요."
RECOMMENDATION_RECALL_EMPTY_TEXT = "아직 다시 보여드릴 추천 이력이 없어요. 원하시면 지금 상품을 추천해드릴게요."
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
    def search_candidates(
        self,
        text: str,
        favorite_artists: list[dict[str, Any]] | None = None,
        category_name: str | None = None,
        artist_name: str | None = None,
    ) -> list[dict[str, Any]] | None:
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

    def search_candidates(
        self,
        text: str,
        favorite_artists: list[dict[str, Any]] | None = None,
        category_name: str | None = None,
        artist_name: str | None = None,
    ) -> list[dict[str, Any]] | None:
        query = {"q": text, "page": 0, "size": 10, "sort": "relevance,desc"}
        max_price = extract_max_price(text)
        if max_price is not None:
            query["maxPrice"] = max_price
        if category_name:
            query["categoryName"] = category_name
        if artist_name:
            query["artistName"] = artist_name
        preferred_artist_ids = favorite_artist_ids(favorite_artists)
        if preferred_artist_ids:
            query["preferredArtistIds"] = ",".join(
                str(artist_id) for artist_id in preferred_artist_ids
            )

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


def build_runtime_goods_catalog_client(spring_api_url: str) -> HttpGoodsCatalogClient:
    """Build the single catalog source shared by admin trace and client chat."""
    return HttpGoodsCatalogClient(spring_api_url)


class HttpSemanticGoodsCatalogClient:
    def __init__(
        self,
        spring_api_url: str,
        embeddings_client: OpenAiEmbeddingsClient,
        timeout_seconds: float = GOODS_SEARCH_TIMEOUT_SECONDS,
        candidate_size: int = DEFAULT_CANDIDATE_SIZE,
    ):
        self.spring_api_url = spring_api_url.rstrip("/")
        self.embeddings_client = embeddings_client
        self.timeout_seconds = timeout_seconds
        self.candidate_size = candidate_size

    def search_candidates(
        self,
        text: str,
        favorite_artists: list[dict[str, Any]] | None = None,
        category_name: str | None = None,
        artist_name: str | None = None,
    ) -> list[dict[str, Any]] | None:
        query_embedding = self.embeddings_client.embed(text)
        if query_embedding is None:
            return None

        payload: dict[str, Any] = {
            "queryEmbedding": query_embedding,
            "size": self.candidate_size,
        }
        if category_name:
            payload["categoryName"] = category_name
        if artist_name:
            payload["artistName"] = artist_name
        max_price = extract_max_price(text)
        if max_price is not None:
            payload["maxPrice"] = max_price
        preferred_artist_ids = favorite_artist_ids(favorite_artists)
        if preferred_artist_ids:
            payload["preferredArtistIds"] = preferred_artist_ids

        request = Request(
            f"{self.spring_api_url}/goods/recommendation-candidates/semantic-search",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json; charset=utf-8",
                "Accept": "application/json",
            },
            method="POST",
        )
        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                response_payload = json.loads(response.read().decode("utf-8"))
        except (HTTPError, TimeoutError, URLError, OSError, ValueError):
            return None

        content = response_payload.get("content") if isinstance(response_payload, dict) else None
        return content if isinstance(content, list) else []


def build_semantic_or_fallback_goods_catalog_client(
    spring_api_url: str,
    openai_embeddings_api_key: str | None,
    openai_embeddings_base_url: str,
    openai_embeddings_model: str,
) -> GoodsCatalogClient:
    """Use semantic search when an embeddings API key is configured, else fall back
    to the existing keyword-matching endpoint with no code changes needed to roll back."""
    if not openai_embeddings_api_key:
        return build_runtime_goods_catalog_client(spring_api_url)
    embeddings_client = OpenAiEmbeddingsClient(
        base_url=openai_embeddings_base_url,
        api_key=openai_embeddings_api_key,
        model=openai_embeddings_model,
    )
    return HttpSemanticGoodsCatalogClient(spring_api_url, embeddings_client)


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

    def search_candidates(
        self,
        text: str,
        favorite_artists: list[dict[str, Any]] | None = None,
        category_name: str | None = None,
        artist_name: str | None = None,
    ) -> list[dict[str, Any]] | None:
        try:
            candidates = self._load_candidates()
        except (OSError, UnicodeDecodeError, csv.Error, ValueError):
            return None

        return filter_tsv_candidates(
            text,
            candidates,
            self.candidate_size,
            favorite_artists,
        )

    def load_all_candidates(self) -> list[dict[str, Any]]:
        """Return the full unfiltered catalog, for batch jobs rather than chat search."""
        return self._load_candidates()

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
        filter_extraction_provider: GoodsFilterExtractionProvider | None = None,
    ):
        self.delegate = delegate
        self.catalog_client = catalog_client
        self.filter_extraction_provider = filter_extraction_provider
        self.recent_recommendation_candidates: list[dict[str, Any]] = []
        self.recommendation_history: list[dict[str, Any]] = []

    def clear_connection_context(self) -> None:
        self.recent_recommendation_candidates = []
        self.recommendation_history = []

    def build_response(
        self,
        text: str,
        context: dict[str, Any] | None = None,
        favorite_artists: list[dict[str, Any]] | None = None,
        personalization_context: dict[str, Any] | None = None,
        response_instruction: str = "",
    ) -> FullTextMessage:
        if not self.recent_recommendation_candidates:
            self.recent_recommendation_candidates = recent_candidates_from_context(context)
        numbered_follow_up_response = build_numbered_follow_up_response(
            text,
            self.recent_recommendation_candidates,
        )
        if numbered_follow_up_response is not None:
            return numbered_follow_up_response
        recall_result = build_recommendation_recall_response(
            text,
            self.recommendation_history,
        )
        if recall_result is not None:
            recall_response, recalled_candidates = recall_result
            if recalled_candidates:
                self.recent_recommendation_candidates = normalize_recent_candidates(
                    recalled_candidates
                )
            return recall_response
        navigation_response = build_navigation_response(text, context, self.delegate)
        if navigation_response is not None:
            return navigation_response
        follow_up_response = build_follow_up_cart_response(
            text,
            self.recent_recommendation_candidates,
        )
        if follow_up_response is not None:
            return follow_up_response

        if not has_product_intent(text):
            return self.delegate.build_response(
                self._with_instruction(
                    self._personalized_text(text, personalization_context),
                    response_instruction,
                ),
                context,
            )

        extracted_filters = (
            self.filter_extraction_provider.extract_filters(text)
            if self.filter_extraction_provider is not None
            else {}
        )
        candidates = self.catalog_client.search_candidates(
            text,
            favorite_artists,
            category_name=extracted_filters.get("categoryName"),
            artist_name=extracted_filters.get("artistName"),
        )
        if candidates is None:
            return self.delegate.build_response(
                self._with_instruction(
                    self._personalized_text(text, personalization_context),
                    response_instruction,
                ),
                context,
            )
        if not candidates:
            return FullTextMessage(
                text="조건에 맞는 판매 가능한 상품을 찾지 못했어요.",
                actions=[],
            )
        recommended_candidates = candidates[:3]
        self.recent_recommendation_candidates = normalize_recent_candidates(
            recommended_candidates
        )
        self.recommendation_history = append_recommendation_history_turn(
            self.recommendation_history,
            text,
            self.recent_recommendation_candidates,
        )

        if isinstance(self.delegate, MockChatResponseProvider):
            return build_mock_catalog_response(text, recommended_candidates)

        prompt = build_personalized_prompt(
            build_catalog_prompt(text, recommended_candidates, favorite_artists),
            personalization_context,
        )
        prompt = self._with_instruction(prompt, response_instruction)
        response = self.delegate.build_response(prompt, context)
        allowed_goods_ids = {
            str(candidate["goodsId"])
            for candidate in recommended_candidates
            if candidate.get("goodsId") is not None
        }
        return FullTextMessage(
            text=response.text,
            actions=merge_candidate_actions(
                [
                    action
                    for action in response.actions
                    if action_goods_id(action) in allowed_goods_ids
                ],
                recommended_candidates,
            ),
            metadata={
                **response.metadata,
                **recommendation_metadata(recommended_candidates),
            },
        )

    def _with_instruction(self, text: str, instruction: str) -> str:
        if not instruction.strip() or isinstance(self.delegate, MockChatResponseProvider):
            return text
        return f"{text}\n\n{instruction.strip()}"

    def _personalized_text(
        self,
        text: str,
        personalization_context: dict[str, Any] | None,
    ) -> str:
        if isinstance(self.delegate, MockChatResponseProvider):
            return text
        return build_personalized_prompt(text, personalization_context)


def recent_candidates_from_context(
    context: dict[str, Any] | Any | None,
) -> list[dict[str, Any]]:
    if context is None:
        return []
    recommendations = (
        context.get("recentRecommendations")
        if isinstance(context, dict)
        else getattr(context, "recentRecommendations", None)
    )
    if not isinstance(recommendations, list):
        return []
    normalized = []
    for recommendation in recommendations:
        goods_id = (
            recommendation.get("goodsId")
            if isinstance(recommendation, dict)
            else getattr(recommendation, "goodsId", None)
        )
        if goods_id is None or not str(goods_id).isdigit():
            continue
        rank_order = (
            recommendation.get("rankOrder")
            if isinstance(recommendation, dict)
            else getattr(recommendation, "rankOrder", None)
        )
        normalized.append({"goodsId": goods_id, "rankOrder": rank_order})
    return sorted(
        normalized,
        key=lambda candidate: (
            candidate["rankOrder"] is None,
            candidate["rankOrder"] if candidate["rankOrder"] is not None else 0,
        ),
    )


def append_recommendation_history_turn(
    history: list[dict[str, Any]],
    request_text: str,
    candidates: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    if not candidates:
        return history
    next_history = [
        *history,
        {
            "requestText": request_text,
            "candidates": [dict(candidate) for candidate in candidates],
        },
    ]
    return next_history[-MAX_RECOMMENDATION_HISTORY_TURNS:]


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
            "artistId": coerce_int(first_present(row, "artistId", "artist_id")),
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
    favorite_artists: list[dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    query = build_tsv_query(text, candidates)
    preferred_artist_ids = set(favorite_artist_ids(favorite_artists))
    scored_candidates = []
    for candidate in candidates:
        score, matched_fields = score_tsv_candidate(candidate, query)
        has_query_match = score > 0
        if not has_query_match and has_specific_tsv_query(query):
            continue
        if candidate.get("artistId") in preferred_artist_ids:
            score += 20
            matched_fields = set(matched_fields)
            matched_fields.add("preferredArtist")
            matched_fields = sorted(matched_fields)
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


def has_specific_tsv_query(query: dict[str, Any]) -> bool:
    if query["artistNames"] or query["groupNames"] or query["categoryKeys"]:
        return True
    return any(not is_generic_recommendation_term(term) for term in query["terms"])


def is_generic_recommendation_term(term: str) -> bool:
    words = [
        word
        for word in normalize_text(term).split()
        if word
    ]
    return bool(words) and all(word in GENERIC_RECOMMENDATION_TERMS for word in words)


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
    inferred_artist_names = infer_artist_names_from_distinctive_terms(
        terms,
        candidates,
        category_keys,
    )
    if inferred_artist_names:
        artist_names.update(inferred_artist_names)
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


def infer_artist_names_from_distinctive_terms(
    terms: set[str],
    candidates: list[dict[str, Any]],
    category_keys: set[str],
) -> set[str]:
    ignored_terms = ignored_artist_inference_terms(category_keys)
    matched_artist_names: set[str] = set()

    for term in terms:
        if len(term) < 2 or term in ignored_terms:
            continue

        term_artist_names = {
            candidate["artistName"]
            for candidate in candidates
            if candidate.get("artistName")
            and candidate_matches_distinctive_term(candidate, term)
        }
        if len(term_artist_names) == 1:
            matched_artist_names.update(term_artist_names)

    return matched_artist_names


def ignored_artist_inference_terms(category_keys: set[str]) -> set[str]:
    ignored_terms = {
        "상품",
        "굿즈",
        "추천",
        "찾아줘",
        "있어",
        "누구",
        "거",
        "관련",
        "품절",
        "아닌",
        "가능",
        "구매",
        "살",
        "수",
    }
    for category_key in category_keys:
        ignored_terms.update(normalize_text(alias) for alias in CATEGORY_ALIASES[category_key])
    return ignored_terms


def candidate_matches_distinctive_term(candidate: dict[str, Any], term: str) -> bool:
    fields = (
        candidate.get("name"),
        candidate.get("description"),
    )
    return any(term in normalize_text(value or "") for value in fields)


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
            "artistId",
            "artistName",
            "groupName",
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


def build_numbered_follow_up_response(
    text: str,
    recent_candidates: list[dict[str, Any]],
) -> FullTextMessage | None:
    normalized_text = re.sub(r"\s+", " ", text.strip().lower())
    selected_indexes = extract_selected_indexes(normalized_text)
    if not selected_indexes:
        return None

    is_cart_action = is_cart_add_text(normalized_text)
    is_navigation_action = is_recommendation_navigation_text(normalized_text)
    if not is_cart_action and not is_navigation_action:
        return None

    if not recent_candidates:
        return FullTextMessage(
            text=FOLLOW_UP_EMPTY_TEXT if is_cart_action else FOLLOW_UP_NAVIGATION_EMPTY_TEXT,
            actions=[],
        )
    if any(index >= len(recent_candidates) for index in selected_indexes):
        return FullTextMessage(
            text=f"추천 상품은 {len(recent_candidates)}개예요.",
            actions=[],
        )

    selection = [recent_candidates[index] for index in selected_indexes]
    if is_cart_action:
        count = len(selection)
        return FullTextMessage(
            text=(
                "방금 추천한 상품을 장바구니에 담을게요."
                if count == 1
                else f"방금 추천한 {count}개 상품을 장바구니에 담을게요."
            ),
            actions=[
                AddToCartAction(goodsId=str(candidate["goodsId"]))
                for candidate in selection
            ],
        )

    goods_ids = [str(candidate["goodsId"]) for candidate in selection]
    if len(goods_ids) == 1:
        return FullTextMessage(
            text="선택한 추천 상품으로 이동할게요.",
            actions=[NavigateAction(path=f"/goods/{goods_ids[0]}")],
        )
    return FullTextMessage(
        text=f"선택한 {len(goods_ids)}개 추천 상품을 보여드릴게요.",
        actions=[ShowRecommendationsAction(goodsIds=goods_ids)],
    )


def build_recommendation_recall_response(
    text: str,
    recommendation_history: list[dict[str, Any]],
) -> tuple[FullTextMessage, list[dict[str, Any]]] | None:
    reference = recommendation_recall_reference(text)
    if reference is None:
        return None
    if not recommendation_history:
        return FullTextMessage(text=RECOMMENDATION_RECALL_EMPTY_TEXT, actions=[]), []

    turn = recommendation_history[0] if reference == "first" else recommendation_history[-1]
    candidates = [
        candidate
        for candidate in turn.get("candidates", [])
        if isinstance(candidate, dict) and candidate.get("goodsId") is not None
    ]
    if not candidates:
        return FullTextMessage(text=RECOMMENDATION_RECALL_EMPTY_TEXT, actions=[]), []

    count = len(candidates)
    label = "처음" if reference == "first" else "마지막으로"
    text_count = "상품을" if count == 1 else f"{count}개 상품을"
    return (
        FullTextMessage(
            text=f"{label} 추천드린 {text_count} 다시 보여드릴게요.",
            actions=default_candidate_actions(candidates),
        ),
        candidates,
    )


def recommendation_recall_reference(text: str) -> str | None:
    normalized_text = re.sub(r"\s+", " ", text.strip().lower())
    if not is_recommendation_recall_text(normalized_text):
        return None
    if any(keyword in normalized_text for keyword in ("처음", "맨 처음", "첫 추천")):
        return "first"
    if any(keyword in normalized_text for keyword in ("방금", "최근", "마지막", "아까")):
        return "latest"
    return None


def is_recommendation_recall_text(normalized_text: str) -> bool:
    has_recommendation_reference = (
        "추천" in normalized_text
        and any(keyword in normalized_text for keyword in ("처음", "맨 처음", "첫", "방금", "최근", "마지막", "아까"))
    )
    has_show_request = any(keyword in normalized_text for keyword in ("다시", "보여", "알려", "꺼내"))
    has_cart_request = is_cart_add_text(normalized_text) or "장바구니" in normalized_text
    return has_recommendation_reference and has_show_request and not has_cart_request


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


def is_cart_add_text(normalized_text: str) -> bool:
    return any(keyword in normalized_text for keyword in ("담", "넣어", "추가"))


def is_recommendation_navigation_text(normalized_text: str) -> bool:
    return any(
        keyword in normalized_text
        for keyword in ("이동", "보여", "열어", "가줘", "가 주세요")
    )


def is_numbered_recommendation_follow_up(text: str) -> bool:
    normalized_text = re.sub(r"\s+", " ", text.strip().lower())
    return bool(extract_selected_indexes(normalized_text)) and (
        is_cart_add_text(normalized_text)
        or is_recommendation_navigation_text(normalized_text)
    )


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
                    "groupName",
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


def build_catalog_prompt(
    text: str,
    candidates: list[dict[str, Any]],
    favorite_artists: list[dict[str, Any]] | None = None,
) -> str:
    compact_candidates = [
        {
            key: candidate.get(key)
            for key in (
                "goodsId",
                "name",
                "price",
                "tags",
                "artistId",
                "artistName",
                "groupName",
                "categoryName",
                "stockCount",
                "recommendationReason",
            )
        }
        for candidate in candidates
    ]
    compact_favorite_artists = [
        {
            "artistId": artist.get("artistId"),
            "name": artist.get("name"),
        }
        for artist in favorite_artists or []
        if isinstance(artist, dict) and artist.get("artistId") is not None
    ]
    favorite_artist_section = (
        "회원 선호 아티스트 JSON:\n"
        f"{json.dumps(compact_favorite_artists, ensure_ascii=False)}\n\n"
        if compact_favorite_artists
        else ""
    )
    return (
        f"사용자 요청:\n{text}\n\n"
        f"{favorite_artist_section}"
        "Spring 상품 API가 반환한 추천 가능 상품 JSON:\n"
        f"{json.dumps(compact_candidates, ensure_ascii=False)}\n\n"
        "위 JSON 안의 상품만 추천하세요. JSON에 없는 goodsId를 만들지 마세요. "
        "추천 시 실제 goodsId로 ACTION 태그를 생성하세요. "
        "형식은 반드시 [ACTION:navigate path=\"/goods/{goodsId}\"] 또는 "
        "[ACTION:highlight selector=\"[data-goods-id='{goodsId}']\"] 입니다. "
        "[ACTION:{goodsId}]처럼 숫자만 넣은 태그는 절대 쓰지 마세요."
    )


def default_candidate_actions(
    candidates: list[dict[str, Any]],
) -> list[NavigateAction | HighlightAction | ShowRecommendationsAction]:
    goods_ids = [
        str(candidate["goodsId"])
        for candidate in candidates
        if candidate.get("goodsId") is not None and str(candidate["goodsId"]).isdigit()
    ]
    if len(goods_ids) >= 2:
        return [ShowRecommendationsAction(goodsIds=goods_ids)]

    actions: list[NavigateAction | HighlightAction] = []
    for index, candidate in enumerate(candidates):
        goods_id = candidate.get("goodsId")
        if goods_id is None:
            continue
        normalized_goods_id = str(goods_id)
        if not normalized_goods_id.isdigit():
            continue
        if index == 0:
            actions.append(NavigateAction(path=f"/goods/{normalized_goods_id}"))
        actions.append(HighlightAction(selector=f"[data-goods-id='{normalized_goods_id}']"))
    return actions


def recommendation_metadata(candidates: list[dict[str, Any]]) -> dict[str, Any]:
    recommendations = []
    for rank_order, candidate in enumerate(candidates[:3]):
        goods_id = candidate.get("goodsId")
        if goods_id is None:
            continue
        recommendations.append(
            {
                "goodsId": goods_id,
                "recommendationReason": candidate.get("recommendationReason"),
                "rankOrder": rank_order,
            }
        )
    return {"recommendations": recommendations} if recommendations else {}


def merge_candidate_actions(
    actions: list[Any],
    candidates: list[dict[str, Any]],
) -> list[Any]:
    if len(candidates) >= 2:
        return [
            *default_candidate_actions(candidates),
            *[action for action in actions if isinstance(action, AddToCartAction)],
        ]

    merged_actions = limit_navigate_actions(actions)
    existing_keys = {
        (action.__class__.__name__, action_goods_id(action))
        for action in merged_actions
    }
    for action in default_candidate_actions(candidates):
        key = (action.__class__.__name__, action_goods_id(action))
        if key not in existing_keys:
            merged_actions.append(action)
            existing_keys.add(key)
    return limit_navigate_actions(merged_actions)


def limit_navigate_actions(actions: list[Any]) -> list[Any]:
    limited_actions: list[Any] = []
    has_navigate = False
    for action in actions:
        if isinstance(action, NavigateAction):
            if has_navigate:
                continue
            has_navigate = True
        limited_actions.append(action)
    return limited_actions


def build_mock_catalog_response(
    text: str,
    candidates: list[dict[str, Any]],
) -> FullTextMessage:
    first = candidates[0]
    actions: list[Any] = default_candidate_actions(candidates)
    if "장바구니" in text or "담아" in text:
        actions.append(AddToCartAction(goodsId=str(first["goodsId"])))
    response_text = (
        f"{first.get('name', '추천 상품')}을 추천해요."
        if len(candidates) == 1
        else f"조건에 맞는 {len(candidates)}개 상품을 추천해요."
    )
    return FullTextMessage(
        text=response_text,
        actions=actions,
        metadata=recommendation_metadata(candidates),
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
