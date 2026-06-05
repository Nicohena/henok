import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const heroColor = new THREE.Color('#f5f0e8')

export default function SceneBackground() {
  const platformRef  = useRef()
  const wireframeRef = useRef()
  const ringRef      = useRef()
  const ringRef2     = useRef()
  const glowRef      = useRef()
  const shardRef1    = useRef()
  const shardRef2    = useRef()
  const shardRef3    = useRef()
  const scrollY     = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      scrollY.current = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useFrame(({ scene, clock }) => {
    const currentY = scrollY.current
    const height = window.innerHeight
    const t = Math.min(currentY / (height * 0.75), 1)

    // Keep scene background transparent to reveal HTML background transition
    scene.background = null

    // Hologram platform disc fades in slowly as the user scrolls to the About section (t 0→1)
    const platformOpacity = t
    
    const updateOpacity = (ref, maxOp = 1) => {
      if (ref.current) {
        ref.current.material.opacity = platformOpacity * maxOp
        ref.current.visible = platformOpacity > 0.01
      }
    }

    updateOpacity(platformRef, 0.9)
    updateOpacity(wireframeRef, 0.3)
    updateOpacity(ringRef, 1)
    updateOpacity(ringRef2, 0.8)
    updateOpacity(glowRef, 0.4)
    updateOpacity(shardRef1, 1)
    updateOpacity(shardRef2, 1)
    updateOpacity(shardRef3, 1)

    // Animations for the sci-fi pedestal
    const time = clock.getElapsedTime()
    if (ringRef.current) ringRef.current.rotation.z = time * 0.3
    if (ringRef2.current) ringRef2.current.rotation.z = -time * 0.2
    if (wireframeRef.current) wireframeRef.current.rotation.z = time * 0.05
    
    // Subtle pulsing glow
    if (glowRef.current) {
      const pulse = 1 + Math.sin(time * 2) * 0.05
      glowRef.current.scale.set(pulse, pulse, pulse)
    }

    // Orbiting shards
    if (shardRef1.current) {
      shardRef1.current.position.x = Math.cos(time * 0.8) * 1.5
      shardRef1.current.position.z = Math.sin(time * 0.8) * 1.5
      shardRef1.current.rotation.x = time * 2
      shardRef1.current.rotation.y = time * 2
    }
    if (shardRef2.current) {
      shardRef2.current.position.x = Math.cos(time * 0.5 + Math.PI) * 1.8
      shardRef2.current.position.z = Math.sin(time * 0.5 + Math.PI) * 1.8
      shardRef2.current.rotation.x = -time * 1.5
      shardRef2.current.rotation.y = time * 1.5
      shardRef2.current.position.y = Math.sin(time * 2) * 0.5 + 0.5
    }
    if (shardRef3.current) {
      shardRef3.current.position.x = Math.cos(time * 1.2 + Math.PI/2) * 1.3
      shardRef3.current.position.z = Math.sin(time * 1.2 + Math.PI/2) * 1.3
      shardRef3.current.rotation.x = time * 3
      shardRef3.current.rotation.y = -time * 2
      shardRef3.current.position.y = Math.cos(time * 3) * 0.3 + 0.2
    }
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
      </directionalLight>

      {/* High-tech Sci-Fi Pedestal Group */}
      <group position={[0, -0.5, 0.6]}>
        
        {/* Core solid disc (dark base with slight emissive tint) */}
        <mesh ref={platformRef} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.0, 64]} />
          <meshStandardMaterial color="#0A0F1E" emissive="#5227FF" emissiveIntensity={0.2} transparent opacity={0} roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Wireframe overlay on disc (creates a grid-like sci-fi floor) */}
        <mesh ref={wireframeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <circleGeometry args={[1.0, 32]} />
          <meshBasicMaterial color="#00c8ff" wireframe transparent opacity={0} />
        </mesh>

        {/* Inner rotating solid ring (Cyan) */}
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <ringGeometry args={[1.05, 1.15, 64]} />
          <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={1.5} transparent opacity={0} />
        </mesh>

        {/* Outer rotating dashed/wireframe ring (Orange/Purple combo) */}
        <mesh ref={ringRef2} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
          <ringGeometry args={[1.2, 1.35, 32, 2]} />
          <meshStandardMaterial color="#FF6B2B" emissive="#FF6B2B" emissiveIntensity={1.5} wireframe transparent opacity={0} />
        </mesh>

        {/* Outer pulsing atmospheric glow */}
        <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[2.8, 64]} />
          <meshStandardMaterial color="#5227FF" emissive="#5227FF" emissiveIntensity={0.6} transparent opacity={0} />
        </mesh>

        {/* Orbiting Shard 1 (Cyan) */}
        <mesh ref={shardRef1} position={[1.5, 0.2, 0]}>
          <octahedronGeometry args={[0.08]} />
          <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={2} transparent opacity={0} />
        </mesh>
        
        {/* Orbiting Shard 2 (Orange) */}
        <mesh ref={shardRef2} position={[-1.8, 0.5, 0]}>
          <octahedronGeometry args={[0.05]} />
          <meshStandardMaterial color="#FF6B2B" emissive="#FF6B2B" emissiveIntensity={2} transparent opacity={0} />
        </mesh>

        {/* Orbiting Shard 3 (Purple) */}
        <mesh ref={shardRef3} position={[0, 0.3, 1.3]}>
          <octahedronGeometry args={[0.04]} />
          <meshStandardMaterial color="#5227FF" emissive="#5227FF" emissiveIntensity={2} transparent opacity={0} />
        </mesh>
        
      </group>
    </>
  )
}
