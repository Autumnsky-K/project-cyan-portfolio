import { useEffect, useState } from 'react'
import ArtistPage from './features/artist/artist.tsx'
import GoodsPage from './features/goods/goods.jsx'

function getCurrentPage() {
  return window.location.hash === '#artists' ? 'artists' : 'goods'
}

function App() {
  const [currentPage, setCurrentPage] = useState(getCurrentPage)

  useEffect(() => {
    const handleHashChange = () => setCurrentPage(getCurrentPage())

    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return currentPage === 'artists' ? <ArtistPage /> : <GoodsPage />
}

export default App
