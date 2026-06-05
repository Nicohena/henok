import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import { Suspense, useEffect, useRef } from 'react'
import SceneContent from './SceneContent'
import SceneBackground from './SceneBackground'
import './MainScene.css'

export default function MainScene() {
  const aboutCardsRef = useRef(null)

  // Fade in about cards as user scrolls into the About section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const height = window.innerHeight
      // t goes 0→1 as user scrolls (completes at 75% of viewport)
      const t = Math.min(scrollY / (height * 0.75), 1)
      if (aboutCardsRef.current) {
        const cards = aboutCardsRef.current.querySelectorAll('.about-card')
        cards.forEach((card) => {
          card.style.opacity = t
        })
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Hero text — normal DOM, scrolls with page */}
      <div className="hero-text-overlay">
        <h1>
          Hi, my<br />
          name is <span className="highlight">Henok.</span>
        </h1>
        <p>I love building beautiful digital experiences.</p>
        <a href="#projects" className="btn">Get in touch</a>
      </div>

      {/* About overlay — second screen */}
      <div className="about-overlay-dom" ref={aboutCardsRef}>
        <div className="about-cards">
          <div className="about-card name-card">
            <h3>Henok</h3>
            <p>📍 Ethiopia</p>
          </div>
          <div className="about-card bio-card">
            <p>Builds immersive 3D web experiences and interactive systems that are fast, responsive, and fun to use.</p>
          </div>
          <div className="about-card skills-card">
            <h4>Skills</h4>
            <ul>
              <li>Three.js &amp; WebGL</li>
              <li>React &amp; Next.js</li>
              <li>Node.js &amp; Express</li>
              <li>TypeScript</li>
              <li>Python &amp; Django</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sticky canvas — fixed height, sticks while scrolling hero+about */}
      <div className="canvas-sticky-wrapper">
        <Canvas
          camera={{ position: [0, 3.5, 6], fov: 42 }}
          shadows
          gl={{ logarithmicDepthBuffer: true, antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <SceneBackground />
            <SceneContent />
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
    </>
  )
}
