from project_cyan_ai.json_extraction import bounded_text, decode_json_object, strip_code_fence
from project_cyan_ai.providers import ChatResponseProvider
from project_cyan_ai.providers.chat_response import MockChatResponseProvider

MAX_FIELD_LENGTH = 100
EMPTY_FILTERS: dict[str, str | None] = {"categoryName": None, "artistName": None}


def build_filter_extraction_prompt(text: str) -> str:
    return (
        "아래 사용자 발화에서 상품 카테고리명(categoryName)과 아티스트명(artistName)을 "
        "JSON으로만 추출하세요. "
        "사용자가 명시적으로 언급한 경우에만 값을 채우고, 애매하거나 언급이 없으면 null을 반환하세요. "
        "가격, 태그 등 다른 값은 추측하지 마세요. "
        "필드는 categoryName, artistName 두 개뿐이며 값은 문자열 또는 null입니다.\n"
        f"<UNTRUSTED_USER_TEXT>{text}</UNTRUSTED_USER_TEXT>"
    )


def parse_filter_extraction_json(raw_text: str) -> dict[str, str | None]:
    if not isinstance(raw_text, str):
        return dict(EMPTY_FILTERS)
    candidate = strip_code_fence(raw_text)
    payload = decode_json_object(candidate)
    if payload is None:
        return dict(EMPTY_FILTERS)
    return {
        "categoryName": bounded_text(payload.get("categoryName"), MAX_FIELD_LENGTH),
        "artistName": bounded_text(payload.get("artistName"), MAX_FIELD_LENGTH),
    }


class GoodsFilterExtractionProvider:
    def __init__(self, delegate: ChatResponseProvider):
        self.delegate = delegate

    def extract_filters(self, text: str) -> dict[str, str | None]:
        if isinstance(self.delegate, MockChatResponseProvider):
            return dict(EMPTY_FILTERS)
        response = self.delegate.build_response(build_filter_extraction_prompt(text))
        return parse_filter_extraction_json(response.text)
