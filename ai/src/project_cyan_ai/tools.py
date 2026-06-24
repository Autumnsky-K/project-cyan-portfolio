import json
import re
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

GOODS_API_TIMEOUT_SECONDS = 5.0
DEFAULT_GOODS_PAGE_SIZE = 10
GOODS_ID_PATTERN = re.compile(r"^\d+$")


class GoodsToolError(RuntimeError):
    pass


def normalize_goods(value: Any) -> dict[str, Any] | None:
    if not isinstance(value, dict):
        return None

    goods_id = value.get("goodsId")
    name = value.get("name")

    if goods_id is None or not isinstance(name, str):
        return None

    normalized = {
        "goodsId": str(goods_id),
        "name": name,
        "price": value.get("price"),
        "imageUrl": value.get("imageUrl"),
        "tags": value.get("tags") if isinstance(value.get("tags"), list) else [],
        "artistName": value.get("artistName"),
        "categoryName": value.get("categoryName"),
        "salesStatus": value.get("salesStatus"),
        "isBestSeller": value.get("isBestSeller"),
        "aiPickDefault": value.get("aiPickDefault"),
    }

    if "description" in value:
        normalized["description"] = value.get("description")
    if "artistId" in value:
        normalized["artistId"] = value.get("artistId")
    if "stockCount" in value:
        normalized["stockCount"] = value.get("stockCount")

    return normalized


class GoodsApiClient:
    def __init__(
        self,
        base_url: str,
        timeout_seconds: float = GOODS_API_TIMEOUT_SECONDS,
    ):
        self.base_url = base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    def search_goods(
        self,
        query: str | None = None,
        options: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        options = options or {}
        params: dict[str, Any] = {
            "page": int(options.get("page", 0) or 0),
            "size": int(options.get("size", DEFAULT_GOODS_PAGE_SIZE) or DEFAULT_GOODS_PAGE_SIZE),
        }

        if query:
            params["q"] = query

        for key in ("tag", "tags", "artistId", "artistIds", "categoryId", "categoryIds", "sort"):
            value = options.get(key)
            if value is not None and value != "":
                params[key] = value

        payload = self._get_json(f"/goods?{urlencode(params)}")
        content = payload.get("content") if isinstance(payload, dict) else None
        goods = [normalized for item in content or [] if (normalized := normalize_goods(item))]

        return {
            "goods": goods,
            "page": payload.get("page", params["page"]) if isinstance(payload, dict) else params["page"],
            "size": payload.get("size", params["size"]) if isinstance(payload, dict) else params["size"],
            "totalElements": payload.get("totalElements", len(goods)) if isinstance(payload, dict) else len(goods),
            "totalPages": payload.get("totalPages", 1) if isinstance(payload, dict) else 1,
        }

    def get_goods_detail(self, goods_id: str | int) -> dict[str, Any]:
        normalized_goods_id = str(goods_id).strip()
        if not GOODS_ID_PATTERN.fullmatch(normalized_goods_id):
            raise GoodsToolError("Invalid goodsId.")

        payload = self._get_json(f"/goods/{normalized_goods_id}")
        normalized = normalize_goods(payload)

        if normalized is None:
            raise GoodsToolError("Invalid goods detail response.")

        return normalized

    def _get_json(self, path: str) -> Any:
        request = Request(
            f"{self.base_url}{path}",
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="GET",
        )

        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                return json.loads(response.read().decode("utf-8"))
        except (HTTPError, TimeoutError, URLError, OSError, ValueError) as exception:
            raise GoodsToolError("Goods API request failed.") from exception


class ShoppingTools:
    def __init__(self, goods_client: GoodsApiClient):
        self.goods_client = goods_client

    def call(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        if name == "search_goods":
            result = self.search_goods(arguments)
            return {"ok": True, **result}

        if name == "get_goods_detail":
            goods_id = arguments.get("goodsId")
            if goods_id is None:
                raise GoodsToolError("goodsId is required.")
            return {"ok": True, "goods": self.get_goods_detail(goods_id)}

        raise GoodsToolError(f"Unsupported shopping tool: {name}")

    def search_goods(self, arguments: dict[str, Any]) -> dict[str, Any]:
        query = arguments.get("query")
        options = arguments.get("options") if isinstance(arguments.get("options"), dict) else {}

        for key in ("tag", "tags", "artistId", "artistIds", "categoryId", "categoryIds", "page", "size", "sort"):
            if key in arguments and key not in options:
                options[key] = arguments[key]

        return self.goods_client.search_goods(
            query=query if isinstance(query, str) else None,
            options=options,
        )

    def get_goods_detail(self, goods_id: str | int) -> dict[str, Any]:
        return self.goods_client.get_goods_detail(goods_id)


def collect_goods_ids(tool_result: Any) -> set[str]:
    goods_ids: set[str] = set()

    if isinstance(tool_result, dict):
        goods = tool_result.get("goods")
        if isinstance(goods, list):
            for item in goods:
                if isinstance(item, dict) and item.get("goodsId") is not None:
                    goods_ids.add(str(item["goodsId"]))
        elif isinstance(goods, dict) and goods.get("goodsId") is not None:
            goods_ids.add(str(goods["goodsId"]))

        if tool_result.get("goodsId") is not None:
            goods_ids.add(str(tool_result["goodsId"]))

    return goods_ids


def build_recommendation_actions(goods_ids: list[str], include_add_to_cart: bool = False) -> str:
    tags: list[str] = []

    for goods_id in goods_ids:
        tags.append(f'[ACTION:navigate path="/goods/{goods_id}"]')
        tags.append(f'[ACTION:highlight selector="[data-goods-id=\'{goods_id}\']"]')
        if include_add_to_cart:
            tags.append(f'[ACTION:addToCart goodsId="{goods_id}"]')

    return " ".join(tags)
