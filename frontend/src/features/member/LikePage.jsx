import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getArtistOptions,
  getCurrentMember,
  getFavoriteArtistIds,
  saveFavoriteArtists,
} from './member'
import './AccountPages.css'

function LikePage() {
  const navigate = useNavigate()
  const artists = getArtistOptions()
  const [member, setMember] = useState(null)
  const [selectedArtistIds, setSelectedArtistIds] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const hasSelectedArtists = selectedArtistIds.length > 0

  useEffect(() => {
    let isMounted = true

    async function loadMember() {
      try {
        const currentMember = await getCurrentMember()

        if (!currentMember) {
          navigate('/login')
          return
        }

        const favoriteArtistIds = await getFavoriteArtistIds(currentMember.userId)

        if (isMounted) {
          setMember(currentMember)
          setSelectedArtistIds(favoriteArtistIds)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMember()

    return () => {
      isMounted = false
    }
  }, [navigate])

  const toggleArtist = (artistId) => {
    setSelectedArtistIds((currentArtistIds) =>
      currentArtistIds.includes(artistId)
        ? currentArtistIds.filter((currentArtistId) => currentArtistId !== artistId)
        : [...currentArtistIds, artistId],
    )
  }

  const handleSave = async () => {
    if (!member) {
      return
    }

    setError('')
    setIsSaving(true)

    try {
      await saveFavoriteArtists(member.userId, selectedArtistIds)
      navigate('/mypage')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleActionButtonClick = () => {
    if (hasSelectedArtists) {
      handleSave()
      return
    }

    navigate('/mypage')
  }

  let actionButtonText = '건너뛰기'

  if (hasSelectedArtists) {
    actionButtonText = isSaving ? '저장 중...' : '저장하기'
  }

  if (isLoading) {
    return (
      <main className="account-page like-page">
        <section className="account-shell like-shell like-panel">
          <p className="mypage-empty">관심 아티스트 정보를 불러오는 중입니다.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="account-page like-page">
      <div className="account-shell like-shell">
        <section className="like-panel" aria-label="관심 아티스트 선택">
          <div className="account-heading">
            <h1>관심 아티스트를 선택해주세요</h1>
          </div>

          {error && (
            <p className="account-feedback account-feedback-error" role="alert">
              {error}
            </p>
          )}

          <div className="artist-grid">
            {artists.map((artist) => {
              const isSelected = selectedArtistIds.includes(artist.artistId)

              return (
                <button
                  className={`artist-option ${isSelected ? 'is-selected' : ''}`}
                  type="button"
                  key={artist.artistId}
                  onClick={() => toggleArtist(artist.artistId)}
                  aria-pressed={isSelected}
                >
                  <strong>{artist.name}</strong>
                </button>
              )
            })}
          </div>

          <div className="account-actions like-actions">
            <button
              className="account-button like-action-button"
              type="button"
              onClick={handleActionButtonClick}
              disabled={hasSelectedArtists && isSaving}
            >
              {actionButtonText}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default LikePage
