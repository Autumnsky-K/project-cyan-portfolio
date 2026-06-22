# AI/Live2D 로컬 통합 설정 가이드

새로 클론한 팀원이 Project Cyan의 AI 챗봇, LLM provider, WebSocket, Live2D 렌더러를 로컬에서 재현하기 위한 가이드입니다. 실제 API key, token, password, secret, private URL은 문서와 커밋에 남기지 말고 placeholder 또는 로컬 env 파일만 사용합니다.

## 전체 구조 요약

```text
frontend
  VtuberChatbot
  Live2D renderer
  VITE_VTUBER_WS_URL
    |
    | WebSocket: ws://localhost:8000/client-ws
    v
AI server
  FastAPI /client-ws
  PROJECT_CYAN_AI_PROVIDER
    |
    +-- mock provider
    +-- LLM provider: openai, claude
    +-- OLV-compatible REST gateway: olv
```

- 프론트엔드는 `frontend/src/features/vtuber/useVtuberWebSocket.ts`에서 WebSocket에 연결합니다.
- AI 서버의 WebSocket endpoint는 `/client-ws`입니다.
- 클라이언트 메시지는 `{ "type": "text-input", "text": "..." }`입니다.
- 서버 응답은 `{ "type": "full-text", "text": "...", "actions": [] }` 형태입니다.
- `actions` 배열은 `docs/api-contract.md`의 `[ACTION]` 계약을 따릅니다.
- Live2D 렌더러는 `frontend/src/features/vtuber/Live2DCharacter.tsx`에서 모델을 표시합니다.
- Cubism Core가 없거나 WebGL/model 로딩이 실패하면 placeholder avatar fallback이 표시됩니다.

## 최초 1회 준비

### npm install

루트 개발 서버는 `concurrently`로 frontend, backend, ai 서버를 함께 실행합니다.

```bash
npm install
```

프론트엔드 패키지는 `frontend/`에 별도 `package.json`이 있으므로 처음 클론한 환경에서는 프론트엔드 의존성도 설치합니다.

```bash
cd frontend
npm install
```

### AI 의존성 준비

AI 서버는 Python 3.10 이상을 사용합니다. `uv`를 사용하는 경우:

```bash
cd ai
uv sync --extra dev
```

`uv`를 쓰지 않는 경우:

```bash
cd ai
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

### Live2D Cubism Core 다운로드

Live2D Cubism Core는 라이선스상 커밋하지 않습니다. 로컬에서 아래 명령으로 `frontend/public/live2d/runtime/live2dcubismcore.min.js`를 내려받습니다.

```bash
cd frontend
npm run live2d:core
```

다운로드된 `frontend/public/live2d/runtime/live2dcubismcore.min.js`는 `.gitignore` 대상입니다.

## 프론트엔드 env 설정

프론트엔드 env 파일은 `frontend/` 기준으로 읽힙니다.

```text
frontend/.env.development
frontend/.env.local
```

커밋 가능한 기본값은 `frontend/.env.development`에 둡니다.

```env
VITE_VTUBER_WS_URL=ws://localhost:8000/client-ws
```

개인 환경에서 다른 AI 서버로 연결해야 하면 `frontend/.env.local`에 같은 키를 override합니다.

```env
VITE_VTUBER_WS_URL=ws://<ai-server-host>/client-ws
```

`frontend/.env.local`에는 개인 WebSocket override를 둘 수 있지만, `VITE_` 값은 브라우저에 노출될 수 있으므로 secret을 넣지 않습니다. private URL이 필요할 때도 문서에는 항상 placeholder만 적고 파일은 커밋하지 않습니다.

## AI env 설정

AI 서버는 실행 위치가 `ai/`일 때 아래 파일을 읽습니다.

```text
ai/.env
ai/.env.local
```

루트의 `npm run dev`와 `npm run dev:ai`도 내부에서 `ai/`를 working directory로 사용하므로 같은 파일이 적용됩니다. 쉘에서 직접 export한 환경변수는 env 파일 값보다 우선합니다.

mock provider만 사용할 때:

```env
PROJECT_CYAN_AI_PROVIDER=mock
```

LLM provider를 사용할 때:

```env
PROJECT_CYAN_AI_PROVIDER=<openai-or-claude>
PROJECT_CYAN_LLM_BASE_URL=<llm-base-url>
PROJECT_CYAN_LLM_API_KEY=<llm-api-key>
PROJECT_CYAN_LLM_MODEL=<llm-model>
```

OLV-compatible REST gateway를 실험적으로 사용할 때:

```env
PROJECT_CYAN_AI_PROVIDER=olv
PROJECT_CYAN_OLV_GATEWAY_URL=<olv-compatible-rest-gateway-url>
PROJECT_CYAN_OLV_API_KEY=<olv-api-key>
```

Project Cyan AI 서버는 OLV 원본 서버의 `/client-ws` WebSocket으로 다시 연결하는 구조가 아닙니다. `olv` provider는 별도의 REST gateway가 있을 때만 사용합니다.

## mock provider 실행 방법

1. `ai/.env.local`에 provider를 mock으로 둡니다.

```env
PROJECT_CYAN_AI_PROVIDER=mock
```

2. 전체 서버 또는 AI 서버를 실행합니다.

```bash
npm run dev
```

또는:

```bash
npm run dev:ai
```

3. 프론트엔드 챗봇에서 테스트 메시지를 입력합니다.

```text
안녕
추천 상품 보여줘
추천 상품을 장바구니에 담아줘
```

mock provider는 추천 관련 문구에 `navigate`, `highlight` 액션을 붙이고, 장바구니 관련 문구에 `addToCart` 액션을 붙입니다. 서버 응답의 `type`은 `"full-text"`입니다.

## LLM provider 실행 방법

1. `ai/.env.local`에 provider와 LLM 접속 정보를 설정합니다.

```env
PROJECT_CYAN_AI_PROVIDER=openai
PROJECT_CYAN_LLM_BASE_URL=<llm-base-url>
PROJECT_CYAN_LLM_API_KEY=<llm-api-key>
PROJECT_CYAN_LLM_MODEL=<llm-model>
```

또는:

```env
PROJECT_CYAN_AI_PROVIDER=claude
PROJECT_CYAN_LLM_BASE_URL=<llm-base-url>
PROJECT_CYAN_LLM_API_KEY=<llm-api-key>
PROJECT_CYAN_LLM_MODEL=<llm-model>
```

2. AI 서버를 실행합니다.

```bash
npm run dev:ai
```

3. LLM이 액션을 내려야 할 때는 `docs/api-contract.md`의 `[ACTION]` 문법을 따르는 텍스트를 생성해야 합니다.

```text
추천 상품을 보여드릴게요. [ACTION:navigate path="/goods/1002"] [ACTION:highlight selector="[data-goods-id='1002']"]
```

AI 서버는 `[ACTION:...]` 태그를 파싱해 WebSocket 응답의 `actions` 배열로 변환하고, 말풍선에 표시되는 `text`에서는 해당 태그를 제거합니다.

## 전체 서버 실행

루트에서 아래 명령을 실행하면 frontend, backend, ai 서버가 함께 실행됩니다.

```bash
npm run dev
```

내부적으로 실행되는 명령:

```bash
npm run dev:frontend
npm run dev:backend
npm run dev:ai
```

프론트엔드 기본 주소는 Vite 기본값인 `http://localhost:5173`입니다. 백엔드는 로컬 개발 API base URL로 `http://localhost:8080/api`를 사용합니다. AI 서버는 `ws://localhost:8000/client-ws`를 사용합니다.

## 개별 서버 실행

### frontend

```bash
npm run dev:frontend
```

또는:

```bash
cd frontend
npm run dev
```

### backend

```bash
npm run dev:backend
```

또는:

```bash
cd backend
./gradlew bootRun
```

### ai

```bash
npm run dev:ai
```

또는:

```bash
cd ai
uv run fastapi dev src/project_cyan_ai/main.py --host 127.0.0.1 --port 8000
```

## Live2D asset 추가 규칙

Live2D 모델 asset은 public URL 기준으로 아래 구조를 따릅니다.

```text
frontend/public/live2d/{characterId}/model.model3.json
```

브라우저에서 로드되는 URL은:

```text
/live2d/{characterId}/model.model3.json
```

새 캐릭터를 추가할 때는 `frontend/src/features/vtuber/characters.ts`의 `VTUBER_CHARACTERS`에 config를 추가합니다.

```ts
export const VTUBER_CHARACTERS = {
  cyan: {
    id: 'cyan',
    name: 'Cyan Assistant',
    modelUrl: '/live2d/cyan/model.model3.json',
  },
  newCharacter: {
    id: 'newCharacter',
    name: 'New Character',
    modelUrl: '/live2d/newCharacter/model.model3.json',
  },
} as const satisfies Record<string, VtuberCharacterConfig>
```

모델 파일, texture, motion, expression 파일은 `model.model3.json`에서 참조하는 상대 경로가 깨지지 않게 같은 character 디렉터리 아래에 둡니다. Cubism Core runtime 파일은 모델 asset과 별개이며 커밋하지 않습니다.

## 테스트 메시지 예시

```text
안녕
추천 상품 보여줘
추천 상품을 장바구니에 담아줘
```

예상 WebSocket 요청:

```json
{
  "type": "text-input",
  "text": "추천 상품 보여줘"
}
```

예상 mock 응답:

```json
{
  "type": "full-text",
  "text": "추천 mock 응답입니다. 조건에 맞는 상품 액션을 준비했어요.",
  "actions": [
    { "type": "navigate", "path": "/goods/1002" },
    { "type": "highlight", "selector": "[data-goods-id='1002']" }
  ]
}
```

## expected behavior

- 말풍선에는 서버 응답의 `text`가 표시됩니다.
- `navigate` 액션은 React Router의 `navigate(path)`로 이동합니다.
- `highlight` 액션은 대상 DOM selector에 `vtuber-action-highlight` 클래스를 잠시 적용합니다.
- `addToCart` 액션은 먼저 `data-add-to-cart` 버튼을 찾아 실행하고, 없으면 상품 상세 API를 읽어 장바구니 상태에 추가합니다.
- 챗봇 상태는 연결 중, 준비됨, 생각 중, 응답 중, 연결 대기 상태로 바뀝니다.
- Live2D 렌더러는 상태에 따라 expression 또는 motion을 적용합니다. 예를 들어 `thinking` 상태는 `question` 또는 `surprise`, `speaking` 상태는 `blush` 또는 `smirk_*`, `error` 상태는 `tears` 또는 `black_face` expression을 시도합니다.
- Cubism Core, WebGL, 모델 로딩 중 하나라도 실패하면 앱 전체가 깨지지 않고 placeholder fallback이 표시됩니다.

## troubleshooting

### WebSocket 연결 오류

- AI 서버가 실행 중인지 확인합니다.
- `frontend/.env.development` 또는 `frontend/.env.local`의 `VITE_VTUBER_WS_URL`이 `ws://localhost:8000/client-ws`인지 확인합니다.
- 브라우저 개발자 도구 Network 탭에서 `/client-ws` 연결 상태를 확인합니다.
- 프론트엔드만 실행 중이면 챗봇이 `연결 대기`로 표시될 수 있으며, 이 상태는 정상입니다.

### AI provider 설정 누락

- 설정이 없으면 기본 provider는 `mock`입니다.
- 의도한 provider가 있다면 `ai/.env.local`에 `PROJECT_CYAN_AI_PROVIDER=<provider-name>`을 설정합니다.
- 지원 provider 이름은 `mock`, `openai`, `claude`, `olv`입니다.

### LLM API key 누락

- `openai` 또는 `claude` provider는 `PROJECT_CYAN_LLM_API_KEY`가 필요합니다.
- 실제 key를 문서, README, PR 설명, commit message에 적지 않습니다.
- 로컬에서는 `ai/.env.local`에 `PROJECT_CYAN_LLM_API_KEY=<llm-api-key>` 형태로 둡니다.
- key가 누락되거나 호출이 실패하면 AI 서버는 fallback text와 빈 `actions` 배열을 반환할 수 있습니다.

### Cubism Core 누락

- 아래 명령을 실행해 runtime 파일을 내려받습니다.

```bash
cd frontend
npm run live2d:core
```

- 생성 파일 위치는 `frontend/public/live2d/runtime/live2dcubismcore.min.js`입니다.
- 이 파일은 커밋하지 않습니다.

### Live2D 모델 로딩 실패

- `frontend/public/live2d/{characterId}/model.model3.json` 파일이 있는지 확인합니다.
- `frontend/src/features/vtuber/characters.ts`의 `modelUrl`이 `/live2d/{characterId}/model.model3.json`인지 확인합니다.
- `model.model3.json` 안의 texture, motion, expression 상대 경로가 실제 파일과 맞는지 확인합니다.
- 브라우저가 WebGL을 지원하지 않거나 모델 파일 로딩이 실패하면 placeholder fallback이 표시됩니다.

### ACTION이 실행되지 않는 경우

- 서버 응답 `type`이 `"full-text"`인지 확인합니다.
- 서버 응답에 `actions` 배열이 있는지 확인합니다. 액션이 없을 때도 `actions: []` 형태가 허용됩니다.
- `navigate`는 `{ "type": "navigate", "path": "/goods/1002" }` 형태여야 하며 React Router로 이동합니다.
- `highlight`는 `{ "type": "highlight", "selector": "[data-goods-id='1002']" }` 형태여야 하며 대상 DOM이 현재 화면에 있어야 합니다.
- `addToCart`는 `{ "type": "addToCart", "goodsId": "1002" }` 형태여야 합니다.
- `[ACTION]` 태그를 LLM 응답에 직접 넣는 경우 `docs/api-contract.md`의 문법을 따릅니다.
