import { useRef } from 'react'
import { RoundedBox, Box, Plane } from '@react-three/drei'

export default function HeroEnvironment() {
  return (
    <group>
      {/* Floating Wall Elements (behind the desk, z = -2) */}
      <group position={[1.5, 1.5, -1.5]}>


        {/* Picture Frame */}
        <group position={[2.0, 0.2, 0]}>
          <RoundedBox args={[1.5, 1.2, 0.1]} radius={0.05} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#A0AAB5" roughness={0.6} />
          </RoundedBox>
          <Plane args={[1.3, 1.0]} position={[0, 0, 0.06]} receiveShadow>
            <meshStandardMaterial color="#F0F5FA" roughness={1} />
          </Plane>
        </group>

      </group>
    </group>
  )
}
