import { useEffect, useRef, lazy, Suspense, useState, useCallback } from "react";
import MainScene from "./components/MainScene";
import Navbar from "./components/Navbar";
import TopRightActions from "./components/TopRightActions";
import LoadingScreen from "./components/LoadingScreen";

// Lazy-load below-the-fold sections — defers their JS parse cost until needed
const ProjectsSection = lazy(() => import("./components/ProjectsSection"));
const ContactSection  = lazy(() => import("./components/ContactSection"));

function App() {
  const bgRef = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0)
  const [isLoaded, setIsLoaded]         = useState(false)

  const handleProgress = useCallback((p) => setLoadProgress(p), [])
  const handleLoaded   = useCallback(() => setIsLoaded(true), [])

  // Change page background color as user scrolls into about section
  useEffect(() => {
    let rafId = null
    const onScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const t = Math.min(window.scrollY / (window.innerHeight * 0.75), 1)
        if (bgRef.current) {
          const r = Math.round(245 + (15 - 245) * t)
          const g = Math.round(240 + (15 - 240) * t)
          const b = Math.round(232 + (15 - 232) * t)
          bgRef.current.style.background = `rgb(${r},${g},${b})`
        }
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <LoadingScreen progress={loadProgress} isVisible={!isLoaded} />
      <div ref={bgRef} style={{ background: "#f5f0e8" }}>
        <Navbar />
        <TopRightActions />
        <div id="hero" style={{ position: "relative", height: "200vh" }}>
          <MainScene onProgress={handleProgress} onLoaded={handleLoaded} />
        </div>
        <Suspense fallback={null}>
          <div id="projects">
            <ProjectsSection />
          </div>
          <ContactSection />
        </Suspense>
      </div>
    </>
  );
}

export default App;
