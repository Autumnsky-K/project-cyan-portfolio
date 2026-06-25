from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class ProjectCyanAiSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ai_provider: str = Field(default="mock", alias="PROJECT_CYAN_AI_PROVIDER")
    llm_base_url: str | None = Field(
        default=None,
        alias="PROJECT_CYAN_LLM_BASE_URL",
    )
    llm_api_key: str | None = Field(default=None, alias="PROJECT_CYAN_LLM_API_KEY")
    llm_model: str | None = Field(
        default=None,
        alias="PROJECT_CYAN_LLM_MODEL",
    )
    olv_gateway_url: str | None = Field(
        default=None,
        alias="PROJECT_CYAN_OLV_GATEWAY_URL",
    )
    olv_api_key: str | None = Field(default=None, alias="PROJECT_CYAN_OLV_API_KEY")
    spring_api_url: str = Field(
        default="http://localhost:8080/api",
        alias="PROJECT_CYAN_SPRING_API_URL",
    )
    goods_api_base_url: str = Field(
        default="http://localhost:8080/api",
        alias="PROJECT_CYAN_GOODS_API_BASE_URL",
    )
    goods_catalog_tsv_url: str | None = Field(
        default=None,
        alias="PROJECT_CYAN_GOODS_CATALOG_TSV_URL",
    )
    goods_catalog_metadata_url: str | None = Field(
        default=None,
        alias="PROJECT_CYAN_GOODS_CATALOG_METADATA_URL",
    )
    goods_catalog_cache_ttl_seconds: int = Field(
        default=300,
        alias="PROJECT_CYAN_GOODS_CATALOG_CACHE_TTL_SECONDS",
    )


def get_settings() -> ProjectCyanAiSettings:
    return ProjectCyanAiSettings()
