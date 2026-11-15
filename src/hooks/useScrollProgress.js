import { useEffect, useRef, useState } from 'react'

/**
 * useScrollProgress — unified singleton scroll store.
 *
 * Consolidates all scroll subscribers across the app into ONE single
 * passive scroll listener on window, throttled via requestAnimationFrame.
 */

let cachedHeight = typeof window !== 'undefined' ? window.innerHeight : 800
let rafId = null
let sharedScrollY = 0
const subscribers = new Set()

function onScroll() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = null
    sharedScrollY = window.scrollY
    subscribers.forEach((fn) => fn(sharedScrollY, cachedHeight))
  })
}

function onResize() {
  cachedHeight = window.innerHeight
  subscribers.forEach((fn) => fn(sharedScrollY, cachedHeight))
}

function attachGlobalListeners() {
  if (typeof window === 'undefined') return
  if (subscribers.size === 1) {
    sharedScrollY = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
  }
}

function detachGlobalListeners() {
  if (typeof window === 'undefined') return
  if (subscribers.size === 0) {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }
}

export function subscribeScroll(fn) {
  subscribers.add(fn)
  attachGlobalListeners()
  if (typeof window !== 'undefined') {
    fn(window.scrollY, cachedHeight)
  }
  return () => {
    subscribers.delete(fn)
    detachGlobalListeners()
  }
}

export function useScrollProgress({ viewportFraction = 0.75, disabled = false } = {}) {
  const progressRef = useRef(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (disabled) {
      progressRef.current = 0
      Promise.resolve().then(() => setProgress(0))
      return
    }

    const update = (scrollY, height) => {
      const t = Math.min(scrollY / (height * viewportFraction), 1)
      progressRef.current = t
      setProgress(t)
    }

    // Initial calculation
    const initScrollY = typeof window !== 'undefined' ? window.scrollY : 0
    update(initScrollY, cachedHeight)

    subscribers.add(update)
    attachGlobalListeners()

    return () => {
      subscribers.delete(update)
      detachGlobalListeners()
    }
  }, [viewportFraction, disabled])

  return { progressRef, progress }
}

export default useScrollProgress

