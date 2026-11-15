import { useEffect } from 'react'
import { useProgress } from '@react-three/drei'

/**
 * Lives inside the <Canvas> and reports loading progress upward via callbacks.
 * useProgress tracks all assets loaded by useGLTF / useTexture etc.
 */
export default function SceneLoader({ onProgress, onLoaded }) {
  const { progress, active } = useProgress()

  useEffect(() => {
    // Safety timeout: prevent indefinite loading if any asset stalls
    const timeout = setTimeout(() => {
      onLoaded?.()
    }, 7000)
    return () => clearTimeout(timeout)
  }, [onLoaded])

  useEffect(() => {
    onProgress(progress)
    // active = true while assets are still loading
    // When active becomes false and progress hits 100, everything is done
    if (!active && progress === 100) {
      // Let the browser paint the first rendered 3D frame before dismissing the loader
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          onLoaded?.()
        })
        return () => cancelAnimationFrame(raf2)
      })
      return () => cancelAnimationFrame(raf1)
    }
  }, [progress, active, onProgress, onLoaded])

  return null
}
