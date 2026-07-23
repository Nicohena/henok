import { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export default function ContactScene() {
  const wavingRef = useRef()
  const waving = useGLTF('/waving.glb')
  const contact = useGLTF('/contact.glb')

  const { actions } = useAnimations(waving.animations, wavingRef)

  useEffect(() => {
    // Play the waving animation on loop
    if (actions && actions['mixamo.com']) {
      actions['mixamo.com'].reset().fadeIn(0.5).play()
    }

    // Enable shadows for waving character
    if (waving.scene) {
      waving.scene.traverse((child) => {
        if (child.isMesh) {
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
      {/* Waving character — centred in canvas, slightly left */}
      <primitive
        ref={wavingRef}
        object={waving.scene}
        position={[0, -1.5, 0]}
        scale={2}
        rotation={[0, 0, 0]}
      />

      {/* Contact environment (boxes / envelopes) — to the right and slightly back */}
      <primitive
        object={contact.scene}
        position={[3.5, -1.5, -0.5]}
        scale={2}
        rotation={[0, -Math.PI / 5, 0]}
      />
    </group>
  )
}

useGLTF.preload('/waving.glb')
useGLTF.preload('/contact.glb')
