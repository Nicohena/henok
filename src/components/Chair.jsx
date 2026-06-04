import { useGLTF } from '@react-three/drei'

export default function Chair() {
  const { scene } = useGLTF('/chair.glb')

  return (
    <primitive
      object={scene}
      position={[-0.2, -1.8, 0.98]}
      scale={0.015}
      rotation={[0, Math.PI * 0.65, 0]}
    />
  )
}

useGLTF.preload('/chair.glb')
