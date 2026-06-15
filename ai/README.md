# project-cyan AI

project-cyan의 FastAPI 기반 AI WebSocket 서버입니다.

## 준비

Python 3.10 이상을 사용합니다.

```bash
cd ai
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

`uv`를 사용하는 경우에는 아래처럼 설치할 수 있습니다.

```bash
cd ai
uv sync --extra dev
```

실제 API key, Supabase/Kakao/OpenAI 키, token, password, private server URL, secret 값은 문서와 커밋에 남기지 않습니다. 로컬 설정이 필요하면 `.env` 또는 `.env.local`에 넣고, 해당 파일은 커밋하지 않습니다.

## 실행

```bash
cd ai
fastapi dev src/project_cyan_ai/main.py --host 127.0.0.1 --port 8000
```

서버 실행 후 헬스 체크는 아래 주소에서 확인할 수 있습니다.

```text
http://localhost:8000/health
```

`uv`를 사용하는 경우에는 아래처럼 실행할 수 있습니다.

```bash
cd ai
uv run fastapi dev src/project_cyan_ai/main.py --host 127.0.0.1 --port 8000
```

## WebSocket 엔드포인트

AI 서버는 OLV 표준 WebSocket 엔드포인트인 `/client-ws`를 제공합니다.

```text
ws://localhost:8000/client-ws
```

클라이언트는 아래 형태의 메시지를 보냅니다.

```json
{
  "type": "text-input",
  "text": "상품 추천 보여줘"
}
```

서버는 연결 직후 초기 메시지와 모델 설정 메시지를 보낸 뒤, `text-input` 요청에 응답합니다. 응답 메시지는 `type`, `text`, `actions` 필드를 포함합니다.

```json
{
  "type": "full-text",
  "text": "추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
  "actions": [
    { "type": "navigate", "path": "/goods/42" },
    { "type": "highlight", "selector": "[data-goods-id='42']" }
  ]
}
```

현재 mock 응답은 추천 관련 문구에 `navigate`, `highlight` 액션을 반환하고, 장바구니 관련 문구에 `addToCart` 액션을 반환합니다. 액션이 없을 때는 `actions`가 빈 배열입니다.

## 프론트엔드 연결

프론트엔드 개발 서버를 로컬 AI 서버와 함께 실행할 때는 WebSocket URL을 환경변수로 넘깁니다.

```bash
cd frontend
VITE_VTUBER_WS_URL=ws://localhost:8000/client-ws npm run dev
```

로컬이 아닌 환경에서는 실제 서버 주소를 문서에 적지 말고 placeholder를 사용합니다.

```bash
VITE_VTUBER_WS_URL=ws://<ai-server-host>/client-ws npm run dev
```

팀 개발용 실제 값은 `.env.local`에 넣어 사용하되, `.env`, `.env.local`, private server URL, token, password, secret은 커밋하지 않습니다.

## 테스트

```bash
cd ai
pytest
```

`uv`를 사용하는 경우에는 아래처럼 실행할 수 있습니다.

```bash
cd ai
uv run pytest
```
