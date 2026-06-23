import type { CSSProperties } from 'react'

import type { CmsPage } from '../../api/cms'

const colorPattern = /^#[0-9a-fA-F]{6}$/

function searchParams() {
  if (typeof window === 'undefined') {
    return new URLSearchParams()
  }
  return new URLSearchParams(window.location.search)
}

function validColor(value: string | null) {
  return value && colorPattern.test(value) ? value : null
}

export function applyPreviewTheme(page: CmsPage): CmsPage {
  const params = searchParams()
  return {
    ...page,
    primaryColor: validColor(params.get('previewPrimary')) || page.primaryColor,
    accentColor: validColor(params.get('previewAccent')) || page.accentColor,
    backgroundColor: validColor(params.get('previewBackground')) || page.backgroundColor,
  }
}

export function previewTypographyStyle(): CSSProperties {
  const params = searchParams()
  const fontSize = params.get('previewFontSize')
  const fontFamily = params.get('previewFontFamily')
  const style: CSSProperties = {}

  if (fontSize && /^\d{1,2}$/.test(fontSize)) {
    style.fontSize = `${fontSize}px`
  }
  if (fontFamily) {
    style.fontFamily = fontFamily
  }

  return style
}
