import { useState, useEffect } from 'react'
import './Navbar.css'

// Section definitions: id, label, and which color theme the section uses
const SECTIONS = [
  { id: 'hero',     label: 'Home',     theme: 'light' },
  { id: 'about',    label: 'About',    theme: 'dark'  },
  { id: 'projects', label: 'Projects', theme: 'light'  },
  { id: 'contact',  label: 'Contact',  theme: 'light' },
]

export default function Navbar() {
  const [activeId, setActiveId] = useState('hero')
  const [theme, setTheme]       = useState('light')

  // Detect active section via scroll position
  useEffect(() => {
    let rafId = null
    const onScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const scrollMid = window.scrollY + window.innerHeight * 0.4

        let current = SECTIONS[0]
        for (const section of SECTIONS) {
          const el = document.getElementById(section.id)
          if (el && el.offsetTop <= scrollMid) {
            current = section
          }
        }

        setActiveId(current.id)
        setTheme(current.theme)
      })
    }

    // Run once on mount
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const handleNav = (e, id) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`navbar theme-${theme}`} aria-label="Main navigation">
      <div className="navbar-pill">
        {SECTIONS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`nav-item${activeId === id ? ' active' : ''}`}
            onClick={(e) => handleNav(e, id)}
            aria-current={activeId === id ? 'page' : undefined}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  )
}
