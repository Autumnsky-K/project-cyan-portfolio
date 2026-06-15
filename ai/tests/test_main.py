import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from project_cyan_ai.main import app
from project_cyan_ai.schemas.ws import ClientTextInput, FullTextMessage

client = TestClient(app)

def test_health_returns_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_client_text_input_requires_frozen_type():
    with pytest.raises(ValidationError):
        ClientTextInput.model_validate({"type": "ping", "text": "안녕"})


def test_full_text_message_preserves_server_contract_shape():
    message = FullTextMessage(text="안녕")

    assert message.model_dump() == {
        "type": "full-text",
        "text": "안녕",
        "actions": [],
    }


def test_client_ws_sends_initial_messages():
    with client.websocket_connect("/client-ws") as websocket:
        greeting = websocket.receive_json()
        config = websocket.receive_json()

    assert greeting == {
        "type": "full-text",
        "text": "Connection established",
        "actions": [],
    }

    assert config["type"] == "set-model-and-conf"
    assert config["model_info"] == {}
    assert config["conf_name"] == "project-cyan-ai"
    assert config["conf_uid"] == "default"
    assert isinstance(config["client_uid"], str)
    assert config["client_uid"]


def test_client_ws_echoes_valid_text_input():
    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json({"type": "text-input", "text": "안녕"})
        response = websocket.receive_json()

    assert response == {
        "type": "full-text",
        "text": "받은 메시지: 안녕",
        "actions": [],
    }


def test_client_ws_rejects_unsupported_message_type():
    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json({"type": "ping", "text": "안녕"})
        response = websocket.receive_json()

    assert response == {
        "type": "error",
        "message": "Unsupported message type.",
    }


def test_client_ws_rejects_invalid_text_input():
    with client.websocket_connect("/client-ws") as websocket:
        websocket.receive_json()
        websocket.receive_json()

        websocket.send_json({"type": "text-input"})
        response = websocket.receive_json()

    assert response == {
        "type": "error",
        "message": "Invalid text-input message.",
    }
