from typing import Any, Literal, TypeAlias, Union

from pydantic import BaseModel, ConfigDict, Field, field_validator

CLIENT_TEXT_INPUT_TYPE = "text-input"
SERVER_FULL_TEXT_TYPE = "full-text"
SERVER_CONFIG_TYPE = "set-model-and-conf"
SERVER_ERROR_TYPE = "error"
ACTION_NAVIGATE_TYPE = "navigate"
ACTION_HIGHLIGHT_TYPE = "highlight"
ACTION_ADD_TO_CART_TYPE = "addToCart"
CLIENT_TEXT_MAX_LENGTH = 1000
CLIENT_CART_ITEMS_MAX_LENGTH = 50


class NavigateAction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["navigate"] = ACTION_NAVIGATE_TYPE
    path: str = Field(pattern=r"^/goods/\d+$")


class HighlightAction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["highlight"] = ACTION_HIGHLIGHT_TYPE
    selector: str

    @field_validator("selector")
    @classmethod
    def validate_goods_selector(cls, value: str) -> str:
        if (
            value.startswith("[data-goods-id='")
            and value.endswith("']")
            and value.removeprefix("[data-goods-id='").removesuffix("']").isdigit()
        ):
            return value
        if (
            value.startswith('[data-goods-id="')
            and value.endswith('"]')
            and value.removeprefix('[data-goods-id="').removesuffix('"]').isdigit()
        ):
            return value
        raise ValueError("selector must target a numeric data-goods-id")


class AddToCartAction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["addToCart"] = ACTION_ADD_TO_CART_TYPE
    goodsId: str = Field(pattern=r"^\d+$")


ActionPayload: TypeAlias = Union[NavigateAction, HighlightAction, AddToCartAction]


class ClientTextInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["text-input"] = CLIENT_TEXT_INPUT_TYPE
    text: str = Field(min_length=1, max_length=CLIENT_TEXT_MAX_LENGTH)
    context: "ClientContext | None" = None

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        stripped_value = value.strip()
        if not stripped_value:
            raise ValueError("text must not be blank")
        return stripped_value


class CartContextItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    goodsId: str | int
    name: str
    quantity: int
    tags: list[str] = Field(default_factory=list)
    artistName: str | None = None
    categoryName: str | None = None


class ClientContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    cartItems: list[CartContextItem] = Field(
        default_factory=list,
        max_length=CLIENT_CART_ITEMS_MAX_LENGTH,
    )


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
