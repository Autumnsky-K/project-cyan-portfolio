from typing import Any, Literal

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from project_cyan_ai.behavior import BehaviorEngine
from project_cyan_ai.goods_catalog import CatalogGroundedChatResponseProvider, build_runtime_goods_catalog_client
from project_cyan_ai.hook_policy import build_hook_filter
from project_cyan_ai.providers import get_chat_response_provider
from project_cyan_ai.providers.chat_response import AI_FALLBACK_TEXT
from project_cyan_ai.runtime_config import RuntimeModelConnectionProvider, runtime_config_from_draft
from project_cyan_ai.settings import get_settings


router = APIRouter(prefix="/internal/admin/behavior", tags=["internal-admin-behavior"])
connection_router = APIRouter(prefix="/internal/admin/model-connections", tags=["internal-admin-model-connections"])


class BehaviorTraceRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    customer_input: str = Field(alias="customerInput", min_length=1, max_length=1000)
    logic_functions: str = Field(default="", alias="logicFunctions")
    admin_settings: str = Field(default="", alias="adminSettings")
    motion_list: str = Field(default="", alias="motionList")
    memory_log: str = Field(default="", alias="memoryLog")
    pipeline_mode: Literal["faithful18", "optimized"] = Field(
        default="faithful18",
        alias="pipelineMode",
    )
    config_version: int = Field(default=0, alias="configVersion")
    model_connection_profile_id: int | None = Field(default=None, alias="modelConnectionProfileId")
    context: dict[str, Any] | None = None


@router.post("/trace")
def trace_behavior(
    request: BehaviorTraceRequest,
    service_token: str | None = Header(default=None, alias="X-Project-Cyan-Service-Token"),
):
    settings = get_settings()
    if settings.internal_service_token and service_token != settings.internal_service_token:
        raise HTTPException(status_code=401, detail="invalid service token")

    runtime_connection = None
    if request.model_connection_profile_id is not None:
        runtime_connection = RuntimeModelConnectionProvider(
            settings.spring_api_url,
            service_token=settings.internal_service_token,
        ).resolve(request.model_connection_profile_id)
    base_provider = get_chat_response_provider(enable_shopping_tools=False, runtime_connection=runtime_connection)
    search_provider = get_chat_response_provider(enable_shopping_tools=False, runtime_connection=runtime_connection)
    response_provider = CatalogGroundedChatResponseProvider(
        delegate=base_provider,
        catalog_client=build_runtime_goods_catalog_client(settings.spring_api_url),
    )
    engine = BehaviorEngine(
        base_provider=search_provider,
        response_provider=response_provider,
        hook_filter=build_hook_filter(
            settings.spring_api_url,
            settings.hook_policy_cache_ttl_seconds,
        ),
    )
    config = runtime_config_from_draft(request.model_dump(by_alias=True))
    execution = engine.run(
        request.customer_input,
        config,
        context=request.context,
        memory_log=request.memory_log,
    )
    return {
        "ok": True,
        "run": execution.run,
        "response": execution.response.model_dump(),
    }


class ConnectionTestRequest(BaseModel):
    profile_id: int = Field(alias="profileId", gt=0)


@connection_router.post("/test")
def test_model_connection(
    request: ConnectionTestRequest,
    service_token: str | None = Header(default=None, alias="X-Project-Cyan-Service-Token"),
):
    settings = get_settings()
    if not settings.internal_service_token or service_token != settings.internal_service_token:
        raise HTTPException(status_code=401, detail="invalid service token")
    try:
        runtime_connection = RuntimeModelConnectionProvider(
            settings.spring_api_url,
            service_token=settings.internal_service_token,
        ).resolve(request.profile_id)
        provider = get_chat_response_provider(
            enable_shopping_tools=False,
            runtime_connection=runtime_connection,
        )
        response = provider.build_response("연결 상태 확인에 짧게 응답해주세요.")
        if response.text == AI_FALLBACK_TEXT:
            raise ValueError("provider returned the safe fallback response")
        return {
            "ok": True,
            "profileId": runtime_connection.profile_id,
            "profileVersion": runtime_connection.profile_version,
            "provider": runtime_connection.provider,
        }
    # behavior.py 109번째 줄
    except (OSError, TimeoutError, ValueError, KeyError) as exception:
        import traceback; traceback.print_exc()  # 임시 추가
        raise HTTPException(status_code=502, detail="model connection test failed") from exception
