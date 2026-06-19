import { useCallback, useEffect, useMemo, useState } from 'react'
import { localFavoritesRepository, type FavoritesRepository } from './favoritesRepository'

export function useGoodsFavorites(repository: FavoritesRepository = localFavoritesRepository) {
  const [favoriteIds, setFavoriteIds] = useState<number[]>(repository.readIds)
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds])

  useEffect(() => {
    repository.writeIds(favoriteIds)
  }, [favoriteIds, repository])

  useEffect(
    () => repository.subscribe(() => setFavoriteIds(repository.readIds())),
    [repository],
  )

  const toggleFavorite = useCallback((goodsId: number) => {
    setFavoriteIds((current) =>
      current.includes(goodsId)
        ? current.filter((currentGoodsId) => currentGoodsId !== goodsId)
        : [...current, goodsId],
    )
  }, [])

  return {
    favoriteIds,
    isFavorite: (goodsId: number) => favoriteIdSet.has(goodsId),
    toggleFavorite,
  }
}
