// Lightweight analytics wrapper
// Uses Plausible (privacy-friendly, no cookies, GDPR compliant)
// Falls back to console.log in development

const IS_PROD = typeof window !== 'undefined' && window.location.hostname !== 'localhost'

export function trackEvent(name, props = {}) {
  if (IS_PROD && window.plausible) {
    window.plausible(name, { props })
  } else {
    console.log('[Analytics]', name, props)
  }
}

// Pre-defined events for the calculator flow
export const events = {
  subsSelected: (count, total) =>
    trackEvent('subs_selected', { count, monthly_total: total.toFixed(2) }),

  wishlistCompleted: (count) =>
    trackEvent('wishlist_completed', { game_count: count }),

  emailCaptured: () =>
    trackEvent('email_captured'),

  emailSkipped: () =>
    trackEvent('email_skipped'),

  resultsViewed: (saving) =>
    trackEvent('results_viewed', { yearly_saving: saving.toFixed(0) }),

  shareClicked: (method) =>
    trackEvent('share_clicked', { method }),

  resetClicked: () =>
    trackEvent('reset_clicked'),

  gameSearched: (query) =>
    trackEvent('game_searched', { query }),

  gameAdded: (name, source) =>
    trackEvent('game_added', { name, source }),
}
