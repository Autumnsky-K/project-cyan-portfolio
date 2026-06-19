import { useEffect, useMemo, useRef, useState } from 'react'
import type { GoodsDetail, GoodsVariant } from '../../api/goods'
import { useCart } from '../cart/useCart'
import { formatGoodsDate, formatGoodsPrice } from './goodsFormatters'
import GoodsRatingSummary from './GoodsRatingSummary'

const PURCHASE_STATE_LABELS: Record<string, string> = {
  AVAILABLE: '판매 중',
  UPCOMING: '판매 예정',
  ENDED: '판매 종료',
  SOLD_OUT: '품절',
  UNAVAILABLE: '구매 불가',
}

function variantMatches(variant: GoodsVariant, selections: Record<string, string>) {
  return Object.entries(selections).every(([key, value]) => variant.selections[key] === value)
}

function GoodsPurchasePanel({ goods, onReviewClick }: { goods: GoodsDetail; onReviewClick?: () => void }) {
  const { addCartItem } = useCart()
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState('')
  const feedbackTimerRef = useRef<number | null>(null)
  const optionGroups = useMemo(() => goods.optionGroups ?? [], [goods.optionGroups])
  const variants = useMemo(() => goods.variants ?? [], [goods.variants])

  useEffect(
    () => () => {
      if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current)
    },
    [],
  )

  const selectedVariant = useMemo(() => {
    if (optionGroups.some((group) => !selections[group.key])) return null
    return variants.find((variant) => variantMatches(variant, selections)) ?? null
  }, [optionGroups, selections, variants])
  const availableVariants = useMemo(
    () => variants.filter((variant) => variant.active && variant.stockCount > 0),
    [variants],
  )
  const effectiveVariant = optionGroups.length === 0
    ? selectedVariant ?? availableVariants[0] ?? variants[0]
    : selectedVariant
  const maxQuantity = effectiveVariant?.stockCount ?? goods.stockCount ?? 0
  const selectedQuantity = Math.max(1, Math.min(quantity, maxQuantity || 1))
  const purchasingAvailable = goods.purchaseState === 'AVAILABLE'
  const hasPurchasableItem = variants.length === 0
    ? maxQuantity > 0
    : Boolean(effectiveVariant?.active && maxQuantity > 0)
  const canAdd = purchasingAvailable && hasPurchasableItem
  const unitPrice = Number(goods.price ?? 0) + Number(effectiveVariant?.additionalPrice ?? 0)

  function showFeedback(message: string) {
    setFeedback(message)
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = window.setTimeout(() => setFeedback(''), 1800)
  }

  function handleAddCartItem() {
    if (!canAdd) return
    const variantLabel = effectiveVariant
      ? optionGroups
          .map((group) => `${group.name}: ${effectiveVariant.selections[group.key]}`)
          .join(' / ')
      : ''

    addCartItem(
      {
        ...goods,
        variantId: effectiveVariant?.variantId,
        variantLabel,
        variantPrice: unitPrice,
        maxQuantity,
        shippingFee: goods.shipping?.fee ?? 0,
      },
      selectedQuantity,
    )
    showFeedback('장바구니에 담았습니다.')
  }

  function selectOption(key: string, value: string) {
    setSelections((current) => {
      const matchingVariants = variants.filter(
        (variant) =>
          variant.active &&
          variant.stockCount > 0 &&
          variant.selections[key] === value,
      )
      const nextSelections: Record<string, string> = { [key]: value }

      for (const [selectedKey, selectedValue] of Object.entries(current)) {
        if (
          selectedKey !== key &&
          matchingVariants.some((variant) => variant.selections[selectedKey] === selectedValue)
        ) {
          nextSelections[selectedKey] = selectedValue
        }
      }
      return nextSelections
    })
    setQuantity(1)
  }

  function optionValueDisabled(key: string, value: string) {
    return !variants.some(
      (variant) =>
        variant.active &&
        variant.stockCount > 0 &&
        variant.selections[key] === value,
    )
  }

  return (
    <aside className="purchase-panel">
      <div className="purchase-heading">
        <span className={`purchase-state state-${goods.purchaseState?.toLowerCase()}`}>
          {PURCHASE_STATE_LABELS[goods.purchaseState ?? ''] ?? goods.salesStatus ?? '판매 정보'}
        </span>
        <p>{goods.artistName ?? 'Project Cyan'}</p>
        <h2>{goods.name}</h2>
        <GoodsRatingSummary
          averageRating={goods.averageRating}
          reviewCount={goods.reviewCount}
          onClick={onReviewClick}
        />
        <strong>{formatGoodsPrice(unitPrice)}</strong>
      </div>

      <dl className="purchase-info">
        <div>
          <dt>판매 기간</dt>
          <dd>{formatGoodsDate(goods.saleStartAt)} ~ {formatGoodsDate(goods.saleEndAt)}</dd>
        </div>
        <div>
          <dt>배송비</dt>
          <dd>{goods.shipping?.fee ? formatGoodsPrice(goods.shipping.fee) : '무료 배송'}</dd>
        </div>
        <div>
          <dt>배송</dt>
          <dd>{goods.shipping?.carrier} · {goods.shipping?.scope}</dd>
        </div>
      </dl>

      {optionGroups.map((group) => (
        <fieldset className="option-group" key={group.optionGroupId}>
          <legend>{group.name}</legend>
          <div>
            {group.values.map((value) => (
              <button
                aria-pressed={selections[group.key] === value.name}
                disabled={optionValueDisabled(group.key, value.name)}
                key={value.optionValueId}
                type="button"
                onClick={() => selectOption(group.key, value.name)}
              >
                {value.name}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="purchase-selection">
        <span>
          {optionGroups.length > 0 && !effectiveVariant
            ? '옵션을 선택해 주세요.'
            : `재고 ${maxQuantity}개`}
        </span>
        <div className="detail-quantity" aria-label="수량">
          <button
            disabled={selectedQuantity <= 1}
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            −
          </button>
          <span>{selectedQuantity}</span>
          <button
            disabled={!maxQuantity || selectedQuantity >= maxQuantity}
            type="button"
            onClick={() => setQuantity((value) => value + 1)}
          >
            ＋
          </button>
        </div>
      </div>

      <div className="purchase-total">
        <span>총 상품 금액</span>
        <strong>{formatGoodsPrice(unitPrice * selectedQuantity)}</strong>
      </div>

      {!canAdd && (
        <p className="purchase-message">
          {goods.purchaseMessage || '구매 가능한 옵션을 선택해 주세요.'}
        </p>
      )}
      <button
        className="purchase-button"
        data-add-to-cart={goods.goodsId}
        disabled={!canAdd}
        type="button"
        onClick={handleAddCartItem}
      >
        장바구니 담기
      </button>
      {feedback && <span className="purchase-feedback" role="status">{feedback}</span>}
    </aside>
  )
}

export default GoodsPurchasePanel
