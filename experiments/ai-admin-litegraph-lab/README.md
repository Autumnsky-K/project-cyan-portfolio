# AI Admin LiteGraph Lab

관리자 `AI 챗봇 관리 > 행동관리 실험/버그`에서 iframe으로 띄우는 실험용 LiteGraph UI입니다.
소스는 이 폴더에 있고, 빌드 산출물은 Spring 정적 리소스로 들어갑니다.

## 관리자 페이지에 내장 빌드

프로젝트 루트에서 실행합니다.

```powershell
npm --prefix experiments/ai-admin-litegraph-lab install
npm run build:ai-lab
```

빌드 결과는 아래 경로에 생성됩니다.

```text
backend/src/main/resources/static/admin/ai-behavior-lab-app
```

Spring 관리자 서버를 띄운 뒤 아래 페이지에서 바로 볼 수 있습니다.

```text
/admin/ai/behavior-lab
```

## 개발 서버

실험 UI만 빠르게 개발할 때는 8002 Vite dev server를 사용할 수 있습니다.

```powershell
npm run dev:ai-lab
```

실행 주소는 `http://127.0.0.1:8002/`입니다.

## 현재 의존성

- Vite dev server는 8002를 사용합니다.
- 관리자 내장 빌드 화면은 Spring 정적 리소스에서 직접 서빙됩니다.
- LLM/OAuth 관련 API 호출은 dev server에서는 `http://127.0.0.1:8001` 프록시를 사용합니다.
- 8001 OAuth API 서버는 아직 개인 로컬 실험 서버 의존성이 남아 있으므로, 이 폴더만으로는 OAuth/LLM 호출이 완전히 독립 실행되지 않습니다.

## 커밋 제외

`node_modules`와 실험 폴더 내부 `dist`는 루트 `.gitignore`에 의해 제외됩니다.
Spring 내장용 빌드 산출물 `backend/src/main/resources/static/admin/ai-behavior-lab-app`은 팀 공유를 위해 커밋 대상입니다.
