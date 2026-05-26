function ProgressBar({ step }) {
  const getClass = (s) => {
    if (s < step) return 'prog-step done'
    if (s === step) return 'prog-step active'
    return 'prog-step'
  }

  return (
    <div className="prog-steps" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
      <div className={getClass(1)}></div>
      <div className={getClass(2)}></div>
      <div className={getClass(3)}></div>
    </div>
  )
}

export default ProgressBar
