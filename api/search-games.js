// Vercel Serverless Function: /api/search-games?q=starfield
// Searches RAWG API for games and maps subscription availability

const RAWG_BASE = 'https://api.rawg.io/api'

// Mapping of known game IDs/slugs to subscription availability
// In production, this would be a database updated by a cron job
const SUB_MAPPINGS = {
  'game-pass': 'gp',
  'ps-plus-extra': 'psx',
  'ps-plus-premium': 'psp',
  'ea-play': 'ea',
  'ubisoft-plus': 'ubi',
}

export default async function handler(req, res) {
  const { q } = req.query

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' })
  }

  const apiKey = process.env.RAWG_API_KEY

  if (!apiKey) {
    // Fallback: return empty results if no API key configured
    // The frontend will use local data as fallback
    return res.status(200).json({ results: [], source: 'no_api_key' })
  }

  try {
    const url = `${RAWG_BASE}/games?key=${apiKey}&search=${encodeURIComponent(q)}&page_size=8&search_precise=true`
    const response = await fetch(url)

    if (!response.ok) {
      return res.status(200).json({ results: [], source: 'api_error' })
    }

    const data = await response.json()

    const results = (data.results || []).map(game => ({
      id: game.id,
      name: game.name,
      slug: game.slug,
      released: game.released,
      rating: game.rating,
      background_image: game.background_image,
      platforms: (game.platforms || []).map(p => p.platform.name),
      // Subscription data would come from our own DB in production
      // For now, we'll let the frontend handle sub matching
      subs: inferSubscriptions(game),
    }))

    // Cache for 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200')
    return res.status(200).json({ results, source: 'rawg' })
  } catch (error) {
    return res.status(200).json({ results: [], source: 'error' })
  }
}

// Basic heuristic to infer subscription availability from platform data
// In production, this would query a real subscription catalog database
function inferSubscriptions(game) {
  const subs = []
  const platforms = (game.platforms || []).map(p => p.platform.slug)
  const stores = (game.stores || []).map(s => s.store?.slug)

  // Xbox/PC games are likely on Game Pass
  if (platforms.includes('xbox-one') || platforms.includes('xbox-series-x')) {
    // Only major first-party and day-one titles — this is a rough heuristic
    if (game.rating >= 4.0 || stores.includes('xbox-store')) {
      // Don't auto-assign GP — too many false positives
    }
  }

  // PS games might be on PS Plus
  if (platforms.includes('playstation5') || platforms.includes('playstation4')) {
    // Same — don't auto-assign without real data
  }

  return subs
}
