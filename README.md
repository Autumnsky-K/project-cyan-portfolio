# Project Cyan

Project Cyan은 팬덤 굿즈 커머스와 AI 캐릭터 추천을 결합한 통합 쇼핑 플랫폼입니다.
사용자의 자연어 요청을 실제 상품 데이터와 연결하고, 추천 결과가 화면 이동, 상품 하이라이트, 장바구니 담기 같은 실제 쇼핑 액션으로 이어지는 경험을 목표로 했습니다.

이 저장소는 React + Vite 프론트엔드, Spring Boot 백엔드, FastAPI AI WebSocket 서버로 구성된 모노레포입니다.

> 공개용 저장소 안내: 이 저장소는 포트폴리오 공개를 위해 secret, 개인 로컬 설정, 실제 Supabase project ref/key가 제거된 정리본입니다. 원 팀 저장소의 전체 커밋 이력과 일부 운영 설정은 보안상 포함하지 않았습니다.

## Demo

이 저장소만으로는 실제 Supabase Auth/Storage/Database, 결제 provider, LLM provider 환경이 구성되지 않습니다.
로컬 실행은 프로젝트 구조와 개발 환경 재현을 위한 안내이며, 전체 기능 확인은 아래 배포 주소를 권장합니다.

- Demo: https://project-cyan.autumnsky1562.workers.dev

## 주요 기능

- 회원가입, 로그인, 관심 아티스트, 마이페이지
- 굿즈 목록, 상세, 좋아요, 조회 이력, 관리자 상품 등록/수정
- 장바구니, checkout, KakaoPay 결제 흐름
- Supabase Auth와 내부 member DB 연동
- Supabase Storage 기반 상품 이미지 관리
- FastAPI WebSocket 기반 AI 챗봇
- LLM 기반 상품 추천, pgvector semantic search, ACTION grounding
- GitHub Actions와 Cloud Run 기반 배포 파이프라인

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | React, Vite, TypeScript, JavaScript |
| Backend | Spring Boot, Spring MVC, Spring JPA, Gradle |
| AI Service | FastAPI, WebSocket, Pydantic, OpenAI-compatible LLM API |
| Database / Storage | PostgreSQL, pgvector, Supabase Auth, Supabase Storage |
| Infra / DevOps | Docker, GitHub Actions, GCP Cloud Run |
| Collaboration | Jira, Notion, API 계약 문서 |

## 아키텍처

```text
React Client
  ├─ Spring API: 회원, 상품, 주문, 결제, 관리자 기능
  ├─ Supabase Auth: 사용자 인증
  └─ FastAPI WebSocket: AI 캐릭터 챗봇

Spring API
  ├─ PostgreSQL/Supabase: 도메인 데이터
  ├─ Supabase Storage: 상품 이미지
  └─ AI Service 연동: 개인화 컨텍스트, 추천 후보, 대화 이력

AI Service
  ├─ LLM Provider: 자연어 응답 생성
  ├─ Semantic Search: embedding + pgvector 기반 상품 후보 검색
  └─ ACTION 검증: navigate, highlight, addToCart 등 화면 액션 제한
```

## 팀 기여 영역

| 담당 | 주요 기여 |
| --- | --- |
| 강승민 | 팀 리딩, API 계약 문서화, FastAPI AI 챗봇 서버, WebSocket 실시간 대화, LLM 상품 추천 grounding, pgvector semantic search 연동, ACTION 검증 구조, Docker/GitHub Actions/Cloud Run 배포 흐름 |

## AI 챗봇 설계 요약

AI 챗봇은 LLM이 임의로 상품을 만들어내지 않도록 실제 상품 후보를 먼저 조회한 뒤, 그 후보 안에서만 답변과 ACTION을 생성하도록 설계했습니다.

- 상품명, 아티스트, 카테고리, 태그, 설명을 embedding input으로 구성
- `text-embedding-3-small`과 PostgreSQL `pgvector` 기반 semantic search 적용
- Spring API가 반환한 상품 후보만 LLM prompt에 제공
- `goodsId` allowlist, Pydantic schema, 프론트 action 재검증으로 잘못된 이동/장바구니 액션 차단
- embedding/API 장애 시 키워드 검색 fallback으로 기본 추천 흐름 유지

## Local Development

루트의 `npm install`은 세 개발 서버를 함께 실행하기 위한 `concurrently`만 설치합니다.
프론트엔드, 백엔드, AI 서버의 의존성은 각 하위 프로젝트 기준으로 별도 준비가 필요합니다.
공개 저장소에는 실제 운영 환경변수가 포함되어 있지 않으므로, 로컬에서 전체 기능을 실행하려면 별도의 Supabase/Auth/Storage/Database/LLM 환경 구성이 필요합니다.

### 최초 1회 의존성 설치

루트 실행 스크립트 준비:

```bash
npm install
```

프론트엔드 의존성 설치:

```bash
cd frontend
npm install
cd ..
```

백엔드는 Gradle wrapper가 `bootRun` 또는 `build` 시점에 필요한 의존성을 내려받습니다.
로컬에는 Java 21 이상이 필요합니다.

```bash
cd backend
./gradlew build
cd ..
```

AI 서버는 Python 3.10 이상과 `uv` 사용을 권장합니다.

```bash
cd ai
uv sync --extra dev
cd ..
```

`uv`를 사용하지 않는 경우에는 Python venv를 직접 만들고 editable install을 수행합니다.

```bash
cd ai
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cd ..
```

### 통합 개발 서버 실행

의존성 준비가 끝난 뒤 루트 디렉토리에서 아래 명령으로 세 개발 서버를 함께 실행합니다.

```bash
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

### Docker Compose 기반 로컬 멀티 컨테이너 개발 환경

Docker Compose로 프론트엔드, 백엔드, AI 서버를 각각 별도 컨테이너로 실행할 수 있습니다.
DB/Auth/Storage는 로컬 컨테이너로 띄우지 않고 기존처럼 원격 Supabase를 사용합니다.

먼저 각 예시 파일을 복사한 뒤 실제 로컬 값을 채웁니다. 비밀값이 들어가는 `.env.docker` 파일은 커밋하지 않습니다.

```bash
cp frontend/.env.docker.example frontend/.env.docker
cp backend/.env.docker.example backend/.env.docker
cp ai/.env.docker.example ai/.env.docker
```

그 다음 루트에서 아래 명령을 실행합니다.

```bash
docker compose up --build
```

기본 접속 주소는 다음과 같습니다.

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8080
AI:       http://localhost:8000
```

Compose 내부 서버 간 통신은 서비스 이름을 사용합니다. 예를 들어 AI 서버는 Spring API를 `http://backend:8080/api`로 호출하고, 브라우저에서 접속하는 WebSocket URL은 `ws://localhost:8000/client-ws`를 유지합니다.

## 로컬 설정과 보안

실제 secret, API key, Supabase/Kakao/OpenAI 키, token, password, private server URL은 커밋하지 않습니다. 로컬 비밀값이나 개인 서버 주소는 필요한 경우 `.env` 또는 `.env.local`에만 보관하고, 해당 파일은 커밋하지 않습니다. `frontend/.env.development`에는 커밋 가능한 로컬 기본값만 둡니다.

`frontend/.env.development`는 공개 가능한 placeholder만 포함합니다. 실제 Supabase project URL과 publishable key는 로컬의 `frontend/.env.local` 또는 배포 환경변수로 설정합니다.

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
