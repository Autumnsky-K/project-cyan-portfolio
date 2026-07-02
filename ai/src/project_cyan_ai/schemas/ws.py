from typing import Any, Literal, TypeAlias, Union

from pydantic import BaseModel, ConfigDict, Field, field_validator

CLIENT_AUTH_TYPE = "auth"
CLIENT_TEXT_INPUT_TYPE = "text-input"
SERVER_FULL_TEXT_TYPE = "full-text"
SERVER_CONFIG_TYPE = "set-model-and-conf"
SERVER_ERROR_TYPE = "error"
ACTION_NAVIGATE_TYPE = "navigate"
ACTION_HIGHLIGHT_TYPE = "highlight"
ACTION_ADD_TO_CART_TYPE = "addToCart"
ACTION_SHOW_RECOMMENDATIONS_TYPE = "showRecommendations"
CLIENT_TEXT_MAX_LENGTH = 1000
CLIENT_CART_ITEMS_MAX_LENGTH = 50
CLIENT_RECENT_RECOMMENDATIONS_MAX_LENGTH = 20


class NavigateAction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["navigate"] = ACTION_NAVIGATE_TYPE
    path: str = Field(pattern=r"^/(?:goods(?:/\d+)?|cart)$")


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


class ShowRecommendationsAction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["showRecommendations"] = ACTION_SHOW_RECOMMENDATIONS_TYPE
    goodsIds: list[str] = Field(min_length=2, max_length=20)

    @field_validator("goodsIds")
    @classmethod
    def validate_goods_ids(cls, values: list[str]) -> list[str]:
        if any(not value.isdigit() for value in values):
            raise ValueError("goodsIds must contain numeric strings")
        if len(set(values)) != len(values):
            raise ValueError("goodsIds must be unique")
        return values


ActionPayload: TypeAlias = Union[
    NavigateAction,
    HighlightAction,
    AddToCartAction,
    ShowRecommendationsAction,
]


class ClientTextInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["text-input"] = CLIENT_TEXT_INPUT_TYPE
    text: str = Field(min_length=1, max_length=CLIENT_TEXT_MAX_LENGTH)
    sessionId: int | None = Field(default=None, ge=1)
    context: "ClientContext | None" = None

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        stripped_value = value.strip()
        if not stripped_value:
            raise ValueError("text must not be blank")
        return stripped_value


class ClientAuthMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["auth"] = CLIENT_AUTH_TYPE
    accessToken: str = Field(min_length=1)


class CartContextItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    goodsId: str | int
    name: str
    quantity: int
    tags: list[str] = Field(default_factory=list)
    artistName: str | None = None
    categoryName: str | None = None


class RecentRecommendationContextItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    goodsId: str | int
    rankOrder: int | None = Field(default=None, ge=0)


class ClientContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    cartItems: list[CartContextItem] = Field(
        default_factory=list,
        max_length=CLIENT_CART_ITEMS_MAX_LENGTH,
    )
    recentRecommendations: list[RecentRecommendationContextItem] = Field(
        default_factory=list,
        max_length=CLIENT_RECENT_RECOMMENDATIONS_MAX_LENGTH,
    )
    currentPath: str | None = Field(
        default=None,
        pattern=r"^/(?:goods(?:/\d+)?|cart)$",
    )


class FullTextMessage(BaseModel):
    type: Literal["full-text"] = SERVER_FULL_TEXT_TYPE
    text: str
    actions: list[ActionPayload] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)

    def model_dump(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        payload = super().model_dump(*args, **kwargs)
        if not payload.get("metadata"):
            payload.pop("metadata", None)
        return payload


class ModelConfigMessage(BaseModel):
    type: Literal["set-model-and-conf"] = SERVER_CONFIG_TYPE
    model_info: dict[str, Any] = Field(default_factory=dict)
    conf_name: str
    conf_uid: str
    client_uid: str


class ErrorMessage(BaseModel):
    type: Literal["error"] = SERVER_ERROR_TYPE
    message: str
