import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

import './artist.css'

type FilterGroup = {
  title: string
  options: string[]
}

type Artist = {
  artistId: number
  name: string
  imageUrl: string
  lore: string
  debutDate: string
  collections: string[]
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

const artists: Artist[] = [
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

function ArtistPage(): ReactElement {
  return (
    <main className="artist-page">
      <header className="artist-header">
        <div>
          <p className="artist-eyebrow">SM Universe Store</p>
          <h1>Artists</h1>
        </div>
        <nav className="artist-nav" aria-label="Store navigation">
          <Link to="/">Home</Link>
          <Link to="/artists" aria-current="page">
            Artists
          </Link>
          <Link to="/goods">Goods</Link>
          <Link to="/cart">Cart</Link>
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
              <h2>Artist Universe</h2>
              <p>Showing {artists.length} artist profiles</p>
            </div>
          </div>

          <div className="artist-grid">
            {artists.map((artist) => (
              <article className="artist-card" data-artist-id={artist.artistId} key={artist.artistId}>
                <div className="artist-image" aria-label={`${artist.name} image placeholder`}>
                  <span>{artist.name}</span>
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
                    <strong>{artist.collections.length} collections</strong>
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
