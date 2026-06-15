from fastapi import FastAPI

from project_cyan_ai.api.websocket import router as websocket_router

app = FastAPI(title="Project Cyan AI", version="0.1.0")
app.include_router(websocket_router)

@app.get("/health")
async def health():
    return {"status": "ok"}