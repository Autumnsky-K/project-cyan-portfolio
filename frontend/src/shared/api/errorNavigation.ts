import type { NavigateFunction } from 'react-router-dom'

let globalNavigate: NavigateFunction | null = null

export function setGlobalNavigate(navigate: NavigateFunction | null): void {
  globalNavigate = navigate
}

export function navigateToServerError(): void {
  globalNavigate?.('/500')
}
