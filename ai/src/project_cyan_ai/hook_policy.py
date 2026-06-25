import json
import re
import time
from dataclasses import dataclass
from typing import Any, Protocol
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from project_cyan_ai.schemas.ws import ActionPayload, FullTextMessage

DEFAULT_HOOK_MESSAGE = "요청을 처리하기 전에 내용을 다시 확인해주세요."
DEFAULT_POLICY_TTL_SECONDS = 30
POLICY_REQUEST_TIMEOUT_SECONDS = 3.0


@dataclass(frozen=True)
class HookPolicy:
    hook: str
    check: str
    threshold: str
    action: str
    message: str
    enabled: bool = True
    priority: int = 0


class HookPolicyClient(Protocol):
    def fetch_policies(self) -> list[HookPolicy]:
        """Return active hook policies."""
        ...


class SpringHookPolicyClient:
    def __init__(
        self,
        spring_api_url: str,
        timeout_seconds: float = POLICY_REQUEST_TIMEOUT_SECONDS,
    ):
        self.spring_api_url = spring_api_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    def fetch_policies(self) -> list[HookPolicy]:
        request = Request(
            f"{self.spring_api_url}/ai/hooks",
            headers={"Accept": "application/json"},
            method="GET",
        )
        with urlopen(request, timeout=self.timeout_seconds) as response:
            payload = json.loads(response.read().decode("utf-8"))

        if not isinstance(payload, list):
            return []

        policies: list[HookPolicy] = []
        for item in payload:
            if not isinstance(item, dict):
                continue
            try:
                policies.append(
                    HookPolicy(
                        hook=str(item["hook"]),
                        check=str(item["check"]),
                        threshold=str(item["threshold"]),
                        action=str(item["action"]),
                        message=str(item["message"]),
                        enabled=bool(item.get("enabled", True)),
                        priority=int(item.get("priority", 0)),
                    )
                )
            except (KeyError, TypeError, ValueError):
                continue

        return sorted(policies, key=lambda policy: policy.priority)


class CachedHookPolicyProvider:
    def __init__(
        self,
        client: HookPolicyClient,
        ttl_seconds: int = DEFAULT_POLICY_TTL_SECONDS,
    ):
        self.client = client
        self.ttl_seconds = max(1, ttl_seconds)
        self.cached_policies: list[HookPolicy] = []
        self.expires_at = 0.0

    def get_policies(self) -> list[HookPolicy]:
        now = time.monotonic()
        if now < self.expires_at:
            return self.cached_policies

        try:
            self.cached_policies = self.client.fetch_policies()
            self.expires_at = now + self.ttl_seconds
        except (HTTPError, TimeoutError, URLError, OSError, ValueError, json.JSONDecodeError):
            if not self.cached_policies:
                self.expires_at = now + self.ttl_seconds

        return self.cached_policies


class HookFilter:
    def __init__(self, policy_provider: CachedHookPolicyProvider):
        self.policy_provider = policy_provider

    def filter_input(self, text: str) -> FullTextMessage | None:
        for policy in self._policies_for("input"):
            if not self._violates_text_policy(text, policy):
                continue
            if policy.action in ("stop", "review"):
                return FullTextMessage(text=policy.message or DEFAULT_HOOK_MESSAGE, actions=[])
        return None

    def filter_output(self, response: FullTextMessage) -> FullTextMessage:
        next_response = response
        for policy in self._policies_for("output"):
            if policy.check == "actionScope" and policy.action == "filter":
                next_response = FullTextMessage(
                    text=next_response.text,
                    actions=self._filter_actions(next_response.actions, policy.threshold),
                )
                continue

            if policy.check == "forbiddenWords" and self._contains_forbidden_word(next_response.text, policy.threshold):
                if policy.action == "rewrite":
                    next_response = FullTextMessage(text=policy.message, actions=[])
                elif policy.action in ("stop", "review"):
                    next_response = FullTextMessage(text=policy.message or DEFAULT_HOOK_MESSAGE, actions=[])

        return next_response

    def _policies_for(self, hook: str) -> list[HookPolicy]:
        return [
            policy
            for policy in self.policy_provider.get_policies()
            if policy.enabled and policy.hook == hook
        ]

    def _violates_text_policy(self, text: str, policy: HookPolicy) -> bool:
        if policy.check == "maxLength":
            return len(text) > parse_number(policy.threshold, default=0)
        if policy.check == "forbiddenWords":
            return self._contains_forbidden_word(text, policy.threshold)
        if policy.check == "specialCharRatio":
            return character_ratio(text, r"[^0-9A-Za-z가-힣\s]") >= parse_ratio(policy.threshold)
        if policy.check == "numberRatio":
            return character_ratio(text, r"[0-9]") >= parse_ratio(policy.threshold)
        if policy.check == "englishRatio":
            return character_ratio(text, r"[A-Za-z]") >= parse_ratio(policy.threshold)
        return False

    def _contains_forbidden_word(self, text: str, threshold: str) -> bool:
        words = parse_list(threshold)
        if not words or words == ["관리자 목록"]:
            return False
        normalized_text = text.casefold()
        return any(word.casefold() in normalized_text for word in words)

    def _filter_actions(
        self,
        actions: list[ActionPayload],
        threshold: str,
    ) -> list[ActionPayload]:
        allowed_types = set(parse_list(threshold))
        if not allowed_types:
            return actions
        return [action for action in actions if action.type in allowed_types]


def parse_list(value: str) -> list[str]:
    return [item.strip() for item in re.split(r"[,，]", value or "") if item.strip()]


def parse_ratio(value: str) -> float:
    stripped_value = str(value or "").strip()
    if stripped_value.endswith("%"):
        return parse_number(stripped_value[:-1], default=100.0) / 100.0
    return parse_number(stripped_value, default=1.0)


def parse_number(value: str, default: float = 0.0) -> float:
    try:
        return float(str(value).strip())
    except (TypeError, ValueError):
        return default


def character_ratio(text: str, pattern: str) -> float:
    if not text:
        return 0.0
    matches = re.findall(pattern, text)
    return len(matches) / len(text)


def build_hook_filter(spring_api_url: str, ttl_seconds: int) -> HookFilter:
    return HookFilter(
        CachedHookPolicyProvider(
            SpringHookPolicyClient(spring_api_url),
            ttl_seconds=ttl_seconds,
        )
    )
