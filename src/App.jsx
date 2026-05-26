import { useState, useMemo } from 'react'
import { SUBS } from './data'
import ProgressBar from './components/ProgressBar'
import StepOne from './components/StepOne'
import StepTwo from './components/StepTwo'
import EmailGate from './components/EmailGate'
import StepThree from './components/StepThree'
import { events } from './services/analytics'
import './App.css'

function App() {
  const [step, setStep] = useState(1)
  const [selectedSubs, setSelectedSubs] = useState(new Set())
  const [wishlist, setWishlist] = useState([])
  const [userEmail, setUserEmail] = useState(null)

  const monthlyTotal = useMemo(() => {
    let total = 0
    selectedSubs.forEach(id => {
      const s = SUBS.find(x => x.id === id)
      if (s) total += s.price
    })
    return total
  }, [selectedSubs])

  const toggleSub = (id) => {
    setSelectedSubs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Accept full game objects (from API or local data)
  const addGame = (game) => {
    if (wishlist.length >= 10) return
    if (wishlist.find(w => w.id === game.id)) return
    setWishlist(prev => [...prev, game])
  }

  const removeGame = (id) => {
    setWishlist(prev => prev.filter(g => g.id !== id))
  }

  const goToStep2 = () => {
    events.subsSelected(selectedSubs.size, monthlyTotal)
    setStep(2)
  }

  const goToEmailGate = () => {
    events.wishlistCompleted(wishlist.length)
    setStep('email')
  }

  const goToResults = (email) => {
    setUserEmail(email || null)
    setStep(3)
  }

  const reset = () => {
    setStep(1)
    setSelectedSubs(new Set())
    setWishlist([])
    setUserEmail(null)
  }

  // Map step to progress bar position (email gate counts as step 2.5)
  const progressStep = step === 'email' ? 2 : step

  return (
    <div className="calc-wrap">
      <ProgressBar step={progressStep} />

      {step === 1 && (
        <StepOne
          selectedSubs={selectedSubs}
          toggleSub={toggleSub}
          monthlyTotal={monthlyTotal}
          onNext={goToStep2}
        />
      )}

      {step === 2 && (
        <StepTwo
          wishlist={wishlist}
          addGame={addGame}
          removeGame={removeGame}
          onNext={goToEmailGate}
        />
      )}

      {step === 'email' && (
        <EmailGate
          selectedSubs={selectedSubs}
          wishlistCount={wishlist.length}
          onComplete={(email) => goToResults(email)}
          onSkip={() => goToResults(null)}
        />
      )}

      {step === 3 && (
        <StepThree
          selectedSubs={selectedSubs}
          wishlist={wishlist}
          onReset={reset}
        />
      )}
    </div>
  )
}

export default App
