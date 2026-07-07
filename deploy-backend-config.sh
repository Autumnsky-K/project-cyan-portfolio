#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="project-cyan-500906"
SERVICE_NAME="project-cyan-backend"
REGION="asia-northeast3"
VALUES_FILE="${1:-backend/.env.cloudrun}"
SECRET_PREFIX="project-cyan-backend"

REQUIRED_KEYS=(
  SUPABASE_DB_URL
  SUPABASE_DB_USERNAME
  SUPABASE_DB_PASSWORD
  SUPABASE_SERVICE_ROLE_KEY
  SUPABASE_PROJECT_URL
  SUPABASE_JWT_ISSUER
  SUPABASE_JWKS_URL
  SUPABASE_JWT_AUDIENCE
  ADMIN_AUTH_USERNAME
  ADMIN_AUTH_PASSWORD
  FRONTEND_BASE_URL
  AI_GOODS_CATALOG_EXPORT_ENABLED
  AI_GOODS_CATALOG_BUCKET
  AI_GOODS_CATALOG_FILE_NAME
  AI_GOODS_CATALOG_CRON
  AI_GOODS_CATALOG_SIGNED_URL_TTL_SECONDS
  PROJECT_CYAN_AI_SERVICE_URL
  PROJECT_CYAN_INTERNAL_SERVICE_TOKEN
  PROJECT_CYAN_CREDENTIAL_MASTER_KEY
  PROJECT_CYAN_LLM_ALLOWED_HOSTS
)

if [[ ! -f "$VALUES_FILE" ]]; then
  echo "설정 파일을 찾을 수 없습니다: $VALUES_FILE" >&2
  exit 1
fi

gcloud config set project "$PROJECT_ID" >/dev/null

declare -A VALUES

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%$'\r'}"

  [[ -z "$line" || "$line" == \#* ]] && continue

  key="${line%%=*}"
  value="${line#*=}"

  if [[ "$key" == "$line" ]]; then
    echo "잘못된 설정 줄: $line" >&2
    exit 1
  fi

  VALUES["$key"]="$value"
done < "$VALUES_FILE"

for key in "${REQUIRED_KEYS[@]}"; do
  if [[ -z "${VALUES[$key]:-}" ]]; then
    echo "값이 없거나 비어 있습니다: $key" >&2
    exit 1
  fi
done

PROJECT_NUMBER="$(
  gcloud projects describe "$PROJECT_ID" \
    --format='value(projectNumber)'
)"

RUN_SERVICE_ACCOUNT="$(
  gcloud run services describe "$SERVICE_NAME" \
    --region "$REGION" \
    --format='value(spec.template.spec.serviceAccountName)'
)"

if [[ -z "$RUN_SERVICE_ACCOUNT" ]]; then
  RUN_SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
fi

echo "Cloud Run 서비스 계정: $RUN_SERVICE_ACCOUNT"

SECRET_MAPPINGS=()

for key in "${REQUIRED_KEYS[@]}"; do
  secret_suffix="$(
    printf '%s' "$key" |
      tr '[:upper:]_' '[:lower:]-'
  )"
  secret_name="${SECRET_PREFIX}-${secret_suffix}"

  if ! gcloud secrets describe "$secret_name" >/dev/null 2>&1; then
    echo "Secret 생성: $secret_name"

    gcloud secrets create "$secret_name" \
      --replication-policy=automatic \
      >/dev/null
  fi

  echo "Secret 버전 추가: $key"

  version_path="$(
    printf '%s' "${VALUES[$key]}" |
      gcloud secrets versions add "$secret_name" \
        --data-file=- \
        --format='value(name)'
  )"

  version="${version_path##*/}"

  gcloud secrets add-iam-policy-binding "$secret_name" \
    --member="serviceAccount:${RUN_SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet \
    >/dev/null

  SECRET_MAPPINGS+=("${key}=${secret_name}:${version}")
done

secret_argument="$(
  IFS=,
  printf '%s' "${SECRET_MAPPINGS[*]}"
)"

echo "Cloud Run 새 리비전 배포 중..."

gcloud run services update "$SERVICE_NAME" \
  --region "$REGION" \
  --update-secrets "$secret_argument" \
  --quiet

echo
echo "배포 완료"
gcloud run services describe "$SERVICE_NAME" \
  --region "$REGION" \
  --format='value(status.url)'
