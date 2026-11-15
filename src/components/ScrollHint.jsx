import { useEffect, useState, useRef } from 'react'
import { subscribeScroll } from '../hooks/useScrollProgress'
import { useReducedMotion } from '../hooks/useReducedMotion'
import './ScrollHint.css'

export default function ScrollHint({ isHeroLoaded }) {
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isRendered, setIsRendered] = useState(true)
  const reduceMotion = useReducedMotion()
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    // If user is already past the top on initial mount (e.g. reload while scrolled down)
    if (typeof window !== 'undefined' && window.scrollY > 15) {
      hasTriggeredRef.current = true
      setHasScrolled(true)
      setIsRendered(false)
      return
    }

    const unsubscribe = subscribeScroll((scrollY) => {
      if (hasTriggeredRef.current) return
      if (scrollY > 15) {
        hasTriggeredRef.current = true
        setHasScrolled(true)
        // After fade-out transition (400ms), unmount completely from DOM
        setTimeout(() => {
          setIsRendered(false)
        }, 450)
      }
    })

    return unsubscribe
  }, [])

  // If already unmounted or never intended to show, render nothing
  if (!isRendered) return null

  // Keep hidden until hero has actually finished loading
  const isVisible = isHeroLoaded && !hasScrolled

  return (
    <div
      className={`hero-scroll-hint ${isVisible ? 'is-visible' : 'is-hidden'} ${reduceMotion ? 'reduce-motion' : ''}`}
      aria-hidden="true"
    >
      <div className="mouse-indicator">
        <span className="mouse-wheel" />
      </div>
      <span className="mouse-label">Scroll to explore</span>
    </div>
  )
}
