const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

export async function fetchGoods(params = {}, options = {}) {
  const url = new URL(`${API_BASE_URL}/goods`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })

  const response = await fetch(url, options)

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message ?? 'Failed to load goods.')
  }

  return response.json()
}

export async function fetchGoodsDetail(goodsId, options = {}) {
  const response = await fetch(`${API_BASE_URL}/goods/${goodsId}`, options)

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message ?? 'Failed to load goods detail.')
  }

  return response.json()
}
