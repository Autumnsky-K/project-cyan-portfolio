from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from project_cyan_ai.chat_history import (
    ChatHistoryClient,
    build_assistant_message_payload,
    build_user_message_payload,
)
from project_cyan_ai.conversation_summary import ConversationSummaryProvider
from project_cyan_ai.favorite_artists import (
    CachedFavoriteArtistProvider,
    FavoriteArtistClient,
)
from project_cyan_ai.goods_catalog import (
    CatalogGroundedChatResponseProvider,
    HttpGoodsCatalogClient,
    MetadataTsvGoodsCatalogClient,
    TsvGoodsCatalogClient,
    has_product_intent,
)
from project_cyan_ai.providers import get_chat_response_provider
from project_cyan_ai.hook_policy import build_hook_filter
from project_cyan_ai.personalization_context import (
    PersonalizationContextClient,
    repair_recent_summaries,
    with_current_session_history,
)
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
    base_response_provider = get_chat_response_provider()
    response_provider = CatalogGroundedChatResponseProvider(
        delegate=base_response_provider,
        catalog_client=catalog_client,
    )
    summary_provider = ConversationSummaryProvider(
        get_chat_response_provider(enable_shopping_tools=False)
    )
    chat_history_client = ChatHistoryClient(settings.spring_api_url)
    personalization_client = PersonalizationContextClient(settings.spring_api_url)
    favorite_artist_provider = CachedFavoriteArtistProvider(
        FavoriteArtistClient(settings.spring_api_url),
        cache_ttl_seconds=settings.favorite_artist_cache_ttl_seconds,
    )
    access_token: str | None = None
    active_session_id: int | None = None
    personalization_context: dict | None = None
    personalization_session_id: int | None = None
    personalization_loaded = False
    history_session_id: int | None = None
    current_session_history: list[dict] = []
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
                    favorite_artist_provider.clear()
                    personalization_context = None
                    personalization_session_id = None
                    personalization_loaded = False
                    history_session_id = None
                    current_session_history = []
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
                if active_session_id is not None and active_session_id != message.sessionId:
                    finalize_session(
                        access_token,
                        active_session_id,
                        chat_history_client,
                        summary_provider,
                    )
                active_session_id = message.sessionId
                if history_session_id != message.sessionId:
                    current_session_history = load_current_session_history(
                        access_token,
                        message.sessionId,
                        chat_history_client,
                    )
                    history_session_id = message.sessionId

            if access_token and (
                not personalization_loaded
                or personalization_session_id != message.sessionId
            ):
                personalization_context = personalization_client.fetch_context(
                    access_token,
                    message.sessionId,
                )
                if repair_recent_summaries(
                    personalization_context,
                    access_token,
                    chat_history_client,
                    summary_provider,
                ):
                    personalization_context = personalization_client.fetch_context(
                        access_token,
                        message.sessionId,
                    )
                personalization_session_id = message.sessionId
                personalization_loaded = True

            if access_token and message.sessionId:
                chat_history_client.create_message(
                    access_token,
                    message.sessionId,
                    build_user_message_payload(message.text),
                )

            favorite_artists = []
            if has_product_intent(message.text):
                context_artists = (
                    personalization_context.get("favoriteArtists")
                    if isinstance(personalization_context, dict)
                    else None
                )
                favorite_artists = (
                    context_artists
                    if isinstance(context_artists, list)
                    else favorite_artist_provider.favorite_artists(access_token)
                )
            response = response_provider.build_response(
                message.text,
                message.context,
                favorite_artists,
                with_current_session_history(
                    personalization_context,
                    current_session_history,
                ),
            )
            response = hook_filter.filter_output(response)

            if access_token and message.sessionId:
                chat_history_client.create_message(
                    access_token,
                    message.sessionId,
                    build_assistant_message_payload(response, message.text),
                )

            if message.sessionId:
                current_session_history.extend(
                    [
                        {"speaker": "USER", "messageText": message.text},
                        {"speaker": "ASSISTANT", "messageText": response.text},
                    ]
                )

            await websocket.send_json(response.model_dump())

    except WebSocketDisconnect:
        pass
    finally:
        if access_token and active_session_id:
            finalize_session(
                access_token,
                active_session_id,
                chat_history_client,
                summary_provider,
            )


def finalize_session(
    access_token: str,
    session_id: int,
    history_client: ChatHistoryClient,
    summary_provider: ConversationSummaryProvider,
) -> None:
    try:
        messages = history_client.fetch_messages(access_token, session_id)
        summary_payload = summary_provider.summarize(messages)
        if summary_payload is not None:
            history_client.upsert_summary(access_token, session_id, summary_payload)
        history_client.end_session(access_token, session_id)
    except (AttributeError, TypeError, ValueError):
        return


def load_current_session_history(
    access_token: str,
    session_id: int,
    history_client: ChatHistoryClient,
) -> list[dict]:
    try:
        messages = history_client.fetch_messages(access_token, session_id)
    except (AttributeError, TypeError, ValueError):
        return []
    if not isinstance(messages, list):
        return []
    return [
        {
            "speaker": message.get("speaker"),
            "messageText": message.get("messageText"),
        }
        for message in messages
        if isinstance(message, dict)
        and message.get("speaker") in ("USER", "ASSISTANT")
        and isinstance(message.get("messageText"), str)
        and message.get("messageText").strip()
    ]
