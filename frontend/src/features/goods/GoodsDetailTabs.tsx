import { forwardRef, type KeyboardEvent } from 'react'
import type { GoodsDetail } from '../../api/goods'
import GoodsDescription from './GoodsDescription'
import GoodsDetailSpecs from './GoodsDetailSpecs'
import GoodsReviewsPanel from './GoodsReviewsPanel'
import GoodsQnaPanel from './GoodsQnaPanel'

export type DetailTab = 'intro' | 'reviews' | 'qna'

type GoodsDetailTabsProps = {
  activeTab: DetailTab
  goods: GoodsDetail
  onTabChange: (tab: DetailTab) => void
}

const TABS: Array<{ id: DetailTab; label: string }> = [
  { id: 'intro', label: '상품 소개' },
  { id: 'reviews', label: '리뷰' },
  { id: 'qna', label: '상품 문의' },
]

function nextTab(current: DetailTab, direction: 1 | -1) {
  const currentIndex = TABS.findIndex((tab) => tab.id === current)
  const nextIndex = (currentIndex + direction + TABS.length) % TABS.length
  return TABS[nextIndex].id
}

const GoodsDetailTabs = forwardRef<HTMLElement, GoodsDetailTabsProps>(function GoodsDetailTabs(
  { activeTab, goods, onTabChange },
  ref,
) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return
    }

    event.preventDefault()
    const tab = nextTab(activeTab, event.key === 'ArrowRight' ? 1 : -1)
    onTabChange(tab)
    window.requestAnimationFrame(() => {
      document.getElementById(`goods-detail-tab-${tab}`)?.focus()
    })
  }

  return (
    <section className="detail-tabs" ref={ref}>
      <div
        className="detail-tab-list"
        role="tablist"
        aria-label="상품 상세 정보"
        onKeyDown={handleKeyDown}
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.id
          const label = tab.id === 'reviews'
            ? `${tab.label} (${Number(goods.reviewCount ?? 0).toLocaleString()})`
            : tab.label

          return (
            <button
              id={`goods-detail-tab-${tab.id}`}
              key={tab.id}
              aria-controls={`goods-detail-panel-${tab.id}`}
              aria-selected={selected}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
              onClick={() => onTabChange(tab.id)}
            >
              {label}
            </button>
          )
        })}
      </div>
      {activeTab === 'intro' && (
        <div
          id="goods-detail-panel-intro"
          aria-labelledby="goods-detail-tab-intro"
          className="detail-tab-panel"
          role="tabpanel"
        >
          <div className="detail-overview">
            <GoodsDetailSpecs goods={goods} />
            <GoodsDescription sanitizedHtml={goods.description} />
          </div>
        </div>
      )}
      {activeTab === 'reviews' && (
        <div
          id="goods-detail-panel-reviews"
          aria-labelledby="goods-detail-tab-reviews"
          className="detail-tab-panel"
          role="tabpanel"
        >
          <GoodsReviewsPanel goodsId={goods.goodsId} />
        </div>
      )}
      {activeTab === 'qna' && (
        <div
          id="goods-detail-panel-qna"
          aria-labelledby="goods-detail-tab-qna"
          className="detail-tab-panel"
          role="tabpanel"
        >
          <GoodsQnaPanel goodsId={goods.goodsId} />
        </div>
      )}
    </section>
  )
})

export default GoodsDetailTabs
