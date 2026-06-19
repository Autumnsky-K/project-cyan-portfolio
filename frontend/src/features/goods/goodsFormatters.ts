export function formatGoodsPrice(value: number) {
  return `${Number(value ?? 0).toLocaleString()}원`
}

export function formatGoodsDate(value?: string | null) {
  if (!value) return '상시 판매'
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(value))
}
