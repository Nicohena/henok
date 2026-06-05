import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import DeskSetup from './DeskSetup'
import FlowerPot from './FlowerPot'

export default function SceneContent() {
  const charRef      = useRef()
  const fadeGroupRef = useRef()
  const scrollY      = useRef(0) // Track raw scrollY value

  const typing  = useGLTF('/typing.glb')
  const talking = useGLTF('/sitting_and_talking.glb')
  const chair   = useGLTF('/chair.glb')

  const { actions: typingActions, mixer } = useAnimations(typing.animations, charRef)
  const talkingActionRef = useRef(null)

  // Hero → About states
  const heroX        = 1.
  const heroY        = -0.5
  const heroScale    = 1.8
  const heroRotation = Math.PI * -0.35
  const aboutX        = 0.0
  const aboutY        = -1.0
  const aboutScale    = 2.3
  const aboutRotation = Math.PI * 1.0

  // Listen to native window scroll
  useEffect(() => {
    const onScroll = () => {
      scrollY.current = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!mixer || !typingActions) return

    const typingAction = typingActions[Object.keys(typingActions)[0]]
    if (typingAction) typingAction.reset().play()

    const talkingClip = talking.animations[0]
    if (talkingClip) {
      talkingActionRef.current = mixer.clipAction(talkingClip, charRef.current)
    }

    if (fadeGroupRef.current) {
      fadeGroupRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone()
          child.material.transparent = true
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
    if (charRef.current) {
      charRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone()
          child.material.transparent = true
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
    // Also make character meshes transparent for fading
    if (charRef.current) {
      charRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone()
          child.material.transparent = true
        }
      })
    }
  }, [mixer, typingActions, talking.animations])

  useFrame(() => {
    if (!charRef.current) return
    const currentY = scrollY.current
    const height = window.innerHeight

    // t goes 0→1 over 75% of the Hero to About scroll range (completes at 75vh)
    const t = Math.min(currentY / (height * 0.75), 1)

    // outT goes 0→1 as we scroll past the About section (100vh to 200vh)
    const outT = Math.min(Math.max((currentY - height) / height, 0), 1)

    // Animate character + chair
    charRef.current.position.x = THREE.MathUtils.lerp(heroX, aboutX, t)

    // Keep character at aboutY position once in About section (no slide-down)
    charRef.current.position.y = THREE.MathUtils.lerp(heroY, aboutY, t)

    charRef.current.scale.setScalar(THREE.MathUtils.lerp(heroScale, aboutScale, t))
    charRef.current.rotation.y = THREE.MathUtils.lerp(heroRotation, aboutRotation, t)

    // Fade out desk + pot
    if (fadeGroupRef.current) {
      const opacity = THREE.MathUtils.lerp(1, 0, t)
      fadeGroupRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.opacity = opacity
        }
      })
      fadeGroupRef.current.visible = opacity > 0.01
    }

    // Keep character and chair fully visible (no opacity change)
    if (charRef.current) {
      // Ensure opacity stays at 1
      charRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.opacity = 1
        }
      })
      charRef.current.visible = true
    }

    // Animation crossfade
    const typingAction  = typingActions?.[Object.keys(typingActions  || {})[0]]
    const talkingAction = talkingActionRef.current

    if (typingAction && talkingAction) {
      if (t > 0.6 && !talkingAction.isRunning()) {
        talkingAction.reset().play()
        typingAction.crossFadeTo(talkingAction, 0.5, true)
      } else if (t < 0.4 && !typingAction.isRunning()) {
        typingAction.reset().play()
        talkingAction.crossFadeTo(typingAction, 0.5, true)
      }
    }
  })

  return (
    <>
      <group ref={fadeGroupRef}>
        <DeskSetup />
        <FlowerPot position={[4, -1.8, 0.3]} />
      </group>

      <group
        ref={charRef}
        position={[heroX, heroY, 0.99]}
        scale={heroScale}
        rotation={[0, heroRotation, 0]}
      >
        <primitive object={typing.scene} castShadow receiveShadow />
        <primitive
          object={chair.scene}
          position={[0, -0.05, 0]}
          scale={0.0083}
          rotation={[0, Math.PI, 0]}
          castShadow
          receiveShadow
        />
      </group>
    </>
  )
}

useGLTF.preload('/typing.glb')
useGLTF.preload('/sitting_and_talking.glb')
useGLTF.preload('/chair.glb')
