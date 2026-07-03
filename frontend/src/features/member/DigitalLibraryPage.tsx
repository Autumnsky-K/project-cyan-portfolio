import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  fetchDigitalLibrary,
  requestDigitalDownload,
  type DigitalLibraryItem,
} from '../../api/digitalLibrary'
import './AccountPages.css'

function formatDate(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function formatFileSize(value?: number | null) {
  if (!value || value <= 0) return ''
  if (value >= 1024 * 1024) {
    return `${(value / 1024 / 1024).toFixed(1)} MB`
  }
  if (value >= 1024) {
    return `${(value / 1024).toFixed(1)} KB`
  }
  return `${value} B`
}

function primaryMeta(item: DigitalLibraryItem) {
  return [
    item.artistName,
    formatDate(item.grantedAt) ? `${formatDate(item.grantedAt)} 구매` : null,
    `${item.downloadPeriodDays}일마다 ${item.downloadLimitPerPeriod}회 다운로드`,
  ].filter(Boolean).join(' · ')
}

function DigitalLibraryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const focusedGoodsId = useMemo(() => new URLSearchParams(location.search).get('goodsId'), [location.search])
  const [items, setItems] = useState<DigitalLibraryItem[]>([])
  const [status, setStatus] = useState<'loading' | 'data' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [downloadingKey, setDownloadingKey] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDigitalLibrary() {
      setStatus('loading')
      setError('')
      try {
        const libraryItems = await fetchDigitalLibrary(focusedGoodsId ?? undefined)
        if (isMounted) {
          setItems(libraryItems)
          setStatus('data')
        }
      } catch (loadError) {
        console.error(loadError)
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : '디지털 제품 저장소를 불러오지 못했습니다.')
          setStatus('error')
        }
      }
    }

    void loadDigitalLibrary()

    return () => {
      isMounted = false
    }
  }, [focusedGoodsId])

  async function handleDownload(item: DigitalLibraryItem, assetId?: number) {
    setError('')
    setMessage('')
    const targetAssetId = assetId ?? item.assets[0]?.assetId
    if (!targetAssetId) {
      setError('등록된 다운로드 파일이 없습니다.')
      return
    }
    const downloadKey = `${item.entitlementId}:${targetAssetId}`
    setDownloadingKey(downloadKey)
    try {
      const result = await requestDigitalDownload(item.entitlementId, targetAssetId)
      setMessage(`${result.fileName} 다운로드 링크를 열었습니다.`)
      window.location.assign(result.signedUrl)
    } catch (downloadError) {
      console.error(downloadError)
      setError(downloadError instanceof Error ? downloadError.message : '디지털 파일 다운로드 요청에 실패했습니다.')
    } finally {
      setDownloadingKey('')
    }
  }

  return (
    <main className="account-page mypage-page digital-library-page">
      <div className="account-shell">
        <section className="account-card digital-library-shell">
          <div className="account-panel digital-library-hero">
            <div>
              <p>MY DIGITAL STORAGE</p>
              <h1>디지털 제품 저장소</h1>
              <span>구매한 디지털 굿즈는 배송 없이 이곳에서 다운로드합니다.</span>
            </div>
            <button className="mypage-edit-link" type="button" onClick={() => navigate('/mypage')}>
              마이페이지
            </button>
          </div>

          {message && <p className="account-feedback account-feedback-success">{message}</p>}
          {error && <p className="account-feedback account-feedback-error">{error}</p>}

          {status === 'loading' && (
            <section className="account-panel mypage-section">
              <p className="mypage-empty">디지털 제품 저장소를 불러오는 중입니다.</p>
            </section>
          )}

          {status === 'error' && (
            <section className="account-panel mypage-section">
              <p className="mypage-empty">잠시 후 다시 시도해주세요.</p>
            </section>
          )}

          {status === 'data' && (
            <section className="account-panel mypage-section digital-library-list" aria-label="디지털 제품 목록">
              {items.length > 0 ? (
                <div className="digital-library-grid">
                  {items.map((item) => {
                    const nextDownloadAt = formatDate(item.nextDownloadAvailableAt)
                    return (
                      <article className="digital-library-card" key={item.entitlementId}>
                        <Link className="digital-library-image" to={`/goods/${item.goodsId}`}>
                          {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <span>Digital</span>}
                        </Link>
                        <div className="digital-library-body">
                          <span className="digital-library-status">
                            {item.downloadAvailable ? '다운로드 가능' : '다운로드 대기'}
                          </span>
                          <h2>{item.name}</h2>
                          <p>{primaryMeta(item)}</p>
                          {!item.downloadAvailable && (
                            <p className="digital-library-wait">
                              {item.assets.length === 0
                                ? '관리자가 다운로드 파일을 등록하면 활성화됩니다.'
                                : nextDownloadAt
                                  ? `${nextDownloadAt}부터 재다운로드할 수 있습니다.`
                                  : '다운로드 제한 상태를 확인하는 중입니다.'}
                            </p>
                          )}
                          <div className="digital-library-assets">
                            {item.assets.length > 0 ? (
                              item.assets.map((asset) => {
                                const downloadKey = `${item.entitlementId}:${asset.assetId}`
                                return (
                                  <button
                                    type="button"
                                    key={asset.assetId}
                                    disabled={!item.downloadAvailable || downloadingKey === downloadKey}
                                    onClick={() => void handleDownload(item, asset.assetId)}
                                  >
                                    <span>{asset.displayName || asset.originalFileName}</span>
                                    <small>{formatFileSize(asset.fileSizeBytes) || asset.contentType}</small>
                                  </button>
                                )
                              })
                            ) : (
                              <span className="digital-library-empty-asset">등록된 파일 없음</span>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <p className="mypage-empty">구매한 디지털 상품이 없습니다.</p>
              )}
            </section>
          )}
        </section>
      </div>
    </main>
  )
}

export default DigitalLibraryPage
