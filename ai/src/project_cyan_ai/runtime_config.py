import csv
import hashlib
import json
import time
from dataclasses import dataclass
from typing import Any, Literal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


PipelineMode = Literal["faithful18", "optimized"]
DEFAULT_CONFIG_CACHE_TTL_SECONDS = 30
DEFAULT_MOTION_KEYS = ("idle", "wave", "point", "nod", "shake-head")

DEFAULT_LOGIC_FUNCTIONS = "\n".join(
    ["step\tname\tdescription"]
    + [f"{index:02d}\tstep-{index:02d}\tFastAPI runtime step {index:02d}" for index in range(1, 19)]
)
DEFAULT_ADMIN_SETTINGS = "\n".join(
    [
        "section\tkey\tvalue\tnote",
        "searchPrompt\tformat\t오타보정 + 의도분류 + 검색키워드 추출\t검색 LLM",
        "persona\ttone\t친근하고 간결한 쇼핑 도우미\t최종 응답",
        "responseContract\tfields\ttext,actions,metadata.behavior\tWebSocket 출력",
    ]
)
DEFAULT_MOTION_LIST = "\n".join(
    [
        "motionKey\tlabel\tmodelMode\tfileKey\ttrigger\tloop\tpriority\tnote",
        "idle\t기본 대기\t2d,3d\t-\t대기\ttrue\t10\t기본 fallback",
        "wave\t손 흔들기\t2d,3d\twave\t인사\tfalse\t20\t자산 없으면 idle",
        "point\t상품 가리키기\t2d,3d\tpoint\t추천\tfalse\t30\t자산 없으면 idle",
        "nod\t고개 끄덕이기\t2d,3d\tnod\t확인\tfalse\t40\t자산 없으면 idle",
        "shake-head\t고개 젓기\t2d,3d\tshake_head\t오류\tfalse\t50\t자산 없으면 idle",
    ]
)


@dataclass(frozen=True)
class RuntimeConfig:
    config_version: int
    pipeline_mode: PipelineMode
    published_at: str
    logic_functions: str
    admin_settings: str
    motion_list: str
    model_connection: dict[str, int] | None = None

    @property
    def allowed_motion_keys(self) -> set[str]:
        rows = csv.DictReader(self.motion_list.splitlines(), delimiter="\t")
        values = {
            str(row.get("motionKey") or "").strip()
            for row in rows
            if str(row.get("motionKey") or "").strip()
        }
        return values or set(DEFAULT_MOTION_KEYS)

    def setting(self, section: str, key: str | None = None, fallback: str = "") -> str:
        rows = csv.DictReader(self.admin_settings.splitlines(), delimiter="\t")
        for row in rows:
            if str(row.get("section") or "").strip().casefold() != section.casefold():
                continue
            if key is not None and str(row.get("key") or "").strip().casefold() != key.casefold():
                continue
            for field in ("value", "key", "note"):
                value = str(row.get(field) or "").strip()
                if value:
                    return value
        return fallback


def default_runtime_config() -> RuntimeConfig:
    return RuntimeConfig(
        config_version=0,
        pipeline_mode="faithful18",
        published_at="",
        logic_functions=DEFAULT_LOGIC_FUNCTIONS,
        admin_settings=DEFAULT_ADMIN_SETTINGS,
        motion_list=DEFAULT_MOTION_LIST,
        model_connection=None,
    )


class RuntimeConfigProvider:
    def __init__(
        self,
        spring_api_url: str,
        ttl_seconds: int = DEFAULT_CONFIG_CACHE_TTL_SECONDS,
        timeout_seconds: float = 3.0,
        service_token: str | None = None,
    ):
        self.spring_api_url = spring_api_url.rstrip("/")
        self.ttl_seconds = max(1, ttl_seconds)
        self.timeout_seconds = timeout_seconds
        self.service_token = service_token
        self.cached = default_runtime_config()
        self.expires_at = 0.0

    def get(self) -> RuntimeConfig:
        now = time.monotonic()
        if now < self.expires_at:
            return self.cached
        try:
            self.cached = self._fetch()
        except (HTTPError, TimeoutError, URLError, OSError, ValueError, KeyError, json.JSONDecodeError):
            pass
        self.expires_at = now + self.ttl_seconds
        return self.cached

    def _fetch(self) -> RuntimeConfig:
        headers = {"Accept": "application/json"}
        if self.service_token:
            headers["X-Project-Cyan-Service-Token"] = self.service_token
        request = Request(
            f"{self.spring_api_url}/ai/runtime-config",
            headers=headers,
            method="GET",
        )
        with urlopen(request, timeout=self.timeout_seconds) as response:
            manifest = json.loads(response.read().decode("utf-8"))
        files = manifest.get("files") or {}
        checksums = manifest.get("checksums") or {}
        logic_functions = self._download_verified(files["logicFunctionsUrl"], checksums["logicFunctions"])
        admin_settings = self._download_verified(files["adminSettingsUrl"], checksums["adminSettings"])
        motion_list = self._download_verified(files["motionListUrl"], checksums["motionList"])
        mode = parse_pipeline_mode(manifest.get("pipelineMode"))
        return RuntimeConfig(
            config_version=int(manifest["configVersion"]),
            pipeline_mode=mode,
            published_at=str(manifest.get("publishedAt") or ""),
            logic_functions=logic_functions,
            admin_settings=admin_settings,
            motion_list=motion_list,
            model_connection=_model_connection_reference(manifest.get("modelConnection")),
        )

    def _download_verified(self, url: str, expected_checksum: str) -> str:
        with urlopen(str(url), timeout=self.timeout_seconds) as response:
            payload = response.read()
        actual = hashlib.sha256(payload).hexdigest()
        if actual != str(expected_checksum):
            raise ValueError("runtime config checksum mismatch")
        return payload.decode("utf-8")


def runtime_config_from_draft(payload: dict) -> RuntimeConfig:
    mode = parse_pipeline_mode(payload.get("pipelineMode"))
    return RuntimeConfig(
        config_version=int(payload.get("configVersion") or 0),
        pipeline_mode=mode,
        published_at="",
        logic_functions=str(payload.get("logicFunctions") or DEFAULT_LOGIC_FUNCTIONS),
        admin_settings=str(payload.get("adminSettings") or DEFAULT_ADMIN_SETTINGS),
        motion_list=str(payload.get("motionList") or DEFAULT_MOTION_LIST),
        model_connection=None,
    )


def parse_pipeline_mode(value: Any) -> PipelineMode:
    mode = str(value or "faithful18")
    if mode not in ("faithful18", "optimized"):
        raise ValueError("unsupported pipelineMode")
    return mode  # type: ignore[return-value]


def _model_connection_reference(value: Any) -> dict[str, int] | None:
    if not isinstance(value, dict) or value.get("profileId") is None:
        return None
    return {
        "profileId": int(value["profileId"]),
        "profileVersion": int(value["profileVersion"]),
    }


@dataclass(frozen=True)
class RuntimeModelConnection:
    profile_id: int
    profile_version: int
    provider: str
    connection_type: str
    base_url: str | None
    model: str
    credential: dict[str, Any]


class RuntimeModelConnectionProvider:
    def __init__(
        self,
        spring_api_url: str,
        timeout_seconds: float = 5.0,
        service_token: str | None = None,
    ):
        self.spring_api_url = spring_api_url.rstrip("/")
        self.timeout_seconds = timeout_seconds
        self.service_token = service_token

    def resolve(
        self,
        profile_id: int,
        profile_version: int | None = None,
    ) -> RuntimeModelConnection:
        payload: dict[str, Any] = {"profileId": profile_id}
        if profile_version is not None:
            payload["profileVersion"] = profile_version
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json; charset=utf-8",
        }
        if self.service_token:
            headers["X-Project-Cyan-Service-Token"] = self.service_token
        request = Request(
            f"{self.spring_api_url}/ai/internal/model-connections/resolve",
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        with urlopen(request, timeout=self.timeout_seconds) as response:
            value = json.loads(response.read().decode("utf-8"))
        credential = value.get("credential") or {}
        if not isinstance(credential, dict):
            raise ValueError("runtime credential must be an object")
        return RuntimeModelConnection(
            profile_id=int(value["profileId"]),
            profile_version=int(value["profileVersion"]),
            provider=str(value["provider"]),
            connection_type=str(value["connectionType"]),
            base_url=str(value["baseUrl"]) if value.get("baseUrl") else None,
            model=str(value["model"]),
            credential=credential,
        )
