export type ArtistGoodsLinkSource = {
  artistId: number | string
  name: string
  groupKey?: string | null
  groupName?: string | null
}

export type ArtistGoodsGroup = {
  groupKey: string
  groupName: string
  artistIds: Array<number | string>
  artistNames: string[]
  goodsPath: string
}

function isCatalogArtistId(artistId: number | string) {
  return /^\d+$/.test(String(artistId).trim())
}

function uniqueCatalogArtistIds(artistIds: Array<number | string>) {
  return [...new Set(
    artistIds
      .map((artistId) => String(artistId).trim())
      .filter((artistId) => isCatalogArtistId(artistId)),
  )]
}

function createGoodsSearchPath(query: string) {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) {
    return '/goods'
  }

  const params = new URLSearchParams()
  params.set('q', normalizedQuery)
  return `/goods?${params.toString()}`
}

function createArtistFilterPath(artistIds: Array<number | string>, fallbackQuery: string) {
  const catalogArtistIds = uniqueCatalogArtistIds(artistIds)
  if (catalogArtistIds.length) {
    return `/goods?artists=${catalogArtistIds.join(';')}`
  }

  return createGoodsSearchPath(fallbackQuery)
}

export function createArtistGoodsPath(artist: ArtistGoodsLinkSource) {
  return createArtistFilterPath([artist.artistId], artist.name)
}

export function buildArtistGoodsGroups(artists: ArtistGoodsLinkSource[]): ArtistGoodsGroup[] {
  const groupedArtists = new Map<string, Omit<ArtistGoodsGroup, 'goodsPath'>>()

  artists.forEach((artist) => {
    const groupName = artist.groupName?.trim() || 'Project Cyan'
    const groupKey = artist.groupKey?.trim().toLowerCase() || groupName.toLowerCase()
    const group = groupedArtists.get(groupKey) ?? {
      groupKey,
      groupName,
      artistIds: [],
      artistNames: [],
    }

    group.artistIds.push(artist.artistId)
    group.artistNames.push(artist.name)
    groupedArtists.set(groupKey, group)
  })

  return [...groupedArtists.values()].map((group) => ({
    ...group,
    goodsPath: createArtistFilterPath(group.artistIds, group.groupName),
  }))
}
