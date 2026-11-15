import { useGLTF } from '@react-three/drei'

let isContactRequested = false
const listeners = new Set()

export const contactLoader = {
  isRequested: () => isContactRequested,
  load: () => {
    if (isContactRequested) return
    isContactRequested = true

    // Preload Contact 3D assets via drei's useGLTF cache
    useGLTF.preload('/waving_opt.glb')
    useGLTF.preload('/contact.glb')

    // Preload the ContactSection component chunk
    import('../components/ContactSection')

    // Notify all subscribers
    listeners.forEach((fn) => {
      try {
        fn(true)
      } catch (err) {
        console.error('contactLoader listener error:', err)
      }
    })
  },
  subscribe: (fn) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  }
}

