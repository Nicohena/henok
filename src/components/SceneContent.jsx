import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import DeskSetup from './DeskSetup'
import FlowerPot from './FlowerPot'
import HeroEnvironment from './HeroEnvironment'
import { useScrollProgress } from '../hooks/useScrollProgress'

export default function SceneContent({ reduceMotion = false }) {
  const charRef      = useRef()
  const fadeGroupRef = useRef()
  const fadeMaterialsRef = useRef([])
  const frameCount   = useRef(0)
  const prevT        = useRef(-1)

  // Single shared scroll listener — exposes a ref we can read inside
  // useFrame without triggering re-renders. disabled when reduceMotion.
  const { progressRef } = useScrollProgress({ disabled: reduceMotion })

  const typing  = useGLTF('/typing.glb')
  const talking = useGLTF('/sitting_and_talking.glb')
  const chair   = useGLTF('/chair.glb')

  const { actions: typingActions, mixer } = useAnimations(typing.animations, charRef)
  const talkingActionRef = useRef(null)

  // Hero → About states
  // Note: Y positions adjusted for the new Boy01 character model which
  // has a different vertical origin than the old Beta model. The new
  // model's mesh extends further below the origin, so we lower Y to
  // keep the character seated on the chair/floor without floating.
  const heroX        = 1
  const heroY        = -1.6
  const heroScale    = 1.8
  const heroRotation = Math.PI * -0.35
  const aboutX        = 0
  const aboutY        = -1.6
  const aboutScale    = 2.3
  const aboutRotation = Math.PI * 1.0

  useEffect(() => {
    if (!mixer || !typingActions) return

    const typingAction = typingActions[Object.keys(typingActions)[0]]
    if (typingAction) typingAction.reset().play()

    const talkingClip = talking.animations[0]
    if (talkingClip) {
      talkingActionRef.current = mixer.clipAction(talkingClip, charRef.current)
    }

    const fadeMats = []
    if (fadeGroupRef.current) {
      fadeGroupRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone()
          child.material.transparent = true
          child.castShadow = true
          child.receiveShadow = true
          fadeMats.push(child.material)
        }
      })
    }
    fadeMaterialsRef.current = fadeMats

    // Enable shadows on the new character model. The new Mixamo "Boy01"
    // models have real textures (skin, eyes, brows, mouth) so we do NOT
    // recolor — the textures define the appearance. Just enable shadows.
    if (charRef.current) {
      charRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
  // Note: depend on `talking` (the gltf object) rather than
  // `talking.animations` (a new array reference on every render) to
  // avoid re-running this effect — which re-clones materials and
  // re-traverses the scene graph — on every render.
  }, [mixer, typingActions, talking])

  useFrame(() => {
    if (!charRef.current) return

    // Reduced motion: freeze character in hero pose, keep desk visible,
    // disable all scroll-driven choreography. Typing animation still plays
    // so the scene doesn't look dead, but no crossfade to talking.
    if (reduceMotion) {
      charRef.current.position.x = heroX
      charRef.current.position.y = heroY
      charRef.current.scale.setScalar(heroScale)
      charRef.current.rotation.y = heroRotation
      if (fadeGroupRef.current) fadeGroupRef.current.visible = true
      if (fadeMaterialsRef.current.length > 0) {
        fadeMaterialsRef.current.forEach((mat) => { mat.opacity = 1 })
      }
      return
    }

    const t = progressRef.current
    frameCount.current++

    // Always lerp position/scale/rotation (cheap, must be smooth)
    charRef.current.position.x = THREE.MathUtils.lerp(heroX, aboutX, t)
    charRef.current.position.y = THREE.MathUtils.lerp(heroY, aboutY, t)
    charRef.current.scale.setScalar(THREE.MathUtils.lerp(heroScale, aboutScale, t))
    charRef.current.rotation.y = THREE.MathUtils.lerp(heroRotation, aboutRotation, t)

    // Fade out desk + pot — only when t is changing or every 3rd frame
    if (fadeGroupRef.current && fadeMaterialsRef.current.length > 0) {
      if (prevT.current !== t || (frameCount.current % 3) === 0) {
        const opacity = THREE.MathUtils.lerp(1, 0, t)
        fadeMaterialsRef.current.forEach((mat) => { mat.opacity = opacity })
        fadeGroupRef.current.visible = opacity > 0.01
      }
    }

    prevT.current = t

    // Animation crossfade — expensive, throttle to every 10th frame
    if ((frameCount.current % 10) !== 0) return

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
        <HeroEnvironment />
        <DeskSetup />
        <FlowerPot position={[4, -1.6, 0.3]} />
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
