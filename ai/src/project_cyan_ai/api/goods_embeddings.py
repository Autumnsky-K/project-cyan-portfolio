from fastapi import APIRouter, Header, HTTPException

from project_cyan_ai.embeddings import OpenAiEmbeddingsClient
from project_cyan_ai.goods_catalog import MetadataTsvGoodsCatalogClient, TsvGoodsCatalogClient
from project_cyan_ai.goods_embedding_batch import GoodsEmbeddingBatchJob
from project_cyan_ai.settings import ProjectCyanAiSettings, get_settings

router = APIRouter(prefix="/internal/goods-embeddings", tags=["internal-goods-embeddings"])


@router.post("/recompute")
def recompute_goods_embeddings(
    service_token: str | None = Header(default=None, alias="X-Project-Cyan-Service-Token"),
):
    settings = get_settings()
    if settings.internal_service_token and service_token != settings.internal_service_token:
        raise HTTPException(status_code=401, detail="invalid service token")
    if not settings.openai_embeddings_api_key:
        raise HTTPException(status_code=503, detail="openai embeddings api key is not configured")

    job = GoodsEmbeddingBatchJob(
        catalog_client=build_goods_catalog_batch_client(settings),
        embeddings_client=OpenAiEmbeddingsClient(
            base_url=settings.openai_embeddings_base_url,
            api_key=settings.openai_embeddings_api_key,
            model=settings.openai_embeddings_model,
        ),
        spring_api_url=settings.spring_api_url,
        service_token=settings.internal_service_token,
        embedding_model=settings.openai_embeddings_model,
    )
    return job.run()


def build_goods_catalog_batch_client(settings: ProjectCyanAiSettings) -> TsvGoodsCatalogClient:
    if settings.goods_catalog_metadata_url:
        return MetadataTsvGoodsCatalogClient(settings.goods_catalog_metadata_url)
    if settings.goods_catalog_tsv_url:
        return TsvGoodsCatalogClient(settings.goods_catalog_tsv_url)
    raise HTTPException(status_code=503, detail="goods catalog source is not configured")
