import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'

export default function DeskSetup() {
  const { scene } = useGLTF('/desk_and_pc.glb')

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  return (
    <primitive
      object={scene}
      position={[2, -0.5, 0]}
      scale={0.5}
      rotation={[0, Math.PI + Math.PI * 0.15, 0]}
    />
  )
}

useGLTF.preload('/desk_and_pc.glb')
