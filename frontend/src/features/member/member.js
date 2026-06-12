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
