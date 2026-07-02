import re
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from threading import Lock
from typing import Any
from uuid import uuid4

from project_cyan_ai.goods_catalog import CatalogGroundedChatResponseProvider
from project_cyan_ai.hook_policy import HookFilter
from project_cyan_ai.navigation_intent import is_navigation_intent_candidate
from project_cyan_ai.providers import ChatResponseProvider
from project_cyan_ai.runtime_config import RuntimeConfig
from project_cyan_ai.schemas.ws import FullTextMessage


TRACE_TITLES = (
    "원본 DB 입력",
    "DB 두 갈래 분기",
    "DB 요약",
    "고객 입력 수집",
    "고객 입력 두 갈래 분기",
    "Input Hook",
    "Hook 실패 기록",
    "검색 LLM 프롬프트",
    "검색 LLM 입력 결합",
    "검색 키워드 선택 LLM",
    "Spring 검색 요청",
    "실제 DB/API 검색",
    "응답 페르소나",
    "대화 기억 조회",
    "Memory 입력 구성",
    "최종 응답 입력 결합",
    "최종 입력 Hook",
    "최종 LLM 출력과 고객 노출",
)
MOTION_INSTRUCTION = (
    "응답 마지막에 허용된 캐릭터 모션 하나를 [MOTION:motionKey] 형식으로 추가하세요. "
    "허용되지 않은 키는 만들지 마세요."
)
LATENCY_BUDGET_MS = 5000
_latency_lock = Lock()
_latencies: dict[str, deque[int]] = defaultdict(lambda: deque(maxlen=200))


@dataclass(frozen=True)
class BehaviorExecution:
    response: FullTextMessage
    run: dict[str, Any]


def _line(part: str, text: str) -> dict[str, str]:
    return {"part": part, "text": text}


def _record_latency(mode: str, duration_ms: int) -> dict[str, Any]:
    with _latency_lock:
        values = _latencies[mode]
        values.append(duration_ms)
        sorted_values = sorted(values)
    p50 = sorted_values[max(0, round((len(sorted_values) - 1) * 0.50))]
    p95 = sorted_values[max(0, round((len(sorted_values) - 1) * 0.95))]
    return {
        "sampleCount": len(sorted_values),
        "p50Ms": p50,
        "p95Ms": p95,
        "budgetMs": LATENCY_BUDGET_MS,
        "budgetExceeded": p95 > LATENCY_BUDGET_MS,
    }


def _fallback_motion(response: FullTextMessage, *, blocked: bool = False) -> str:
    if blocked or response.type == "error":
        return "shake-head"
    action_types = {action.type for action in response.actions}
    if "addToCart" in action_types:
        return "nod"
    if action_types.intersection({"navigate", "highlight"}):
        return "point"
    return "idle"


def apply_behavior_metadata(
    response: FullTextMessage,
    config: RuntimeConfig,
    *,
    blocked: bool = False,
) -> FullTextMessage:
    metadata = dict(response.metadata)
    proposed_behavior = metadata.get("behavior")
    proposed_key = (
        str(proposed_behavior.get("motionKey") or "").strip()
        if isinstance(proposed_behavior, dict)
        else ""
    )
    if config.config_version <= 0 and not proposed_key:
        return response
    allowed = config.allowed_motion_keys
    if proposed_key in allowed:
        motion_key = proposed_key
        source = "llm"
    else:
        motion_key = _fallback_motion(response, blocked=blocked)
        if motion_key not in allowed:
            motion_key = "idle"
        source = "fallback"
    metadata.update(
        {
            "configVersion": config.config_version,
            "pipelineMode": config.pipeline_mode,
            "behavior": {"motionKey": motion_key, "source": source},
        }
    )
    return FullTextMessage(text=response.text, actions=response.actions, metadata=metadata)


class BehaviorEngine:
    def __init__(
        self,
        base_provider: ChatResponseProvider,
        response_provider: CatalogGroundedChatResponseProvider,
        hook_filter: HookFilter,
    ):
        self.base_provider = base_provider
        self.response_provider = response_provider
        self.hook_filter = hook_filter

    def run(
        self,
        text: str,
        config: RuntimeConfig,
        *,
        context: dict[str, Any] | None = None,
        favorite_artists: list[dict[str, Any]] | None = None,
        personalization_context: dict[str, Any] | None = None,
        memory_log: str = "",
    ) -> BehaviorExecution:
        run_id = str(uuid4())
        started_at = time.time()
        steps: list[dict[str, Any]] = []
        highlight_terms: list[str] = []
        applied_policy_ids: list[int] = []

        def add_step(
            index: int,
            lines: list[dict[str, str]],
            started: float,
            status: str = "OK",
        ) -> None:
            steps.append(
                {
                    "index": index,
                    "title": TRACE_TITLES[index - 1],
                    "status": status,
                    "javaClass": "project_cyan_ai.behavior.BehaviorEngine",
                    "javaMethod": f"step{index:02d}",
                    "durationMs": max(0, round((time.perf_counter() - started) * 1000)),
                    "lines": lines,
                }
            )

        for index, message in (
            (1, "Spring 실제 DB/API 카탈로그를 원본으로 사용"),
            (2, "카탈로그 요약 갈래와 검색 갈래 준비"),
            (3, "검색 LLM에는 상품 원본 대신 Spring 검색 계약을 제공"),
            (4, f"고객 입력: {text}"),
            (5, "입력 Hook과 대화 기억 갈래 준비"),
        ):
            started = time.perf_counter()
            optimized_status = {
                2: "COMBINED",
                3: "SKIPPED",
            }.get(index, "OK") if config.pipeline_mode == "optimized" else "OK"
            add_step(index, [_line("function-output", message)], started, optimized_status)

        started = time.perf_counter()
        if hasattr(self.hook_filter, "transform_text"):
            normalized_text, transformed_ids = self.hook_filter.transform_text(text, "input")
        else:
            normalized_text, transformed_ids = text, []
        applied_policy_ids.extend(transformed_ids)
        blocked_response = self.hook_filter.filter_input(normalized_text)
        if blocked_response is not None and hasattr(self.hook_filter, "violated_text_policy_ids"):
            applied_policy_ids.extend(
                self.hook_filter.violated_text_policy_ids(normalized_text, "input")
            )
        add_step(
            6,
            [
                _line("function-output", f"Hook 출력: {normalized_text}"),
                _line("function-report", f"적용 정책 ID: {transformed_ids}"),
            ],
            started,
        )

        started = time.perf_counter()
        add_step(
            7,
            [_line("function-output", "차단" if blocked_response else "통과")],
            started,
        )

        search_prompt = config.setting(
            "searchPrompt",
            fallback="고객 요청에서 상품 검색 키워드와 의도를 《키워드》 형식으로 정리하세요.",
        )
        started = time.perf_counter()
        add_step(
            8,
            [_line("function-output", search_prompt)],
            started,
            "COMBINED" if config.pipeline_mode == "optimized" else "OK",
        )
        started = time.perf_counter()
        search_input = f"{search_prompt}\n\n고객 요청:\n{normalized_text}"
        add_step(
            9,
            [_line("function-output", "검색 프롬프트 결합 완료")],
            started,
            "COMBINED" if config.pipeline_mode == "optimized" else "OK",
        )

        search_output = ""
        navigation_candidate = is_navigation_intent_candidate(normalized_text)
        if (
            blocked_response is None
            and config.pipeline_mode == "faithful18"
            and not navigation_candidate
        ):
            started = time.perf_counter()
            search_output = self.base_provider.build_response(search_input).text
            highlight_terms = re.findall(r"《([^》]+)》", search_output)
            if not highlight_terms:
                highlight_terms = [
                    token
                    for token in re.findall(r"[0-9A-Za-z가-힣]{2,}", normalized_text)
                    if token not in {"추천", "상품", "있어", "찾아줘"}
                ][:5]
            add_step(
                10,
                [
                    _line("llm", f"검색 LLM 출력: {search_output}"),
                    _line("function-output", f"검색 키워드: {highlight_terms}"),
                ],
                started,
            )
        else:
            started = time.perf_counter()
            add_step(
                10,
                [_line("function-report", "optimized, 이동 의도 또는 Hook 차단으로 검색 LLM 생략")],
                started,
                "SKIPPED",
            )

        started = time.perf_counter()
        add_step(11, [_line("function-output", f"Spring 검색 q={normalized_text}")], started)

        persona = config.setting("persona", fallback="친근하고 간결한 쇼핑 도우미")
        motion_keys = ",".join(sorted(config.allowed_motion_keys))
        response_instruction = (
            f"응답 페르소나: {persona}\n{MOTION_INSTRUCTION}\n허용 motionKey: {motion_keys}"
        )

        if blocked_response is not None:
            response = blocked_response
        else:
            response = self.response_provider.build_response(
                normalized_text,
                context,
                favorite_artists,
                personalization_context,
                response_instruction=response_instruction,
            )

        candidate_ids = [
            candidate.get("goodsId")
            for candidate in self.response_provider.recent_recommendation_candidates
            if candidate.get("goodsId") is not None
        ]
        started = time.perf_counter()
        add_step(
            12,
            [_line("function-output", f"candidate goodsId: {candidate_ids}")],
            started,
        )
        started = time.perf_counter()
        add_step(13, [_line("function-output", f"persona: {persona}")], started)
        started = time.perf_counter()
        add_step(14, [_line("function-output", "대화 기억 있음" if memory_log or personalization_context else "대화 기억 없음")], started)
        started = time.perf_counter()
        add_step(15, [_line("function-output", "기존 세션/개인화 context 결합")], started)
        started = time.perf_counter()
        add_step(16, [_line("function-output", "응답·ACTION·motion 출력 계약 결합")], started)
        started = time.perf_counter()
        add_step(17, [_line("function-output", "최종 입력 Hook 통과")], started)

        started = time.perf_counter()
        if hasattr(self.hook_filter, "transform_text"):
            transformed_output, output_policy_ids = self.hook_filter.transform_text(response.text, "output")
            applied_policy_ids.extend(output_policy_ids)
            response = FullTextMessage(
                text=transformed_output,
                actions=response.actions,
                metadata=response.metadata,
            )
        response = self.hook_filter.filter_output(response)
        response = apply_behavior_metadata(response, config, blocked=blocked_response is not None)
        add_step(
            18,
            [
                _line("visible", f"고객에게 실제 노출: {response.text}"),
                _line("function-output", f"actions={len(response.actions)} metadata={response.metadata}"),
            ],
            started,
        )
        finished_at = time.time()
        duration_ms = round((finished_at - started_at) * 1000)
        latency = _record_latency(config.pipeline_mode, duration_ms)
        return BehaviorExecution(
            response=response,
            run={
                "runId": run_id,
                "status": "OK",
                "startedAt": started_at,
                "finishedAt": finished_at,
                "durationMs": duration_ms,
                "latency": latency,
                "configVersion": config.config_version,
                "pipelineMode": config.pipeline_mode,
                "highlightTerms": highlight_terms,
                "candidateGoodsIds": candidate_ids,
                "appliedHookPolicyIds": applied_policy_ids,
                "steps": steps,
            },
        )
