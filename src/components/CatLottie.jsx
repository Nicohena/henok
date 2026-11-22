import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'
import animationData from '../assets/cat-loading.json'

/**
 * CatLottie — plays the "Orange Cat Lying Wiggling Tail" Lottie animation.
 *
 * Props:
 *   celebrate  — when true the animation pauses on its last frame (loaded state)
 *   reduced    — when true respects prefers-reduced-motion by pausing after frame 0
 */
export default function CatLottie({ celebrate = false, reduced = false }) {
  const containerRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    animRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: !reduced,
      animationData,
    })

    return () => {
      animRef.current?.destroy()
      animRef.current = null
    }
  }, [reduced])

  // Pause on first frame for reduced-motion users
  useEffect(() => {
    if (!animRef.current) return
    if (reduced) {
      animRef.current.goToAndStop(0, true)
    } else {
      animRef.current.play()
    }
  }, [reduced])

  // On "celebrate" (fully loaded), pause on the last frame
  useEffect(() => {
    if (!animRef.current) return
    if (celebrate) {
      const totalFrames = animRef.current.totalFrames
      animRef.current.goToAndStop(totalFrames - 1, true)
    } else {
      if (!reduced) animRef.current.play()
    }
  }, [celebrate, reduced])

  return <div ref={containerRef} className="loading-mascot" aria-hidden="true" />
}
