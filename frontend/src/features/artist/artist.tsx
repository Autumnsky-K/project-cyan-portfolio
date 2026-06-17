import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

import { fetchCmsArtists, fetchCmsPage, type CmsArtistProfile, type CmsPage } from '../../api/cms'
import { applyPreviewTheme, previewTypographyStyle } from '../theme/previewTheme'
import './artist.css'

type FilterGroup = {
  title: string
  options: string[]
}

type Artist = {
  artistId: number
  name: string
  imageUrl?: string | null
  groupName?: string | null
  lore: string
  debutDate: string
  collections: string[]
}

const defaultArtistPage: CmsPage = {
  pageKey: 'artists',
  eyebrow: 'SM Universe Store',
  title: 'Artists',
  summaryTitle: 'Artist Universe',
  summaryBody: 'Showing artist profiles',
  primaryColor: '#111111',
  accentColor: '#2f6f64',
  backgroundColor: '#ffffff',
  heroImageUrl: null,
}

const filters: FilterGroup[] = [
  {
    title: 'Collection',
    options: ['All', 'KWANGYA', 'Neo City', 'RIIZE Archive', 'Velvet Room'],
  },
  {
    title: 'Debut',
    options: ['2010s', '2020s', 'Legacy'],
  },
  {
    title: 'Focus',
    options: ['Lore', 'Goods', 'New releases'],
  },
]

const fallbackArtists: Artist[] = [
  {
    artistId: 7,
    name: 'aespa',
    imageUrl: 'https://cdn.example.com/artists/7.jpg',
    lore:
      'A hyper-pop quartet connected to KWANGYA lore, virtual avatars, and high-concept visual worlds.',
    debutDate: '2020-11-17',
    collections: ['KWANGYA', 'Drama', 'Armageddon'],
  },
  {
    artistId: 12,
    name: 'NCT',
    imageUrl: 'https://cdn.example.com/artists/12.jpg',
    lore:
      'A modular group universe built around city-based units, limitless member expansion, and performance-driven goods.',
    debutDate: '2016-04-09',
    collections: ['Neo City', 'Wish', '127'],
  },
  {
    artistId: 18,
    name: 'RIIZE',
    imageUrl: 'https://cdn.example.com/artists/18.jpg',
    lore:
      'A growth-record team whose goods can connect memories, daily styling, and archive-like fan moments.',
    debutDate: '2023-09-04',
    collections: ['Memories', 'Get A Guitar', 'Boom Boom Bass'],
  },
  {
    artistId: 3,
    name: 'Red Velvet',
    imageUrl: 'https://cdn.example.com/artists/3.jpg',
    lore:
      'A dual-concept group balancing bright red energy and velvet moods across albums, kits, and collectibles.',
    debutDate: '2014-08-01',
    collections: ['Velvet Room', 'Birthday', 'Cosmic'],
  },
]

function mapCmsArtist(artist: CmsArtistProfile): Artist {
  return {
    artistId: artist.artistId,
    name: artist.name,
    imageUrl: artist.imageUrl,
    groupName: artist.groupName,
    lore: artist.lore || 'Artist profile is ready for CMS editing.',
    debutDate: artist.debutDate || '-',
    collections: (artist.collections || '')
      .split(',')
      .map((collection) => collection.trim())
      .filter(Boolean),
  }
}

function ArtistPage(): ReactElement {
  const [cmsPage, setCmsPage] = useState<CmsPage>(defaultArtistPage)
  const [cmsArtists, setCmsArtists] = useState<Artist[]>(fallbackArtists)

  useEffect(() => {
    const controller = new AbortController()

    async function loadCms() {
      try {
        const [page, artists] = await Promise.all([
          fetchCmsPage('artists', { signal: controller.signal }),
          fetchCmsArtists({ signal: controller.signal }),
        ])
        setCmsPage(page)
        setCmsArtists(artists.length ? artists.map(mapCmsArtist) : fallbackArtists)
      } catch (loadError) {
        if (!(loadError instanceof DOMException && loadError.name === 'AbortError')) {
          setCmsPage(defaultArtistPage)
          setCmsArtists(fallbackArtists)
        }
      }
    }

    loadCms()

    return () => {
      controller.abort()
    }
  }, [])

  const previewPage = applyPreviewTheme(cmsPage)

  const pageStyle = {
    '--artist-ink': previewPage.primaryColor,
    '--artist-accent': previewPage.accentColor,
    backgroundColor: previewPage.backgroundColor,
    ...previewTypographyStyle(),
  } as CSSProperties
  const headerStyle = previewPage.heroImageUrl
    ? {
        backgroundImage: `linear-gradient(90deg, ${previewPage.backgroundColor} 0%, rgba(255,255,255,.86) 50%, rgba(255,255,255,.18) 100%), url("${previewPage.heroImageUrl}")`,
      }
    : undefined

  return (
    <main className="artist-page" style={pageStyle}>
      <header className="artist-header" style={headerStyle}>
        <div>
          <p className="artist-eyebrow">{previewPage.eyebrow}</p>
          <h1>{previewPage.title}</h1>
        </div>
        <nav className="artist-nav" aria-label="Store navigation">
          <a href="#home">Home</a>
          <a href="#artists" aria-current="page">
            Artists
          </a>
          <a href="#goods">Goods</a>
          <a href="#cart">Cart</a>
        </nav>
      </header>

      <section className="artist-toolbar" aria-label="Artist search and sort">
        <label className="artist-search">
          <span>Search</span>
          <input type="search" placeholder="Search artist, lore, collection" />
        </label>
        <label className="artist-sort">
          <span>Sort</span>
          <select defaultValue="name">
            <option value="name">Name</option>
            <option value="debut-new">Newest debut</option>
            <option value="debut-old">Oldest debut</option>
          </select>
        </label>
      </section>

      <section className="artist-layout" id="artists">
        <aside className="artist-filter-panel" aria-label="Artist filters">
          <div className="artist-panel-heading">
            <h2>Filters</h2>
            <button type="button">Reset</button>
          </div>
          {filters.map((group) => (
            <fieldset className="artist-filter-group" key={group.title}>
              <legend>{group.title}</legend>
              {group.options.map((option) => (
                <label key={option}>
                  <input type="checkbox" />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>
          ))}
        </aside>

        <div className="artist-content">
          <div className="artist-summary">
            <div>
              <h2>{previewPage.summaryTitle}</h2>
              <p>{previewPage.summaryBody}</p>
            </div>
          </div>

          <div className="artist-grid">
            {cmsArtists.map((artist) => (
              <article className="artist-card" data-artist-id={artist.artistId} key={artist.artistId}>
                <div className="artist-image" aria-label={`${artist.name} image placeholder`}>
                  {artist.imageUrl ? <img src={artist.imageUrl} alt="" /> : <span>{artist.name}</span>}
                </div>
                <div className="artist-card-body">
                  <div className="artist-card-topline">
                    <span>artistId {artist.artistId}</span>
                    <strong>{artist.debutDate}</strong>
                  </div>
                  <h3>{artist.name}</h3>
                  <p>{artist.lore}</p>
                  <div className="artist-collection-row">
                    {artist.collections.map((collection) => (
                      <span key={collection}>{collection}</span>
                    ))}
                  </div>
                  <div className="artist-card-footer">
                    <strong>{artist.groupName || `${artist.collections.length} collections`}</strong>
                    <button type="button">View</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default ArtistPage
