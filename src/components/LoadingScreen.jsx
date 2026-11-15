import { useEffect, useRef, useState } from 'react'
import './LoadingScreen.css'
import LoadingMascot from './LoadingMascot'
import ErrorBoundary from './ErrorBoundary'
import { useReducedMotion } from '../hooks/useReducedMotion'

/**
 * Loading screen — mirrors the "Samuel Briskar / ThreeDee" loading shot:
 * white backdrop, 3D seal scene up top, blue "Loading..." wordmark with
 * sequential dots, glowing pill progress bar. At 100% the scene cuts to
 * the party emoji and the bar turns green ("Loaded").
 */
export default function LoadingScreen({ progress, isVisible }) {
  const [mounted, setMounted] = useState(true)
  const barRef = useRef(null)
  const reduced = useReducedMotion()
  const celebrate = progress >= 100

  // Unmount after the 0.8s CSS fade transition completes so the LoadingMascot
  // WebGL context and requestAnimationFrame loop are completely freed from GPU memory.
  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => {
        setMounted(false)
      }, 850)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${progress}%`
    }
  }, [progress])

  if (!mounted) return null

  return (
    <div className={`loading-screen ${!isVisible ? 'loading-screen--hidden' : ''}`}>
      <div className="loading-content">
        {/* 3D scene — isolated so a WebGL failure can never break the screen */}
        <ErrorBoundary fallback={null}>
          <LoadingMascot celebrate={celebrate} reduced={reduced} visible={isVisible} />
        </ErrorBoundary>

        {/* Wordmark with sequential dots, as in the reference */}
        <div className="loading-text" aria-live="polite">
          {celebrate ? 'Loaded' : 'Loading'}
          {!celebrate && (
            <span className="loading-dots-anim" aria-hidden="true">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          )}
        </div>

        {/* Glowing pill progress bar */}
        <div className="loading-bar-track">
          <div
            className={`loading-bar-fill ${celebrate ? 'loading-bar-fill--loaded' : ''}`}
            ref={barRef}
          />
        </div>

        <p className="loading-caption">Henok Kebede · Portfolio</p>
      </div>
    </div>
  )
}
