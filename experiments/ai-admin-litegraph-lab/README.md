# AI Admin LiteGraph Lab

관리자 `AI 챗봇 관리 > 행동관리 실험/버그`에서 iframe으로 띄우는 실험용 LiteGraph UI입니다.

## 실행

프로젝트 루트에서 실행합니다.

```powershell
npm --prefix experiments/ai-admin-litegraph-lab install
npm run dev:ai-lab
```

실행 주소는 `http://127.0.0.1:8002/`입니다.

## 관리자 화면 연결

Spring 관리자 서버를 띄운 뒤 아래 페이지에서 볼 수 있습니다.

```text
/admin/ai/behavior-lab
```

## 현재 의존성

- Vite dev server는 8002를 사용합니다.
- LLM/OAuth 관련 API 호출은 현재 `http://127.0.0.1:8001`을 프록시 대상으로 봅니다.
- 8001 OAuth API 서버는 아직 개인 로컬 실험 서버 의존성이 남아 있으므로, 이 폴더만으로는 OAuth/LLM 호출이 완전히 독립 실행되지 않습니다.

## 커밋 제외

`node_modules`와 `dist`는 루트 `.gitignore`에 의해 제외됩니다.
