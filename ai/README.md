# project-cyan AI

project-cyan의 FastAPI 기반 AI WebSocket 서버입니다.

프론트엔드 WebSocket, provider env, Live2D 렌더러까지 포함한 전체 로컬 통합 설정은 `../docs/ai-live2d-local-setup.md`를 참고합니다.

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

## 응답 provider 설정

기본 응답 provider는 로컬 개발용 `mock`입니다.

AI 서버는 실행 위치가 `ai/`일 때 `ai/.env`와 `ai/.env.local`을 읽습니다. 루트의 `npm run dev`와 `npm run dev:ai`는 내부에서 `cd ai` 후 서버를 실행하므로, 로컬 AI 설정 파일은 `ai/` 바로 아래에 둡니다.

```text
ai/.env
ai/.env.local
```

`ai/.env`는 팀 공통 placeholder나 개인 로컬 설정에 사용할 수 있고, `ai/.env.local`은 개인 override에 사용할 수 있습니다. 두 파일 모두 `.gitignore` 대상이므로 커밋하지 않습니다. 쉘에서 직접 export한 환경변수가 있으면 `.env` 값보다 우선합니다.

```bash
PROJECT_CYAN_AI_PROVIDER=mock
```

실제 LLM 응답을 받을 때는 provider를 원하는 LLM adapter로 바꾸고 접속 정보를 로컬 비밀 설정에 넣습니다. Project Cyan은 OLV 서버를 별도로 실행해 `/client-ws`로 다시 연결하지 않습니다. OLV의 LLM adapter 구조만 참고해 AI 서버 안에서 LLM provider를 직접 호출합니다.

OpenAI API를 사용할 때는 아래처럼 설정합니다.

```env
PROJECT_CYAN_AI_PROVIDER=openai
PROJECT_CYAN_LLM_BASE_URL=https://api.openai.com/v1
PROJECT_CYAN_LLM_API_KEY=<LLM API key>
PROJECT_CYAN_LLM_MODEL=gpt-5.4-mini
```

Claude API를 사용할 때도 같은 `PROJECT_CYAN_LLM_*` 키를 사용합니다.

```env
PROJECT_CYAN_AI_PROVIDER=claude
PROJECT_CYAN_LLM_BASE_URL=https://api.anthropic.com
PROJECT_CYAN_LLM_API_KEY=<LLM API key>
PROJECT_CYAN_LLM_MODEL=claude-3-haiku-20240307
```

`PROJECT_CYAN_LLM_API_KEY`는 필수 값입니다. 실제 API key, token, password, secret은 문서와 커밋에 남기지 말고 `ai/.env` 또는 `ai/.env.local`에만 보관합니다.

`PROJECT_CYAN_OLV_GATEWAY_URL`과 `PROJECT_CYAN_OLV_API_KEY`는 OLV-compatible REST gateway가 별도로 있을 때만 쓰는 실험적 호환 설정입니다. OLV 원본 서버의 `/client-ws` WebSocket을 Project Cyan AI 서버가 다시 호출하는 구조는 현재 권장 경로가 아닙니다.

LLM provider는 응답 안의 `[ACTION:...]` 태그를 파싱해 WebSocket 응답의 `actions` 배열로 변환하고, 챗봇 말풍선에 표시되는 `text`에서는 해당 태그를 제거합니다.

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
