from project_cyan_ai.behavior import BehaviorEngine
from project_cyan_ai.goods_catalog import CatalogGroundedChatResponseProvider
from project_cyan_ai.hook_policy import CachedHookPolicyProvider, HookFilter, HookPolicy
from project_cyan_ai.runtime_config import (
    RuntimeConfig,
    DEFAULT_LOGIC_FUNCTIONS,
    DEFAULT_MOTION_LIST,
    default_runtime_config,
    runtime_config_from_draft,
)
from project_cyan_ai.schemas.ws import FullTextMessage


class StaticPolicyClient:
    def __init__(self, policies):
        self.policies = policies

    def fetch_policies(self):
        return self.policies


class FakeProvider:
    def __init__(self):
        self.calls = []

    def build_response(self, text, context=None):
        self.calls.append(text)
        if "검색 LLM" in text:
            return FullTextMessage(text="의도보고: 포토카드 추천\n검색키워드: 《포토카드》")
        return FullTextMessage(
            text="추천했어요.",
            metadata={"behavior": {"motionKey": "point", "source": "llm"}},
        )


class FakeCatalogClient:
    def __init__(self):
        self.received_texts = []

    def search_candidates(self, text, favorite_artists=None):
        self.received_texts.append(text)
        return [{"goodsId": 42, "name": "포토카드", "price": 10000}]


def config(mode="faithful18"):
    return RuntimeConfig(
        config_version=12,
        pipeline_mode=mode,
        published_at="2026-06-30T00:00:00Z",
        logic_functions=DEFAULT_LOGIC_FUNCTIONS,
        admin_settings=(
            "section\tkey\tvalue\tnote\n"
            "searchPrompt\tformat\t검색 LLM: 《키워드》를 반환하세요.\t\n"
            "persona\ttone\t친근한 점원\t"
        ),
        motion_list=DEFAULT_MOTION_LIST,
    )


def hook_filter(policies=()):
    return HookFilter(CachedHookPolicyProvider(StaticPolicyClient(list(policies)), ttl_seconds=60))


def test_faithful_engine_returns_eighteen_steps_and_shared_response_contract():
    provider = FakeProvider()
    catalog = FakeCatalogClient()
    grounded = CatalogGroundedChatResponseProvider(provider, catalog)
    execution = BehaviorEngine(provider, grounded, hook_filter()).run("포카 추천", config())

    assert len(execution.run["steps"]) == 18
    assert execution.run["highlightTerms"] == ["포토카드"]
    assert execution.run["searchQuery"] == "포토카드 포카 추천"
    assert catalog.received_texts == ["포토카드 포카 추천"]
    assert execution.run["candidateGoodsIds"] == [42]
    assert execution.response.metadata["configVersion"] == 12
    assert execution.response.metadata["pipelineMode"] == "faithful18"
    assert execution.response.metadata["behavior"] == {"motionKey": "point", "source": "llm"}
    assert len(provider.calls) == 2


def test_runtime_config_defaults_to_faithful_pipeline_but_preserves_admin_choice():
    assert default_runtime_config().pipeline_mode == "faithful18"
    assert runtime_config_from_draft(
        {
            "pipelineMode": "optimized",
            "logicFunctions": DEFAULT_LOGIC_FUNCTIONS,
            "adminSettings": "section\tkey\tvalue\tnote\npersona\ttone\t친근한 점원\t",
            "motionList": DEFAULT_MOTION_LIST,
        }
    ).pipeline_mode == "optimized"


def test_search_llm_corrected_keywords_are_used_for_catalog_query():
    class TypoCorrectingProvider:
        def __init__(self):
            self.calls = []

        def build_response(self, text, context=None):
            self.calls.append(text)
            if "검색키워드" in text:
                return FullTextMessage(
                    text="의도유형: searchGoods\n정규화요청: 히에나 포토카드 있어?\n검색키워드: 《히에나》《포토카드》"
                )
            return FullTextMessage(text="추천했어요.")

    provider = TypoCorrectingProvider()
    catalog = FakeCatalogClient()
    grounded = CatalogGroundedChatResponseProvider(provider, catalog)

    execution = BehaviorEngine(provider, grounded, hook_filter()).run(
        "히ㅇ애나 표토카드 있어?",
        config(),
    )

    assert execution.run["highlightTerms"] == ["히에나", "포토카드"]
    assert execution.run["searchQuery"] == "히에나 포토카드 히ㅇ애나 표토카드 있어?"
    assert catalog.received_texts == ["히에나 포토카드 히ㅇ애나 표토카드 있어?"]


def test_optimized_engine_skips_search_llm_and_uses_one_provider_call():
    provider = FakeProvider()
    grounded = CatalogGroundedChatResponseProvider(provider, FakeCatalogClient())
    execution = BehaviorEngine(provider, grounded, hook_filter()).run("포카 추천", config("optimized"))

    assert execution.run["steps"][9]["status"] == "SKIPPED"
    assert execution.run["steps"][1]["status"] == "COMBINED"
    assert execution.run["latency"]["budgetMs"] == 5000
    assert len(provider.calls) == 1


def test_faithful_engine_skips_all_llm_calls_for_explicit_navigation():
    provider = FakeProvider()
    grounded = CatalogGroundedChatResponseProvider(provider, FakeCatalogClient())

    execution = BehaviorEngine(provider, grounded, hook_filter()).run(
        "굿즈 목록으로 돌아가줘",
        config(),
        context={"currentPath": "/goods/42"},
    )

    assert execution.response.actions[0].path == "/goods"
    assert execution.run["steps"][9]["status"] == "SKIPPED"
    assert provider.calls == []


def test_faithful_engine_uses_only_classifier_llm_for_ambiguous_navigation():
    provider = FakeProvider()
    grounded = CatalogGroundedChatResponseProvider(provider, FakeCatalogClient())

    execution = BehaviorEngine(provider, grounded, hook_filter()).run(
        "저쪽으로 이동해줘",
        config(),
        context={"currentPath": "/goods"},
    )

    assert execution.response.text == "상품 목록과 장바구니 중 어디로 이동할까요?"
    assert execution.run["steps"][9]["status"] == "SKIPPED"
    assert len(provider.calls) == 1


def test_faithful_engine_skips_search_llm_for_numbered_recommendation_follow_up():
    provider = FakeProvider()
    grounded = CatalogGroundedChatResponseProvider(provider, FakeCatalogClient())
    grounded.recent_recommendation_candidates = [
        {"goodsId": 42, "name": "첫 번째"},
        {"goodsId": 84, "name": "두 번째"},
    ]

    execution = BehaviorEngine(provider, grounded, hook_filter()).run(
        "두 번째로 이동해줘",
        config(),
        context={"currentPath": "/goods"},
    )

    assert execution.response.actions[0].path == "/goods/84"
    assert execution.run["steps"][9]["status"] == "SKIPPED"
    assert provider.calls == []


def test_hook_transformations_are_applied_in_priority_order():
    filter_ = hook_filter(
        [
            HookPolicy(
                hook="input",
                check="literalText",
                threshold="포카",
                action="replace",
                message="",
                replacement="포토카드",
                policy_id=3,
            ),
            HookPolicy(
                hook="output",
                check="literalText",
                threshold="♡",
                action="remove",
                message="",
                policy_id=4,
            ),
        ]
    )

    assert filter_.transform_text("포카 추천", "input") == ("포토카드 추천", [3])
    assert filter_.filter_output(FullTextMessage(text="좋아요♡")).text == "좋아요"
