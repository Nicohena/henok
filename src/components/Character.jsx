import { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export default function Character() {
  const group = useRef()

  const { scene, animations } = useGLTF('/typing.glb')
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    if (!actions) return
    const action = actions[Object.keys(actions)[0]]
    if (action) {
      action.reset().play()
    }
  }, [actions])

  return (
    <group ref={group} position={[-0.25, -1.8, 0.93]} scale={1.8} rotation={[0, -Math.PI * 0.35, 0]}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload('/typing.glb')
