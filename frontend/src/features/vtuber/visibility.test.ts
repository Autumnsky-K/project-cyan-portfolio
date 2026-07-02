import { describe, expect, it } from 'vitest'

import { isVtuberVisiblePath } from './visibility'

describe('isVtuberVisiblePath', () => {
  it.each(['/goods', '/goods/42', '/cart'])('shows the chatbot on %s', (path) => {
    expect(isVtuberVisiblePath(path)).toBe(true)
  })

  it.each([
    '/',
    '/artists',
    '/store',
    '/checkout',
    '/payment/success',
    '/mypage',
    '/goods/not-a-number',
  ])('hides the chatbot on %s', (path) => {
    expect(isVtuberVisiblePath(path)).toBe(false)
  })
})
