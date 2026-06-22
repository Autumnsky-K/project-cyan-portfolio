import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublicKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY
const hasDashboardUrl = supabaseUrl?.includes(
  'supabase.com/dashboard/project/',
)

function getSupabaseConfigError() {
  if (!supabaseUrl) {
    return 'VITE_SUPABASE_URL이 설정되어 있지 않습니다.'
  }

  if (!supabasePublicKey) {
    return 'VITE_SUPABASE_PUBLISHABLE_KEY 또는 VITE_SUPABASE_ANON_KEY가 설정되어 있지 않습니다.'
  }

  if (hasDashboardUrl) {
    return 'VITE_SUPABASE_URL에는 Supabase Dashboard 주소가 아니라 https://프로젝트-ref.supabase.co 형식의 Project URL을 입력해야 합니다.'
  }

  try {
    const parsedUrl = new URL(supabaseUrl)

    if (
      parsedUrl.protocol !== 'https:' ||
      !parsedUrl.hostname.endsWith('.supabase.co')
    ) {
      return 'VITE_SUPABASE_URL은 https://프로젝트-ref.supabase.co 형식이어야 합니다.'
    }
  } catch {
    return 'VITE_SUPABASE_URL 형식이 올바르지 않습니다.'
  }

  return ''
}

export const supabaseConfigError = getSupabaseConfigError()

// 브라우저에 공개 가능한 Supabase URL과 공개 키만 사용합니다.
export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabasePublicKey, {
      auth: {
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    })
