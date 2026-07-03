import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchSupportFaqs, type SupportFaq } from '../../api/support'
import './customer-info.css'

type CustomerInfoKind = 'support' | 'faq' | 'terms' | 'privacy' | 'partnership'

type CustomerInfoPageProps = {
  kind: CustomerInfoKind
}

type PolicySection = {
  title: string
  body: string[]
}

const customerNavItems = [
  { kind: 'support', label: '고객센터', to: '/support' },
  { kind: 'faq', label: 'FAQ', to: '/faq' },
  { kind: 'terms', label: '이용약관', to: '/terms' },
  { kind: 'privacy', label: '개인정보 처리방침', to: '/privacy' },
  { kind: 'partnership', label: '제휴 문의', to: '/partnership' },
] as const

const pageMeta = {
  support: {
    eyebrow: 'Customer Center',
    title: '고객센터',
    description: '주문, 결제, 배송, 디지털 굿즈 이용 중 확인해야 할 항목을 정리했습니다.',
  },
  faq: {
    eyebrow: 'FAQ',
    title: '자주 묻는 질문',
    description: '굿즈 구매와 계정 이용 중 반복되는 질문을 빠르게 확인합니다.',
  },
  terms: {
    eyebrow: 'Terms',
    title: '이용약관',
    description: 'Project Cyan Store 이용 조건과 구매 절차의 기본 기준입니다.',
  },
  privacy: {
    eyebrow: 'Privacy',
    title: '개인정보 처리방침',
    description: '회원, 주문, 결제, 보안 운영에 필요한 개인정보 처리 기준입니다.',
  },
  partnership: {
    eyebrow: 'Partner',
    title: '제휴 문의',
    description: '크리에이터, IP 보유자, 브랜드와 함께 굿즈 기획과 판매 가능성을 검토합니다.',
  },
} as const satisfies Record<CustomerInfoKind, {
  eyebrow: string
  title: string
  description: string
}>

const supportChecklist = [
  '주문 관련 문의는 마이페이지에서 주문 상태와 결제 일시를 먼저 확인해 주세요.',
  '배송 문의는 수령인, 연락처, 주소가 최신 정보인지 확인한 뒤 접수해야 합니다.',
  '디지털 굿즈 이용 문제는 상품명, 구매 계정, 오류 화면을 함께 남겨야 처리 속도가 빨라집니다.',
]

const defaultFaqItems: SupportFaq[] = [
  {
    faqId: -1,
    category: '주문/결제',
    question: 'Q. 결제 후 주문 내역은 어디에서 확인하나요?',
    answer: '로그인 후 마이페이지에서 주문 상태를 확인할 수 있습니다. 주문이 보이지 않으면 결제 시각, 결제 수단, 주문자 정보를 확인한 뒤 고객센터로 문의해 주세요.',
    sortOrder: 10,
    visible: true,
  },
  {
    faqId: -2,
    category: '주문/결제',
    question: 'Q. 무통장 입금 확인이 늦어지고 있습니다.',
    answer: '입금자명, 금액, 주문 정보가 일치해야 확인됩니다. 입금자명이 다르거나 금액이 다르면 수동 확인이 필요하므로 주문번호와 실제 입금자명을 함께 남겨주세요.',
    sortOrder: 20,
    visible: true,
  },
  {
    faqId: -3,
    category: '배송',
    question: 'Q. 제주/도서산간 추가 배송비가 있나요?',
    answer: '배송지가 제주 또는 도서산간 지역이면 추가 배송비가 부과될 수 있습니다. 결제 단계에서 입력한 배송지를 기준으로 배송비가 계산됩니다.',
    sortOrder: 30,
    visible: true,
  },
  {
    faqId: -4,
    category: '취소/교환/반품',
    question: 'Q. 제품 하자를 발견하면 어떻게 하나요?',
    answer: '상품명, 주문번호, 하자 부위 사진을 준비해 고객센터로 문의해 주세요. 상품 자체 불량으로 확인되면 교환, 반품, 보상 가능 범위를 안내합니다.',
    sortOrder: 40,
    visible: true,
  },
]

const termsSections: PolicySection[] = [
  {
    title: '제1조 목적',
    body: [
      '본 약관은 Project Cyan Store가 제공하는 회원, 굿즈 탐색, 장바구니, 주문, 결제, 디지털 콘텐츠 이용 서비스의 조건과 절차를 정합니다.',
    ],
  },
  {
    title: '제2조 용어의 정의',
    body: [
      '회원은 약관에 동의하고 계정을 생성하여 서비스를 이용하는 사람을 말합니다.',
      '상품은 실물 굿즈, 디지털 굿즈, 다운로드형 콘텐츠, 기타 사이트에서 판매하거나 안내하는 재화와 서비스를 말합니다.',
      '디지털 굿즈는 음성, 이미지, 메시지, 파일, 코드 등 배송 없이 전자적 방식으로 제공되는 상품을 말합니다.',
    ],
  },
  {
    title: '제3조 약관의 게시와 변경',
    body: [
      '사이트는 이용자가 확인할 수 있는 화면에 약관, 개인정보 처리방침, 고객 안내를 게시합니다.',
      '약관을 변경하는 경우 적용일과 변경 사유를 사전에 공지하며, 이용자에게 불리한 주요 변경은 충분한 고지 기간을 둡니다.',
    ],
  },
  {
    title: '제4조 회원가입과 계정 관리',
    body: [
      '회원은 가입과 주문에 필요한 정보를 정확하게 입력해야 하며, 허위 정보 또는 타인 정보 사용으로 발생한 문제는 회원에게 책임이 있습니다.',
      '계정, 비밀번호, 인증 수단의 관리 책임은 회원에게 있으며 도용이 의심되는 경우 즉시 비밀번호를 변경하고 고객센터에 알려야 합니다.',
    ],
  },
  {
    title: '제5조 상품 구매와 결제',
    body: [
      '상품 가격, 판매 상태, 재고, 배송 조건, 디지털 제공 방식은 주문 시점의 상품 상세 화면과 결제 단계 안내를 기준으로 합니다.',
      '주문은 결제 승인 또는 별도 고지된 조건이 충족된 때 성립하며, 결제 실패나 재고 부족이 확인되면 주문이 취소될 수 있습니다.',
    ],
  },
  {
    title: '제6조 취소, 교환, 환불',
    body: [
      '실물 상품은 발송 준비 상태, 배송 진행 여부, 상품 하자 여부에 따라 취소, 교환, 환불 가능 범위가 달라집니다.',
      '디지털 굿즈는 다운로드, 열람, 코드 발급, 파일 제공 등 콘텐츠 제공이 시작된 뒤에는 관련 법령이 허용하는 범위에서 환불이 제한될 수 있습니다.',
    ],
  },
  {
    title: '제7조 금지 행위와 이용 제한',
    body: [
      '이용자는 허위 주문, 부정 결제, 자동화된 대량 요청, 무단 크롤링, 서비스 장애 유발, 타인의 권리 침해 행위를 해서는 안 됩니다.',
      '보안상 위험하거나 서비스 운영을 방해하는 요청이 확인되면 사이트는 접속 제한, 주문 보류, 계정 제한 등 필요한 조치를 할 수 있습니다.',
    ],
  },
  {
    title: '제8조 지식재산권',
    body: [
      '사이트의 화면, 로고, 상품 이미지, 설명, 콘텐츠, 프로그램에 관한 권리는 Project Cyan Store 또는 정당한 권리자에게 있습니다.',
      '회원은 명시적 허락 없이 사이트 콘텐츠를 복제, 배포, 판매, 2차 제작, 상업적으로 이용할 수 없습니다.',
    ],
  },
  {
    title: '제9조 서비스 중단과 면책',
    body: [
      '시스템 점검, 장애, 보안 대응, 천재지변, 외부 서비스 장애가 있는 경우 서비스가 일시적으로 중단될 수 있습니다.',
      '사이트의 고의 또는 중대한 과실이 없는 한 이용자의 귀책사유, 외부 결제사나 배송사의 장애, 불가항력으로 발생한 손해에 대해서는 책임이 제한됩니다.',
    ],
  },
  {
    title: '부칙',
    body: [
      '본 약관은 2026년 7월 3일부터 적용합니다.',
    ],
  },
]

const privacySections: PolicySection[] = [
  {
    title: '처리 목적',
    body: [
      '회원 식별, 로그인 유지, 장바구니, 주문 처리, 결제 검증, 배송, 고객 응대, 부정 이용 방지 목적으로 개인정보를 처리합니다.',
    ],
  },
  {
    title: '처리 항목',
    body: [
      '회원 정보는 이메일, 이름, 휴대폰 번호, 배송지, 주문 내역, 결제 상태 등 서비스 제공에 필요한 항목을 포함합니다.',
      '보안 운영을 위해 IP 주소, 요청 시각, 브라우저 환경, 오류 로그 등 접속 기록이 서버 보안 로그에 남을 수 있습니다.',
    ],
  },
  {
    title: '보관과 파기',
    body: [
      '개인정보는 목적 달성 후 지체 없이 파기하되, 전자상거래, 세무, 분쟁 대응 등 관계 법령에서 정한 기간이 있으면 해당 기간 동안 보관합니다.',
    ],
  },
  {
    title: '쿠키와 통계',
    body: [
      '로그인, 장바구니, 결제 보안에 필요한 필수 쿠키는 서비스 운영을 위해 사용됩니다.',
      '고객 이용 통계 쿠키는 이용자가 동의한 경우에만 방문 흐름과 상품 이용 개선 목적으로 사용합니다.',
    ],
  },
]

const partnershipSteps = [
  {
    title: '신청서 접수',
    body: '제작 희망 품목, 예상 수량, IP 또는 크리에이터 소개, 판매 목적, 담당자 연락처를 정리해 문의합니다.',
  },
  {
    title: '상품화 검토',
    body: '제휴 적합성이 확인되면 상품 구성, 샘플 제작, 단가, 일정, 판매 방식, 정산 기준을 함께 검토합니다.',
  },
  {
    title: '제작 및 판매 운영',
    body: '계약 범위가 확정되면 제작, 검수, 상품 등록, 판매, CS, 정산 운영 범위를 나누어 진행합니다.',
  },
]

const partnershipChecklist = [
  '크리에이터, 브랜드, IP 소개',
  '희망 굿즈 품목과 예상 수량',
  '제작 목적과 판매 희망 시기',
  '참고 이미지 또는 기존 판매 사례',
  '담당자 이름, 이메일, 연락 가능한 채널',
]

const partnershipMailSubject = '[Project Cyan] 제휴 문의'
const partnershipMailBody = [
  'Project Cyan Store 제휴 문의',
  '',
  '1. 크리에이터/브랜드/IP명:',
  '2. 담당자 이름:',
  '3. 연락처 또는 회신 이메일:',
  '4. 희망 굿즈 품목:',
  '5. 예상 수량:',
  '6. 제작 목적 또는 판매 계획:',
  '7. 희망 일정:',
  '8. 참고 링크/자료:',
].join('\n')

const partnershipMailHref = `mailto:?subject=${encodeURIComponent(partnershipMailSubject)}&body=${encodeURIComponent(partnershipMailBody)}`

function CustomerSideNav({ kind }: { kind: CustomerInfoKind }) {
  return (
    <aside className="customer-info-sidebar" aria-label="Customer information navigation">
      <p>Help Menu</p>
      <nav>
        {customerNavItems.map((item) => (
          <Link
            key={item.kind}
            to={item.to}
            aria-current={item.kind === kind ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

function PolicySectionList({ sections }: { sections: PolicySection[] }) {
  return (
    <div className="customer-policy-list">
      {sections.map((section) => (
        <article key={section.title} className="customer-policy-section">
          <h2>{section.title}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>
      ))}
    </div>
  )
}

function FaqList({ faqs }: { faqs: SupportFaq[] }) {
  if (!faqs.length) {
    return <div className="customer-info-state">등록된 FAQ가 없습니다.</div>
  }

  return (
    <div className="customer-info-faq-list">
      {faqs.map((item, index) => (
        <details key={item.faqId} className="customer-info-faq-item" open={index === 0}>
          <summary>
            <span>{item.category}</span>
            <strong>{item.question}</strong>
          </summary>
          <div>
            {item.answer.split('\n').map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}

function CustomerInfoPage({ kind }: CustomerInfoPageProps) {
  const meta = pageMeta[kind]
  const [faqItems, setFaqItems] = useState<SupportFaq[]>(defaultFaqItems)
  const [faqStatus, setFaqStatus] = useState<'idle' | 'loaded' | 'fallback'>('idle')

  useEffect(() => {
    if (kind !== 'faq') {
      return undefined
    }

    const controller = new AbortController()
    fetchSupportFaqs({ signal: controller.signal })
      .then((items) => {
        setFaqItems(items)
        setFaqStatus('loaded')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
        setFaqItems(defaultFaqItems)
        setFaqStatus('fallback')
      })

    return () => controller.abort()
  }, [kind])

  return (
    <main className="customer-info-page">
      <section className="customer-info-hero" aria-labelledby="customer-info-title">
        <p>{meta.eyebrow}</p>
        <h1 id="customer-info-title">{meta.title}</h1>
        <span>{meta.description}</span>
      </section>

      <div className="customer-info-layout">
        <CustomerSideNav kind={kind} />

        <div className="customer-info-content">
          {kind === 'support' && (
            <section className="customer-info-section" aria-labelledby="support-checklist-title">
              <div className="customer-info-section-heading">
                <p>Before Contact</p>
                <h2 id="support-checklist-title">문의 전 확인</h2>
              </div>
              <ul className="customer-info-list">
                {supportChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="customer-info-actions">
                <Link to="/mypage">주문 정보 확인</Link>
                <Link to="/goods">상품 다시 보기</Link>
              </div>
            </section>
          )}

          {kind === 'faq' && (
            <section className="customer-info-section" aria-labelledby="faq-list-title">
              <div className="customer-info-section-heading">
                <p>Help Topics</p>
                <h2 id="faq-list-title">FAQ</h2>
              </div>
              {faqStatus === 'fallback' && (
                <div className="customer-info-state is-warning">
                  서버 FAQ를 불러오지 못해 기본 안내를 표시합니다.
                </div>
              )}
              <FaqList faqs={faqItems} />
            </section>
          )}

          {kind === 'terms' && (
            <section className="customer-info-section" aria-labelledby="terms-list-title">
              <div className="customer-info-section-heading">
                <p>Store Terms</p>
                <h2 id="terms-list-title">기본 약관</h2>
              </div>
              <PolicySectionList sections={termsSections} />
            </section>
          )}

          {kind === 'privacy' && (
            <section className="customer-info-section" aria-labelledby="privacy-list-title">
              <div className="customer-info-section-heading">
                <p>Data Use</p>
                <h2 id="privacy-list-title">처리 항목</h2>
              </div>
              <PolicySectionList sections={privacySections} />
            </section>
          )}

          {kind === 'partnership' && (
            <>
              <section className="customer-info-section partnership-intro" aria-labelledby="partnership-title">
                <div className="customer-info-section-heading">
                  <p>Contact Us</p>
                  <h2 id="partnership-title">IP 기반 굿즈 제휴</h2>
                </div>
                <p>
                  Project Cyan Store는 크리에이터와 브랜드의 세계관을 굿즈로 확장하는 협업을 검토합니다.
                  실물 굿즈, 디지털 굿즈, 한정 판매, 이벤트 상품처럼 판매 목적이 분명한 제안을 우선 검토합니다.
                </p>
                <div className="customer-info-actions">
                  <a href={partnershipMailHref}>제휴 문의 메일 작성</a>
                  <Link to="/goods">판매 굿즈 보기</Link>
                </div>
              </section>

              <section className="customer-info-section" aria-labelledby="partnership-process-title">
                <div className="customer-info-section-heading">
                  <p>Process</p>
                  <h2 id="partnership-process-title">진행 절차</h2>
                </div>
                <div className="partnership-step-grid">
                  {partnershipSteps.map((step, index) => (
                    <article key={step.title}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <h3>{step.title}</h3>
                      <p>{step.body}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="customer-info-section" aria-labelledby="partnership-checklist-title">
                <div className="customer-info-section-heading">
                  <p>Checklist</p>
                  <h2 id="partnership-checklist-title">문의에 포함할 내용</h2>
                </div>
                <ul className="customer-info-list">
                  {partnershipChecklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default CustomerInfoPage
