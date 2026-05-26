import { useState, useRef } from 'react'
import { SUBS } from '../data'
import { searchGames, debounce } from '../services/gameSearch'
import { events, trackEvent } from '../services/analytics'
import SteamImport from './SteamImport'

function StepTwo({ wishlist, addGame, removeGame, onNext }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchSource, setSearchSource] = useState(null)

  const wishlistIds = wishlist.map(g => g.id)

  // Debounced search — 300ms delay for API calls
  const debouncedSearch = useRef(
    debounce(async (q) => {
      if (!q.trim() || q.trim().length < 2) {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      const matches = await searchGames(q, wishlistIds)
      setResults(matches)
      setSearchSource(matches[0]?.source || null)
      setLoading(false)
      events.gameSearched(q)
    }, 300)
  ).current

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)

    if (!val.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    debouncedSearch(val)
  }

  const handleAdd = (game) => {
    addGame(game)
    setQuery('')
    setResults([])
    events.gameAdded(game.name, game.source || 'local')
  }

  const handleSteamImport = (games) => {
    // Add up to remaining slots
    const remaining = 10 - wishlist.length
    const toAdd = games.slice(0, remaining)
    toAdd.forEach(game => addGame(game))
    trackEvent('steam_import', { imported: toAdd.length, total_available: games.length })
  }

  return (
    <div>
      <div className="step-header">
        <div className="step-badge done">✓</div>
        <div>
          <div className="step-title">Your wishlist</div>
          <div className="step-sub">Search games or import from Steam</div>
        </div>
      </div>

      <div className="card">
        {/* Steam Import */}
        <SteamImport onImport={handleSteamImport} wishlistCount={wishlist.length} />

        <div className="divider">
          <span className="divider-text">or search manually</span>
        </div>

        {/* Manual Search */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search any game..."
            value={query}
            onChange={handleInputChange}
            aria-label="Search games"
          />
          {loading && <span className="search-spinner">⟳</span>}
        </div>

        {results.length > 0 && (
          <div className="game-results">
            {results.map(g => (
              <div key={g.id} className="game-row">
                <div className="game-row-left">
                  {g.image && (
                    <img
                      src={g.image}
                      alt=""
                      className="game-thumb"
                      loading="lazy"
                    />
                  )}
                  <span className="game-name">{g.name}</span>
                </div>
                <div className="game-row-right">
                  <div className="game-tags">
                    {g.subs && g.subs.length > 0
                      ? g.subs.map(sid => {
                          const s = SUBS.find(x => x.id === sid)
                          return s ? <span key={sid} className="tag tag-gp">{s.short}</span> : null
                        })
                      : <span className="tag tag-none">Buy only</span>
                    }
                  </div>
                  <button className="add-btn" onClick={() => handleAdd(g)}>+ Add</button>
                </div>
              </div>
            ))}
            {searchSource === 'api' && (
              <div className="api-badge">Powered by RAWG</div>
            )}
          </div>
        )}

        {query.trim().length >= 2 && !loading && results.length === 0 && (
          <div className="no-results">No games found for "{query}"</div>
        )}

        {/* Wishlist chips */}
        <div className="wishlist-chips">
          {wishlist.map(g => (
            <div key={g.id} className="chip">
              {g.name}
              <button className="chip-remove" onClick={() => removeGame(g.id)} aria-label={`Remove ${g.name}`}>✕</button>
            </div>
          ))}
          {wishlist.length === 0 && (
            <span className="hint-text">Import from Steam or search to add games</span>
          )}
          {wishlist.length > 0 && wishlist.length < 3 && (
            <span className="hint-text">Add at least {3 - wishlist.length} more game{3 - wishlist.length > 1 ? 's' : ''}</span>
          )}
          {wishlist.length >= 3 && wishlist.length < 10 && (
            <span className="hint-text">{10 - wishlist.length} more slots available</span>
          )}
        </div>
      </div>

      <button
        className="cta-btn"
        disabled={wishlist.length < 3}
        onClick={onNext}
      >
        See my results →
      </button>
    </div>
  )
}

export default StepTwo
