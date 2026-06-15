from typing import Any, Literal, TypeAlias

from pydantic import BaseModel, Field

CLIENT_TEXT_INPUT_TYPE = "text-input"
SERVER_FULL_TEXT_TYPE = "full-text"
SERVER_CONFIG_TYPE = "set-model-and-conf"
SERVER_ERROR_TYPE = "error"

ActionPayload: TypeAlias = dict[str, str]


class ClientTextInput(BaseModel):
    type: Literal["text-input"] = CLIENT_TEXT_INPUT_TYPE
    text: str


class FullTextMessage(BaseModel):
    type: Literal["full-text"] = SERVER_FULL_TEXT_TYPE
    text: str
    actions: list[ActionPayload] = Field(default_factory=list)


class ModelConfigMessage(BaseModel):
    type: Literal["set-model-and-conf"] = SERVER_CONFIG_TYPE
    model_info: dict[str, Any] = Field(default_factory=dict)
    conf_name: str
    conf_uid: str
    client_uid: str


class ErrorMessage(BaseModel):
    type: Literal["error"] = SERVER_ERROR_TYPE
    message: str
