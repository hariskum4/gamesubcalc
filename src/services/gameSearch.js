import { GAMES } from '../data'

// Search games via API with fallback to local data
export async function searchGames(query, wishlistIds = []) {
  if (!query || query.trim().length < 2) return []

  try {
    const res = await fetch(`/api/search-games?q=${encodeURIComponent(query)}`)
    const data = await res.json()

    if (data.results && data.results.length > 0 && data.source === 'rawg') {
      // Filter out games already in wishlist
      return data.results
        .filter(g => !wishlistIds.includes(g.id))
        .slice(0, 6)
        .map(g => ({
          id: g.id,
          name: g.name,
          subs: g.subs || [],
          image: g.background_image,
          rating: g.rating,
          source: 'api',
        }))
    }
  } catch {
    // API unavailable — fall through to local
  }

  // Fallback: search local data
  return GAMES
    .filter(g =>
      g.name.toLowerCase().includes(query.toLowerCase()) &&
      !wishlistIds.includes(g.id)
    )
    .slice(0, 6)
    .map(g => ({ ...g, source: 'local' }))
}

// Debounce helper
export function debounce(fn, ms) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}
