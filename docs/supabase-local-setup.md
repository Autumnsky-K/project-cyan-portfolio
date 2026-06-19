# Supabase 로컬 개발 환경 가이드

이 문서는 팀원이 온라인 Supabase 프로젝트에 직접 연결하지 않고 로컬 Supabase 스택으로 백엔드와 Storage 기능을 확인하는 절차를 설명합니다.

## 1. 준비물

- Docker 호환 런타임
  - macOS: Docker Desktop 또는 OrbStack 권장
  - Docker가 켜져 있는지 확인:
    ```bash
    docker info
    ```
- Supabase CLI
  - 현재 확인한 CLI 버전: `2.100.0`
  - 설치 확인:
    ```bash
    supabase --version
    ```

로컬 Supabase만 실행하는 데는 Supabase 사이트의 운영 key가 필요하지 않습니다.

## 2. 로컬 Supabase 시작

저장소 루트에서 실행합니다.

```bash
supabase start
```

첫 실행은 Docker 이미지를 내려받기 때문에 시간이 걸릴 수 있습니다. 완료 후 상태를 확인합니다.

```bash
supabase status -o env
```

주요 로컬 주소는 다음과 같습니다.

```text
API_URL=http://127.0.0.1:54321
DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
STUDIO_URL=http://127.0.0.1:54323
```

Supabase Studio는 브라우저에서 `http://127.0.0.1:54323`으로 접속합니다.

## 3. 백엔드 로컬 설정

예시 파일을 복사해 개인 로컬 설정을 만듭니다.

```bash
cp backend/src/main/resources/application-local.example.properties backend/src/main/resources/application-local.properties
```

`supabase status -o env` 출력에서 `SERVICE_ROLE_KEY` 값을 복사해 `application-local.properties`의 `supabase.storage.service-role-key`에 넣습니다.

```properties
spring.datasource.url=jdbc:postgresql://127.0.0.1:54322/postgres
spring.datasource.username=postgres
spring.datasource.password=postgres

supabase.storage.project-url=http://127.0.0.1:54321
supabase.storage.service-role-key=<SERVICE_ROLE_KEY from supabase status -o env>
```

`application-local.properties`는 `.gitignore` 대상이므로 커밋하지 않습니다.

백엔드는 기본적으로 `local` profile로 실행됩니다.

```bash
npm run dev:backend
```

전체 개발 서버를 함께 실행하려면 다음 명령을 사용합니다.

```bash
npm run dev
```

## 4. Storage 동작 확인

백엔드가 실행된 뒤 관리자 Storage 페이지에서 다음을 확인합니다.

- bucket 목록 조회
- bucket 생성
- folder path 생성

Storage API는 `supabase.storage.project-url`에 `/storage/v1`을 붙여 호출합니다. 로컬에서는 `http://127.0.0.1:54321/storage/v1`입니다.

## 5. 원격 스키마를 로컬 migration으로 가져오기

현재 온라인 Supabase DB 스키마를 로컬 환경에 맞추려면 권한 있는 팀원이 한 번만 아래 흐름을 실행합니다.

필요한 값은 Supabase Dashboard 또는 팀 보안 채널에서 확인합니다.

- Supabase project ref
- 원격 DB password
- Supabase CLI login용 access token, 또는 이미 로그인된 팀원 계정

실행합니다.

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db pull initial_remote_schema
supabase db reset
```

위 과정에서 입력하는 access token, DB password, 운영 key는 문서와 커밋에 남기지 않습니다. 생성된 `supabase/migrations/*.sql`만 검토 후 커밋합니다.

## 6. 자주 쓰는 명령

```bash
supabase status -o env
supabase stop
supabase start
supabase db reset
```

로컬 데이터를 완전히 버리고 정리해야 할 때만 다음 명령을 사용합니다.

```bash
supabase stop --no-backup
```

## 7. 보안 주의사항

- 운영 Supabase key, DB password, access token, JWT secret은 절대 커밋하지 않습니다.
- `application-local.properties`, `.env`, `.env.local`은 개인 로컬 파일로만 사용합니다.
- `supabase status`에 표시되는 로컬 key는 로컬 개발용입니다. 운영 환경에 사용하지 않습니다.
- 로컬 Supabase 서비스가 localhost 밖에서 접근 가능하게 열릴 수 있으므로 공용 네트워크에서 노출하지 않습니다.
- 노출된 운영 key는 로컬 Supabase 구축과 별개로 Supabase Dashboard에서 재발급하거나 폐기해야 합니다.
