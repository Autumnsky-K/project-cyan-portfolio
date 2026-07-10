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
    build_semantic_or_fallback_goods_catalog_client,
    has_product_intent,
)
from project_cyan_ai.goods_filter_extraction import GoodsFilterExtractionProvider
from project_cyan_ai.guest_chat_policy import (
    GuestChatState,
    build_auth_required_response,
    classify_auth_required,
)
from project_cyan_ai.providers import OpenAiChatResponseProvider, get_chat_response_provider
from project_cyan_ai.hook_policy import build_hook_filter
from project_cyan_ai.behavior import BehaviorEngine, apply_behavior_metadata
from project_cyan_ai.personalization_context import (
    PersonalizationContextClient,
    build_recent_sessions_fallback,
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
from project_cyan_ai.runtime_config import RuntimeConfigProvider, RuntimeModelConnectionProvider

router = APIRouter()


@router.websocket("/client-ws")
async def client_ws(websocket: WebSocket):
    await websocket.accept()
    client_uid = str(uuid4())
    settings = get_settings()
    runtime_config_provider = RuntimeConfigProvider(
        settings.spring_api_url,
        settings.runtime_config_cache_ttl_seconds,
        service_token=settings.internal_service_token,
    )
    runtime_config = runtime_config_provider.get()
    runtime_connection = None
    runtime_connection_failed = False
    if runtime_config.model_connection:
        try:
            runtime_connection = RuntimeModelConnectionProvider(
                settings.spring_api_url,
                service_token=settings.internal_service_token,
            ).resolve(
                runtime_config.model_connection["profileId"],
                runtime_config.model_connection["profileVersion"],
            )
        except (OSError, TimeoutError, ValueError, KeyError):
            runtime_connection_failed = True
    catalog_client = build_semantic_or_fallback_goods_catalog_client(
        settings.spring_api_url,
        settings.openai_embeddings_api_key,
        settings.openai_embeddings_base_url,
        settings.openai_embeddings_model,
    )
    base_response_provider = (
        OpenAiChatResponseProvider(client=None)
        if runtime_connection_failed
        else get_chat_response_provider(enable_shopping_tools=False, runtime_connection=runtime_connection)
    )
    filter_extraction_provider = GoodsFilterExtractionProvider(base_response_provider)
    response_provider = CatalogGroundedChatResponseProvider(
        delegate=base_response_provider,
        catalog_client=catalog_client,
        filter_extraction_provider=filter_extraction_provider,
    )
    summary_provider = ConversationSummaryProvider(
        OpenAiChatResponseProvider(client=None)
        if runtime_connection_failed
        else get_chat_response_provider(enable_shopping_tools=False, runtime_connection=runtime_connection)
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
    # MVP: this per-connection guest limit intentionally resets on WebSocket reconnect.
    guest_state = GuestChatState()
    hook_filter = build_hook_filter(
        settings.spring_api_url,
        settings.hook_policy_cache_ttl_seconds,
    )
    search_response_provider = (
        OpenAiChatResponseProvider(client=None)
        if runtime_connection_failed
        else get_chat_response_provider(enable_shopping_tools=False, runtime_connection=runtime_connection)
    )
    behavior_engine = BehaviorEngine(
        base_provider=search_response_provider,
        response_provider=response_provider,
        hook_filter=hook_filter,
    )

    if not await send_websocket_json(
        websocket,
        FullTextMessage(text="안녕! Hiena에요! 당신의 쇼핑을 도와줄게요!\n원하시는 상품이 있으면 말해주세요!\n추천이랑 카트 담기까지 모두 해드릴게요!").model_dump(),
    ):
        return
    if not await send_websocket_json(
        websocket,
        ModelConfigMessage(
            conf_name="project-cyan-ai",
            conf_uid="default",
            client_uid=client_uid,
        ).model_dump(),
    ):
        return

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
                    guest_state.reset()
                    response_provider.clear_connection_context()
                except ValidationError:
                    if not await send_websocket_json(websocket,
                        FullTextMessage(
                            text="인증 정보를 확인해주세요.",
                            actions=[],
                        ).model_dump(),
                    ):
                        return
                continue

            if data.get("type") != CLIENT_TEXT_INPUT_TYPE:
                if not await send_websocket_json(websocket,
                    FullTextMessage(
                        text="지원하지 않는 메시지 형식이에요.",
                        actions=[],
                    ).model_dump(),
                ):
                    return
                continue

            raw_text = data.get("text")
            if isinstance(raw_text, str):
                blocked_response = hook_filter.filter_input(raw_text.strip())
                if blocked_response is not None:
                    if not await send_websocket_json(websocket,
                        apply_behavior_metadata(
                            blocked_response,
                            runtime_config_provider.get(),
                            blocked=True,
                        ).model_dump(),
                    ):
                        return
                    continue

            try:
                message = ClientTextInput.model_validate(data)
            except ValidationError:
                if not await send_websocket_json(websocket,
                    FullTextMessage(
                        text="입력 내용을 확인해주세요.",
                        actions=[],
                    ).model_dump(),
                ):
                    return
                continue

            blocked_response = hook_filter.filter_input(message.text)
            if blocked_response is not None:
                if not await send_websocket_json(websocket, blocked_response.model_dump()):
                    return
                continue

            if not access_token:
                auth_reason = classify_auth_required(message.text)
                if auth_reason is not None:
                    if not await send_websocket_json(
                        websocket,
                        build_auth_required_response(auth_reason).model_dump(),
                    ):
                        return
                    continue
                if guest_state.limit_reached:
                    if not await send_websocket_json(
                        websocket,
                        build_auth_required_response("guestLimit").model_dump(),
                    ):
                        return
                    continue
                guest_state.record_request()

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
                if personalization_context is None:
                    personalization_context = build_recent_sessions_fallback(
                        access_token,
                        message.sessionId,
                        chat_history_client,
                    )
                if repair_recent_summaries(
                    personalization_context,
                    access_token,
                    chat_history_client,
                    summary_provider,
                ):
                    refreshed_context = personalization_client.fetch_context(
                        access_token,
                        message.sessionId,
                    )
                    if refreshed_context is not None:
                        personalization_context = refreshed_context
                personalization_session_id = message.sessionId
                personalization_loaded = True

            if access_token and message.sessionId:
                chat_history_client.create_message(
                    access_token,
                    message.sessionId,
                    build_user_message_payload(message.text),
                )

            favorite_artists = []
            if access_token and has_product_intent(message.text):
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
            execution = behavior_engine.run(
                message.text,
                runtime_config_provider.get(),
                context=message.context,
                favorite_artists=favorite_artists,
                personalization_context=with_current_session_history(
                    personalization_context,
                    current_session_history if access_token else guest_state.history,
                ),
            )
            response = execution.response

            if access_token and message.sessionId:
                chat_history_client.create_message(
                    access_token,
                    message.sessionId,
                    build_assistant_message_payload(response, message.text),
                )

            if access_token and message.sessionId:
                current_session_history.extend(
                    [
                        {"speaker": "USER", "messageText": message.text},
                        {"speaker": "ASSISTANT", "messageText": response.text},
                    ]
                )
            elif not access_token:
                guest_state.append_exchange(message.text, response.text)

            if not await send_websocket_json(websocket, response.model_dump()):
                return

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


async def send_websocket_json(websocket: WebSocket, payload: dict) -> bool:
    try:
        await websocket.send_json(payload)
        return True
    except (WebSocketDisconnect, OSError):
        return False


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
