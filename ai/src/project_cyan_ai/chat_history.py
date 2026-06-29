import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from project_cyan_ai.schemas.ws import FullTextMessage

CHAT_HISTORY_TIMEOUT_SECONDS = 2.0


class ChatHistoryClient:
    def __init__(
        self,
        spring_api_url: str,
        timeout_seconds: float = CHAT_HISTORY_TIMEOUT_SECONDS,
    ):
        self.base_url = spring_api_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    def create_message(
        self,
        access_token: str,
        session_id: int,
        payload: dict,
    ) -> bool:
        if not access_token or session_id < 1:
            return False

        request = Request(
            f"{self.base_url}/virtual-chat/sessions/{session_id}/messages",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Accept": "application/json",
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json; charset=utf-8",
            },
            method="POST",
        )

        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                response.read()
            return True
        except (HTTPError, URLError, TimeoutError, OSError, ValueError):
            return False

    def fetch_messages(self, access_token: str, session_id: int) -> list[dict] | None:
        payload = self._request_json(
            access_token,
            f"/virtual-chat/sessions/{session_id}/messages",
            "GET",
        )
        return payload if isinstance(payload, list) else None

    def fetch_sessions(
        self,
        access_token: str,
        page: int = 0,
        size: int = 4,
    ) -> list[dict] | None:
        payload = self._request_json(
            access_token,
            f"/virtual-chat/sessions?page={page}&size={size}&sort=startedAt,desc",
            "GET",
        )
        if not isinstance(payload, dict):
            return None
        sessions = payload.get("content")
        return sessions if isinstance(sessions, list) else None

    def upsert_summary(
        self,
        access_token: str,
        session_id: int,
        payload: dict,
    ) -> bool:
        return self._request_json(
            access_token,
            f"/virtual-chat/sessions/{session_id}/summary",
            "PUT",
            payload,
        ) is not None

    def end_session(self, access_token: str, session_id: int) -> bool:
        if not access_token or session_id < 1:
            return False
        request = Request(
            f"{self.base_url}/virtual-chat/sessions/{session_id}/end",
            headers={
                "Accept": "application/json",
                "Authorization": f"Bearer {access_token}",
            },
            method="PATCH",
        )
        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                response.read()
            return True
        except (HTTPError, URLError, TimeoutError, OSError, ValueError):
            return False

    def _request_json(
        self,
        access_token: str,
        path: str,
        method: str,
        payload: dict | None = None,
    ) -> object | None:
        if not access_token:
            return None
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {access_token}",
        }
        data = None
        if payload is not None:
            headers["Content-Type"] = "application/json; charset=utf-8"
            data = json.dumps(payload).encode("utf-8")
        request = Request(
            f"{self.base_url}{path}",
            data=data,
            headers=headers,
            method=method,
        )
        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                raw_payload = response.read()
            return json.loads(raw_payload.decode("utf-8")) if raw_payload else {}
        except (
            HTTPError,
            URLError,
            TimeoutError,
            OSError,
            ValueError,
            json.JSONDecodeError,
        ):
            return None


def build_user_message_payload(text: str) -> dict:
    return {
        "speaker": "USER",
        "messageText": text,
        "action": None,
        "actions": [],
        "metadata": {},
        "recommendations": [],
    }


def build_assistant_message_payload(
    response: FullTextMessage,
    request_text: str,
) -> dict:
    actions = [action.model_dump() for action in response.actions]

    return {
        "speaker": "ASSISTANT",
        "messageText": response.text,
        "action": actions[0]["type"] if actions else None,
        "actions": actions,
        "metadata": response.metadata,
        "recommendations": recommendation_payloads(
            response.metadata,
            request_text,
        ),
    }


def recommendation_payloads(metadata: dict, request_text: str) -> list[dict]:
    recommendations = metadata.get("recommendations")
    if not isinstance(recommendations, list):
        return []

    payloads = []
    for index, recommendation in enumerate(recommendations):
        if not isinstance(recommendation, dict):
            continue

        goods_id = parse_positive_int(recommendation.get("goodsId"))
        if goods_id is None:
            continue

        rank_order = parse_non_negative_int(recommendation.get("rankOrder"))
        reason = recommendation.get("recommendationReason")
        payloads.append(
            {
                "goodsId": goods_id,
                "requestText": request_text,
                "recommendationReason": reason if isinstance(reason, str) else None,
                "rankOrder": rank_order if rank_order is not None else index,
            }
        )

    return payloads


def parse_positive_int(value: object) -> int | None:
    try:
        parsed_value = int(value)
    except (TypeError, ValueError):
        return None

    return parsed_value if parsed_value > 0 else None


def parse_non_negative_int(value: object) -> int | None:
    try:
        parsed_value = int(value)
    except (TypeError, ValueError):
        return None

    return parsed_value if parsed_value >= 0 else None
