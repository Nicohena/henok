import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Suspense } from 'react'
import Character from './Character'
import DeskSetup from './DeskSetup'
import Chair from './Chair'
import FlowerPot from './FlowerPot'
import './HeroSection.css'

export default function HeroSection() {
  return (
    <section className="hero">
      {/* Left side — text */}
      <div className="hero-text">
        <h1>
          Hi, my<br />
          name is <span className="highlight">Henok.</span>
        </h1>
        <p>I love building beautiful digital experiences.</p>
        <a href="#contact" className="btn">Get in touch</a>
      </div>

      {/* Right side — 3D scene */}
      <div className="hero-canvas">
        <Canvas
          camera={{ position: [0, 3.5, 6], fov: 42 }}
          shadows
          gl={{ logarithmicDepthBuffer: true, antialias: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
          />
          <Suspense fallback={null}>
            <DeskSetup />
            <Chair />
            <Character />
            {/* Flower pot on the right side of the scene */}
            <FlowerPot position={[-1.5, -1.8, 0.5]} />
            <ContactShadows
              position={[0, -1.8, 0]}
              opacity={0.4}
              scale={4}
              blur={2}
            />
            <Environment preset="warehouse" />
          </Suspense>
        </Canvas>
      </div>
    </section>
  )
}