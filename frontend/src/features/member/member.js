export function loginMember(form) {
  // 회원 API 계약이 확정되기 전까지 로그인 화면 동작만 확인하는 임시 함수입니다.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!form.loginId || !form.password) {
        reject(new Error('아이디와 비밀번호를 모두 입력해주세요.'))
        return
      }

      resolve({
        member: {
          loginId: form.loginId,
        },
      })
    }, 300)
  })
}

export function signupMember(form) {
  // 실제: POST /api/members/signup
  // userId와 인증 방식이 확정되기 전까지 회원가입 화면 흐름만 흉내 냅니다.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!form.name || !form.phone || !form.address || !form.email) {
        reject(new Error('기본 정보를 모두 입력해주세요.'))
        return
      }

      if (!form.loginId || !form.password || !form.passwordConfirm) {
        reject(new Error('가입 정보를 모두 입력해주세요.'))
        return
      }

      resolve({
        member: {
          name: form.name,
          loginId: form.loginId,
          email: form.email,
        },
      })
    }, 300)
  })
}
