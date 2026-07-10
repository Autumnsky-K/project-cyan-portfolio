# Supabase 원격 프로젝트 연결 가이드

이 프로젝트는 개발 환경에서도 로컬 Supabase DB를 실행하지 않고 팀 Supabase 원격 프로젝트에 연결합니다.

## 1. 필요한 값

Supabase Dashboard 또는 팀 보안 채널에서 아래 값을 받아 개인 환경 파일에만 저장합니다.

```env
SUPABASE_DB_URL=jdbc:postgresql://<supabase-pooler-host>:5432/postgres
SUPABASE_DB_USERNAME=postgres.<project-ref>
SUPABASE_DB_PASSWORD=<database-password>
SUPABASE_PROJECT_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_JWT_ISSUER=https://<project-ref>.supabase.co/auth/v1
SUPABASE_JWKS_URL=https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
SUPABASE_JWT_AUDIENCE=authenticated
```

실제 password, service role key, access token은 커밋하지 않습니다.

## 2. 백엔드 설정

예시 파일을 복사해 개인 설정을 만듭니다.

```bash
cp backend/src/main/resources/application-local.example.properties backend/src/main/resources/application-local.properties
```

`application-local.properties`는 `${...}` placeholder를 사용하므로 위 환경변수를 셸, IDE 실행 설정, 또는 커밋하지 않는 `.env.local`에 넣습니다.

백엔드는 기본적으로 `local` profile로 실행됩니다.

```bash
npm run dev:backend
```

전체 개발 서버를 함께 실행하려면 다음 명령을 사용합니다.

```bash
npm run dev
```

## 3. Storage와 Auth

Storage와 Auth Admin API도 같은 원격 Supabase 프로젝트를 사용합니다.

```properties
supabase.storage.project-url=${SUPABASE_PROJECT_URL}
supabase.auth.project-url=${SUPABASE_PROJECT_URL}
```

Storage API는 `<SUPABASE_PROJECT_URL>/storage/v1`로 호출됩니다.

## 4. 스키마 변경

원격 DB 스키마 변경은 팀 합의 후 Supabase migration으로 관리합니다. 로컬 DB에 먼저 적용하는 흐름은 사용하지 않습니다.

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

DB password, access token, 운영 key는 문서와 커밋에 남기지 않습니다.

## 5. 보안 주의사항

- 운영 Supabase key, DB password, access token, JWT secret은 절대 커밋하지 않습니다.
- `application-local.properties`, `.env`, `.env.local`은 개인 설정 파일로만 사용합니다.
- 원격 프로젝트에 직접 연결하므로 데이터 삭제와 migration 작업은 팀 합의 후 실행합니다.
