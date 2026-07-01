from dataclasses import dataclass, field
from typing import Literal, TypeAlias

from project_cyan_ai.schemas.ws import FullTextMessage

AuthReason: TypeAlias = Literal[
    "accountPersonalization",
    "chatHistory",
    "persistence",
    "guestLimit",
]

GUEST_REQUEST_LIMIT = 10
GUEST_HISTORY_MESSAGE_LIMIT = 20
LOGIN_PATH = "/login"

AUTH_REQUIRED_PHRASES: tuple[tuple[AuthReason, tuple[str, ...]], ...] = (
    (
        "accountPersonalization",
        (
            "내 찜",
            "찜한 상품",
            "위시리스트",
            "구매 이력",
            "주문 이력",
            "내가 산 상품",
        ),
    ),
    (
        "chatHistory",
        (
            "지난번",
            "저번 세션",
            "이전 대화",
            "예전에 말한 내용",
        ),
    ),
    (
        "persistence",
        (
            "대화 저장",
            "다음에도 기억",
            "기억을 저장",
        ),
    ),
)

AUTH_REQUIRED_TEXT: dict[AuthReason, str] = {
    "accountPersonalization": "로그인하면 찜과 구매 이력을 참고해 더 잘 추천할 수 있어요.",
    "chatHistory": "로그인하면 이전 대화를 확인하고 이어갈 수 있어요.",
    "persistence": "로그인하면 다음 접속에도 대화를 이어갈 수 있어요.",
    "guestLimit": "게스트 채팅 이용 횟수를 모두 사용했어요. 로그인하고 계속 대화해 주세요.",
}


def classify_auth_required(text: str) -> AuthReason | None:
    for reason, phrases in AUTH_REQUIRED_PHRASES:
        if any(phrase in text for phrase in phrases):
            return reason
    return None


def build_auth_required_response(reason: AuthReason) -> FullTextMessage:
    return FullTextMessage(
        text=AUTH_REQUIRED_TEXT[reason],
        actions=[],
        metadata={
            "authRequired": True,
            "authReason": reason,
            "loginPath": LOGIN_PATH,
        },
    )


@dataclass
class GuestChatState:
    request_count: int = 0
    history: list[dict] = field(default_factory=list)

    @property
    def limit_reached(self) -> bool:
        return self.request_count >= GUEST_REQUEST_LIMIT

    def record_request(self) -> None:
        self.request_count += 1

    def append_exchange(self, user_text: str, assistant_text: str) -> None:
        self.history.extend(
            [
                {"speaker": "USER", "messageText": user_text},
                {"speaker": "ASSISTANT", "messageText": assistant_text},
            ]
        )
        self.history = self.history[-GUEST_HISTORY_MESSAGE_LIMIT:]

    def reset(self) -> None:
        self.request_count = 0
        self.history = []
