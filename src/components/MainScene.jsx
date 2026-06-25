import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useRef, useCallback, useState } from "react";
import SceneContent from "./SceneContent";
import SceneBackground from "./SceneBackground";
import LightRays from "./LightRays";
import TiltedCard from "./TiltedCard";
import SceneLoader from "./SceneLoader";
import "./MainScene.css";

export default function MainScene({ onProgress, onLoaded }) {
  const aboutCardsRef = useRef(null);
  const lightfallRef = useRef(null);
  const lightRaysVisibleRef = useRef(false);
  const [showLightRays, setShowLightRays] = useState(false);
  const handleProgress = useCallback((p) => onProgress?.(p), [onProgress])
  const handleLoaded   = useCallback(() => onLoaded?.(), [onLoaded])

  // Fade in about cards as user scrolls into the About section
  useEffect(() => {
    let rafId = null
    const handleScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const scrollY = window.scrollY
        const height = window.innerHeight
        const t = Math.min(scrollY / (height * 0.75), 1)
        if (aboutCardsRef.current) {
          const cards = aboutCardsRef.current.querySelectorAll('.about-card-wrapper')
          cards.forEach((card) => { card.style.opacity = t })
        }
        if (lightfallRef.current) lightfallRef.current.style.opacity = t

        const shouldShowLightRays = t > 0.05
        if (lightRaysVisibleRef.current !== shouldShowLightRays) {
          lightRaysVisibleRef.current = shouldShowLightRays
          setShowLightRays(shouldShowLightRays)
        }
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      {/* Hero text — normal DOM, scrolls with page */}
      <div className="hero-text-overlay">
        <h1 className="hero-title">
          <span className="hero-name-line">Henok</span>
          <span className="hero-name-line">Kebede</span>
        </h1>
        <div className="hero-badge">FULL-STACK DEVELOPER</div>
      </div>

      {/* About overlay — second screen */}
      <div id="about" className="about-overlay-dom" ref={aboutCardsRef}>

        <div className="about-cards">
          <div className="about-card-wrapper name-card">
            <TiltedCard
              containerWidth="220px"
              containerHeight="110px"
              imageWidth="100%"
              imageHeight="100%"
              showMobileWarning={false}
              showTooltip={false}
              displayOverlayContent={true}
              overlayContent={
                <div className="glass-panel">
                  <h3>Henok</h3>
                  <p>Ethiopia</p>
                </div>
              }
            />
          </div>

          <div className="about-card-wrapper bio-card">
            <TiltedCard
              containerWidth="280px"
              containerHeight="170px"
              imageWidth="100%"
              imageHeight="100%"
              showMobileWarning={false}
              showTooltip={false}
              displayOverlayContent={true}
              overlayContent={
                <div className="glass-panel">
                  <p>
                    Builds immersive 3D web experiences and interactive systems that
                    are fast, responsive, and fun to use.
                  </p>
                </div>
              }
            />
          </div>

          <div className="about-card-wrapper skills-card">
            <TiltedCard
              containerWidth="240px"
              containerHeight="260px"
              imageWidth="100%"
              imageHeight="100%"
              showMobileWarning={false}
              showTooltip={false}
              displayOverlayContent={true}
              overlayContent={
                <div className="glass-panel">
                  <h4>Skills</h4>
                  <ul>
                    <li>Three.js &amp; WebGL</li>
                    <li>React &amp; Next.js</li>
                    <li>Node.js &amp; Express</li>
                    <li>TypeScript</li>
                    <li>Python &amp; Django</li>
                  </ul>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Sticky canvas — fixed height, sticks while scrolling hero+about */}
      <div className="canvas-sticky-wrapper">
        {/* LightRays background (fades in via scroll, behind 3D canvas) */}
        <div className="lightfall-bg" ref={lightfallRef}>
          {showLightRays && (
            <LightRays
              raysOrigin="top-center"
              raysColor="#00C8FF"
              raysSpeed={0.6}
              lightSpread={0.5}
              rayLength={3}
              followMouse={false}
              mouseInfluence={0}
              noiseAmount={0}
              distortion={0}
              className="custom-rays"
              pulsating={false}
              fadeDistance={1}
              saturation={1}
            />
          )}
        </div>

        <Canvas
          camera={{ position: [0, 3.5, 6], fov: 42 }}
          shadows
          dpr={[0.9, 1.25]}
          performance={{ min: 0.5 }}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <SceneLoader onProgress={handleProgress} onLoaded={handleLoaded} />
            <SceneBackground />
            <SceneContent />
            {/* Ambient contact shadows for soft ambient occlusion */}
            <ContactShadows
              position={[0, -0.5, 0]}
              opacity={0.08}
              scale={20}
              blur={2.5}
              resolution={256}
              far={10}
            />

            {/* Directional light shadow receiver floor */}
            <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[50, 50]} />
              <shadowMaterial opacity={0.03} />
            </mesh>
            <Environment preset="warehouse" />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}
