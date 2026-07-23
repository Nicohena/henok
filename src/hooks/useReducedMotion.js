import { useEffect, useState } from 'react'

/**
 * useReducedMotion — subscribes to the user's `prefers-reduced-motion` setting.
 *
 * Returns `true` when the user has requested reduced motion (OS-level setting
 * or browser flag). Components should use this to disable non-essential
 * animations: parallax, scroll-driven 3D choreography, shader backgrounds,
 * hover tilts, looping decorative animations.
 *
 * Essential transitions (page navigation, overlay open/close, loading
 * progress) may still run — the goal is to reduce vestibular triggers, not
 * freeze the entire UI.
 *
 * @returns {boolean} true if the user prefers reduced motion
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setReduced(e.matches)

    // Modern browsers: addEventListener; older Safari: addListener
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    } else if (mql.addListener) {
      mql.addListener(onChange)
      return () => mql.removeListener(onChange)
    }
  }, [])

  return reduced
}

export default useReducedMotion
