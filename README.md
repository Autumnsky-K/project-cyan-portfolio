# project-cyan

project-cyan은 React + Vite 프론트엔드, Spring Boot 백엔드, FastAPI AI WebSocket 서버로 구성된 모노레포입니다.

AI 챗봇, LLM provider, WebSocket, Live2D 렌더러를 새 로컬 환경에서 함께 재현하는 절차는 `docs/ai-live2d-local-setup.md`를 참고합니다.

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

PostgreSQL은 개발 환경에서도 팀 Supabase 원격 프로젝트를 사용합니다. 백엔드 연결 값은 `docs/supabase-remote-setup.md`를 참고해 개인 환경변수 또는 커밋하지 않는 로컬 설정 파일에만 둡니다.

## Cloud Run 배포 설정

코드에 남아 있는 `localhost` URL은 로컬 개발용 fallback입니다. Cloud Run 같은 배포 환경에서는 서비스 간 호출과 사용자-facing 링크가 실제 배포 주소를 보도록 환경변수 또는 Secret Manager 값으로 override해야 합니다.

백엔드 Cloud Run 설정을 갱신할 때는 `deploy-backend-config.sh`가 `backend/.env.cloudrun`의 필수 값을 검사하고 Secret Manager에 반영합니다. 실제 값은 커밋하지 말고 로컬 설정 파일이나 배포 환경의 secret으로만 관리합니다.

```env
FRONTEND_BASE_URL=https://<frontend-domain>
PROJECT_CYAN_AI_SERVICE_URL=https://<ai-cloud-run-url>
PROJECT_CYAN_INTERNAL_SERVICE_TOKEN=<shared-internal-token>
```

AI Cloud Run에는 Spring API를 실제 백엔드 서비스로 향하게 하는 값이 필요합니다.

```env
PROJECT_CYAN_SPRING_API_URL=https://<backend-cloud-run-url>/api
PROJECT_CYAN_GOODS_API_BASE_URL=https://<backend-cloud-run-url>/api
PROJECT_CYAN_INTERNAL_SERVICE_TOKEN=<shared-internal-token>
```

프론트엔드 배포 빌드는 브라우저가 사용자 기기의 localhost를 호출하지 않도록 실제 API/WebSocket 주소를 주입해야 합니다.

```env
VITE_API_BASE_URL=https://<backend-cloud-run-url>/api
VITE_VTUBER_WS_URL=wss://<ai-cloud-run-url>/client-ws
```
