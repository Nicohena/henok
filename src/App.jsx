import { useEffect, useRef, lazy, Suspense, useState, useCallback, useMemo } from "react";
import Navbar from "./components/Navbar";
import TopRightActions from "./components/TopRightActions";
import LoadingScreen from "./components/LoadingScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import { useScrollProgress } from "./hooks/useScrollProgress";

const MainScene = lazy(() => import("./components/MainScene"));
// Lazy-load below-the-fold sections — defers their JS parse cost until needed
const ProjectsSection = lazy(() => import("./components/ProjectsSection"));
const ContactSection  = lazy(() => import("./components/ContactSection"));

function LazyWhenNear({ children, rootMargin = "600px 0px" }) {
  const ref = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  return <div ref={ref}>{shouldRender ? children : null}</div>;
}

/**
 * HeroErrorBoundary — wraps the 3D hero scene with an ErrorBoundary that:
 *   1. Calls `onError` when the scene fails (so App can dismiss the loading
 *      screen and not leave the user staring at a progress bar forever).
 *   2. Renders the static HeroFallback in place of the crashed scene.
 *
 * This is its own component (rather than inline in App) so the fallback
 * JSX is only created when actually needed — keeping the happy path lean.
 */
function HeroErrorBoundary({ onError, children }) {
  return (
    <ErrorBoundary fallback={<HeroFallback />} onError={onError}>
      {children}
    </ErrorBoundary>
  )
}

/**
 * Static fallback shown if the 3D hero scene fails to load or render
 * (WebGL unsupported, GLB corrupt, GPU context lost, etc.).
 * Preserves the core portfolio message — name, role, and a CTA — so the
 * site is still functional even when 3D is unavailable.
 */
function HeroFallback() {
  return (
    <div
      style={{
        position: "absolute",
        top: "35vh",
        left: "10vw",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "1rem",
      }}
    >
      <h1
        style={{
          display: "flex",
          flexDirection: "column",
          margin: 0,
          fontFamily: "'Urbanist', sans-serif",
          fontSize: "clamp(3.2rem, 7vw, 7rem)",
          fontWeight: 600,
          color: "#2a2a2a",
          lineHeight: 1,
          letterSpacing: "1.5px",
        }}
      >
        <span>Henok</span>
        <span>Kebede</span>
      </h1>
      <div
        style={{
          backgroundColor: "#38257a",
          color: "#ffffff",
          fontFamily: "'Courier New', monospace",
          fontSize: "clamp(1rem, 2vw, 1.8rem)",
          fontWeight: 700,
          padding: "0.5rem 1.5rem",
          transform: "rotate(-4deg)",
          boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.15)",
          letterSpacing: "1px",
        }}
      >
        FULL-STACK DEVELOPER
      </div>
      <p
        style={{
          marginTop: "1rem",
          color: "#666",
          fontFamily: "'Urbanist', sans-serif",
          fontSize: "1rem",
          maxWidth: "400px",
          lineHeight: 1.6,
        }}
      >
        Builds immersive 3D web experiences and interactive systems that are
        fast, responsive, and fun to use.
      </p>
      <p
        style={{
          marginTop: "0.5rem",
          color: "#999",
          fontFamily: "'Urbanist', sans-serif",
          fontSize: "0.85rem",
        }}
      >
        (3D scene unavailable — showing static fallback)
      </p>
    </div>
  );
}

/**
 * Fallback for the contact section if its 3D scene fails.
 * Preserves the "Let's work together" message and social links.
 */
function ContactFallback() {
  return (
    <section
      id="contact"
      style={{
        position: "relative",
        width: "100vw",
        minHeight: "100vh",
        background: "#e8dfd0",
        display: "flex",
        alignItems: "center",
        padding: "5rem 4rem",
      }}
    >
      <div style={{ maxWidth: "400px" }}>
        <h2
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 900,
            color: "#1a1a1a",
            lineHeight: 1.1,
            margin: "0 0 2rem 0",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
          }}
        >
          Let's work
          <br />
          together!
        </h2>
        <p
          style={{
            color: "#666",
            fontFamily: "'Urbanist', sans-serif",
            fontSize: "0.85rem",
            margin: 0,
          }}
        >
          (3D scene unavailable — scroll down for contact links)
        </p>
      </div>
    </section>
  );
}

function App() {
  const bgRef = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0)
  const [isLoaded, setIsLoaded]         = useState(false)
  // If the hero scene fails to load, dismiss the loading screen so the
  // user isn't stuck staring at a progress bar forever.
  const [heroFailed, setHeroFailed]     = useState(false)

  const handleProgress = useCallback((p) => setLoadProgress(p), [])
  const handleLoaded   = useCallback(() => setIsLoaded(true), [])
  // Dismiss loading screen if hero fails — fallback can render without it.
  // The HeroErrorBoundary component below calls onError when it catches,
  // which sets heroFailed=true, which dismisses the loading screen
  // (handled inline in the JSX below — no separate effect needed).
  const handleHeroError = useCallback(() => setHeroFailed(true), [])

  // Shared scroll listener — used to interpolate page background color
  // from cream (#f5f0e8) at top to dark (#0f0f0f) as user scrolls into
  // the about section. Precompute start/end RGB tuples once.
  const { progress } = useScrollProgress()
  const bgStart = useMemo(() => ({ r: 245, g: 240, b: 232 }), [])
  const bgEnd   = useMemo(() => ({ r: 15,  g: 15,  b: 15  }), [])
  useEffect(() => {
    if (!bgRef.current) return
    const { r: sr, g: sg, b: sb } = bgStart
    const { r: er, g: eg, b: eb } = bgEnd
    const r = Math.round(sr + (er - sr) * progress)
    const g = Math.round(sg + (eg - sg) * progress)
    const b = Math.round(sb + (eb - sb) * progress)
    bgRef.current.style.background = `rgb(${r},${g},${b})`
  }, [progress, bgStart, bgEnd])

  return (
    <>
      {/* Loading screen is hidden when: scene loaded OR hero failed.
          If hero failed, the static HeroFallback renders immediately,
          so the loading screen must also disappear to reveal it. */}
      <LoadingScreen progress={loadProgress} isVisible={!isLoaded && !heroFailed} />
      <div ref={bgRef} style={{ background: "#f5f0e8" }}>
        <Navbar />
        <TopRightActions />
        <div id="hero" style={{ position: "relative", height: "200vh" }}>
          <HeroErrorBoundary onError={handleHeroError}>
            <Suspense fallback={null}>
              <MainScene onProgress={handleProgress} onLoaded={handleLoaded} />
            </Suspense>
          </HeroErrorBoundary>
        </div>
        <div id="projects">
          <LazyWhenNear>
            <ErrorBoundary fallback={<div />}>
              <Suspense fallback={null}>
                <ProjectsSection />
              </Suspense>
            </ErrorBoundary>
            <ErrorBoundary fallback={<ContactFallback />}>
              <Suspense fallback={null}>
                <ContactSection />
              </Suspense>
            </ErrorBoundary>
          </LazyWhenNear>
        </div>
      </div>
    </>
  );
}

export default App;
