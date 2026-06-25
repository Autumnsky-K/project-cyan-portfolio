import json
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from project_cyan_ai.main import app
from project_cyan_ai.goods_catalog import (
    CatalogGroundedChatResponseProvider,
    HttpGoodsCatalogClient,
    MetadataTsvGoodsCatalogClient,
    TsvGoodsCatalogClient,
    extract_max_price,
    filter_tsv_candidates,
    parse_goods_catalog_tsv,
)
from project_cyan_ai.hook_policy import (
    CachedHookPolicyProvider,
    HookFilter,
    HookPolicy,
    character_ratio,
    parse_ratio,
)
from project_cyan_ai.providers import (
    ClaudeChatResponseProvider,
    MockChatResponseProvider,
    OlvChatResponseProvider,
    OpenAiChatResponseProvider,
    get_chat_response_provider,
    parse_action_tags,
)
from project_cyan_ai.tools import (
    GoodsApiClient,
    GoodsToolError,
    ShoppingTools,
    build_recommendation_actions,
)
from project_cyan_ai.schemas.ws import (
    AddToCartAction,
    CLIENT_CART_ITEMS_MAX_LENGTH,
    CLIENT_TEXT_MAX_LENGTH,
    ClientTextInput,
    FullTextMessage,
    HighlightAction,
    NavigateAction,
)
from project_cyan_ai.settings import get_settings

client = TestClient(app)
mock_provider = MockChatResponseProvider()


@pytest.fixture(autouse=True)
def isolate_ai_settings(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    for env_name in (
        "PROJECT_CYAN_AI_PROVIDER",
        "PROJECT_CYAN_LLM_BASE_URL",
        "PROJECT_CYAN_LLM_API_KEY",
        "PROJECT_CYAN_LLM_MODEL",
        "PROJECT_CYAN_CLAUDE_BASE_URL",
        "PROJECT_CYAN_CLAUDE_API_KEY",
        "PROJECT_CYAN_CLAUDE_MODEL",
        "PROJECT_CYAN_OLV_GATEWAY_URL",
        "PROJECT_CYAN_OLV_API_KEY",
        "PROJECT_CYAN_SPRING_API_URL",
        "PROJECT_CYAN_GOODS_API_BASE_URL",
        "PROJECT_CYAN_HOOK_POLICY_CACHE_TTL_SECONDS",
    ):
        monkeypatch.delenv(env_name, raising=False)
    monkeypatch.setenv(
        "PROJECT_CYAN_SPRING_API_URL",
        "http://127.0.0.1:1/api",
    )


class FakeOlvClient:
    def __init__(
        self,
        response_text: str | None = None,
        error: Exception | None = None,
    ):
        self.response_text = response_text
        self.error = error
        self.received_texts: list[str] = []

    def generate_text(self, text: str) -> str:
        self.received_texts.append(text)

        if self.error is not None:
            raise self.error

        return self.response_text or ""


class FakeClaudeClient:
    def __init__(
        self,
        response_text: str | None = None,
        error: Exception | None = None,
    ):
        self.response_text = response_text
        self.error = error
        self.received_texts: list[str] = []

    def generate_text(self, text: str) -> str:
        self.received_texts.append(text)

        if self.error is not None:
            raise self.error

        return self.response_text or ""


class FakeOpenAiClient:
    def __init__(
        self,
        response_text: str | None = None,
        error: Exception | None = None,
        responses: list[dict] | None = None,
    ):
        self.response_text = response_text
        self.error = error
        self.received_texts: list[str] = []
        self.responses = responses or []
        self.received_response_requests: list[dict] = []

    def generate_text(self, text: str) -> str:
        self.received_texts.append(text)

        if self.error is not None:
            raise self.error

        return self.response_text or ""

    def create_response(self, input_items, instructions, tools):
        self.received_response_requests.append(
            {
                "input_items": input_items,
                "instructions": instructions,
                "tools": tools,
            }
        )

        if self.error is not None:
            raise self.error

        return self.responses.pop(0)


class FakeGoodsClient:
    def __init__(self):
        self.search_calls = []
        self.detail_calls = []
        self.fail = False

    def search_goods(self, query=None, options=None):
        self.search_calls.append({"query": query, "options": options})

        if self.fail:
            raise GoodsToolError("secret-goods-url")

        return {
            "goods": [
                {
                    "goodsId": "42",
                    "name": "Artist A Photocard",
                    "price": 35000,
                    "imageUrl": "https://cdn.example.test/42.jpg",
                    "tags": ["PHOTOCARD"],
                    "artistName": "Artist A",
                    "categoryName": "Photocard",
                }
            ],
            "page": 0,
            "size": 10,
            "totalElements": 1,
            "totalPages": 1,
        }

    def get_goods_detail(self, goods_id):
        self.detail_calls.append(goods_id)

        if self.fail:
            raise GoodsToolError("secret-goods-url")

        return {
            "goodsId": str(goods_id),
            "name": "Artist A Photocard",
            "price": 35000,
            "imageUrl": "https://cdn.example.test/42.jpg",
            "tags": ["PHOTOCARD"],
            "description": "Artist A collectible photocard",
            "artistId": 1,
            "stockCount": 5,
            "artistName": "Artist A",
            "categoryName": "Photocard",
        }


class FakeHttpResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


class FakeTextHttpResponse(FakeHttpResponse):
    def read(self):
        return self.payload.encode("utf-8")


class FakeGoodsCatalogClient:
    def __init__(self, candidates):
        self.candidates = candidates
        self.received_texts = []

    def search_candidates(self, text):
        self.received_texts.append(text)
        return self.candidates


class FakeHookPolicyClient:
    def __init__(self, policies):
        self.policies = policies
        self.calls = 0

    def fetch_policies(self):
        self.calls += 1
        return self.policies


class FakeHookFilter:
    def __init__(self, policies):
        self.filter = HookFilter(CachedHookPolicyProvider(FakeHookPolicyClient(policies)))

    def filter_input(self, text):
        return self.filter.filter_input(text)

    def filter_output(self, response):
        return self.filter.filter_output(response)


class FakeWebSocketGoodsCatalogClient:
    candidates = [
        {
            "goodsId": 1005,
            "name": "Tour Poster A2",
            "price": 12000,
            "tags": ["POSTER"],
            "artistName": "Artist C",
            "categoryName": "Poster",
        },
        {
            "goodsId": 1006,
            "name": "Character Plush",
            "price": 32000,
            "tags": ["PLUSH"],
            "artistName": "Artist C",
            "categoryName": "Plush",
        },
    ]

    def __init__(self, spring_api_url):
        self.spring_api_url = spring_api_url
        self.received_texts = []

    def search_candidates(self, text):
        self.received_texts.append(text)
        return self.candidates


GOODS_CATALOG_TSV = """goodsId\tname\tprice\tartistName\tgroupName\tcategoryName\ttags\tsalesStatus\tstockCount\taiPickDefault\tbestSeller\tdescription
1001\tPhotocard Set Vol.1\t12000\tArtist A\tGROUP ONE\tPhotocard\tPHOTOCARD,ARTIST_A\tON_SALE\t120\ttrue\ttrue\tArtist A 포토카드 세트입니다.
1002\tOfficial Lightstick\t45000\tArtist A\tGROUP ONE\tLightstick\tLIGHTSTICK,ARTIST_A\tON_SALE\t35\ttrue\ttrue\tArtist A 공식 응원봉입니다.
1003\tMini Album [Repackage]\t23000\tArtist B\tGROUP ONE\tAlbum\tALBUM,ARTIST_B\tON_SALE\t200\tfalse\tfalse\tArtist B 리패키지 미니 앨범입니다.
1004\tLogo Hoodie\t58000\tArtist B\tGROUP ONE\tApparel\tHOODIE,ARTIST_B\tON_SALE\t18\ttrue\tfalse\tArtist B 로고 후디입니다.
1005\tTour Poster A2\t8000\tArtist C\tGROUP TWO\tPoster\tPOSTER,ARTIST_C\tON_SALE\t80\tfalse\tfalse\tArtist C 투어 포스터입니다.
1006\tCharacter Plush\t27000\tArtist C\tGROUP TWO\tPlush\tPLUSH,ARTIST_C\tON_SALE\t42\ttrue\tfalse\tArtist C 캐릭터 인형입니다.
1007\tPhotocard Binder\t15000\tArtist D\tGROUP TWO\tPhotocard\tPHOTOCARD,BINDER\tON_SALE\t60\tfalse\tfalse\t포토카드를 보관하는 바인더입니다.
1008\tConcept Album\t31000\tArtist D\tGROUP TWO\tAlbum\tALBUM,ARTIST_D\tPRE_ORDER\t100\tfalse\tfalse\tArtist D 콘셉트 앨범입니다.
1009\tKeyring Charm\t19000\tArtist E\tGROUP THREE\tKeyring\tKEYRING,ARTIST_E\tON_SALE\t70\tfalse\ttrue\t콘서트 키링입니다.
1010\tSold Out Photocard\t14000\tArtist E\tGROUP THREE\tPhotocard\tPHOTOCARD,ARTIST_E\tON_SALE\t0\tfalse\tfalse\t품절 포토카드입니다.
"""


THREE_RECENT_CANDIDATES = [
    *FakeWebSocketGoodsCatalogClient.candidates,
    {
        "goodsId": 1007,
        "name": "Trading Card Pack",
        "price": 8000,
        "tags": ["PHOTOCARD"],
        "artistName": "Artist C",
        "categoryName": "Photocard",
    },
]


def test_health_returns_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_extract_max_price_supports_korean_amounts():
    assert extract_max_price("5만원 이하 키링 추천") == 50_000
    assert extract_max_price("가격 35,000원 상품") == 35_000


def test_catalog_grounding_uses_real_candidate_id_for_mock_provider():
    catalog = FakeGoodsCatalogClient(
        [{"goodsId": 42, "name": "Artist A Photocard"}]
    )
    provider = CatalogGroundedChatResponseProvider(
        delegate=MockChatResponseProvider(),
        catalog_client=catalog,
    )

    response = provider.build_response("Artist A Photocard 상품 추천해줘")

    assert catalog.received_texts == ["Artist A Photocard 상품 추천해줘"]
    assert response.actions == [
        NavigateAction(path="/goods/42"),
        HighlightAction(selector="[data-goods-id='42']"),
    ]


def test_http_goods_catalog_client_calls_recommendation_candidates(monkeypatch):
    captured_requests = []

    def fake_urlopen(request, timeout):
        captured_requests.append({"url": request.full_url, "timeout": timeout})
        return FakeHttpResponse(
            {
                "content": [
                    {
                        "goodsId": 42,
                        "name": "Artist A Photocard",
                        "price": 35000,
                        "imageUrl": "https://cdn.example.test/42.jpg",
                        "tags": ["PHOTOCARD"],
                        "artistName": "Artist A",
                        "categoryName": "Photocard",
                        "salesStatus": "ON_SALE",
                        "stockCount": 5,
                    }
                ],
                "page": 0,
                "size": 10,
                "totalElements": 1,
                "totalPages": 1,
            }
        )

    monkeypatch.setattr("project_cyan_ai.goods_catalog.urlopen", fake_urlopen)

    response = HttpGoodsCatalogClient("http://backend.test/api").search_candidates(
        "Artist A Photocard 상품 추천해줘"
    )

    parsed_url = urlparse(captured_requests[0]["url"])
    query = parse_qs(parsed_url.query)
    assert parsed_url.geturl().startswith(
        "http://backend.test/api/goods/recommendation-candidates?"
    )
    assert query == {
        "q": ["Artist A Photocard 상품 추천해줘"],
        "page": ["0"],
        "size": ["10"],
        "sort": ["relevance,desc"],
    }
    assert captured_requests[0]["timeout"] == 2.0
    assert response == [
        {
            "goodsId": 42,
            "name": "Artist A Photocard",
            "price": 35000,
            "imageUrl": "https://cdn.example.test/42.jpg",
            "tags": ["PHOTOCARD"],
            "artistName": "Artist A",
            "categoryName": "Photocard",
            "salesStatus": "ON_SALE",
            "stockCount": 5,
        }
    ]


def test_http_goods_catalog_client_sends_extracted_max_price(monkeypatch):
    captured_urls = []

    def fake_urlopen(request, timeout):
        captured_urls.append(request.full_url)
        return FakeHttpResponse({"content": []})

    monkeypatch.setattr("project_cyan_ai.goods_catalog.urlopen", fake_urlopen)

    response = HttpGoodsCatalogClient("http://backend.test/api").search_candidates(
        "Artist A Photocard 50,000원 이하 상품 추천해줘"
    )

    query = parse_qs(urlparse(captured_urls[0]).query)
    assert query["maxPrice"] == ["50000"]
    assert response == []


def test_parse_goods_catalog_tsv_normalizes_catalog_fields():
    candidates = parse_goods_catalog_tsv(GOODS_CATALOG_TSV)

    assert candidates[0]["goodsId"] == 1001
    assert candidates[0]["price"] == 12000
    assert candidates[0]["tags"] == ["PHOTOCARD", "ARTIST_A"]
    assert candidates[0]["stockCount"] == 120
    assert candidates[0]["aiPickDefault"] is True


@pytest.mark.parametrize(
    ("text", "expected_goods_ids"),
    [
        ("포토카드 찾아줘", [1001, 1007]),
        ("포토카드는 누구의 상품이 있어?", [1001, 1007]),
        ("포토카드가 있어?", [1001, 1007]),
        ("Artist A의 포토카드 있어?", [1001]),
        ("키링은 누구 거 있어?", [1009]),
        ("Group One 포토카드", [1001]),
        ("3만원 이하 포토카드", [1001, 1007]),
        ("품절 아닌 포토카드", [1001, 1007]),
        ("Artist A 상품 추천해줘", [1001, 1002]),
    ],
)
def test_filter_tsv_candidates_handles_core_recommendation_requests(
    text,
    expected_goods_ids,
):
    candidates = parse_goods_catalog_tsv(GOODS_CATALOG_TSV)

    response = filter_tsv_candidates(text, candidates)

    assert [candidate["goodsId"] for candidate in response] == expected_goods_ids
    assert all(candidate["salesStatus"] == "ON_SALE" for candidate in response)
    assert all(candidate["stockCount"] > 0 for candidate in response)


def test_filter_tsv_candidates_allows_related_artist_group_as_secondary_results():
    candidates = parse_goods_catalog_tsv(GOODS_CATALOG_TSV)

    response = filter_tsv_candidates("Artist A 관련 굿즈 추천해줘", candidates)

    assert [candidate["goodsId"] for candidate in response] == [
        1001,
        1002,
        1004,
        1003,
    ]
    assert response[0]["artistName"] == "Artist A"
    assert response[1]["artistName"] == "Artist A"


def test_tsv_goods_catalog_client_reads_local_snapshot(tmp_path):
    catalog_path = tmp_path / "goods-catalog-latest.tsv"
    catalog_path.write_text(GOODS_CATALOG_TSV, encoding="utf-8")
    client = TsvGoodsCatalogClient(str(catalog_path))

    response = client.search_candidates("Artist A의 포토카드 있어?")

    assert response == [
        {
            "goodsId": 1001,
            "name": "Photocard Set Vol.1",
            "price": 12000,
            "imageUrl": None,
            "tags": ["PHOTOCARD", "ARTIST_A"],
            "artistName": "Artist A",
            "categoryName": "Photocard",
            "salesStatus": "ON_SALE",
            "stockCount": 120,
            "recommendationReason": "artistName, categoryName, description, tags 조건과 일치하는 상품입니다.",
            "matchedFields": [
                "artistName",
                "categoryName",
                "description",
                "tags",
            ],
        }
    ]


def test_metadata_tsv_goods_catalog_client_reads_catalog_url_from_spring(monkeypatch):
    captured_urls = []

    def fake_urlopen(request, timeout):
        captured_urls.append(request.full_url)
        if request.full_url == "http://backend.test/api/ai/goods-catalog/latest":
            return FakeHttpResponse(
                {
                    "catalogUrl": "https://storage.test/goods-catalog-latest.tsv",
                    "generatedAt": "2026-06-25T03:00:00Z",
                    "urlExpiresAt": "2026-07-02T03:00:00Z",
                    "itemCount": 10,
                    "storagePath": "goods-catalog-latest.tsv",
                }
            )
        return FakeTextHttpResponse(GOODS_CATALOG_TSV)

    monkeypatch.setattr("project_cyan_ai.goods_catalog.urlopen", fake_urlopen)
    client = MetadataTsvGoodsCatalogClient(
        "http://backend.test/api/ai/goods-catalog/latest"
    )

    response = client.search_candidates("키링은 누구 거 있어?")

    assert captured_urls == [
        "http://backend.test/api/ai/goods-catalog/latest",
        "https://storage.test/goods-catalog-latest.tsv",
    ]
    assert [candidate["goodsId"] for candidate in response] == [1009]


def test_catalog_grounding_removes_actions_for_goods_outside_candidates():
    catalog = FakeGoodsCatalogClient([{"goodsId": 42, "name": "Allowed Goods"}])
    delegate = ClaudeChatResponseProvider(
        client=FakeClaudeClient('추천 [ACTION:navigate path="/goods/999"]')
    )
    provider = CatalogGroundedChatResponseProvider(delegate, catalog)

    response = provider.build_response("상품 추천해줘")

    assert response.actions == []


def test_catalog_grounding_adds_all_recent_candidates_to_cart_on_follow_up():
    catalog = FakeGoodsCatalogClient(FakeWebSocketGoodsCatalogClient.candidates)
    provider = CatalogGroundedChatResponseProvider(
        delegate=MockChatResponseProvider(),
        catalog_client=catalog,
    )

    provider.build_response("Artist C 굿즈 추천해줘")
    response = provider.build_response("둘 다 담아줘")

    assert catalog.received_texts == ["Artist C 굿즈 추천해줘"]
    assert response.model_dump() == {
        "type": "full-text",
        "text": "방금 추천한 2개 상품을 장바구니에 담을게요.",
        "actions": [
            {"type": "addToCart", "goodsId": "1005"},
            {"type": "addToCart", "goodsId": "1006"},
        ],
    }


def test_catalog_grounding_adds_selected_recent_candidate_to_cart_on_follow_up():
    catalog = FakeGoodsCatalogClient(THREE_RECENT_CANDIDATES)
    provider = CatalogGroundedChatResponseProvider(
        delegate=MockChatResponseProvider(),
        catalog_client=catalog,
    )

    provider.build_response("Artist C 굿즈 추천해줘")

    assert provider.build_response("첫 번째 담아줘").model_dump() == {
        "type": "full-text",
        "text": "방금 추천한 상품을 장바구니에 담을게요.",
        "actions": [
            {"type": "addToCart", "goodsId": "1005"},
        ],
    }
    assert provider.build_response("2번 담아줘").model_dump() == {
        "type": "full-text",
        "text": "방금 추천한 상품을 장바구니에 담을게요.",
        "actions": [
            {"type": "addToCart", "goodsId": "1006"},
        ],
    }
    assert provider.build_response("세 번째 담아줘").model_dump() == {
        "type": "full-text",
        "text": "방금 추천한 상품을 장바구니에 담을게요.",
        "actions": [
            {"type": "addToCart", "goodsId": "1007"},
        ],
    }


def test_catalog_grounding_adds_multiple_numbered_candidates_to_cart_on_follow_up():
    catalog = FakeGoodsCatalogClient(THREE_RECENT_CANDIDATES)
    provider = CatalogGroundedChatResponseProvider(
        delegate=MockChatResponseProvider(),
        catalog_client=catalog,
    )

    provider.build_response("Artist C 굿즈 추천해줘")
    response = provider.build_response("1번 3번 담아줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "방금 추천한 2개 상품을 장바구니에 담을게요.",
        "actions": [
            {"type": "addToCart", "goodsId": "1005"},
            {"type": "addToCart", "goodsId": "1007"},
        ],
    }


def test_catalog_grounding_uses_count_qualified_all_only_when_count_matches():
    catalog = FakeGoodsCatalogClient(THREE_RECENT_CANDIDATES)
    provider = CatalogGroundedChatResponseProvider(
        delegate=MockChatResponseProvider(),
        catalog_client=catalog,
    )

    provider.build_response("Artist C 굿즈 추천해줘")

    assert provider.build_response("세 개 다 담아줘").model_dump() == {
        "type": "full-text",
        "text": "방금 추천한 3개 상품을 장바구니에 담을게요.",
        "actions": [
            {"type": "addToCart", "goodsId": "1005"},
            {"type": "addToCart", "goodsId": "1006"},
            {"type": "addToCart", "goodsId": "1007"},
        ],
    }
    assert provider.build_response("셋 다 담아줘").model_dump() == {
        "type": "full-text",
        "text": "방금 추천한 3개 상품을 장바구니에 담을게요.",
        "actions": [
            {"type": "addToCart", "goodsId": "1005"},
            {"type": "addToCart", "goodsId": "1006"},
            {"type": "addToCart", "goodsId": "1007"},
        ],
    }
    assert provider.build_response("둘 다 담아줘").model_dump() == {
        "type": "full-text",
        "text": "추천한 상품이 여러 개라서 어떤 상품을 담을지 모르겠어요. 1번 2번처럼 번호로 알려주세요.",
        "actions": [],
    }


def test_catalog_grounding_adds_all_recent_candidates_for_unqualified_all_words():
    catalog = FakeGoodsCatalogClient(THREE_RECENT_CANDIDATES)
    provider = CatalogGroundedChatResponseProvider(
        delegate=MockChatResponseProvider(),
        catalog_client=catalog,
    )

    provider.build_response("Artist C 굿즈 추천해줘")
    response = provider.build_response("전부 담아줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "방금 추천한 3개 상품을 장바구니에 담을게요.",
        "actions": [
            {"type": "addToCart", "goodsId": "1005"},
            {"type": "addToCart", "goodsId": "1006"},
            {"type": "addToCart", "goodsId": "1007"},
        ],
    }


def test_catalog_grounding_returns_empty_follow_up_message_without_recent_candidates():
    provider = CatalogGroundedChatResponseProvider(
        delegate=MockChatResponseProvider(),
        catalog_client=FakeGoodsCatalogClient([]),
    )

    response = provider.build_response("둘 다 담아줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "담을 상품을 찾지 못했어요. 먼저 추천받을 상품을 알려주세요.",
        "actions": [],
    }


def test_client_text_input_requires_frozen_type():
    with pytest.raises(ValidationError):
        ClientTextInput.model_validate({"type": "ping", "text": "안녕"})


def test_client_text_input_rejects_blank_or_oversized_text():
    with pytest.raises(ValidationError):
        ClientTextInput.model_validate({"type": "text-input", "text": "   "})

    with pytest.raises(ValidationError):
        ClientTextInput.model_validate(
            {"type": "text-input", "text": "a" * (CLIENT_TEXT_MAX_LENGTH + 1)}
        )


def test_client_text_input_rejects_extra_fields_and_oversized_context():
    with pytest.raises(ValidationError):
        ClientTextInput.model_validate(
            {"type": "text-input", "text": "안녕", "unexpected": True}
        )

    cart_items = [
        {
            "goodsId": index,
            "name": f"Goods {index}",
            "quantity": 1,
            "tags": [],
        }
        for index in range(CLIENT_CART_ITEMS_MAX_LENGTH + 1)
    ]
    with pytest.raises(ValidationError):
        ClientTextInput.model_validate(
            {
                "type": "text-input",
                "text": "안녕",
                "context": {"cartItems": cart_items},
            }
        )


def test_client_text_input_accepts_optional_cart_context():
    message = ClientTextInput.model_validate(
        {
            "type": "text-input",
            "text": "Artist A Photocard 추천해줘",
            "context": {
                "cartItems": [
                    {
                        "goodsId": 42,
                        "name": "Artist A Photocard",
                        "quantity": 1,
                        "tags": ["PHOTOCARD"],
                        "artistName": "Artist A",
                        "categoryName": "Photocard",
                    }
                ]
            },
        }
    )

    assert message.model_dump()["context"] == {
        "cartItems": [
            {
                "goodsId": 42,
                "name": "Artist A Photocard",
                "quantity": 1,
                "tags": ["PHOTOCARD"],
                "artistName": "Artist A",
                "categoryName": "Photocard",
            }
        ]
    }


def test_full_text_message_preserves_server_contract_shape():
    message = FullTextMessage(text="안녕")

    assert message.model_dump() == {
        "type": "full-text",
        "text": "안녕",
        "actions": [],
    }


def test_full_text_message_accepts_mvp_action_payloads():
    message = FullTextMessage(
        text="추천 상품을 보여드릴게요",
        actions=[
            NavigateAction(path="/goods/1002"),
            HighlightAction(selector="[data-goods-id='1002']"),
            AddToCartAction(goodsId="1002"),
        ],
    )

    assert message.model_dump() == {
        "type": "full-text",
        "text": "추천 상품을 보여드릴게요",
        "actions": [
            {"type": "navigate", "path": "/goods/1002"},
            {"type": "highlight", "selector": "[data-goods-id='1002']"},
            {"type": "addToCart", "goodsId": "1002"},
        ],
    }


def test_full_text_message_rejects_unknown_action_payload():
    with pytest.raises(ValidationError):
        FullTextMessage.model_validate(
            {
                "type": "full-text",
                "text": "안녕",
                "actions": [{"type": "unknown", "value": "1002"}],
            }
        )


def test_full_text_message_rejects_action_missing_required_field():
    with pytest.raises(ValidationError):
        FullTextMessage.model_validate(
            {
                "type": "full-text",
                "text": "안녕",
                "actions": [{"type": "navigate"}],
            }
        )


def test_full_text_message_rejects_extra_action_field():
    with pytest.raises(ValidationError):
        FullTextMessage.model_validate(
            {
                "type": "full-text",
                "text": "안녕",
                "actions": [
                    {"type": "addToCart", "goodsId": "1002", "path": "/goods/1002"}
                ],
            }
        )


def test_full_text_message_rejects_unsafe_action_targets():
    unsafe_actions = [
        {"type": "navigate", "path": "https://evil.example"},
        {"type": "navigate", "path": "/admin"},
        {"type": "navigate", "path": "/goods/not-a-number"},
        {"type": "highlight", "selector": "body"},
        {"type": "highlight", "selector": "[data-artist-id='7']"},
        {"type": "addToCart", "goodsId": "../admin"},
    ]

    for action in unsafe_actions:
        with pytest.raises(ValidationError):
            FullTextMessage.model_validate(
                {
                    "type": "full-text",
                    "text": "안녕",
                    "actions": [action],
                }
            )


def test_chat_response_provider_factory_returns_mock_provider_by_default():
    assert isinstance(get_chat_response_provider(), MockChatResponseProvider)


def test_chat_response_provider_factory_uses_env_provider(monkeypatch):
    monkeypatch.setenv("PROJECT_CYAN_AI_PROVIDER", "claude")
    monkeypatch.setenv("PROJECT_CYAN_LLM_API_KEY", "local-secret")

    assert isinstance(get_chat_response_provider(), ClaudeChatResponseProvider)


def test_chat_response_provider_factory_uses_openai_provider(monkeypatch):
    monkeypatch.setenv("PROJECT_CYAN_AI_PROVIDER", "openai")
    monkeypatch.setenv("PROJECT_CYAN_LLM_API_KEY", "local-secret")

    assert isinstance(get_chat_response_provider(), OpenAiChatResponseProvider)


def test_chat_response_provider_factory_keeps_experimental_olv_provider(
    monkeypatch,
):
    monkeypatch.setenv("PROJECT_CYAN_AI_PROVIDER", "olv")
    monkeypatch.setenv(
        "PROJECT_CYAN_OLV_GATEWAY_URL",
        "http://olv-gateway.test/chat",
    )

    assert isinstance(get_chat_response_provider(), OlvChatResponseProvider)


def test_settings_loads_ai_env_file_from_working_directory(tmp_path, monkeypatch):
    env_file = tmp_path / ".env"
    env_file.write_text(
        "\n".join(
            [
                "PROJECT_CYAN_AI_PROVIDER=claude",
                "PROJECT_CYAN_LLM_BASE_URL=https://api.example.test/v1",
                "PROJECT_CYAN_LLM_API_KEY=local-secret",
                "PROJECT_CYAN_LLM_MODEL=test-model",
            ]
        ),
        encoding="utf-8",
    )
    monkeypatch.chdir(tmp_path)

    settings = get_settings()

    assert settings.ai_provider == "claude"
    assert settings.llm_base_url == "https://api.example.test/v1"
    assert settings.llm_api_key == "local-secret"
    assert settings.llm_model == "test-model"


def test_settings_loads_goods_api_base_url(monkeypatch):
    monkeypatch.setenv("PROJECT_CYAN_GOODS_API_BASE_URL", "http://backend.test/api")

    assert get_settings().goods_api_base_url == "http://backend.test/api"


def test_goods_api_client_normalizes_search_page(monkeypatch):
    captured_urls = []

    def fake_urlopen(request, timeout):
        captured_urls.append(request.full_url)
        return FakeHttpResponse(
            {
                "content": [
                    {
                        "goodsId": 42,
                        "name": "Artist A Photocard",
                        "price": 35000,
                        "imageUrl": "https://cdn.example.test/42.jpg",
                        "tags": ["PHOTOCARD"],
                        "artistName": "Artist A",
                        "categoryName": "Photocard",
                    }
                ],
                "page": 0,
                "size": 10,
                "totalElements": 1,
                "totalPages": 1,
            }
        )

    monkeypatch.setattr("project_cyan_ai.tools.urlopen", fake_urlopen)

    response = GoodsApiClient("http://backend.test/api").search_goods(
        "Artist A",
        {"tag": "PHOTOCARD", "size": 10},
    )

    assert captured_urls == [
        "http://backend.test/api/goods?page=0&size=10&q=Artist+A&tag=PHOTOCARD"
    ]
    assert response["goods"] == [
        {
            "goodsId": "42",
            "name": "Artist A Photocard",
            "price": 35000,
            "imageUrl": "https://cdn.example.test/42.jpg",
            "tags": ["PHOTOCARD"],
            "artistName": "Artist A",
            "categoryName": "Photocard",
            "salesStatus": None,
            "isBestSeller": None,
            "aiPickDefault": None,
        }
    ]


def test_goods_api_client_normalizes_detail(monkeypatch):
    monkeypatch.setattr(
        "project_cyan_ai.tools.urlopen",
        lambda request, timeout: FakeHttpResponse(
            {
                "goodsId": 42,
                "name": "Artist A Photocard",
                "price": 35000,
                "imageUrl": "https://cdn.example.test/42.jpg",
                "tags": ["PHOTOCARD"],
                "description": "Artist A collectible photocard",
                "artistId": 1,
                "stockCount": 5,
            }
        ),
    )

    response = GoodsApiClient("http://backend.test/api").get_goods_detail("42")

    assert response["goodsId"] == "42"
    assert response["description"] == "Artist A collectible photocard"
    assert response["artistId"] == 1
    assert response["stockCount"] == 5


def test_goods_api_client_rejects_non_numeric_detail_id(monkeypatch):
    def fake_urlopen(request, timeout):
        raise AssertionError("urlopen should not be called")

    monkeypatch.setattr("project_cyan_ai.tools.urlopen", fake_urlopen)

    with pytest.raises(GoodsToolError):
        GoodsApiClient("http://backend.test/api").get_goods_detail("../admin")


def test_goods_api_client_wraps_failures_without_leaking_details(monkeypatch):
    def fake_urlopen(request, timeout):
        raise OSError("secret-backend-token")

    monkeypatch.setattr("project_cyan_ai.tools.urlopen", fake_urlopen)

    with pytest.raises(GoodsToolError) as exc_info:
        GoodsApiClient("http://backend.test/api").search_goods("Artist A")

    assert "secret-backend-token" not in str(exc_info.value)


def test_build_recommendation_actions_uses_documented_action_tags():
    assert build_recommendation_actions(["42"], include_add_to_cart=True) == (
        '[ACTION:navigate path="/goods/42"] '
        '[ACTION:highlight selector="[data-goods-id=\'42\']"] '
        '[ACTION:addToCart goodsId="42"]'
    )


def test_mock_provider_echoes_plain_text_input():
    response = mock_provider.build_response("안녕")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "받은 메시지: 안녕",
        "actions": [],
    }


def test_mock_provider_returns_recommendation_actions():
    response = mock_provider.build_response("상품 추천 보여줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
        "actions": [
            {"type": "navigate", "path": "/goods/1002"},
            {"type": "highlight", "selector": "[data-goods-id='1002']"},
        ],
    }


def test_mock_provider_returns_add_to_cart_action():
    response = mock_provider.build_response("장바구니에 담아줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
        "actions": [
            {"type": "addToCart", "goodsId": "1002"},
        ],
    }


def test_mock_provider_combines_actions_when_keywords_overlap():
    response = mock_provider.build_response("추천 상품을 장바구니에 담아줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
        "actions": [
            {"type": "navigate", "path": "/goods/1002"},
            {"type": "highlight", "selector": "[data-goods-id='1002']"},
            {"type": "addToCart", "goodsId": "1002"},
        ],
    }


def test_parse_action_tags_removes_tags_and_builds_actions():
    response = parse_action_tags(
        '이 상품을 추천해요. [ACTION:navigate path="/goods/1002"] '
        '[ACTION:highlight selector="[data-goods-id=\'1002\']"]'
        '[ACTION:addToCart goodsId="1002"]'
    )

    assert response.model_dump() == {
        "type": "full-text",
        "text": "이 상품을 추천해요.",
        "actions": [
            {"type": "navigate", "path": "/goods/1002"},
            {"type": "highlight", "selector": "[data-goods-id='1002']"},
            {"type": "addToCart", "goodsId": "1002"},
        ],
    }


def test_parse_action_tags_ignores_invalid_actions():
    response = parse_action_tags(
        '안내할게요. [ACTION:unknown value="1002"] '
        '[ACTION:navigate] [ACTION:navigate path="/admin"] '
        '[ACTION:highlight selector="body"] [ACTION:addToCart goodsId="../admin"] '
        '[ACTION:addToCart goodsId="1002"]'
    )

    assert response.model_dump() == {
        "type": "full-text",
        "text": "안내할게요.",
        "actions": [
            {"type": "addToCart", "goodsId": "1002"},
        ],
    }


def test_olv_provider_uses_client_and_parses_actions():
    fake_client = FakeOlvClient('좋아요. [ACTION:navigate path="/goods/1002"]')
    provider = OlvChatResponseProvider(client=fake_client)

    response = provider.build_response("상품 추천해줘")

    assert fake_client.received_texts == ["상품 추천해줘"]
    assert response.model_dump() == {
        "type": "full-text",
        "text": "좋아요.",
        "actions": [
            {"type": "navigate", "path": "/goods/1002"},
        ],
    }


def test_olv_provider_falls_back_when_client_is_missing():
    response = OlvChatResponseProvider().build_response("상품 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요.",
        "actions": [],
    }


def test_olv_provider_falls_back_without_leaking_error_details():
    provider = OlvChatResponseProvider(
        client=FakeOlvClient(error=OSError("secret-url-token"))
    )

    response = provider.build_response("상품 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요.",
        "actions": [],
    }
    assert "secret-url-token" not in response.text


def test_claude_provider_uses_client_and_parses_actions():
    fake_client = FakeClaudeClient('추천입니다 [ACTION:navigate path="/goods/42"]')
    provider = ClaudeChatResponseProvider(client=fake_client)

    response = provider.build_response("상품 추천해줘")

    assert fake_client.received_texts == ["상품 추천해줘"]
    assert response.model_dump() == {
        "type": "full-text",
        "text": "추천입니다",
        "actions": [
            {"type": "navigate", "path": "/goods/42"},
        ],
    }


def test_claude_provider_falls_back_when_client_is_missing():
    response = ClaudeChatResponseProvider().build_response("상품 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요.",
        "actions": [],
    }


def test_claude_provider_falls_back_without_leaking_error_details():
    provider = ClaudeChatResponseProvider(
        client=FakeClaudeClient(error=OSError("secret-api-key"))
    )

    response = provider.build_response("상품 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요.",
        "actions": [],
    }
    assert "secret-api-key" not in response.text


def test_claude_provider_falls_back_on_empty_response():
    provider = ClaudeChatResponseProvider(client=FakeClaudeClient(""))

    response = provider.build_response("상품 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요.",
        "actions": [],
    }


def test_openai_provider_uses_client_and_parses_actions():
    fake_client = FakeOpenAiClient('좋아요 [ACTION:addToCart goodsId="42"]')
    provider = OpenAiChatResponseProvider(client=fake_client)

    response = provider.build_response("장바구니에 담아줘")

    assert fake_client.received_texts == ["장바구니에 담아줘"]
    assert response.model_dump() == {
        "type": "full-text",
        "text": "좋아요",
        "actions": [
            {"type": "addToCart", "goodsId": "42"},
        ],
    }


def test_openai_provider_handles_function_call_loop_with_goods_tools():
    fake_client = FakeOpenAiClient(
        responses=[
            {
                "output": [
                    {
                        "type": "function_call",
                        "name": "search_goods",
                        "call_id": "call-search-1",
                        "arguments": '{"query":"Artist A Photocard","options":{"size":5}}',
                    }
                ]
            },
            {
                "output_text": (
                    "Artist A Photocard를 추천드려요. "
                    '[ACTION:navigate path="/goods/42"] '
                    '[ACTION:highlight selector="[data-goods-id=\'42\']"]'
                )
            },
        ]
    )
    fake_goods_client = FakeGoodsClient()
    provider = OpenAiChatResponseProvider(
        client=fake_client,
        shopping_tools=ShoppingTools(fake_goods_client),
    )

    response = provider.build_response(
        "Artist A Photocard 추천해줘",
        {
            "cartItems": [
                {
                    "goodsId": "7",
                    "name": "이미 담은 상품",
                    "quantity": 1,
                    "tags": [],
                    "artistName": "Artist A",
                    "categoryName": "Goods",
                }
            ]
        },
    )

    assert fake_goods_client.search_calls == [
        {"query": "Artist A Photocard", "options": {"size": 5}}
    ]
    assert len(fake_client.received_response_requests) == 2
    assert fake_client.received_response_requests[0]["tools"][0]["name"] == "search_goods"
    assert "Client context JSON" in fake_client.received_response_requests[0]["input_items"][0]["content"]
    assert fake_client.received_response_requests[1]["input_items"][-1] == {
        "type": "function_call_output",
        "call_id": "call-search-1",
        "output": json.dumps(
            {
                "ok": True,
                "goods": [
                    {
                        "goodsId": "42",
                        "name": "Artist A Photocard",
                        "price": 35000,
                        "imageUrl": "https://cdn.example.test/42.jpg",
                        "tags": ["PHOTOCARD"],
                        "artistName": "Artist A",
                        "categoryName": "Photocard",
                    }
                ],
                "page": 0,
                "size": 10,
                "totalElements": 1,
                "totalPages": 1,
            },
            ensure_ascii=False,
        ),
    }
    assert response.model_dump() == {
        "type": "full-text",
        "text": "Artist A Photocard를 추천드려요.",
        "actions": [
            {"type": "navigate", "path": "/goods/42"},
            {"type": "highlight", "selector": "[data-goods-id='42']"},
        ],
    }


def test_openai_provider_allows_add_to_cart_when_final_text_uses_tool_goods_id():
    fake_client = FakeOpenAiClient(
        responses=[
            {
                "output": [
                    {
                        "type": "function_call",
                        "name": "get_goods_detail",
                        "call_id": "call-detail-1",
                        "arguments": '{"goodsId":"42"}',
                    }
                ]
            },
            {
                "output_text": (
                    "요청하신 상품을 장바구니에 담을게요. "
                    '[ACTION:addToCart goodsId="42"]'
                )
            },
        ]
    )
    fake_goods_client = FakeGoodsClient()
    provider = OpenAiChatResponseProvider(
        client=fake_client,
        shopping_tools=ShoppingTools(fake_goods_client),
    )

    response = provider.build_response("추천한 상품 장바구니에 담아줘")

    assert fake_goods_client.detail_calls == ["42"]
    assert response.model_dump() == {
        "type": "full-text",
        "text": "요청하신 상품을 장바구니에 담을게요.",
        "actions": [
            {"type": "addToCart", "goodsId": "42"},
        ],
    }


def test_openai_provider_filters_hallucinated_goods_ids_from_actions():
    fake_client = FakeOpenAiClient(
        responses=[
            {
                "output": [
                    {
                        "type": "function_call",
                        "name": "search_goods",
                        "call_id": "call-search-1",
                        "arguments": '{"query":"Artist A"}',
                    }
                ]
            },
            {
                "output_text": (
                    "추천드려요. "
                    '[ACTION:navigate path="/goods/42"] '
                    '[ACTION:highlight selector="[data-goods-id=\'999\']"] '
                    '[ACTION:addToCart goodsId="999"]'
                )
            },
        ]
    )
    provider = OpenAiChatResponseProvider(
        client=fake_client,
        shopping_tools=ShoppingTools(FakeGoodsClient()),
    )

    response = provider.build_response("Artist A 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "추천드려요.",
        "actions": [
            {"type": "navigate", "path": "/goods/42"},
        ],
    }


def test_openai_provider_falls_back_when_goods_tool_fails_without_leaking_details():
    fake_client = FakeOpenAiClient(
        responses=[
            {
                "output": [
                    {
                        "type": "function_call",
                        "name": "search_goods",
                        "call_id": "call-search-1",
                        "arguments": '{"query":"Artist A"}',
                    }
                ]
            }
        ]
    )
    fake_goods_client = FakeGoodsClient()
    fake_goods_client.fail = True
    provider = OpenAiChatResponseProvider(
        client=fake_client,
        shopping_tools=ShoppingTools(fake_goods_client),
    )

    response = provider.build_response("Artist A 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요.",
        "actions": [],
    }
    assert "secret-goods-url" not in response.text


def test_openai_provider_falls_back_when_client_is_missing():
    response = OpenAiChatResponseProvider().build_response("상품 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요.",
        "actions": [],
    }


def test_openai_provider_falls_back_without_leaking_error_details():
    provider = OpenAiChatResponseProvider(
        client=FakeOpenAiClient(error=OSError("secret-api-key"))
    )

    response = provider.build_response("상품 추천해줘")

    assert response.model_dump() == {
        "type": "full-text",
        "text": "AI 응답을 준비하지 못했어요. 잠시 후 다시 시도해주세요.",
        "actions": [],
    }
    assert "secret-api-key" not in response.text


def test_client_ws_sends_initial_messages():
    with client.websocket_connect("/client-ws") as websocket:
        greeting = websocket.receive_json()
        config = websocket.receive_json()

    assert greeting == {
        "type": "full-text",
        "text": "Connection established",
        "actions": [],
    }

    assert config["type"] == "set-model-and-conf"
    assert config["model_info"] == {}
    assert config["conf_name"] == "project-cyan-ai"
    assert config["conf_uid"] == "default"
    assert isinstance(config["client_uid"], str)
    assert config["client_uid"]


def test_client_ws_echoes_valid_text_input():
    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json({"type": "text-input", "text": "안녕"})
        response = websocket.receive_json()

    assert response == {
        "type": "full-text",
        "text": "받은 메시지: 안녕",
        "actions": [],
    }


def test_client_ws_returns_recommendation_mock_actions():
    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json({"type": "text-input", "text": "상품 추천 보여줘"})
        response = websocket.receive_json()

    assert response == {
        "type": "full-text",
        "text": "추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
        "actions": [
            {"type": "navigate", "path": "/goods/1002"},
            {"type": "highlight", "selector": "[data-goods-id='1002']"},
        ],
    }


def test_client_ws_returns_add_to_cart_mock_action():
    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json({"type": "text-input", "text": "장바구니에 담아줘"})
        response = websocket.receive_json()

    assert response == {
        "type": "full-text",
        "text": "추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
        "actions": [
            {"type": "addToCart", "goodsId": "1002"},
        ],
    }


def test_client_ws_combines_mock_actions_when_keywords_overlap():
    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json(
            {"type": "text-input", "text": "추천 상품을 장바구니에 담아줘"}
        )
        response = websocket.receive_json()

    assert response == {
        "type": "full-text",
        "text": "추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
        "actions": [
            {"type": "navigate", "path": "/goods/1002"},
            {"type": "highlight", "selector": "[data-goods-id='1002']"},
            {"type": "addToCart", "goodsId": "1002"},
        ],
    }


def test_client_ws_remembers_recent_candidates_within_same_connection(monkeypatch):
    monkeypatch.setattr(
        "project_cyan_ai.api.websocket.HttpGoodsCatalogClient",
        FakeWebSocketGoodsCatalogClient,
    )

    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json({"type": "text-input", "text": "Artist C 굿즈 추천해줘"})
        recommendation_response = websocket.receive_json()

        websocket.send_json({"type": "text-input", "text": "둘 다 담아줘"})
        follow_up_response = websocket.receive_json()

    assert recommendation_response == {
        "type": "full-text",
        "text": "Tour Poster A2을 추천해요.",
        "actions": [
            {"type": "navigate", "path": "/goods/1005"},
            {"type": "highlight", "selector": "[data-goods-id='1005']"},
        ],
    }
    assert follow_up_response == {
        "type": "full-text",
        "text": "방금 추천한 2개 상품을 장바구니에 담을게요.",
        "actions": [
            {"type": "addToCart", "goodsId": "1005"},
            {"type": "addToCart", "goodsId": "1006"},
        ],
    }


def test_client_ws_does_not_share_recent_candidates_across_connections(monkeypatch):
    monkeypatch.setattr(
        "project_cyan_ai.api.websocket.HttpGoodsCatalogClient",
        FakeWebSocketGoodsCatalogClient,
    )

    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()
        websocket.send_json({"type": "text-input", "text": "Artist C 굿즈 추천해줘"})
        websocket.receive_json()

    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()
        websocket.send_json({"type": "text-input", "text": "둘 다 담아줘"})
        response = websocket.receive_json()

    assert response == {
        "type": "full-text",
        "text": "담을 상품을 찾지 못했어요. 먼저 추천받을 상품을 알려주세요.",
        "actions": [],
    }


def test_client_ws_rejects_unsupported_message_type():
    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json({"type": "ping", "text": "안녕"})
        response = websocket.receive_json()

    assert response == {
        "type": "full-text",
        "text": "지원하지 않는 메시지 형식이에요.",
        "actions": [],
    }


def test_client_ws_rejects_invalid_text_input():
    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json({"type": "text-input"})
        response = websocket.receive_json()

    assert response == {
        "type": "full-text",
        "text": "입력 내용을 확인해주세요.",
        "actions": [],
    }


def test_client_ws_rejects_blank_or_oversized_text_input():
    invalid_payloads = [
        {"type": "text-input", "text": "   "},
        {"type": "text-input", "text": "a" * (CLIENT_TEXT_MAX_LENGTH + 1)},
    ]

    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        for payload in invalid_payloads:
            websocket.send_json(payload)
            response = websocket.receive_json()
            assert response == {
                "type": "full-text",
                "text": "입력 내용을 확인해주세요.",
                "actions": [],
            }


def test_client_ws_applies_input_hook_before_schema_max_length(monkeypatch):
    monkeypatch.setattr(
        "project_cyan_ai.api.websocket.build_hook_filter",
        lambda spring_api_url, ttl_seconds: FakeHookFilter(
            [
                HookPolicy(
                    hook="input",
                    check="maxLength",
                    threshold="500",
                    action="stop",
                    message="입력이 너무 길어요. 500자 이하로 다시 입력해주세요.",
                )
            ]
        ),
    )

    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json({"type": "text-input", "text": "가" * (CLIENT_TEXT_MAX_LENGTH + 1)})
        response = websocket.receive_json()

    assert response == {
        "type": "full-text",
        "text": "입력이 너무 길어요. 500자 이하로 다시 입력해주세요.",
        "actions": [],
    }


def test_hook_filter_blocks_input_before_provider_call():
    hook_filter = HookFilter(
        CachedHookPolicyProvider(
            FakeHookPolicyClient(
                [
                    HookPolicy(
                        hook="input",
                        check="maxLength",
                        threshold="5",
                        action="stop",
                        message="짧게 입력해주세요.",
                    )
                ]
            )
        )
    )

    response = hook_filter.filter_input("123456")

    assert response == FullTextMessage(text="짧게 입력해주세요.", actions=[])


def test_hook_filter_filters_output_actions_by_scope():
    hook_filter = HookFilter(
        CachedHookPolicyProvider(
            FakeHookPolicyClient(
                [
                    HookPolicy(
                        hook="output",
                        check="actionScope",
                        threshold="navigate,highlight",
                        action="filter",
                        message="허용 액션만 실행합니다.",
                    )
                ]
            )
        )
    )

    response = hook_filter.filter_output(
        FullTextMessage(
            text="추천해요.",
            actions=[
                NavigateAction(path="/goods/42"),
                HighlightAction(selector="[data-goods-id='42']"),
                AddToCartAction(goodsId="42"),
            ],
        )
    )

    assert response == FullTextMessage(
        text="추천해요.",
        actions=[
            NavigateAction(path="/goods/42"),
            HighlightAction(selector="[data-goods-id='42']"),
        ],
    )


def test_hook_filter_rewrites_forbidden_output_text():
    hook_filter = HookFilter(
        CachedHookPolicyProvider(
            FakeHookPolicyClient(
                [
                    HookPolicy(
                        hook="output",
                        check="forbiddenWords",
                        threshold="secret,banned",
                        action="rewrite",
                        message="안내가 부적절해 다시 정리했어요.",
                    )
                ]
            )
        )
    )

    response = hook_filter.filter_output(
        FullTextMessage(
            text="secret 상품이에요.",
            actions=[NavigateAction(path="/goods/42")],
        )
    )

    assert response == FullTextMessage(text="안내가 부적절해 다시 정리했어요.", actions=[])


def test_hook_ratio_helpers_parse_percent_thresholds():
    assert parse_ratio("30%") == 0.3
    assert character_ratio("abc123", r"[0-9]") == 0.5
