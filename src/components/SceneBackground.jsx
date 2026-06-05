import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const heroColor = new THREE.Color('#f5f0e8')

export default function SceneBackground() {
  const platformRef = useRef()
  const ringRef     = useRef()
  const glowRef     = useRef()
  const backgroundRef = useRef()
  const scrollY     = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      scrollY.current = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useFrame(({ scene }) => {
    const currentY = scrollY.current
    const height = window.innerHeight
    const t = Math.min(currentY / (height * 0.75), 1)

    // Keep scene background transparent to reveal HTML background transition
    scene.background = null

    // Background fade mesh (behind all objects)
    if (backgroundRef.current) {
      backgroundRef.current.material.opacity = t
      backgroundRef.current.visible = t > 0.01
    }

    // Hologram platform disc fades in slowly as the user scrolls to the About section (t 0→1)
    const platformOpacity = t
    if (platformRef.current) {
      platformRef.current.material.opacity = platformOpacity
      platformRef.current.visible = platformOpacity > 0.01
    }
    if (ringRef.current) {
      ringRef.current.material.opacity = platformOpacity
      ringRef.current.visible = platformOpacity > 0.01
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = platformOpacity * 0.4
      glowRef.current.visible = platformOpacity > 0.01
    }
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />

      {/* Background fade plane */}
      <mesh ref={backgroundRef} position={[0, 0, -5]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#0A29FF" transparent opacity={0} />
      </mesh>

      {/* Hologram platform disc */}
      <mesh ref={platformRef} position={[0, -1., 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 64]} />
        <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.6} transparent opacity={0} />
      </mesh>

      {/* Platform outer ring */}
      <mesh ref={ringRef} position={[0, -1, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.2, 64]} />
        <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={1} transparent opacity={0} />
      </mesh>

      {/* Glow disc */}
      <mesh ref={glowRef} position={[0, -1., 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 64]} />
        <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.3} transparent opacity={0} />
      </mesh>
    </>
  )
}
