import { useEffect, useRef, lazy, Suspense, useState, useCallback } from "react";
import Navbar from "./components/Navbar";
import TopRightActions from "./components/TopRightActions";
import LoadingScreen from "./components/LoadingScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollHint from "./components/ScrollHint";
import { subscribeScroll } from "./hooks/useScrollProgress";
import { contactLoader } from "./utils/contactLoader";

const MainScene = lazy(() => import("./components/MainScene"));
// Lazy-load below-the-fold sections — defers their JS parse cost until needed
const ProjectsSection = lazy(() => import("./components/ProjectsSection"));
const ContactSection  = lazy(() => import("./components/ContactSection"));

function LazyWhenNear({ children, rootMargin = "600px 0px" }) {
  const ref = useRef(null);
  const [shouldRender, setShouldRender] = useState(() => {
    if (typeof window !== "undefined" && window.location.search.includes("project=")) {
      return true;
    }
    return false;
  });

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
        top: "22vh",
        left: "clamp(1.25rem, 6vw, 10vw)",
        right: "1.25rem",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "1rem",
        maxWidth: "600px",
      }}
    >
      <h1
        style={{
          display: "flex",
          flexDirection: "column",
          margin: 0,
          fontFamily: "'Urbanist', sans-serif",
          fontSize: "clamp(2.4rem, 7vw, 7rem)",
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
          fontSize: "clamp(0.85rem, 2vw, 1.8rem)",
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
          fontSize: "clamp(0.9rem, 2vw, 1rem)",
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
 * Stable placeholder / fallback for the contact section.
 * Renders the same layout, background, and social links immediately so:
 *  1. #contact exists in the DOM for smooth scrolling from the navbar.
 *  2. No layout shifts or flashes when ContactSection finishes loading.
 */
function ContactPlaceholder({ isError = false }) {
  return (
    <section id="contact" className="contact-section">
      <div className="contact-content">
        <h2>Let's work<br />together!</h2>
        <div className="contact-links">
          <a href="mailto:henokkebede410@gmail.com" className="contact-icon-btn" aria-label="Email">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </a>
          <a href="https://github.com/Nicohena" target="_blank" rel="noopener noreferrer" className="contact-icon-btn" aria-label="GitHub">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>
          <a href="https://linkedin.com/in/henokkebede" target="_blank" rel="noopener noreferrer" className="contact-icon-btn" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href="https://x.com/NicoHena" target="_blank" rel="noopener noreferrer" className="contact-icon-btn" aria-label="X (Twitter)">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>
        {isError && (
          <p style={{ color: "#888", fontFamily: "'Urbanist', sans-serif", fontSize: "0.85rem", marginTop: "1rem" }}>
            (3D scene unavailable — contact links active above)
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * Shared Contact Loading Coordinator wrapper.
 * Triggers on natural scroll approach (~700px before reaching contact),
 * on navbar Contact click, or direct navigation on hash #contact.
 */
function LazyContactSection() {
  const [requested, setRequested] = useState(() =>
    contactLoader.isRequested() || (typeof window !== "undefined" && window.location.hash === "#contact")
  );
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#contact") {
      contactLoader.load();
    }

    const unsubscribe = contactLoader.subscribe(() => {
      setRequested(true);
    });

    if (!requested && sentinelRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            contactLoader.load();
            observer.disconnect();
          }
        },
        { rootMargin: "700px 0px" }
      );
      observer.observe(sentinelRef.current);
      return () => {
        observer.disconnect();
        unsubscribe();
      };
    }
    return unsubscribe;
  }, [requested]);

  return (
    <div ref={sentinelRef}>
      {requested ? (
        <ErrorBoundary fallback={<ContactPlaceholder isError />}>
          <Suspense fallback={<ContactPlaceholder />}>
            <ContactSection />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <ContactPlaceholder />
      )}
    </div>
  );
}

function App() {
  const bgRef = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0)
  const [isLoaded, setIsLoaded]         = useState(false)
  // If the hero scene fails to load, dismiss the loading screen so the
  // user isn't stuck staring at a progress bar forever.
  const [heroFailed, setHeroFailed]     = useState(false)

  // Dev-only test hook: `?p=NN` freezes the loading progress so specific
  // mascot phases can be captured deterministically. Inert in production.
  const devParam = import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get('p')
    : null
  const devForce = devParam === null ? null : Number(devParam)

  const handleProgress = useCallback((p) => setLoadProgress(devForce ?? p), [devForce])
  const handleLoaded   = useCallback(() => {
    if (devForce === null) setIsLoaded(true)
  }, [devForce])
  // Dismiss loading screen if hero fails — fallback can render without it.
  // The HeroErrorBoundary component below calls onError when it catches,
  // which sets heroFailed=true, which dismisses the loading screen
  // (handled inline in the JSX below — no separate effect needed).
  const handleHeroError = useCallback(() => setHeroFailed(true), [])

  // Direct DOM background subscription — updates background color directly
  // via the shared rAF scroll store without triggering App component re-renders.
  useEffect(() => {
    const sr = 245, sg = 240, sb = 232;
    const er = 15,  eg = 15,  eb = 15;
    const unsubscribe = subscribeScroll((scrollY, height) => {
      if (!bgRef.current) return;
      const t = Math.min(scrollY / (height * 0.75), 1);
      const r = Math.round(sr + (er - sr) * t);
      const g = Math.round(sg + (eg - sg) * t);
      const b = Math.round(sb + (eb - sb) * t);
      bgRef.current.style.background = `rgb(${r},${g},${b})`;
    });
    return unsubscribe;
  }, []);

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
          <ScrollHint isHeroLoaded={isLoaded || heroFailed} />
        </div>
        <div id="projects" style={{ minHeight: "100vh" }}>
          <LazyWhenNear>
            <ErrorBoundary fallback={<div />}>
              <Suspense fallback={null}>
                <ProjectsSection />
              </Suspense>
            </ErrorBoundary>
          </LazyWhenNear>
        </div>
        <LazyContactSection />
      </div>
    </>
  );
}

export default App;
