# project-cyan

project-cyan은 React + Vite 프론트엔드, Spring Boot 백엔드, FastAPI AI WebSocket 서버로 구성된 모노레포입니다.

## 루트 개발 서버 실행

macOS/Linux 기준으로 루트 디렉토리에서 아래 명령으로 세 개발 서버를 함께 실행합니다.

```bash
npm install
npm run dev
```

함께 실행되는 명령은 다음과 같습니다.

```bash
npm run dev:frontend
npm run dev:backend
npm run dev:ai
```

프론트엔드 개발 서버의 기본 WebSocket URL은 `frontend/.env.development`에 둡니다.

```bash
VITE_VTUBER_WS_URL=ws://localhost:8000/client-ws
```

개인 로컬 설정이 필요하면 `frontend/.env.local`에서 같은 값을 override합니다. Vite는 `frontend/` 패키지 기준으로 env 파일을 읽기 때문에 루트에서 `npm run dev`로 실행해도 `frontend/.env.local`이 적용됩니다.

개별 실행 명령의 실제 대상은 다음과 같습니다.

```bash
cd frontend && npm run dev
cd backend && ./gradlew bootRun
cd ai && uv run fastapi dev src/project_cyan_ai/main.py --host 127.0.0.1 --port 8000
```

Windows 환경은 이번 루트 개발 서버 통합 범위에 포함하지 않았습니다. Windows에서 같은 흐름이 필요하면 `cross-env` 또는 별도 PowerShell 스크립트를 추가하는 후속 작업으로 다룹니다.

## 로컬 설정과 보안

실제 secret, API key, Supabase/Kakao/OpenAI 키, token, password, private server URL은 커밋하지 않습니다. 로컬 비밀값이나 개인 서버 주소는 필요한 경우 `.env` 또는 `.env.local`에만 보관하고, 해당 파일은 커밋하지 않습니다. `frontend/.env.development`에는 커밋 가능한 로컬 기본값만 둡니다.

PostgreSQL은 Supabase를 사용합니다. 백엔드 DB 실행 자동화는 로컬 PostgreSQL 컨테이너를 추가하지 않는 이번 작업 범위에서는 포함하지 않았으며, 필요하면 Supabase 로컬 개발 흐름 또는 테스트용 프로파일을 별도 작업으로 정리합니다.
