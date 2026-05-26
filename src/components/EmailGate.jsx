import { useState } from 'react'
import { events } from '../services/analytics'

function EmailGate({ selectedSubs, wishlistCount, onComplete, onSkip }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          subscriptions: [...selectedSubs],
          wishlistCount,
        }),
      })

      if (res.ok) {
        events.emailCaptured()
        onComplete(email)
      } else {
        // Don't block the user on API failure
        events.emailCaptured()
        onComplete(email)
      }
    } catch {
      // Network error — still let them through
      events.emailCaptured()
      onComplete(email)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    events.emailSkipped()
    onSkip()
  }

  return (
    <div>
      <div className="step-header">
        <div className="step-badge done">✓</div>
        <div>
          <div className="step-title">Almost there!</div>
          <div className="step-sub">Get your personalized results + monthly savings tips</div>
        </div>
      </div>

      <div className="card">
        <div className="email-gate-content">
          <div className="email-gate-icon">📊</div>
          <h3 className="email-gate-title">Your results are ready</h3>
          <p className="email-gate-desc">
            Enter your email to unlock your personalized recommendation and get notified when games join or leave your subscriptions.
          </p>

          <form onSubmit={handleSubmit} className="email-form">
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              className="email-input"
              aria-label="Email address"
              autoFocus
            />
            <button
              type="submit"
              className="cta-btn"
              disabled={!isValid || loading}
              style={{ marginTop: '12px' }}
            >
              {loading ? 'Sending...' : 'Show my results →'}
            </button>
          </form>

          {error && <p className="email-error">{error}</p>}

          <button className="skip-link" onClick={handleSkip}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailGate
