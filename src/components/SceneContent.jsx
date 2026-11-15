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
  const targetVec    = useRef(new THREE.Vector3())

  // Single shared scroll listener — exposes a ref we can read inside
  // useFrame without triggering re-renders. disabled when reduceMotion.
  const { progressRef } = useScrollProgress({ disabled: reduceMotion })

  const typing  = useGLTF('/typing_opt.glb')
  const talking = useGLTF('/sitting_anim.glb')
  const chair   = useGLTF('/chair_opt.glb')

  const { actions: typingActions, mixer } = useAnimations(typing.animations, charRef)
  const talkingActionRef = useRef(null)

  // Hero → About states
  // The new Boy01 model has a different default facing direction than
  // the old Beta model. After visual testing, the original rotation
  // values (without +PI offset) correctly face the character toward
  // the desk in hero pose and toward the camera in about pose.
  const heroX        = 0.9
  const heroY        = -1.7
  const heroZ        = 0.8
  const heroScale    = 2
  const heroRotation = Math.PI * 0.6             // face desk (right)
  const aboutX        = 0
  const aboutY        = -0.3
  const aboutZ        = 1
  const aboutScale    = 1.9
  const aboutRotation = Math.PI * 0.           // face camera
  const chairRef      = useRef()

  useEffect(() => {
    if (!mixer || !typingActions) return

    // Fallback logic to ensure we get the right typing clip
    const typingKeys = Object.keys(typingActions)
    let typingClipKey = typingKeys[0]
    // If the first one is the sitting one, try to find another
    if (typingClipKey.includes("Layer0") && typingKeys.length > 1) {
      typingClipKey = typingKeys[1]
    }
    const typingAction = typingActions[typingClipKey]
    if (typingAction) typingAction.reset().play()

    // The sitting_and_talking.glb has 2 animations:
    //   [0] "Armature|mixamo.com|Layer0" (~9.6s) — the SITTING animation
    //   [1] "mixamo.com" (~16.5s) — typing animation (duplicate of typing.glb)
    // We must use [0] — the unique sitting clip. Using [1] would play typing.
    // Find the sitting clip by name, falling back to the first non-"mixamo.com" clip.
    const allClips = talking.animations || []
    const sittingClip =
      allClips.find(c => c.name === 'Armature|mixamo.com|Layer0') ||
      allClips.find(c => c.name !== 'mixamo.com') ||
      allClips[0]
    if (sittingClip) {
      talkingActionRef.current = mixer.clipAction(sittingClip, charRef.current)
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

  useFrame(({ camera, viewport }) => {
    if (!charRef.current) return

    const t = reduceMotion ? 0 : progressRef.current
    frameCount.current++

    // Responsive camera framing for narrow viewports (mobile and iPad portrait)
    // Centers and frames the character + desk + monitor in Hero, then smoothly
    // lerps to the About center framing [0, 3.5, 6] looking at [0, 0, 0].
    if (viewport.aspect < 1.05) {
      const isMobile = viewport.aspect < 0.7
      const heroCamX = isMobile ? 1.6 : 0.6
      const heroCamY = isMobile ? 2.8 : 3.2
      const heroCamZ = isMobile ? 9.4 : 7.8
      const heroTargetX = isMobile ? 2.2 : 1.9
      const heroTargetY = isMobile ? -0.6 : -0.4
      const heroTargetZ = 0.2

      const curCamX = THREE.MathUtils.lerp(heroCamX, 0, t)
      const curCamY = THREE.MathUtils.lerp(heroCamY, 3.5, t)
      const curCamZ = THREE.MathUtils.lerp(heroCamZ, 6.0, t)

      const curTargetX = THREE.MathUtils.lerp(heroTargetX, 0, t)
      const curTargetY = THREE.MathUtils.lerp(heroTargetY, 0, t)
      const curTargetZ = THREE.MathUtils.lerp(heroTargetZ, 0, t)

      camera.position.set(curCamX, curCamY, curCamZ)
      targetVec.current.set(curTargetX, curTargetY, curTargetZ)
      camera.lookAt(targetVec.current)
    } else {
      camera.position.set(0, 3.5, 6)
      targetVec.current.set(0, 0, 0)
      camera.lookAt(targetVec.current)
    }

    // Reduced motion: freeze character in hero pose, keep desk visible,
    // disable all scroll-driven choreography. Typing animation still plays
    // so the scene doesn't look dead, but no crossfade to talking.
    if (reduceMotion) {
      charRef.current.position.x = heroX
      charRef.current.position.y = heroY
      charRef.current.position.z = heroZ
      charRef.current.scale.setScalar(heroScale)
      charRef.current.rotation.y = heroRotation
      charRef.current.rotation.x = 0
      if (fadeGroupRef.current) fadeGroupRef.current.visible = true
      if (fadeMaterialsRef.current.length > 0) {
        fadeMaterialsRef.current.forEach((mat) => { mat.opacity = 1 })
      }
      return
    }

    // Always lerp position/scale/rotation (cheap, must be smooth)
    charRef.current.position.x = THREE.MathUtils.lerp(heroX, aboutX, t)
    charRef.current.position.y = THREE.MathUtils.lerp(heroY, aboutY, t)
    charRef.current.position.z = THREE.MathUtils.lerp(heroZ, aboutZ, t)
    charRef.current.scale.setScalar(THREE.MathUtils.lerp(heroScale, aboutScale, t))
    charRef.current.rotation.y = THREE.MathUtils.lerp(heroRotation, aboutRotation, t)
    // Tilt character slightly toward camera in about section so face is visible
    charRef.current.rotation.x = THREE.MathUtils.lerp(0, -0.15, t)

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
        position={[heroX, heroY, heroZ]}
        scale={heroScale}
        rotation={[0, heroRotation, 0]}
      >
        <primitive object={typing.scene} castShadow receiveShadow />
        {/* Office chair — positioned under the character's hips.
            The chair is a child of the character group, so it inherits the
            parent's rotation. We set chair rotation to [0, 0, 0] so it
            aligns with the character's facing direction automatically.
            Position tuned so the seat is at the character's hip height
            and centered behind them. */}
        <primitive
          ref={chairRef}
          object={chair.scene}
          position={[0.05, 0.02, -0.15]}
          scale={0.007}
          rotation={[0, 0, 0]}
          castShadow
          receiveShadow
        />
      </group>
    </>
  )
}

useGLTF.preload('/typing_opt.glb')
useGLTF.preload('/sitting_anim.glb')
useGLTF.preload('/chair_opt.glb')
