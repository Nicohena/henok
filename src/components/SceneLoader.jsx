import { useEffect } from 'react'
import { useProgress } from '@react-three/drei'

/**
 * Lives inside the <Canvas> and reports loading progress upward via callbacks.
 * useProgress tracks all assets loaded by useGLTF / useTexture etc.
 */
export default function SceneLoader({ onProgress, onLoaded }) {
  const { progress, active } = useProgress()

  useEffect(() => {
    onProgress(progress)
    // active = true while assets are still loading
    // When active becomes false and progress hits 100, everything is done
    if (!active && progress === 100) {
      // Small delay to let the scene actually render one frame first
      const timer = setTimeout(() => onLoaded(), 400)
      return () => clearTimeout(timer)
    }
  }, [progress, active, onProgress, onLoaded])

  return null
}
