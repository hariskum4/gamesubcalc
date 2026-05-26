import { useState, useMemo, useEffect } from 'react'
import { SUBS } from '../data'
import { events } from '../services/analytics'

function StepThree({ selectedSubs, wishlist, onReset }) {
  const [copied, setCopied] = useState(false)

  const { totalMonthly, subCoverage, cancelSubs, cancelSaving } = useMemo(() => {
    let totalMonthly = 0
    selectedSubs.forEach(id => {
      const s = SUBS.find(x => x.id === id)
      if (s) totalMonthly += s.price
    })

    const coverage = []
    selectedSubs.forEach(id => {
      const sub = SUBS.find(x => x.id === id)
      const covered = wishlist.filter(g => g.subs.includes(id)).length
      coverage.push({ ...sub, covered, total: wishlist.length })
    })
    coverage.sort((a, b) => b.covered - a.covered)

    const best = coverage[0]
    let saving = 0
    const cancels = []
    coverage.slice(1).forEach(s => {
      if (s.covered <= Math.floor(best.covered * 0.4)) {
        saving += s.price
        cancels.push(s.name)
      }
    })

    return { totalMonthly, subCoverage: coverage, cancelSubs: cancels, cancelSaving: saving }
  }, [selectedSubs, wishlist])

  // Track results viewed
  useEffect(() => {
    events.resultsViewed(cancelSaving * 12)
  }, [cancelSaving])

  // Generate OG image URL for sharing
  const ogImageUrl = useMemo(() => {
    const params = new URLSearchParams({
      saving: (cancelSaving * 12).toFixed(0),
      total: (totalMonthly * 12).toFixed(0),
      subs: selectedSubs.size.toString(),
      cancel: cancelSubs.join(', '),
    })
    return `/api/og?${params.toString()}`
  }, [cancelSaving, totalMonthly, selectedSubs, cancelSubs])

  // Update meta tags for social sharing
  useEffect(() => {
    const baseUrl = window.location.origin
    const fullOgUrl = `${baseUrl}${ogImageUrl}`

    // Update or create OG meta tags
    setMetaTag('og:image', fullOgUrl)
    setMetaTag('og:title', `I'm saving $${(cancelSaving * 12).toFixed(0)}/year on gaming subs`)
    setMetaTag('og:description', 'Find out which gaming subscriptions to cancel based on your wishlist.')
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:image', fullOgUrl)
  }, [ogImageUrl, cancelSaving])

  const shareResult = async () => {
    const yearlyTotal = (totalMonthly * 12).toFixed(0)
    const savingText = cancelSaving > 0
      ? `I just saved $${(cancelSaving * 12).toFixed(0)}/year`
      : `I checked my $${yearlyTotal}/year gaming subs`

    const shareUrl = `${window.location.origin}?ref=share`
    const text = `${savingText} on gaming subscriptions using this free tool 🎮\n\n${shareUrl}`

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GameSubCalc Results',
          text: text,
          url: shareUrl,
        })
        events.shareClicked('native')
        return
      } catch {
        // User cancelled or not supported
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      events.shareClicked('clipboard')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // clipboard not available
    }
  }

  const shareToTwitter = () => {
    const yearlyTotal = (totalMonthly * 12).toFixed(0)
    const text = cancelSaving > 0
      ? `I just found out I can save $${(cancelSaving * 12).toFixed(0)}/year on gaming subs. This free tool shows you what to cancel in 60 seconds 🎮`
      : `I'm spending $${yearlyTotal}/year on gaming subs and they're all worth it 🎮`
    const url = `${window.location.origin}?ref=twitter`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank', 'noopener')
    events.shareClicked('twitter')
  }

  const handleReset = () => {
    events.resetClicked()
    onReset()
  }

  return (
    <div>
      <div className="step-header">
        <div className="step-badge done">✓</div>
        <div>
          <div className="step-title">Your results</div>
          <div className="step-sub">Here's what you should cancel</div>
        </div>
      </div>

      <div className="card">
        <div className="result-header">
          <div className="result-cost">${totalMonthly.toFixed(2)}/month</div>
          <div className="result-sub-cost">
            ${(totalMonthly * 12).toFixed(0)}/year across {selectedSubs.size} subscription{selectedSubs.size > 1 ? 's' : ''}
          </div>
        </div>

        <div>
          {subCoverage.map(s => {
            const keep = !cancelSubs.includes(s.name)
            return (
              <div key={s.id} className="coverage-row">
                <div className="cov-left">
                  <span className="cov-icon">
                    {keep
                      ? (s.covered > 0 ? <span style={{ color: '#1D9E75' }}>✓</span> : <span style={{ color: '#888' }}>−</span>)
                      : <span style={{ color: '#E24B4A' }}>✕</span>
                    }
                  </span>
                  <div>
                    <div className="cov-name">{s.name}</div>
                    <div className="cov-score">{s.covered}/{wishlist.length} games · ${s.price.toFixed(2)}/mo</div>
                  </div>
                </div>
                <span className={`verdict-badge ${keep ? 'v-keep' : 'v-cancel'}`}>
                  {keep ? 'Keep' : 'Cancel'}
                </span>
              </div>
            )
          })}
        </div>

        <div className="rec-box">
          <div className="rec-title">💡 Recommended saving</div>
          {cancelSaving > 0 ? (
            <>
              <div className="rec-amount">${(cancelSaving * 12).toFixed(0)}/year</div>
              <div className="rec-detail">Cancel {cancelSubs.join(' + ')} — your wishlist coverage stays the same.</div>
            </>
          ) : (
            <>
              <div className="rec-amount" style={{ color: 'var(--color-text-primary)' }}>Good news!</div>
              <div className="rec-detail">Your subscriptions all contribute meaningfully to your wishlist. No obvious cancellations.</div>
            </>
          )}
        </div>

        {/* Share buttons */}
        <div className="share-buttons">
          <button className="share-btn share-btn-primary" onClick={shareResult}>
            {copied ? '✓ Copied!' : '↗ Share my results'}
          </button>
          <button className="share-btn share-btn-twitter" onClick={shareToTwitter}>
            𝕏 Post to Twitter
          </button>
        </div>

        {/* OG Image preview (hidden, for debugging) */}
        {/* <img src={ogImageUrl} alt="Share preview" style={{ width: '100%', marginTop: 12, borderRadius: 8 }} /> */}
      </div>

      <div className="reset-link" onClick={handleReset} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') handleReset() }}>
        ↺ Recalculate
      </div>
    </div>
  )
}

// Helper to set/update meta tags
function setMetaTag(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`) ||
           document.querySelector(`meta[name="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    if (property.startsWith('og:')) {
      el.setAttribute('property', property)
    } else {
      el.setAttribute('name', property)
    }
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default StepThree
