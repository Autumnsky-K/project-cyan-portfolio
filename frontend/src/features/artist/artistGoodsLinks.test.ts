import { describe, expect, it } from 'vitest'

import { buildArtistGoodsGroups, createArtistGoodsPath } from './artistGoodsLinks'

describe('artist goods links', () => {
  it('creates an exact goods artist filter link for catalog artist IDs', () => {
    expect(createArtistGoodsPath({
      artistId: 42,
      name: 'Hiena',
    })).toBe('/goods?artists=42')
  })

  it('falls back to a goods search link for non-catalog preview IDs', () => {
    expect(createArtistGoodsPath({
      artistId: 'hiena-01',
      name: 'Hiena Tide',
    })).toBe('/goods?q=Hiena+Tide')
  })

  it('builds group goods links from all artists in the same group', () => {
    expect(buildArtistGoodsGroups([
      { artistId: 1, name: 'Ari', groupName: 'Cyan Unit' },
      { artistId: 2, name: 'Beni', groupName: 'Cyan Unit' },
      { artistId: 3, name: 'Coco', groupName: 'Solo' },
    ])).toEqual([
      {
        groupKey: 'cyan unit',
        groupName: 'Cyan Unit',
        artistIds: [1, 2],
        artistNames: ['Ari', 'Beni'],
        goodsPath: '/goods?artists=1;2',
      },
      {
        groupKey: 'solo',
        groupName: 'Solo',
        artistIds: [3],
        artistNames: ['Coco'],
        goodsPath: '/goods?artists=3',
      },
    ])
  })
})
