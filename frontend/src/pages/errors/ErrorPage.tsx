import type { ReactNode } from 'react'
import './ErrorPage.css'

type ErrorPageProps = {
  code: string
  title: string
  message: ReactNode
  children?: ReactNode
}

function ErrorPage({ code, title, message, children }: ErrorPageProps) {
  return (
    <main className="error-page">
      <p className="error-page-code" aria-hidden="true">{code}</p>
      <h1 className="error-page-title">{title}</h1>
      <p className="error-page-message">{message}</p>
      {children && <div className="error-page-actions">{children}</div>}
    </main>
  )
}

export default ErrorPage
