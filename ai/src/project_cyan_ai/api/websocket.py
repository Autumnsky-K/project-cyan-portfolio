from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from project_cyan_ai.schemas.ws import ClientTextInput, ErrorMessage, ServerMessage

router = APIRouter()

@router.websocket("/client-ws")
async def client_ws(websocket: WebSocket):
    await websocket.accept()
    client_uid = str(uuid4())

    await websocket.send_json({
        "type": "full-text",
        "text": "Connection established",
        "actions": [],
    })
    await websocket.send_json({
        "type": "set-model-and-conf",
        "model_info": {},
        "conf_name": "project-cyan-ai",
        "conf_uid": "default",
        "client_uid": client_uid,
    })

    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") != "text-input":
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

            response = ServerMessage(
                type="full-text",
                text=f"받은 메시지: {message.text}",
                actions=[],
            )
            await websocket.send_json(response.model_dump())

    except WebSocketDisconnect:
        return