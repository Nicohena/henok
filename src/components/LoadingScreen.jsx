import { useEffect, useRef } from 'react'
import './LoadingScreen.css'

export default function LoadingScreen({ progress, isVisible }) {
  const barRef = useRef(null)
  const dotRefs = [useRef(null), useRef(null), useRef(null)]

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${progress}%`
    }
  }, [progress])

  return (
    <div className={`loading-screen ${!isVisible ? 'loading-screen--hidden' : ''}`}>
      {/* Animated background grid */}
      <div className="loading-grid" aria-hidden="true" />

      {/* Center content */}
      <div className="loading-content">
        {/* Name / Brand */}
        <div className="loading-brand">
          <span className="loading-brand-first">HENOK</span>
          <span className="loading-brand-last">KEBEDE</span>
        </div>

        <p className="loading-subtitle">PORTFOLIO</p>

        {/* Progress bar */}
        <div className="loading-bar-track">
          <div className="loading-bar-fill" ref={barRef} />
        </div>

        {/* Progress text */}
        <div className="loading-meta">
          <span className="loading-percent">{Math.round(progress)}%</span>
          <span className="loading-label">Loading assets</span>
        </div>

        {/* Pulse dots */}
        <div className="loading-dots" aria-hidden="true">
          {dotRefs.map((ref, i) => (
            <span key={i} ref={ref} className="loading-dot" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>

      {/* Corner decorations */}
      <span className="loading-corner loading-corner--tl" aria-hidden="true" />
      <span className="loading-corner loading-corner--tr" aria-hidden="true" />
      <span className="loading-corner loading-corner--bl" aria-hidden="true" />
      <span className="loading-corner loading-corner--br" aria-hidden="true" />
    </div>
  )
}
