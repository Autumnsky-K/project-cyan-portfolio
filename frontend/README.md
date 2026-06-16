# project-cyan frontend

project-cyan의 React + Vite 프론트엔드 애플리케이션입니다.

## 실행

```bash
npm install
npm run dev
```

기본 개발 서버는 Vite 설정을 따릅니다. 로컬에서는 보통 `http://localhost:5173`에서 확인할 수 있습니다.

## 빌드

```bash
npm run build
```

## Live2D 챗봇 WebSocket 테스트

챗봇은 `/client-ws` WebSocket 엔드포인트에 연결합니다. AI WebSocket 서버가 실행 중이 아니면 챗봇 상태가 `연결 대기`로 표시됩니다. 프론트엔드만 실행하는 테스트에서는 정상 동작입니다.

Live2D 자산은 허용된 캐릭터 config에서만 선택하며, 기본 경로는 `/live2d/{characterId}/model.model3.json` 형식입니다. 현재 기본 캐릭터는 `cyan`이고, 실제 런타임 로딩 전까지는 placeholder avatar가 `idle`, `connecting`, `ready`, `thinking`, `speaking`, `error` 표시 상태를 시각적으로 표현합니다.

### 프론트엔드만 실행하는 경우

```bash
npm run dev
```

### 로컬 AI WebSocket 서버와 함께 실행하는 경우

커밋 가능한 기본 개발 URL은 `frontend/.env.development`에 있습니다.

```env
VITE_VTUBER_WS_URL=ws://localhost:8000/client-ws
```

로컬이 아닌 환경에서는 문서에 실제 주소를 적지 말고 placeholder를 사용합니다.

```bash
VITE_VTUBER_WS_URL=ws://<ai-server-host>/client-ws
```

실제 팀 개발용 값이나 개인 override는 `.env.local`에 넣어 사용합니다. 루트에서 `npm run dev`를 실행해도 Vite는 `frontend/.env.local`을 읽습니다. `.env.local`, API 키, 토큰, 비밀번호, private server URL, 배포 secret은 커밋하지 마세요. 실제 값은 팀 메신저나 팀원만 접근 가능한 드라이브처럼 비공개 팀 채널에서 공유합니다.

### 테스트 메시지

```text
안녕
추천 상품 보여줘
추천 상품을 장바구니에 담아줘
```

프론트엔드는 서버 메시지의 `text`를 챗봇 말풍선에 표시하고, `actions` 배열의 MVP ACTION을 실행합니다.

- `navigate`: `{ "type": "navigate", "path": "/goods/42" }` 형태를 수신하면 React Router로 이동합니다.
- `highlight`: `{ "type": "highlight", "selector": "[data-goods-id='42']" }` 형태를 수신하면 대상 DOM을 잠시 강조합니다.
- `addToCart`: `{ "type": "addToCart", "goodsId": "42" }` 형태를 수신하면 기존 `data-add-to-cart` 버튼을 우선 실행하고, 버튼이 없으면 상품 상세 API를 읽어 장바구니 상태에 추가합니다.

mock AI 서버 응답 예시는 다음처럼 확인할 수 있습니다.

```json
{ "type": "assistant", "text": "추천 상품을 보여드릴게요.", "actions": [{ "type": "navigate", "path": "/goods" }, { "type": "highlight", "selector": "[data-goods-id='42']" }] }
{ "type": "assistant", "text": "장바구니에 담았어요.", "actions": [{ "type": "addToCart", "goodsId": "42" }] }
```
