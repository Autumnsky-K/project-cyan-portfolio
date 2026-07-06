from project_cyan_ai.goods_catalog import CatalogGroundedChatResponseProvider
from project_cyan_ai.goods_filter_extraction import (
    GoodsFilterExtractionProvider,
    build_filter_extraction_prompt,
    parse_filter_extraction_json,
)
from project_cyan_ai.providers.chat_response import MockChatResponseProvider
from project_cyan_ai.schemas.ws import FullTextMessage


class FakeDelegate:
    def __init__(self, text):
        self.text = text
        self.received_prompts = []

    def build_response(self, text, context=None):
        self.received_prompts.append(text)
        return FullTextMessage(text=self.text, actions=[])


class FakeCatalogClient:
    def __init__(self, candidates):
        self.candidates = candidates
        self.received_category_names = []
        self.received_artist_names = []

    def search_candidates(self, text, favorite_artists=None, category_name=None, artist_name=None):
        self.received_category_names.append(category_name)
        self.received_artist_names.append(artist_name)
        return self.candidates


def test_parse_filter_extraction_json_normal():
    result = parse_filter_extraction_json('{"categoryName": "포토카드", "artistName": "Artist A"}')
    assert result == {"categoryName": "포토카드", "artistName": "Artist A"}


def test_parse_filter_extraction_json_strips_code_fence():
    raw = '```json\n{"categoryName": "앨범", "artistName": null}\n```'
    result = parse_filter_extraction_json(raw)
    assert result == {"categoryName": "앨범", "artistName": None}


def test_parse_filter_extraction_json_handles_surrounding_prose():
    raw = '설명입니다.\n{"categoryName": null, "artistName": "Artist B"}\n감사합니다.'
    result = parse_filter_extraction_json(raw)
    assert result == {"categoryName": None, "artistName": "Artist B"}


def test_parse_filter_extraction_json_corrupted_returns_empty():
    result = parse_filter_extraction_json("이건 JSON이 아니에요")
    assert result == {"categoryName": None, "artistName": None}


def test_parse_filter_extraction_json_wrong_types_ignored():
    result = parse_filter_extraction_json('{"categoryName": 123, "artistName": ["Artist A"]}')
    assert result == {"categoryName": None, "artistName": None}


def test_parse_filter_extraction_json_truncates_overlong_strings():
    long_value = "가" * 500
    result = parse_filter_extraction_json(f'{{"categoryName": "{long_value}", "artistName": null}}')
    assert len(result["categoryName"]) == 100


def test_parse_filter_extraction_json_non_string_input():
    assert parse_filter_extraction_json(None) == {"categoryName": None, "artistName": None}


def test_build_filter_extraction_prompt_wraps_untrusted_text():
    prompt = build_filter_extraction_prompt("포토카드 추천해줘")
    assert "<UNTRUSTED_USER_TEXT>포토카드 추천해줘</UNTRUSTED_USER_TEXT>" in prompt


def test_filter_extraction_provider_short_circuits_for_mock_delegate():
    provider = GoodsFilterExtractionProvider(MockChatResponseProvider())
    assert provider.extract_filters("포토카드 추천해줘") == {"categoryName": None, "artistName": None}


def test_filter_extraction_provider_parses_delegate_response():
    delegate = FakeDelegate('{"categoryName": "포토카드", "artistName": null}')
    provider = GoodsFilterExtractionProvider(delegate)

    result = provider.extract_filters("포토카드 추천해줘")

    assert result == {"categoryName": "포토카드", "artistName": None}
    assert len(delegate.received_prompts) == 1


def test_catalog_grounded_provider_passes_extracted_filters_to_catalog_client():
    delegate = FakeDelegate("추천 응답")
    filter_delegate = FakeDelegate('{"categoryName": "앨범", "artistName": "Artist A"}')
    catalog_client = FakeCatalogClient([{"goodsId": 1, "name": "앨범 상품"}])
    provider = CatalogGroundedChatResponseProvider(
        delegate=delegate,
        catalog_client=catalog_client,
        filter_extraction_provider=GoodsFilterExtractionProvider(filter_delegate),
    )

    provider.build_response("Artist A 앨범 추천해줘")

    assert catalog_client.received_category_names == ["앨범"]
    assert catalog_client.received_artist_names == ["Artist A"]


def test_catalog_grounded_provider_without_filter_extraction_provider_passes_none():
    delegate = FakeDelegate("추천 응답")
    catalog_client = FakeCatalogClient([{"goodsId": 1, "name": "앨범 상품"}])
    provider = CatalogGroundedChatResponseProvider(
        delegate=delegate,
        catalog_client=catalog_client,
    )

    provider.build_response("상품 추천해줘")

    assert catalog_client.received_category_names == [None]
    assert catalog_client.received_artist_names == [None]
