import { memo } from 'react'

const FlowerPot = memo(function FlowerPot({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Pot body - terracotta */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.16, 0.35, 8]} />
        <meshStandardMaterial color="#c1440e" />
      </mesh>

      {/* Pot rim */}
      <mesh position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.22, 0.06, 8]} />
        <meshStandardMaterial color="#a83200" />
      </mesh>

      {/* Soil */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.04, 8]} />
        <meshStandardMaterial color="#2e1a0e" />
      </mesh>

      {/* Main stem */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.45, 6]} />
        <meshStandardMaterial color="#2d6a2d" />
      </mesh>

      {/* Left branch */}
      <mesh position={[-0.15, 0.65, 0]} rotation={[0, 0, Math.PI / 3]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.25, 6]} />
        <meshStandardMaterial color="#2d6a2d" />
      </mesh>

      {/* Right branch */}
      <mesh position={[0.15, 0.72, 0]} rotation={[0, 0, -Math.PI / 3]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.25, 6]} />
        <meshStandardMaterial color="#2d6a2d" />
      </mesh>

      {/* Leaf cluster top */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color="#3a8a3a" />
      </mesh>

      {/* Leaf cluster left */}
      <mesh position={[-0.22, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.14, 6, 6]} />
        <meshStandardMaterial color="#4aaa4a" />
      </mesh>

      {/* Leaf cluster right */}
      <mesh position={[0.22, 0.78, 0]} castShadow>
        <sphereGeometry args={[0.14, 6, 6]} />
        <meshStandardMaterial color="#2d7a2d" />
      </mesh>
    </group>
  )
})

export default FlowerPot
