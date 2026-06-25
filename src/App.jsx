import { useEffect, useRef, lazy, Suspense, useState, useCallback } from "react";
import Navbar from "./components/Navbar";
import TopRightActions from "./components/TopRightActions";
import LoadingScreen from "./components/LoadingScreen";

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
          <Suspense fallback={null}>
            <MainScene onProgress={handleProgress} onLoaded={handleLoaded} />
          </Suspense>
        </div>
        <div id="projects">
          <LazyWhenNear>
            <Suspense fallback={null}>
              <ProjectsSection />
              <ContactSection />
            </Suspense>
          </LazyWhenNear>
        </div>
      </div>
    </>
  );
}

export default App;
