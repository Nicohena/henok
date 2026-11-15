import { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useThree } from '@react-three/fiber'

export default function ContactScene() {
  const wavingRef = useRef()
  const waving = useGLTF('/waving_opt.glb')
  const contact = useGLTF('/contact.glb')

  const { viewport } = useThree()
  const isNarrow = viewport.width < 5
  const isMobile = viewport.width < 3

  const boxesPos = isMobile ? [0.95, -1.5, -0.8] : (isNarrow ? [1.8, -1.5, -0.6] : [3.5, -1.5, -0.5])
  const boxesScale = isMobile ? 1.3 : (isNarrow ? 1.6 : 2)
  const charPos = isMobile ? [0, -1.6, 0] : [0, -1.5, 0]
  const charScale = isMobile ? 1.75 : 2

  const { actions } = useAnimations(waving.animations, wavingRef)

  useEffect(() => {
    // The waving.glb exported from Blender contains 3 animations:
    //   [0] "Armature|mixamo.com|Layer0" (~9.6s) — sitting idle (NOT waving)
    //   [1] "mixamo.com"                  (~16.5s) — typing animation (NOT waving)
    //   [2] "mixamo.com.001"              (~0.6s) — THE ACTUAL WAVING gesture
    //
    // The "mixamo.com" (16.5s) animation is the typing animation embedded
    // in all three model files as a base layer. The actual wave is the
    // short 0.6s clip "mixamo.com.001" — a brief arm-raise wave gesture.
    // We must select this specific clip, not the default "mixamo.com".
    if (actions) {
      const actionNames = Object.keys(actions)
      const preferredAction =
        actions['mixamo.com.001'] ||              // ← the actual waving animation (0.6s)
        actions['mixamo.com|Layer0'] ||            // alternate Blender name
        (actionNames.length > 0 ? actions[actionNames[actionNames.length - 1]] : null)  // fallback: LAST action (shortest, most likely the gesture)

      if (preferredAction) {
        preferredAction.reset().fadeIn(0.5).play()
      }
    }

    // Enable shadows for the new waving character. New Mixamo "Boy01"
    // models have real textures — no recoloring needed.
    if (waving.scene) {
      waving.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }

    // Enable shadows + recolor contact environment to warm cream
    if (contact.scene) {
      contact.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          // Clone material to avoid mutating shared references
          if (child.material) {
            child.material = child.material.clone()
            child.material.color.set('#F0E098')   // slightly yellow cream
            child.material.roughness = 0.85
            child.material.metalness = 0
          }
        }
      })
    }
  }, [actions, waving.scene, contact.scene])

  return (
    <group>
      {/* Waving character — centered in canvas, facing camera */}
      <primitive
        ref={wavingRef}
        object={waving.scene}
        position={charPos}
        scale={charScale}
        rotation={[0, 0, 0]}
      />

      {/* Contact environment (boxes / envelopes) — to the right and slightly back */}
      <primitive
        object={contact.scene}
        position={boxesPos}
        scale={boxesScale}
        rotation={[0, -Math.PI / 5, 0]}
      />
    </group>
  )
}
