import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useRef, useCallback, useState } from "react";
import SceneContent from "./SceneContent";
import SceneBackground from "./SceneBackground";
import LightRays from "./LightRays";
import TiltWrapper from "./TiltWrapper";
import SceneLoader from "./SceneLoader";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useScrollProgress } from "../hooks/useScrollProgress";
import "./MainScene.css";

export default function MainScene({ onProgress, onLoaded }) {
  const aboutCardsRef = useRef(null);
  const lightfallRef = useRef(null);
  const lightRaysVisibleRef = useRef(false);
  const [showLightRays, setShowLightRays] = useState(false);
  const handleProgress = useCallback((p) => onProgress?.(p), [onProgress])
  const handleLoaded   = useCallback(() => onLoaded?.(), [onLoaded])
  const reduceMotion = useReducedMotion();
  // Shared scroll listener — `progress` (state) re-renders this component
  // when scroll crosses rAF thresholds, used to drive about-card opacity
  // and the LightRays mount/unmount toggle.
  const { progress } = useScrollProgress({ disabled: reduceMotion });

  // Apply scroll progress to DOM elements (about cards + lightfall bg).
  // Runs whenever `progress` changes — no internal scroll listener.
  useEffect(() => {
    if (reduceMotion) {
      // Reduced motion: show everything at full opacity, no light rays.
      if (aboutCardsRef.current) {
        aboutCardsRef.current.querySelectorAll('.about-card-wrapper').forEach((card) => {
          card.style.opacity = 1
        })
      }
      if (lightfallRef.current) lightfallRef.current.style.opacity = 1
      Promise.resolve().then(() => setShowLightRays(false))
      return
    }
    // Normal: apply fade based on scroll progress
    if (aboutCardsRef.current) {
      aboutCardsRef.current.querySelectorAll('.about-card-wrapper').forEach((card) => {
        card.style.opacity = progress
      })
    }
    if (lightfallRef.current) lightfallRef.current.style.opacity = progress

    const shouldShowLightRays = progress > 0.05
    if (lightRaysVisibleRef.current !== shouldShowLightRays) {
      lightRaysVisibleRef.current = shouldShowLightRays
      setShowLightRays(shouldShowLightRays)
    }
  }, [progress, reduceMotion])

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
            <TiltWrapper
              containerWidth="220px"
              containerHeight="110px"
            >
              <div className="glass-panel">
                <h3>Henok</h3>
                <p>Ethiopia</p>
              </div>
            </TiltWrapper>
          </div>

          <div className="about-card-wrapper bio-card">
            <TiltWrapper
              containerWidth="280px"
              containerHeight="170px"
            >
              <div className="glass-panel">
                <p>
                  Builds immersive 3D web experiences and interactive systems that
                  are fast, responsive, and fun to use.
                </p>
              </div>
            </TiltWrapper>
          </div>

          <div className="about-card-wrapper skills-card">
            <TiltWrapper
              containerWidth="240px"
              containerHeight="260px"
            >
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
            </TiltWrapper>
          </div>
        </div>
      </div>

      {/* Sticky canvas — fixed height, sticks while scrolling hero+about */}
      <div className="canvas-sticky-wrapper">
        {/* LightRays background (fades in via scroll, behind 3D canvas) */}
        <div className="lightfall-bg" ref={lightfallRef}>
          {showLightRays && !reduceMotion && (
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
            <SceneContent reduceMotion={reduceMotion} />
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
            {/* Note: <Environment preset="warehouse" /> was removed because it
                fetches HDR files from an external CDN (pmndrs/drei-assets),
                which our strict CSP connect-src 'self' blocks. The scene
                already has ambient + directional lights from SceneBackground,
                so lighting still works — just without image-based reflections.
                To restore IBL, either self-host the .hdr file or add the CDN
                URL to connect-src in index.html + deploy configs. */}
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}
