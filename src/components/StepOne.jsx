import { SUBS } from '../data'

function StepOne({ selectedSubs, toggleSub, monthlyTotal, onNext }) {
  return (
    <div>
      <div className="step-header">
        <div className="step-badge">1</div>
        <div>
          <div className="step-title">Your subscriptions</div>
          <div className="step-sub">Select all you currently pay for</div>
        </div>
      </div>

      <div className="card">
        <div className="sub-grid">
          {SUBS.map(s => (
            <div
              key={s.id}
              className={`sub-item${selectedSubs.has(s.id) ? ' selected' : ''}`}
              onClick={() => toggleSub(s.id)}
              role="checkbox"
              aria-checked={selectedSubs.has(s.id)}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSub(s.id) } }}
            >
              <div className="sub-name">{s.name}</div>
              <div className="sub-price">${s.price.toFixed(2)}/mo</div>
            </div>
          ))}
        </div>

        <div className="total-bar">
          <span className="total-label">Monthly cost</span>
          <span>
            <span className="total-amount">${monthlyTotal.toFixed(2)}</span>
            {monthlyTotal > 0 && (
              <span className="total-year">· ${(monthlyTotal * 12).toFixed(0)}/yr</span>
            )}
          </span>
        </div>
      </div>

      <button
        className="cta-btn"
        disabled={selectedSubs.size === 0}
        onClick={onNext}
      >
        Choose my wishlist →
      </button>
    </div>
  )
}

export default StepOne
