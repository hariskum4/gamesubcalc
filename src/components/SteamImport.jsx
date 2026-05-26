import { useState } from 'react'
import { trackEvent } from '../services/analytics'

function SteamImport({ onImport, wishlistCount }) {
  const [steamId, setSteamId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imported, setImported] = useState(false)

  const handleImport = async (e) => {
    e.preventDefault()
    if (!steamId.trim()) return

    setLoading(true)
    setError('')

    // Extract Steam ID from various URL formats
    const cleanId = parseSteamInput(steamId.trim())

    try {
      const res = await fetch(`/api/steam-wishlist?steamId=${encodeURIComponent(cleanId)}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to fetch wishlist')
        setLoading(false)
        return
      }

      if (data.games && data.games.length > 0) {
        onImport(data.games)
        setImported(true)
        trackEvent('steam_import_success', { count: data.games.length })
      } else {
        setError(data.message || 'No games found. Make sure your wishlist is public.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (imported) {
    return (
      <div className="steam-import steam-import-done">
        <span className="steam-icon">✓</span>
        <span className="steam-done-text">Steam wishlist imported</span>
      </div>
    )
  }

  return (
    <div className="steam-import">
      <div className="steam-import-header">
        <span className="steam-icon">🎮</span>
        <span className="steam-label">Import from Steam</span>
      </div>

      <form onSubmit={handleImport} className="steam-form">
        <input
          type="text"
          placeholder="Steam ID, profile URL, or vanity name"
          value={steamId}
          onChange={(e) => { setSteamId(e.target.value); setError('') }}
          className="steam-input"
          aria-label="Steam ID or profile URL"
        />
        <button
          type="submit"
          className="steam-btn"
          disabled={!steamId.trim() || loading || wishlistCount >= 10}
        >
          {loading ? '⟳' : '→'}
        </button>
      </form>

      {error && <p className="steam-error">{error}</p>}

      <p className="steam-help">
        Paste your Steam profile URL or ID. Your wishlist must be <a href="https://store.steampowered.com/account/preferences" target="_blank" rel="noopener noreferrer">set to public</a>.
      </p>
    </div>
  )
}

// Parse various Steam URL formats into a usable ID
function parseSteamInput(input) {
  // Full profile URL: https://steamcommunity.com/profiles/76561198xxxxx
  const profileMatch = input.match(/steamcommunity\.com\/profiles\/(\d+)/)
  if (profileMatch) return profileMatch[1]

  // Vanity URL: https://steamcommunity.com/id/username
  const vanityMatch = input.match(/steamcommunity\.com\/id\/([^/]+)/)
  if (vanityMatch) return vanityMatch[1]

  // Wishlist URL: https://store.steampowered.com/wishlist/profiles/76561198xxxxx
  const wishlistProfileMatch = input.match(/store\.steampowered\.com\/wishlist\/profiles\/(\d+)/)
  if (wishlistProfileMatch) return wishlistProfileMatch[1]

  // Wishlist vanity: https://store.steampowered.com/wishlist/id/username
  const wishlistVanityMatch = input.match(/store\.steampowered\.com\/wishlist\/id\/([^/]+)/)
  if (wishlistVanityMatch) return wishlistVanityMatch[1]

  // Raw input (numeric ID or vanity name)
  return input.replace(/\/$/, '')
}

export default SteamImport
