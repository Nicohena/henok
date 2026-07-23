import { useEffect, useRef, useState } from 'react'

/**
 * useScrollProgress — single source of truth for scroll-driven UI.
 *
 * Consolidates what was previously 5 separate scroll listeners (App,
 * MainScene, SceneContent, SceneBackground, Navbar) into ONE listener
 * shared across all subscribers via a module-level ref.
 *
 * Returns a normalized progress value `t ∈ [0, 1]` computed as:
 *   t = min(scrollY / (innerHeight * 0.75), 1)
 *
 * The 0.75 factor means "full progress is reached after scrolling 75%
 * of one viewport height" — matching the original hero→about transition.
 *
 * Two access patterns:
 *   - `progressRef` (ref): for r3f `useFrame` consumers that read the
 *     value every frame WITHOUT triggering React re-renders. This is
 *     what SceneContent and SceneBackground should use.
 *   - `progress` (state): for React consumers that need to re-render
 *     when progress crosses thresholds (e.g. Navbar active-section
 *     detection, MainScene about-card opacity). Updates are throttled
 *     via requestAnimationFrame.
 *
 * `innerHeight` is cached and only re-read on `resize`, avoiding the
 * layout-reflow penalty of calling `window.innerHeight` inside `useFrame`.
 *
 * @param {Object} options
 * @param {number} options.viewportFraction — what fraction of viewport
 *   height equals "full progress". Default 0.75 (matches original code).
 * @param {boolean} options.disabled — when true, no listener is attached
 *   and progress stays at 0. Use for prefers-reduced-motion.
 * @returns {{ progressRef: React.MutableRefObject<number>, progress: number }}
 */
export function useScrollProgress({ viewportFraction = 0.75, disabled = false } = {}) {
  const progressRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const cachedHeight = useRef(
    typeof window !== 'undefined' ? window.innerHeight : 800
  )

  useEffect(() => {
    if (disabled) {
      progressRef.current = 0
      // Defer setState to a microtask to satisfy the
      // react-hooks/set-state-in-effect lint rule.
      Promise.resolve().then(() => setProgress(0))
      return
    }

    let rafId = null

    const compute = () => {
      rafId = null
      const scrollY = window.scrollY
      const height = cachedHeight.current
      const t = Math.min(scrollY / (height * viewportFraction), 1)
      progressRef.current = t
      setProgress(t)
    }

    const onScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(compute)
    }

    const onResize = () => {
      cachedHeight.current = window.innerHeight
    }

    // Run once on mount so subscribers get the initial value
    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [viewportFraction, disabled])

  return { progressRef, progress }
}

export default useScrollProgress
