export type GoodsLikeSyncUpdate = {
  goodsId: number
  liked: boolean
  likeCount: number
}

const GOODS_LIKE_SYNC_EVENT = 'project-cyan:goods-like-updated'
const GOODS_LIKE_SYNC_STORAGE_KEY = 'project-cyan:goods-like-updates'

function readStoredUpdates(): Record<string, GoodsLikeSyncUpdate> {
  if (typeof window === 'undefined') return {}

  try {
    const rawUpdates = window.sessionStorage.getItem(GOODS_LIKE_SYNC_STORAGE_KEY)
    return rawUpdates ? JSON.parse(rawUpdates) as Record<string, GoodsLikeSyncUpdate> : {}
  } catch {
    return {}
  }
}

export function readGoodsLikeSyncUpdates(): GoodsLikeSyncUpdate[] {
  return Object.values(readStoredUpdates())
}

export function publishGoodsLikeSyncUpdate(update: GoodsLikeSyncUpdate) {
  if (typeof window === 'undefined') return

  const updates = readStoredUpdates()
  updates[String(update.goodsId)] = update
  window.sessionStorage.setItem(GOODS_LIKE_SYNC_STORAGE_KEY, JSON.stringify(updates))
  window.dispatchEvent(new CustomEvent<GoodsLikeSyncUpdate>(GOODS_LIKE_SYNC_EVENT, { detail: update }))
}

export function subscribeGoodsLikeSyncUpdates(onUpdate: (update: GoodsLikeSyncUpdate) => void) {
  if (typeof window === 'undefined') return () => undefined

  function handleUpdate(event: Event) {
    onUpdate((event as CustomEvent<GoodsLikeSyncUpdate>).detail)
  }

  window.addEventListener(GOODS_LIKE_SYNC_EVENT, handleUpdate)
  return () => window.removeEventListener(GOODS_LIKE_SYNC_EVENT, handleUpdate)
}
