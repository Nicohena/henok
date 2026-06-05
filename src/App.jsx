import { useEffect, useRef } from 'react'
import MainScene from './components/MainScene'
import ProjectsSection from './components/ProjectsSection'

function App() {
  const bgRef = useRef(null)

  // Change page background color as user scrolls into about section
  useEffect(() => {
    const onScroll = () => {
      const t = Math.min(window.scrollY / (window.innerHeight * 0.75), 1)
      if (bgRef.current) {
        // Interpolate from cream to dark blue
        const r = Math.round(245 + (5 - 245) * t)
        const g = Math.round(240 + (5 - 240) * t)
        const b = Math.round(232 + (26 - 232) * t)
        bgRef.current.style.background = `rgb(${r},${g},${b})`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={bgRef} style={{ background: '#f5f0e8' }}>
      <div style={{ position: 'relative', height: '200vh' }}>
        <MainScene />
      </div>
      <ProjectsSection />
    </div>
  )
}

export default App
