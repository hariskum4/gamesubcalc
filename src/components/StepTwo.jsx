import { useState, useCallback, useRef, useEffect } from 'react'
import { SUBS, GAMES } from '../data'
import { searchGames, debounce } from '../services/gameSearch'
import { events } from '../services/analytics'

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

  return (
    <div>
      <div className="step-header">
        <div className="step-badge done">✓</div>
        <div>
          <div className="step-title">Your wishlist</div>
          <div className="step-sub">Search and add up to 10 games you want to play</div>
        </div>
      </div>

      <div className="card">
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
                  <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
                    {g.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

        <div className="wishlist-chips">
          {wishlist.map(g => (
            <div key={g.id} className="chip">
              {g.name}
              <button className="chip-remove" onClick={() => removeGame(g.id)} aria-label={`Remove ${g.name}`}>✕</button>
            </div>
          ))}
          {wishlist.length < 3 && (
            <span className="hint-text">Add at least 3 games</span>
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
