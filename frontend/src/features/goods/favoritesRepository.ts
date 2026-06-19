export type FavoritesRepository = {
  readIds: () => number[]
  writeIds: (favoriteIds: number[]) => void
  subscribe: (listener: () => void) => () => void
}

const FAVORITES_STORAGE_KEY = 'project-cyan:goods-favorites'

function readLocalFavoriteIds(): number[] {
  try {
    const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    const parsed: unknown = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed)
      ? parsed.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
      : []
  } catch {
    return []
  }
}

export const localFavoritesRepository: FavoritesRepository = {
  readIds: readLocalFavoriteIds,
  writeIds(favoriteIds) {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds))
  },
  subscribe(listener) {
    function handleStorage(event: StorageEvent) {
      if (event.key === FAVORITES_STORAGE_KEY) listener()
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  },
}
