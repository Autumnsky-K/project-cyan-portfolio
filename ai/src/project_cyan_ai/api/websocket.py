from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from project_cyan_ai.goods_catalog import (
    CatalogGroundedChatResponseProvider,
    HttpGoodsCatalogClient,
)
from project_cyan_ai.providers import get_chat_response_provider
from project_cyan_ai.schemas.ws import (
    CLIENT_TEXT_INPUT_TYPE,
    ClientTextInput,
    ErrorMessage,
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
    response_provider = CatalogGroundedChatResponseProvider(
        delegate=get_chat_response_provider(),
        catalog_client=HttpGoodsCatalogClient(settings.spring_api_url),
    )

    await websocket.send_json(
        FullTextMessage(text="Connection established").model_dump()
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

            if data.get("type") != CLIENT_TEXT_INPUT_TYPE:
                await websocket.send_json(
                    ErrorMessage(message="Unsupported message type.").model_dump()
                )
                continue

            try:
                message = ClientTextInput.model_validate(data)
            except ValidationError:
                await websocket.send_json(
                    ErrorMessage(message="Invalid text-input message.").model_dump()
                )
                continue

            response = response_provider.build_response(message.text)
            await websocket.send_json(response.model_dump())

    except WebSocketDisconnect:
        return
