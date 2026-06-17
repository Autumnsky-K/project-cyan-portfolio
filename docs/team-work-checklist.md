# SM Universe · Team Work Checklist

> 팀원이 작업을 시작하고 PR을 올리기 전 확인할 공통 체크리스트입니다.
> 에이전트 지시는 `AGENTS.md`를 우선하고, API 계약은 `docs/api-contract.md`, Git 협업은 `docs/git-workflow.md`를 우선합니다.

---

## 1. 작업 시작 전

- 최신 `dev`에서 작업 브랜치를 만듭니다.
- 이번 작업의 담당 도메인과 변경 범위를 확인합니다.
- API, DTO, WebSocket, `[ACTION]`, DOM hook 변경 가능성이 있으면 `rules/api-contract.tsv`와 `docs/api-contract.md`를 먼저 읽습니다.
- Git branch, commit, PR, merge, release 작업이면 `rules/git-workflow.tsv`와 `docs/git-workflow.md`를 먼저 읽습니다.
- 회원 의존 기능은 `userId` 계약과 인증 방식이 확정되었는지 확인합니다.
- 비밀값, 개인 로컬 설정, 실제 배포 주소가 코드나 문서에 들어가지 않게 확인합니다.

## 2. 작업 중

- 변경은 한 작업 단위에 집중하고, unrelated refactor를 섞지 않습니다.
- 새 추상화보다 기존 프로젝트 패턴을 우선합니다.
- 계약 변경이 필요하면 코드보다 문서를 먼저 확인하고, 동결 필드의 삭제·이름변경·타입변경은 팀 합의 후 진행합니다.
- additive API 변경은 `docs/api-contract.md` 변경 로그에 기록합니다.
- 생성물, dependency 폴더, build output은 명시적으로 필요하지 않으면 수정하거나 커밋하지 않습니다.

## 3. 코드 식별자 규칙

- 변수, 함수, 클래스, 타입, 파일명, API JSON 키, DB/API 계약명은 영어로 작성합니다.
- JSON 키는 `docs/api-contract.md`의 전역 규약에 따라 영문 `camelCase`를 사용합니다.
- 상수는 언어별 관례에 맞는 영어를 사용합니다. 예: `UPPER_SNAKE_CASE`.
- 한국어는 사용자에게 보이는 UI 문구, 테스트 입력·기대 문구, 문서, 설명 주석에서 사용할 수 있습니다.
- 도메인 용어가 한국어 개념이어도 코드 식별자는 의미가 드러나는 영어 이름으로 바꿉니다.
- 새 코드에 한글 식별자가 들어가면 통일성을 해치는 것으로 보고 PR 리뷰에서 수정 요청합니다.

## 4. PR 전

- 가장 작은 의미 있는 테스트, 타입 체크, 빌드 중 하나 이상을 실행합니다.
- 실행한 검증 명령과 결과를 PR 설명에 적습니다.
- 변경 이유, 영향 범위, 계약 변경 여부를 PR 설명에 적습니다.
- API 계약을 바꿨다면 `docs/api-contract.md` 변경 로그를 확인합니다.
- 충돌 표시(`<<<<<<<`, `=======`, `>>>>>>>`)와 비밀값이 남아 있지 않은지 확인합니다.
- PR은 작업 브랜치에서 `dev`로 올리고, 최소 1명 리뷰를 받습니다.
