from fastapi import FastAPI

from project_cyan_ai.api.websocket import router as websocket_router
from project_cyan_ai.api.behavior import connection_router, router as behavior_router
from project_cyan_ai.api.goods_embeddings import router as goods_embeddings_router

app = FastAPI(title="Project Cyan AI", version="0.1.0")
app.include_router(websocket_router)
app.include_router(behavior_router)
app.include_router(connection_router)
app.include_router(goods_embeddings_router)

@app.get("/health")
async def health():
    return {"status": "ok"}
