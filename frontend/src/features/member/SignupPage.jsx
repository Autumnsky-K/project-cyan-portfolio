import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signupMember } from './member'
import './SignupPage.css'

const REQUIRED_TERMS = [
  {
    id: 'age',
    label: '만 14세 이상입니다.',
  },
  {
    id: 'service',
    label: '서비스 이용약관에 동의합니다.',
  },
  {
    id: 'privacy',
    label: '개인정보 수집 및 이용에 동의합니다.',
  },
]

const OPTIONAL_TERMS = [
  {
    id: 'marketing',
    label: '이벤트 할인 혜택 알림 수신에 동의합니다.',
  },
  {
    id: 'recommend',
    label: '맞춤 굿즈 추천 정보 수신에 동의합니다.',
  },
]

function SignupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    loginId: '',
    password: '',
    passwordConfirm: '',
  })
  const [agreements, setAgreements] = useState({
    age: false,
    service: false,
    privacy: false,
    marketing: false,
    recommend: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const allAgreementIds = [...REQUIRED_TERMS, ...OPTIONAL_TERMS].map(
    (term) => term.id,
  )
  const isAllAgreed = allAgreementIds.every((termId) => agreements[termId])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleAgreementChange = (event) => {
    const { name, checked } = event.target

    setAgreements((currentAgreements) => ({
      ...currentAgreements,
      [name]: checked,
    }))
  }

  const handleAllAgreementChange = (event) => {
    const { checked } = event.target

    setAgreements((currentAgreements) => {
      const nextAgreements = { ...currentAgreements }

      allAgreementIds.forEach((termId) => {
        nextAgreements[termId] = checked
      })

      return nextAgreements
    })
  }

  const validateStepOne = () => {
    if (!form.name || !form.phone || !form.address || !form.email) {
      setError('이름, 휴대폰번호, 주소, 이메일을 모두 입력해주세요.')
      return false
    }

    return true
  }

  const validateStepTwo = () => {
    const isRequiredAgreed = REQUIRED_TERMS.every((term) => agreements[term.id])

    if (!form.loginId || !form.password || !form.passwordConfirm) {
      setError('아이디와 비밀번호를 모두 입력해주세요.')
      return false
    }

    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 서로 다릅니다.')
      return false
    }

    if (!isRequiredAgreed) {
      setError('필수 약관에 모두 동의해주세요.')
      return false
    }

    return true
  }

  const handleNextStep = () => {
    setMessage('')
    setError('')

    if (validateStepOne()) {
      setStep(2)
    }
  }

  const handlePreviousStep = () => {
    setMessage('')
    setError('')
    setStep(1)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!validateStepTwo()) {
      return
    }

    setIsLoading(true)

    try {
      // Supabase Auth 가입 후 DB 트리거가 public.member를 동기화합니다.
      const result = await signupMember({
        ...form,
        agreements,
      })

      setMessage(`${result.member.name}님, 회원가입 요청이 완료되었습니다.`)
      navigate('/like')
    } catch (signupError) {
      setError(signupError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="signup-page">
      <section className="signup-card" aria-label="회원가입">
        <div className="signup-header">
          <div className="signup-logo" aria-hidden="true"></div>
          <div className="signup-step" aria-label={`회원가입 ${step}단계`}>
            <span className={step === 1 ? 'is-active' : ''}>1</span>
            <i aria-hidden="true">·····</i>
            <span className={step === 2 ? 'is-active' : ''}>2</span>
          </div>
          <h1>{step === 1 ? '기본 정보를 입력해주세요' : '가입 정보를 확인해주세요'}</h1>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <label className="signup-field">
                <span>이름</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="이름을 입력하세요"
                  autoComplete="name"
                  required
                />
              </label>

              <label className="signup-field">
                <span>휴대폰번호</span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                  autoComplete="tel"
                  required
                />
              </label>

              <label className="signup-field">
                <span>주소</span>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="주소를 입력하세요"
                  autoComplete="street-address"
                  required
                />
              </label>

              <label className="signup-field">
                <span>이메일</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              {error && (
                <p className="signup-feedback signup-feedback-error" role="alert">
                  {error}
                </p>
              )}

              <button className="signup-submit" type="button" onClick={handleNextStep}>
                다음
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <label className="signup-field">
                <span>비밀번호</span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="new-password"
                  required
                />
              </label>

              <label className="signup-field">
                <span>비밀번호 확인</span>
                <input
                  type="password"
                  name="passwordConfirm"
                  value={form.passwordConfirm}
                  onChange={handleChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  autoComplete="new-password"
                  required
                />
              </label>

              <fieldset className="signup-terms">
                <legend>약관동의</legend>

                <label className="signup-term signup-term-all">
                  <input
                    type="checkbox"
                    checked={isAllAgreed}
                    onChange={handleAllAgreementChange}
                  />
                  <span>모두 동의합니다.</span>
                </label>

                <div className="signup-term-list">
                  {REQUIRED_TERMS.map((term) => (
                    <label className="signup-term" key={term.id}>
                      <input
                        type="checkbox"
                        name={term.id}
                        checked={agreements[term.id]}
                        onChange={handleAgreementChange}
                      />
                      <span>
                        {term.label} <strong>(필수)</strong>
                      </span>
                    </label>
                  ))}

                  {OPTIONAL_TERMS.map((term) => (
                    <label className="signup-term" key={term.id}>
                      <input
                        type="checkbox"
                        name={term.id}
                        checked={agreements[term.id]}
                        onChange={handleAgreementChange}
                      />
                      <span>
                        {term.label} <em>(선택)</em>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {error && (
                <p className="signup-feedback signup-feedback-error" role="alert">
                  {error}
                </p>
              )}

              {message && (
                <p className="signup-feedback signup-feedback-success" role="status">
                  {message}
                </p>
              )}

              <div className="signup-actions">
                <button
                  className="signup-secondary"
                  type="button"
                  onClick={handlePreviousStep}
                >
                  이전
                </button>
                <button className="signup-submit" type="submit" disabled={isLoading}>
                  {isLoading ? '가입 중...' : '회원가입'}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="signup-login">
          이미 계정이 있으신가요? <Link to="/">로그인</Link>
        </p>
      </section>
    </main>
  )
}

export default SignupPage
