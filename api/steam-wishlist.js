// Vercel Serverless Function: /api/steam-wishlist?steamId=76561198xxxxx
// Fetches a user's Steam wishlist via the public Steam API
// Steam wishlists are public by default — no OAuth needed for public profiles

export default async function handler(req, res) {
  const { steamId } = req.query

  if (!steamId) {
    return res.status(400).json({ error: 'Steam ID or vanity URL required' })
  }

  try {
    // Resolve vanity URL to Steam ID if needed
    const resolvedId = await resolveSteamId(steamId)

    if (!resolvedId) {
      return res.status(404).json({
        error: 'Could not find Steam profile. Make sure your profile and wishlist are set to public.',
      })
    }

    // Fetch wishlist (paginated, up to 100 items per page)
    const games = await fetchWishlist(resolvedId)

    if (!games || games.length === 0) {
      return res.status(200).json({
        games: [],
        message: 'Wishlist is empty or private. Make sure your wishlist visibility is set to public.',
      })
    }

    // Cache for 10 minutes
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200')
    return res.status(200).json({ games, steamId: resolvedId })
  } catch (error) {
    console.error('Steam wishlist error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch Steam wishlist. Try again later.' })
  }
}

async function resolveSteamId(input) {
  // If it's already a numeric Steam ID (17 digits)
  if (/^\d{17}$/.test(input)) {
    return input
  }

  // Try to resolve as vanity URL
  const apiKey = process.env.STEAM_API_KEY
  if (!apiKey) {
    // Without API key, we can only accept numeric IDs
    // Try the wishlist endpoint directly — it works with vanity URLs too
    return input
  }

  try {
    const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${encodeURIComponent(input)}`
    const res = await fetch(url)
    const data = await res.json()

    if (data.response?.success === 1) {
      return data.response.steamid
    }
  } catch {
    // Fall through
  }

  return input
}

async function fetchWishlist(steamId) {
  const games = []
  let page = 0
  const maxPages = 5 // Safety limit: 500 games max

  while (page < maxPages) {
    const url = `https://store.steampowered.com/wishlist/profiles/${steamId}/wishlistdata/?p=${page}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'GameSubCalc/1.0',
      },
    })

    if (!res.ok) {
      // Try vanity URL format
      if (page === 0) {
        const vanityUrl = `https://store.steampowered.com/wishlist/id/${steamId}/wishlistdata/?p=0`
        const vanityRes = await fetch(vanityUrl, {
          headers: { 'User-Agent': 'GameSubCalc/1.0' },
        })

        if (vanityRes.ok) {
          const vanityData = await vanityRes.json()
          if (vanityData && Object.keys(vanityData).length > 0) {
            return parseWishlistData(vanityData)
          }
        }
      }
      break
    }

    const data = await res.json()

    // Empty response means no more pages
    if (!data || Object.keys(data).length === 0) break

    games.push(...parseWishlistData(data))
    page++
  }

  return games
}

function parseWishlistData(data) {
  return Object.entries(data).map(([appId, info]) => ({
    id: `steam_${appId}`,
    steamAppId: parseInt(appId),
    name: info.name,
    image: info.capsule ? `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg` : null,
    releaseDate: info.release_date,
    reviewScore: info.review_score,
    priority: info.priority,
    // Subscription matching will happen client-side
    subs: [],
    source: 'steam',
  }))
}
