import { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export default function ContactScene() {
  const wavingRef = useRef()
  const waving = useGLTF('/waving.glb')
  const contact = useGLTF('/contact.glb')

  const { actions } = useAnimations(waving.animations, wavingRef)

  useEffect(() => {
    // The new waving.glb has 3 animations exported from Blender:
    //   [0] "Armature|mixamo.com|Layer0" (Blender's internal name)
    //   [1] "mixamo.com"                (standard Mixamo name)
    //   [2] "mixamo.com.001"            (duplicate)
    // drei's useAnimations keys the `actions` object by animation name,
    // but the duplicate "mixamo.com.001" can shadow "mixamo.com" in some
    // cases. To be robust, we try the preferred name first, then fall
    // back to the first available action.
    if (actions) {
      const actionNames = Object.keys(actions)
      const preferredAction =
        actions['mixamo.com'] ||              // standard Mixamo name
        actions['Armature|mixamo.com|Layer0'] ||  // Blender export name
        (actionNames.length > 0 ? actions[actionNames[0]] : null)  // fallback: first available

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
      {/* Waving character — centered in canvas, facing camera.
          New Boy01 model: scale 2.5, Y=-1.5 (same as before), rotation PI
          to face camera (new model faces opposite direction by default). */}
      <primitive
        ref={wavingRef}
        object={waving.scene}
        position={[0, -1.5, 0]}
        scale={2.5}
        rotation={[0, Math.PI, 0]}
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
