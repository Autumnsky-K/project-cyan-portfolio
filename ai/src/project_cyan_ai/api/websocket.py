from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from project_cyan_ai.chat_history import (
    ChatHistoryClient,
    build_assistant_message_payload,
    build_user_message_payload,
)
from project_cyan_ai.goods_catalog import (
    CatalogGroundedChatResponseProvider,
    HttpGoodsCatalogClient,
    MetadataTsvGoodsCatalogClient,
    TsvGoodsCatalogClient,
)
from project_cyan_ai.providers import get_chat_response_provider
from project_cyan_ai.hook_policy import build_hook_filter
from project_cyan_ai.schemas.ws import (
    CLIENT_AUTH_TYPE,
    CLIENT_TEXT_INPUT_TYPE,
    ClientAuthMessage,
    ClientTextInput,
    FullTextMessage,
    ModelConfigMessage,
)
from project_cyan_ai.settings import get_settings

router = APIRouter()


@router.websocket("/client-ws")
async def client_ws(websocket: WebSocket):
    await websocket.accept()
    client_uid = str(uuid4())
    settings = get_settings()
    if settings.goods_catalog_metadata_url:
        catalog_client = MetadataTsvGoodsCatalogClient(
            settings.goods_catalog_metadata_url,
            cache_ttl_seconds=settings.goods_catalog_cache_ttl_seconds,
        )
    elif settings.goods_catalog_tsv_url:
        catalog_client = TsvGoodsCatalogClient(
            settings.goods_catalog_tsv_url,
            cache_ttl_seconds=settings.goods_catalog_cache_ttl_seconds,
        )
    else:
        catalog_client = HttpGoodsCatalogClient(settings.spring_api_url)
    response_provider = CatalogGroundedChatResponseProvider(
        delegate=get_chat_response_provider(),
        catalog_client=catalog_client,
    )
    chat_history_client = ChatHistoryClient(settings.spring_api_url)
    access_token: str | None = None
    hook_filter = build_hook_filter(
        settings.spring_api_url,
        settings.hook_policy_cache_ttl_seconds,
    )

    await websocket.send_json(
        FullTextMessage(text="안녕! 저는 당신의 쇼핑을 도와줄 cyan이에요! 원하시는 상품이 있으면 말해주세요! 추천이랑 카드 담기까지 모두 해드릴게요!").model_dump()
    )
    await websocket.send_json(
        ModelConfigMessage(
            conf_name="project-cyan-ai",
            conf_uid="default",
            client_uid=client_uid,
        ).model_dump()
    )

    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") == CLIENT_AUTH_TYPE:
                try:
                    auth_message = ClientAuthMessage.model_validate(data)
                    access_token = auth_message.accessToken
                except ValidationError:
                    await websocket.send_json(
                        FullTextMessage(
                            text="인증 정보를 확인해주세요.",
                            actions=[],
                        ).model_dump()
                    )
                continue

            if data.get("type") != CLIENT_TEXT_INPUT_TYPE:
                await websocket.send_json(
                    FullTextMessage(
                        text="지원하지 않는 메시지 형식이에요.",
                        actions=[],
                    ).model_dump()
                )
                continue

            raw_text = data.get("text")
            if isinstance(raw_text, str):
                blocked_response = hook_filter.filter_input(raw_text.strip())
                if blocked_response is not None:
                    await websocket.send_json(blocked_response.model_dump())
                    continue

            try:
                message = ClientTextInput.model_validate(data)
            except ValidationError:
                await websocket.send_json(
                    FullTextMessage(
                        text="입력 내용을 확인해주세요.",
                        actions=[],
                    ).model_dump()
                )
                continue

            blocked_response = hook_filter.filter_input(message.text)
            if blocked_response is not None:
                await websocket.send_json(blocked_response.model_dump())
                continue

            if access_token and message.sessionId:
                chat_history_client.create_message(
                    access_token,
                    message.sessionId,
                    build_user_message_payload(message.text),
                )

            response = response_provider.build_response(message.text, message.context)
            response = hook_filter.filter_output(response)

            if access_token and message.sessionId:
                chat_history_client.create_message(
                    access_token,
                    message.sessionId,
                    build_assistant_message_payload(response, message.text),
                )

            await websocket.send_json(response.model_dump())

    except WebSocketDisconnect:
        return
