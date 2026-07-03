/* eslint-disable react-refresh/only-export-components */
import { type FocusEvent, type KeyboardEvent, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Puck, type Config, type Data } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import './admin-cms-puck.css'

type CmsPageKey = 'home' | 'artists'

type FieldDefinition = {
  key: string
  label: string
  kind?: 'text' | 'textarea'
  placeholder?: string
}

type CmsPreviewProps = Record<string, unknown>

type CmsComponentData = {
  type?: string
  props?: Record<string, unknown>
}

type InlineEditDetail = {
  fieldKey: string
  value: string
}

type InlineEditableTag = 'span' | 'p' | 'h1' | 'h2' | 'strong' | 'small'

const INLINE_EDIT_EVENT = 'project-cyan:puck-inline-edit'

const baseFieldDefinitions: FieldDefinition[] = [
  { key: 'eyebrow', label: '상단 보조 문구' },
  { key: 'title', label: '제목' },
  { key: 'summaryTitle', label: '섹션 제목' },
  { key: 'summaryBody', label: '섹션 설명', kind: 'textarea' },
  { key: 'heroImageUrl', label: '대표 이미지 URL' },
]

const homeCopyFieldDefinitions: FieldDefinition[] = [
  { key: 'navHome', label: '메뉴 Home' },
  { key: 'navArtists', label: '메뉴 Artists' },
  { key: 'navGoods', label: '메뉴 Goods' },
  { key: 'navCart', label: '메뉴 Cart' },
  { key: 'statusSignalLabel', label: '상태 라벨' },
  { key: 'statusReadyLabel', label: '상태 Live' },
  { key: 'statusLoadingLabel', label: '상태 Loading' },
  { key: 'statusErrorLabel', label: '상태 Offline' },
  { key: 'statusModeLabel', label: '모드 라벨' },
  { key: 'artistsEyebrow', label: '아티스트 보조 문구' },
  { key: 'artistsTitle', label: '아티스트 제목' },
  { key: 'physicalEyebrow', label: '실물 굿즈 보조 문구' },
  { key: 'physicalTitle', label: '실물 굿즈 제목' },
  { key: 'physicalCta', label: '실물 굿즈 버튼' },
  { key: 'digitalEyebrow', label: '디지털 보조 문구' },
  { key: 'digitalTitle', label: '디지털 제목' },
  { key: 'digitalCta', label: '디지털 버튼' },
  { key: 'digitalFeatureEyebrow', label: '디지털 드롭 라벨' },
  { key: 'digitalFeatureDescription', label: '디지털 드롭 설명', kind: 'textarea' },
  { key: 'digitalFeatureCta', label: '디지털 드롭 버튼' },
  { key: 'byArtistEyebrow', label: '아티스트별 굿즈 보조 문구' },
  { key: 'byArtistTitle', label: '아티스트별 굿즈 제목' },
  { key: 'byArtistCta', label: '아티스트별 굿즈 버튼' },
  { key: 'categoryEyebrow', label: '카테고리 보조 문구' },
  { key: 'categoryTitle', label: '카테고리 제목' },
  { key: 'categoryCta', label: '카테고리 버튼' },
  { key: 'footerEyebrow', label: '하단 보조 문구' },
  { key: 'footerTitle', label: '하단 제목' },
  { key: 'footerShopTitle', label: 'Shop 컬럼 제목' },
  { key: 'footerShopAllGoods', label: 'Shop 전체 굿즈' },
  { key: 'footerShopPhysicalGoods', label: 'Shop 실물 굿즈' },
  { key: 'footerShopDigitalGoods', label: 'Shop 디지털 굿즈' },
  { key: 'footerArtistTitle', label: 'Artist 컬럼 제목' },
  { key: 'footerArtistArtistsPage', label: 'Artist 페이지' },
  { key: 'footerArtistGroups', label: 'Artist 그룹' },
  { key: 'footerArtistGoodsByArtist', label: 'Artist별 굿즈' },
  { key: 'footerAccountTitle', label: 'Account 컬럼 제목' },
  { key: 'footerAccountSignIn', label: 'Account 로그인' },
  { key: 'footerAccountCart', label: 'Account 장바구니' },
  { key: 'footerAccountLikes', label: 'Account 좋아요' },
  { key: 'footerInfoTitle', label: 'Info 컬럼 제목' },
  { key: 'footerInfoTop', label: 'Info 상단' },
  { key: 'footerInfoCategories', label: 'Info 카테고리' },
  { key: 'footerBottomLabel', label: '하단 제작사' },
  { key: 'footerBackToFirst', label: '첫 페이지 이동' },
]

const artistCopyFieldDefinitions: FieldDefinition[] = [
  { key: 'broadcastStrip', label: '방송 스트립', kind: 'textarea' },
  { key: 'navHome', label: '메뉴 Home' },
  { key: 'navArtists', label: '메뉴 Artists' },
  { key: 'navGoods', label: '메뉴 Goods' },
  { key: 'navCart', label: '메뉴 Cart' },
  { key: 'statsArtistsLabel', label: '요약 Artists' },
  { key: 'statsModeLabel', label: '요약 Mode' },
  { key: 'statsViewLabel', label: '요약 View' },
  { key: 'statsViewValue', label: 'View 값' },
  { key: 'statusLoadingLabel', label: '상태 Loading' },
  { key: 'statusLiveLabel', label: '상태 Live' },
  { key: 'statusPreviewLabel', label: '상태 Preview' },
  { key: 'channelWorld', label: '채널 WORLD' },
  { key: 'channelArea', label: '채널 AREA' },
  { key: 'channelCharacter', label: '채널 CHARACTER' },
  { key: 'channelMusic', label: '채널 MUSIC' },
  { key: 'profileBpmLabel', label: 'BPM 라벨' },
  { key: 'profileDebutLabel', label: 'Debut 라벨' },
  { key: 'profileCollectionsLabel', label: 'Collections 라벨' },
  { key: 'profileSignalLabel', label: 'Signal 라벨' },
  { key: 'artistGoodsCta', label: '아티스트 굿즈 버튼' },
  { key: 'groupGoodsCta', label: '그룹 굿즈 버튼' },
  { key: 'indexEyebrow', label: '인덱스 보조 문구' },
  { key: 'indexTitle', label: '인덱스 제목' },
  { key: 'indexGroupGoodsCta', label: '인덱스 그룹 굿즈' },
  { key: 'pagerIndexLabel', label: '페이저 인덱스' },
]

const homeFallbacks: Record<string, string> = {
  eyebrow: 'Project Cyan',
  title: 'Project Cyan SHOP',
  summaryTitle: 'Official shop signal',
  summaryBody: 'A vertical shop map for characters, physical goods, digital drops, artist collections, and category browsing.',
  navHome: 'Home',
  navArtists: 'Artists',
  navGoods: 'Goods',
  navCart: 'Cart',
  statusSignalLabel: 'SHOP SIGNAL',
  statusReadyLabel: 'Live',
  statusModeLabel: 'FULLPAGE MODE',
  artistsEyebrow: 'Cyan Idol Network',
  artistsTitle: 'Artist Signals',
  physicalEyebrow: 'Physical Goods',
  physicalTitle: 'Goods you can hold',
  physicalCta: 'View physical',
  digitalEyebrow: 'Digital Goods',
  digitalTitle: 'Voice, message, and download drops',
  digitalCta: 'Open digital',
  digitalFeatureEyebrow: 'DATA DROP',
  digitalFeatureDescription: 'Project Cyan channel goods for voice, message, download, or AI-assisted shopping flows.',
  digitalFeatureCta: 'Open drop',
  byArtistEyebrow: 'Goods By Artist',
  byArtistTitle: 'Shop from each artist channel',
  byArtistCta: 'Browse artist goods',
  categoryEyebrow: 'Goods Categories',
  categoryTitle: 'Browse by type',
  categoryCta: 'Open categories',
  footerEyebrow: 'Project Cyan SHOP',
  footerTitle: 'Official Shop Index',
  footerShopTitle: 'Shop',
  footerArtistTitle: 'Artist',
  footerAccountTitle: 'Account',
  footerInfoTitle: 'Info',
  footerBottomLabel: 'CYAN PRODUCTION',
  footerBackToFirst: 'Back to first page',
}

const artistFallbacks: Record<string, string> = {
  eyebrow: 'Cyan Character Area',
  title: 'CHARACTER',
  summaryTitle: 'CYAN',
  summaryBody: 'A full-screen character signal map for virtual idols, stage districts, music energy, and future-pop worlds.',
  broadcastStrip: 'CYAN IDOL NETWORK // AREA STREAM // MUSIC MEDIA MIX // CHARACTER SIGNAL',
  navHome: 'Home',
  navArtists: 'Artists',
  navGoods: 'Goods',
  navCart: 'Cart',
  statsArtistsLabel: 'Artists',
  statsModeLabel: 'Mode',
  statsViewLabel: 'View',
  statsViewValue: 'Stage',
  statusLiveLabel: 'Live',
  statusPreviewLabel: 'Preview',
  channelWorld: 'WORLD',
  channelArea: 'AREA',
  channelCharacter: 'CHARACTER',
  channelMusic: 'MUSIC',
  profileBpmLabel: 'BPM',
  profileDebutLabel: 'Debut',
  profileCollectionsLabel: 'Collections',
  profileSignalLabel: 'Signal',
  artistGoodsCta: '이 아티스트 굿즈 보기',
  groupGoodsCta: '그룹 굿즈 보기',
  indexEyebrow: 'Roster',
  indexTitle: 'Artist Index',
  indexGroupGoodsCta: '그룹 굿즈 보기',
  pagerIndexLabel: 'All',
}

function value(props: CmsPreviewProps, key: string, fallback = '') {
  const rawValue = props[key]
  return typeof rawValue === 'string' && rawValue.trim() ? rawValue : fallback
}

function dispatchInlineEdit(fieldKey: string, nextValue: string) {
  window.dispatchEvent(new CustomEvent<InlineEditDetail>(INLINE_EDIT_EVENT, {
    detail: {
      fieldKey,
      value: nextValue,
    },
  }))
}

function EditableText({
  as = 'span',
  className,
  fieldKey,
  fallback,
  multiline = false,
  props,
}: {
  as?: InlineEditableTag
  className?: string
  fieldKey: string
  fallback: string
  multiline?: boolean
  props: CmsPreviewProps
}) {
  const Element = as
  const displayValue = value(props, fieldKey, fallback)

  function handleBlur(event: FocusEvent<HTMLElement>) {
    dispatchInlineEdit(fieldKey, event.currentTarget.textContent?.trim() ?? '')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!multiline && event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  return (
    <Element
      className={className}
      contentEditable
      data-cms-inline-edit
      data-cms-inline-key={fieldKey}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      suppressContentEditableWarning
    >
      {displayValue}
    </Element>
  )
}

function fieldFromDefinition(definition: FieldDefinition) {
  return {
    type: definition.kind ?? 'text',
    label: definition.label,
    placeholder: definition.placeholder,
    contentEditable: true,
  }
}

function fieldsFromDefinitions(definitions: FieldDefinition[]) {
  return Object.fromEntries(
    definitions.map((definition) => [definition.key, fieldFromDefinition(definition)]),
  )
}

function HomeCmsScreen(props: CmsPreviewProps) {
  const heroImageUrl = value(props, 'heroImageUrl')
  const heroStyle = heroImageUrl
    ? { backgroundImage: `linear-gradient(90deg, rgb(0 0 0 / 78%), rgb(0 0 0 / 28%)), url("${heroImageUrl}")` }
    : undefined

  return (
    <main className="cms-puck-preview cms-puck-home-preview">
      <nav className="cms-puck-preview-nav" aria-label="Home preview navigation">
        <EditableText as="span" fieldKey="navHome" fallback={homeFallbacks.navHome} props={props} />
        <EditableText as="span" fieldKey="navArtists" fallback={homeFallbacks.navArtists} props={props} />
        <EditableText as="span" fieldKey="navGoods" fallback={homeFallbacks.navGoods} props={props} />
        <EditableText as="span" fieldKey="navCart" fallback={homeFallbacks.navCart} props={props} />
      </nav>
      <section className="cms-puck-hero" style={heroStyle}>
        <EditableText as="p" fieldKey="eyebrow" fallback={homeFallbacks.eyebrow} props={props} />
        <EditableText as="h1" fieldKey="title" fallback={homeFallbacks.title} props={props} />
        <EditableText as="strong" fieldKey="summaryTitle" fallback={homeFallbacks.summaryTitle} props={props} />
        <div className="cms-puck-status-strip">
          <EditableText as="span" fieldKey="statusSignalLabel" fallback={homeFallbacks.statusSignalLabel} props={props} />
          <EditableText as="span" fieldKey="statusReadyLabel" fallback={homeFallbacks.statusReadyLabel} props={props} />
          <EditableText as="span" fieldKey="statusModeLabel" fallback={homeFallbacks.statusModeLabel} props={props} />
        </div>
      </section>
      <section className="cms-puck-page-strip">
        <PreviewTile eyebrowKey="artistsEyebrow" eyebrowFallback={homeFallbacks.artistsEyebrow} titleKey="artistsTitle" titleFallback={homeFallbacks.artistsTitle} props={props} />
        <PreviewTile eyebrowKey="physicalEyebrow" eyebrowFallback={homeFallbacks.physicalEyebrow} titleKey="physicalTitle" titleFallback={homeFallbacks.physicalTitle} actionKey="physicalCta" actionFallback={homeFallbacks.physicalCta} props={props} />
        <PreviewTile eyebrowKey="digitalEyebrow" eyebrowFallback={homeFallbacks.digitalEyebrow} titleKey="digitalTitle" titleFallback={homeFallbacks.digitalTitle} actionKey="digitalCta" actionFallback={homeFallbacks.digitalCta} props={props} />
      </section>
      <section className="cms-puck-feature-grid">
        <article>
          <EditableText as="span" fieldKey="digitalFeatureEyebrow" fallback={homeFallbacks.digitalFeatureEyebrow} props={props} />
          <h2>Voice Message Pack</h2>
          <EditableText as="p" fieldKey="digitalFeatureDescription" fallback={homeFallbacks.digitalFeatureDescription} multiline props={props} />
          <button type="button"><EditableText as="span" fieldKey="digitalFeatureCta" fallback={homeFallbacks.digitalFeatureCta} props={props} /></button>
        </article>
        <article>
          <EditableText as="span" fieldKey="byArtistEyebrow" fallback={homeFallbacks.byArtistEyebrow} props={props} />
          <EditableText as="h2" fieldKey="byArtistTitle" fallback={homeFallbacks.byArtistTitle} props={props} />
          <button type="button"><EditableText as="span" fieldKey="byArtistCta" fallback={homeFallbacks.byArtistCta} props={props} /></button>
        </article>
        <article>
          <EditableText as="span" fieldKey="categoryEyebrow" fallback={homeFallbacks.categoryEyebrow} props={props} />
          <EditableText as="h2" fieldKey="categoryTitle" fallback={homeFallbacks.categoryTitle} props={props} />
          <button type="button"><EditableText as="span" fieldKey="categoryCta" fallback={homeFallbacks.categoryCta} props={props} /></button>
        </article>
      </section>
      <footer className="cms-puck-footer-preview">
        <div>
          <EditableText as="span" fieldKey="footerEyebrow" fallback={homeFallbacks.footerEyebrow} props={props} />
          <EditableText as="h2" fieldKey="footerTitle" fallback={homeFallbacks.footerTitle} props={props} />
          <EditableText as="p" fieldKey="summaryBody" fallback={homeFallbacks.summaryBody} multiline props={props} />
        </div>
        <div className="cms-puck-footer-columns">
          <EditableText as="strong" fieldKey="footerShopTitle" fallback={homeFallbacks.footerShopTitle} props={props} />
          <EditableText as="strong" fieldKey="footerArtistTitle" fallback={homeFallbacks.footerArtistTitle} props={props} />
          <EditableText as="strong" fieldKey="footerAccountTitle" fallback={homeFallbacks.footerAccountTitle} props={props} />
          <EditableText as="strong" fieldKey="footerInfoTitle" fallback={homeFallbacks.footerInfoTitle} props={props} />
        </div>
        <small>
          <EditableText as="span" fieldKey="footerBottomLabel" fallback={homeFallbacks.footerBottomLabel} props={props} />
          {' / '}
          <EditableText as="span" fieldKey="footerBackToFirst" fallback={homeFallbacks.footerBackToFirst} props={props} />
        </small>
      </footer>
    </main>
  )
}

function ArtistCmsScreen(props: CmsPreviewProps) {
  const heroImageUrl = value(props, 'heroImageUrl')
  const heroStyle = heroImageUrl
    ? { backgroundImage: `linear-gradient(90deg, rgb(4 5 16 / 88%), rgb(4 5 16 / 34%)), url("${heroImageUrl}")` }
    : undefined

  return (
    <main className="cms-puck-preview cms-puck-artist-preview">
      <nav className="cms-puck-preview-nav" aria-label="Artist preview navigation">
        <EditableText as="span" fieldKey="navHome" fallback={artistFallbacks.navHome} props={props} />
        <EditableText as="span" fieldKey="navArtists" fallback={artistFallbacks.navArtists} props={props} />
        <EditableText as="span" fieldKey="navGoods" fallback={artistFallbacks.navGoods} props={props} />
        <EditableText as="span" fieldKey="navCart" fallback={artistFallbacks.navCart} props={props} />
      </nav>
      <section className="cms-puck-hero cms-puck-artist-hero" style={heroStyle}>
        <EditableText as="span" className="cms-puck-broadcast" fieldKey="broadcastStrip" fallback={artistFallbacks.broadcastStrip} multiline props={props} />
        <EditableText as="p" fieldKey="eyebrow" fallback={artistFallbacks.eyebrow} props={props} />
        <EditableText as="h1" fieldKey="title" fallback={artistFallbacks.title} props={props} />
        <EditableText as="strong" fieldKey="summaryTitle" fallback={artistFallbacks.summaryTitle} props={props} />
        <EditableText as="p" fieldKey="summaryBody" fallback={artistFallbacks.summaryBody} multiline props={props} />
        <dl className="cms-puck-artist-stats">
          <div>
            <dt><EditableText as="span" fieldKey="statsArtistsLabel" fallback={artistFallbacks.statsArtistsLabel} props={props} /></dt>
            <dd>8</dd>
          </div>
          <div>
            <dt><EditableText as="span" fieldKey="statsModeLabel" fallback={artistFallbacks.statsModeLabel} props={props} /></dt>
            <dd><EditableText as="span" fieldKey="statusLiveLabel" fallback={artistFallbacks.statusLiveLabel} props={props} /></dd>
          </div>
          <div>
            <dt><EditableText as="span" fieldKey="statsViewLabel" fallback={artistFallbacks.statsViewLabel} props={props} /></dt>
            <dd><EditableText as="span" fieldKey="statsViewValue" fallback={artistFallbacks.statsViewValue} props={props} /></dd>
          </div>
        </dl>
        <div className="cms-puck-channel-row">
          <EditableText as="span" fieldKey="channelWorld" fallback={artistFallbacks.channelWorld} props={props} />
          <EditableText as="span" fieldKey="channelArea" fallback={artistFallbacks.channelArea} props={props} />
          <EditableText as="span" fieldKey="channelCharacter" fallback={artistFallbacks.channelCharacter} props={props} />
          <EditableText as="span" fieldKey="channelMusic" fallback={artistFallbacks.channelMusic} props={props} />
        </div>
      </section>
      <section className="cms-puck-artist-card">
        <div className="cms-puck-artist-visual">CY</div>
        <div>
          <p>AREA STREAM</p>
          <h2>Artist Name</h2>
          <strong>GROUP NAME</strong>
          <p>아티스트 DB 소개문은 오른쪽 DB 영역에서 관리되고, 이 화면은 공통 라벨과 안내 문구를 편집합니다.</p>
          <dl>
            <div><dt><EditableText as="span" fieldKey="profileBpmLabel" fallback={artistFallbacks.profileBpmLabel} props={props} /></dt><dd>142</dd></div>
            <div><dt><EditableText as="span" fieldKey="profileDebutLabel" fallback={artistFallbacks.profileDebutLabel} props={props} /></dt><dd>2026</dd></div>
            <div><dt><EditableText as="span" fieldKey="profileCollectionsLabel" fallback={artistFallbacks.profileCollectionsLabel} props={props} /></dt><dd>3</dd></div>
            <div><dt><EditableText as="span" fieldKey="profileSignalLabel" fallback={artistFallbacks.profileSignalLabel} props={props} /></dt><dd>POP</dd></div>
          </dl>
          <div className="cms-puck-action-row">
            <button type="button"><EditableText as="span" fieldKey="artistGoodsCta" fallback={artistFallbacks.artistGoodsCta} props={props} /></button>
            <button type="button"><EditableText as="span" fieldKey="groupGoodsCta" fallback={artistFallbacks.groupGoodsCta} props={props} /></button>
          </div>
        </div>
      </section>
      <section className="cms-puck-index-preview">
        <EditableText as="p" fieldKey="indexEyebrow" fallback={artistFallbacks.indexEyebrow} props={props} />
        <EditableText as="h2" fieldKey="indexTitle" fallback={artistFallbacks.indexTitle} props={props} />
        <EditableText as="span" fieldKey="pagerIndexLabel" fallback={artistFallbacks.pagerIndexLabel} props={props} />
        <button type="button"><EditableText as="span" fieldKey="indexGroupGoodsCta" fallback={artistFallbacks.indexGroupGoodsCta} props={props} /></button>
      </section>
    </main>
  )
}

function PreviewTile({
  eyebrowKey,
  eyebrowFallback,
  titleKey,
  titleFallback,
  actionKey,
  actionFallback,
  props,
}: {
  eyebrowKey: string
  eyebrowFallback: string
  titleKey: string
  titleFallback: string
  actionKey?: string
  actionFallback?: string
  props: CmsPreviewProps
}) {
  return (
    <article>
      <EditableText as="span" fieldKey={eyebrowKey} fallback={eyebrowFallback} props={props} />
      <EditableText as="h2" fieldKey={titleKey} fallback={titleFallback} props={props} />
      {actionKey && actionFallback && (
        <button type="button">
          <EditableText as="span" fieldKey={actionKey} fallback={actionFallback} props={props} />
        </button>
      )}
    </article>
  )
}

const homeConfig: Config = {
  components: {
    HomeCmsScreen: {
      label: '홈 화면',
      fields: fieldsFromDefinitions([...baseFieldDefinitions, ...homeCopyFieldDefinitions]),
      render: HomeCmsScreen,
    },
  },
}

const artistConfig: Config = {
  components: {
    ArtistCmsScreen: {
      label: '아티스트 화면',
      fields: fieldsFromDefinitions([...baseFieldDefinitions, ...artistCopyFieldDefinitions]),
      render: ArtistCmsScreen,
    },
  },
}

function formControl(form: HTMLFormElement, name: string) {
  const element = form.elements.namedItem(name)
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement
    ? element
    : null
}

function readFormValue(form: HTMLFormElement, name: string) {
  return formControl(form, name)?.value ?? ''
}

function writeFormValue(form: HTMLFormElement, name: string, nextValue: unknown) {
  const control = formControl(form, name)
  if (!control) {
    return
  }
  control.value = typeof nextValue === 'string' ? nextValue : ''
}

function fieldDefinitionsForPage(pageKey: CmsPageKey) {
  return pageKey === 'home' ? homeCopyFieldDefinitions : artistCopyFieldDefinitions
}

function componentTypeForPage(pageKey: CmsPageKey) {
  return pageKey === 'home' ? 'HomeCmsScreen' : 'ArtistCmsScreen'
}

function titleForPage(pageKey: CmsPageKey) {
  return pageKey === 'home' ? '홈 화면 시각 편집' : '아티스트 화면 시각 편집'
}

function readInitialProps(form: HTMLFormElement, pageKey: CmsPageKey) {
  const props: Record<string, string> = {}
  baseFieldDefinitions.forEach((definition) => {
    props[definition.key] = readFormValue(form, definition.key)
  })
  fieldDefinitionsForPage(pageKey).forEach((definition) => {
    props[definition.key] = readFormValue(form, `copySettings[${definition.key}]`)
  })
  return props
}

function createInitialData(form: HTMLFormElement, pageKey: CmsPageKey): Data {
  return {
    content: [
      {
        type: componentTypeForPage(pageKey),
        props: {
          id: `${pageKey}-cms-screen`,
          ...readInitialProps(form, pageKey),
        },
      },
    ],
    root: {
      props: {
        title: titleForPage(pageKey),
      },
    },
  } as Data
}

function extractProps(data: Data, pageKey: CmsPageKey) {
  const content = Array.isArray(data.content) ? data.content as CmsComponentData[] : []
  const component = content.find((item) => item.type === componentTypeForPage(pageKey)) ?? content[0]
  return component?.props ?? {}
}

function syncDataToForm(form: HTMLFormElement, data: Data, pageKey: CmsPageKey) {
  const props = extractProps(data, pageKey)
  baseFieldDefinitions.forEach((definition) => {
    writeFormValue(form, definition.key, props[definition.key])
  })
  fieldDefinitionsForPage(pageKey).forEach((definition) => {
    writeFormValue(form, `copySettings[${definition.key}]`, props[definition.key])
  })
}

function updateDataProp(data: Data, pageKey: CmsPageKey, fieldKey: string, nextValue: string): Data {
  const content = Array.isArray(data.content) ? data.content as CmsComponentData[] : []
  const componentType = componentTypeForPage(pageKey)
  const nextContent = content.map((item, index) => {
    if (item.type !== componentType && index !== 0) {
      return item
    }
    return {
      ...item,
      props: {
        ...(item.props ?? {}),
        [fieldKey]: nextValue,
      },
    }
  })
  return {
    ...data,
    content: nextContent,
  } as Data
}

function CmsPuckEditor({ form, pageKey }: { form: HTMLFormElement; pageKey: CmsPageKey }) {
  const config = pageKey === 'home' ? homeConfig : artistConfig
  const [data, setData] = useState<Data>(() => createInitialData(form, pageKey))
  const headerTitle = useMemo(() => titleForPage(pageKey), [pageKey])

  function handleChange(nextData: Data) {
    setData(nextData)
    syncDataToForm(form, nextData, pageKey)
  }

  function handlePublish() {
    form.requestSubmit()
  }

  useEffect(() => {
    function handleInlineEdit(event: Event) {
      const detail = (event as CustomEvent<InlineEditDetail>).detail
      if (!detail?.fieldKey) {
        return
      }
      setData((currentData) => {
        const nextData = updateDataProp(currentData, pageKey, detail.fieldKey, detail.value)
        syncDataToForm(form, nextData, pageKey)
        return nextData
      })
    }

    window.addEventListener(INLINE_EDIT_EVENT, handleInlineEdit)
    return () => {
      window.removeEventListener(INLINE_EDIT_EVENT, handleInlineEdit)
    }
  }, [form, pageKey])

  return (
    <Puck
      config={config}
      data={data}
      headerTitle={headerTitle}
      iframe={{ enabled: false }}
      onChange={handleChange}
      onPublish={handlePublish}
      permissions={{
        delete: false,
        drag: false,
        duplicate: false,
        edit: true,
        insert: false,
      }}
    />
  )
}

function mountCmsPuckEditor() {
  const root = document.querySelector<HTMLElement>('[data-puck-cms-editor]')
  if (!root) {
    return
  }
  const pageKey = root.dataset.pageKey === 'artists' ? 'artists' : 'home'
  const formId = root.dataset.formId
  const form = formId ? document.getElementById(formId) : null
  if (!(form instanceof HTMLFormElement)) {
    root.textContent = 'Puck 편집기를 연결할 저장 form을 찾지 못했습니다.'
    return
  }

  createRoot(root).render(<CmsPuckEditor form={form} pageKey={pageKey} />)
}

mountCmsPuckEditor()
