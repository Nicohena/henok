import { useEffect, useState } from 'react'
import './LoadingScreen.css'
import CatLottie from './CatLottie'
import ErrorBoundary from './ErrorBoundary'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function LoadingScreen({ progress, isVisible }) {
  const [mounted, setMounted] = useState(true)
  const reduced = useReducedMotion()
  const celebrate = progress >= 100

  const word = celebrate ? 'Loaded' : 'Loading'

  // Unmount after the 0.8s CSS fade-out transition finishes
  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => setMounted(false), 850)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!mounted) return null

  return (
    <div className={`loading-screen${!isVisible ? ' loading-screen--hidden' : ''}`}>
      <div className="loading-content">
        <ErrorBoundary fallback={null}>
          <CatLottie celebrate={celebrate} reduced={reduced} />
        </ErrorBoundary>

        {/* Wave text — every letter gets its own span with a staggered delay */}
        <p
          className={`loading-text${celebrate ? ' loading-text--loaded' : ''}`}
          aria-label={word}
          aria-live="polite"
        >
          {word.split('').map((char, i) => (
            <span
              key={`${word}-${i}`}
              className="loading-letter"
              style={{ animationDelay: `${i * 0.07}s` }}
              aria-hidden="true"
            >
              {char}
            </span>
          ))}
        </p>

        
      </div>
    </div>
  )
}
