# SM Universe · Git 협업 규칙

> 5인 팀이 한 레포에서 충돌 없이 병렬로 개발하기 위한 규칙.
> 저장 위치: `/docs/git-workflow.md`
> 짝 문서: `/docs/api-contract.md` (코드보다 계약이 먼저)
> 버전: `v0.1.0 (초안)` · 버전 규칙: 주.부.수 (§0.1) · 동결 목표일: `2026-06-18`

---

## 0. 하루 작업 한 장 요약 (외울 것)

```bash
git checkout dev && git pull          # 1. 최신 dev 받기
git checkout -b feature/goods-list    # 2. 작업용 브랜치 따기
# ... 코딩 ...
git add . && git commit -m "feat: 굿즈 목록 API 추가"   # 3. 커밋
git push -u origin feature/goods-list # 4. 올리기
# 5. GitHub에서 dev로 PR 생성 → 리뷰 1명 → 머지
git checkout dev && git pull          # 6. 머지된 dev 다시 받기
git branch -d feature/goods-list      # 7. 끝난 브랜치 삭제
```

**핵심 한 줄: 브랜치는 짧게 살리고 dev에 자주 합친다.** 한 브랜치를 며칠 이상 들고 있지 않는다.

---

## 1. 레포 구조 (모노레포)

레포는 하나. 폴더로 도메인을 나눈다. **폴더가 다르면 파일이 안 겹쳐서 충돌도 거의 없다.**

```
project-cyan/
├── frontend/      # React 스토어프론트 (각자 자기 페이지 폴더)
├── backend/       # Spring Boot (도메인별 패키지: member, goods, artist, order) + Thymeleaf 관리자 동거
├── ai/            # FastAPI(OLV) + 캐릭터 아일랜드 연동, import는 project_cyan_ai
├── docs/          # api-contract.md, git-workflow.md, 와이어프레임 등
└── README.md
```

### 1-1. 리액트 구조 (후보 정하기)
```
기능별로 묶기 (feature-based)

src/features/
├── member/  (이 도메인의 페이지·api·타입이 한 폴더에)
├── goods/
├── order/
```

---

## 2. 브랜치 모델 (main / dev / feature)

| 브랜치 | 역할 | 규칙 |
|--------|------|------|
| `main` | 배포·발표용 안정 버전 | **직접 푸시 금지.** 매주 금요일 dev에서만 머지. 항상 "데모 가능" 상태. |
| `dev`  | 통합 브랜치 | **항상 도는 상태 유지.** 모든 기능이 여기서 만남. 직접 푸시 금지(PR로만). |
| `feature/*` | 기능 하나짜리 작업 브랜치 | dev에서 따고, 끝나면 PR로 dev에 합치고 **삭제**. 수명 며칠. |

흐름: `dev` → `feature/...` 따기 → 작업 → PR → 리뷰 → `dev` 머지 → 브랜치 삭제 → 다음 기능 또 따기.

> ⚠️ 피해야 할 패턴: `members`, `goods`처럼 **사람당 브랜치 1개를 4주 내내** 들고 있다가 마지막에 한 번에 합치기. → 통합 지옥. 같은 도메인이라도 작업 단위로 쪼개 자주 합친다.

---

## 3. 브랜치 이름 규칙

```
<종류>/<도메인>-<작업>
```

- 종류: `feature`(기능) · `fix`(버그) · `docs`(문서) · `chore`(설정·잡일)
- 예: `feature/goods-list`, `feature/member-signup`, `feature/ai-websocket`, `fix/order-status`, `docs/api-contract`
- 소문자 + 하이픈. 한글·공백 금지.

---

## 4. 매일의 작업 흐름 (단계별)

1. **최신 dev 받기** — 작업 시작 전 항상.
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. **기능 브랜치 따기** — 작업 단위로 작게.
   ```bash
   git checkout -b feature/goods-list
   ```
3. **작업 + 자주 커밋** — 의미 있는 단위마다 커밋(§5).
4. **올리기**
   ```bash
   git push -u origin feature/goods-list
   ```
5. **PR 생성** — GitHub에서 `feature/goods-list` → `dev`로 Pull Request. 설명에 "무엇을/왜" 한 줄.
6. **리뷰 받고 머지** — 리뷰어 1명 승인 후 머지(§6).
7. **정리** — 머지된 dev 다시 받고, 끝난 브랜치 삭제.
   ```bash
   git checkout dev && git pull origin dev
   git branch -d feature/goods-list
   ```

> 작업이 길어질 것 같으면 중간중간 `git checkout dev && git pull` 후 내 브랜치에서 `git merge dev`로 최신 dev를 당겨오면 막판 충돌이 작아진다.

---

## 5. 커밋 메시지 규칙

```
<종류>: <한 일 한 줄>
```

- 종류: `feat`(기능) · `fix`(버그) · `docs`(문서) · `style`(포맷) · `refactor`(리팩터) · `chore`(설정)
- 예:
  - `feat: 굿즈 목록 API 추가`
  - `fix: 주문 status 전이 오류 수정`
  - `docs: API 계약 v0.2.0 반영`
- 현재형·간결하게. 한 커밋엔 한 가지 일만.

---

## 6. PR & 리뷰 규칙

- **PR은 작게.** 기능 하나 = PR 하나. 거대한 PR은 리뷰가 안 된다.
- **리뷰어 최소 1명 승인** 후 머지. 리뷰는 짝 도메인끼리:
  - 회원 ↔ 주문
  - 굿즈 ↔ 아티스트
  - AI·플랫폼 ↔ 팀장
- 리뷰는 비난이 아니라 **서로 배우는 시간.** 모르면 코멘트로 질문.
- 머지 방식: `Squash and merge` 권장 (dev 히스토리가 깔끔해짐).
- **머지 전 체크**: dev 기준으로 충돌 없는지, 로컬에서 도는지.

---

## 7. 매주 금요일 = 통합일 (dev → main)

매주 금요일, 그 주의 dev를 main에 올려 "이번 주 데모 버전"을 박제한다.

1. dev가 도는지 다 같이 확인(통합 점검).
2. `dev` → `main` PR 후 머지.
3. 버전 태그 찍기:
   ```bash
   git checkout main && git pull origin main
   git tag -a demo-w1 -m "Week 1 통합 데모"
   git push origin demo-w1
   ```

"이번 주 버전 합치면 도는가?"가 매주의 합격선. 통합을 끝에 몰지 않는 게 이 규칙의 전부다.

---

## 8. 충돌(conflict) 대처

- 충돌은 잘못이 아니라 **자주 합치면 작게, 늦게 합치면 크게** 날 뿐이다. 그래서 dev를 자주 당겨온다.
- 충돌 나면: 파일 열어 `<<<<<<<` ~ `>>>>>>>` 표시 구간에서 **남길 코드만 남기고** 표시 줄 삭제 → 저장 → `git add` → `git commit`.
- 혼자 못 풀겠으면 **합치지 말고** 해당 코드 작성자와 함께 푼다. (특히 같은 파일을 둘이 만졌을 때)

---

## 9. 하지 말 것 (금지)

- ❌ `main`·`dev`에 직접 푸시 (반드시 PR)
- ❌ `git push --force` (남의 커밋이 사라진다)
- ❌ 사람당 브랜치 1개로 4주 작업
- ❌ 계약(`api-contract.md`) 동결 전에 회원 의존 코드 시작
- ❌ `.env`·Secret_Key 등 비밀값 커밋 (→ `.gitignore`에 추가)
- ❌ 거대 PR (수백 줄 한 번에)

---

## 10. 처음 한 번만 (초기 세팅)

```bash
# 1. 레포 클론
git clone https://github.com/<팀계정>/<프로젝트명>.git
cd <프로젝트명>

# 2. dev 브랜치로 이동 (모든 작업의 출발점)
git checkout dev

# 3. 내 이름/이메일 설정 (커밋 작성자 표기)
git config user.name "이름"
git config user.email "github이메일"
```

레포 관리자(팀장)가 GitHub에서 한 번만 해둘 것:
- `main`, `dev` 브랜치 생성, `dev`를 기본 브랜치로 설정
- `main`·`dev`에 **branch protection** 걸기 (직접 푸시 금지, PR 1 승인 필요)
- `.gitignore` 작성 (`node_modules/`, `.env`, `*.local.md`, 빌드 산출물 등)
- `docs/`에 `api-contract.md`·`git-workflow.md` 커밋
