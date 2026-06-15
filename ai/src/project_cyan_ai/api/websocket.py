from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from project_cyan_ai.schemas.ws import (
    CLIENT_TEXT_INPUT_TYPE,
    AddToCartAction,
    ClientTextInput,
    ErrorMessage,
    FullTextMessage,
    HighlightAction,
    ModelConfigMessage,
    NavigateAction,
)

router = APIRouter()

RECOMMENDATION_KEYWORDS = ("추천", "보여줘", "상품")
CART_KEYWORDS = ("장바구니", "담아줘")
MOCK_GOODS_ID = "42"


def build_mock_response(text: str) -> FullTextMessage:
    actions = []

    if any(keyword in text for keyword in RECOMMENDATION_KEYWORDS):
        actions.extend(
            [
                NavigateAction(path=f"/goods/{MOCK_GOODS_ID}"),
                HighlightAction(selector=f"[data-goods-id='{MOCK_GOODS_ID}']"),
            ]
        )

    if any(keyword in text for keyword in CART_KEYWORDS):
        actions.append(AddToCartAction(goodsId=MOCK_GOODS_ID))

    if actions:
        return FullTextMessage(
            text="추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
            actions=actions,
        )

    return FullTextMessage(
        text=f"받은 메시지: {text}",
        actions=[],
    )


@router.websocket("/client-ws")
async def client_ws(websocket: WebSocket):
    await websocket.accept()
    client_uid = str(uuid4())

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

            response = build_mock_response(message.text)
            await websocket.send_json(response.model_dump())

    except WebSocketDisconnect:
        return
