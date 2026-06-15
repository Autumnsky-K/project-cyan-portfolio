from typing import Any, Literal, TypeAlias, Union

from pydantic import BaseModel, ConfigDict, Field

CLIENT_TEXT_INPUT_TYPE = "text-input"
SERVER_FULL_TEXT_TYPE = "full-text"
SERVER_CONFIG_TYPE = "set-model-and-conf"
SERVER_ERROR_TYPE = "error"
ACTION_NAVIGATE_TYPE = "navigate"
ACTION_HIGHLIGHT_TYPE = "highlight"
ACTION_ADD_TO_CART_TYPE = "addToCart"


class NavigateAction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["navigate"] = ACTION_NAVIGATE_TYPE
    path: str


class HighlightAction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["highlight"] = ACTION_HIGHLIGHT_TYPE
    selector: str


class AddToCartAction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["addToCart"] = ACTION_ADD_TO_CART_TYPE
    goodsId: str


ActionPayload: TypeAlias = Union[NavigateAction, HighlightAction, AddToCartAction]


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
