import { useEffect, useRef, useCallback } from 'react'
import { projects } from '../data/projects'
import { projectDetailsById } from '../data/projectDetails'
import './ProjectOverlay.css'

export default function ProjectOverlay({ project, onClose, onSelectProject }) {
  const overlayRef = useRef(null)
  const components = projectDetailsById[project.id] || []

  // Find the next project in the list
  const currentIndex = projects.findIndex((p) => p.id === project.id)
  const nextProject = projects[(currentIndex + 1) % projects.length]

  // Handle next-project navigation
  const handleNext = useCallback(() => {
    if (overlayRef.current) overlayRef.current.scrollTo({ top: 0, behavior: 'instant' })
    onSelectProject(nextProject)
  }, [nextProject, onSelectProject])

  // Lock page scroll & listen for Escape key
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    // Scroll overlay to top on open
    if (overlayRef.current) overlayRef.current.scrollTo(0, 0)

    return () => {
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose, project.id])

  const themeClass = project.theme === 'dark' ? 'theme-dark' : ''

  return (
    <>
      {/* Dark background blend */}
      <div className={`project-bg-blend visible`} onClick={onClose} />

      {/* Slide-up overlay */}
      <div
        ref={overlayRef}
        className={`project-overlay visible ${themeClass}`}
      >
        {/* Back button */}
        <button className="project-back-btn" onClick={onClose} aria-label="Back to projects">
          ←
        </button>

        {/* Close button */}
        <button className="project-close-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Fade-in wrapper */}
        <div className="project-content-fade">
          {/* Hero */}
          <div className="project-hero">
            <div>
              <div className="project-hero-title-wrapper">
                <h1 className="project-hero-title" key={project.id}>
                  {project.title}
                </h1>
              </div>
              <div className="project-hero-tags" style={{ marginTop: 14 }}>
                {project.tags.map((tag) => (
                  <span key={tag} className="project-tag">{tag}</span>
                ))}
              </div>
            </div>

            <p className="project-hero-description">{project.description}</p>

            {/* Buttons — only show if URLs exist */}
            {(project.live || project.github) && (
              <div className="project-hero-buttons">
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-btn project-btn-accent"
                  >
                    Live View
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-btn project-btn-border"
                  >
                    Source Code
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Media content */}
          <div className="project-media-section">
            {components.map((comp, i) => (
              <div
                key={i}
                className="project-media-block"
                style={comp.aspectRatio ? { aspectRatio: comp.aspectRatio } : undefined}
              >
                {comp.type === 'video' ? (
                  <video
                    src={comp.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className={comp.className || ''}
                  />
                ) : (
                  <img
                    src={comp.src}
                    alt={comp.alt || ''}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                {comp.caption && (
                  <span className="project-media-caption">{comp.caption}</span>
                )}
              </div>
            ))}
          </div>

          {/* Next project */}
          {nextProject && (
            <div className="project-next-wrapper">
              <button className="project-next-card" onClick={handleNext}>
                <img
                  src={nextProject.thumbnail}
                  alt={nextProject.title}
                  className="project-next-thumb"
                />
                <div className="project-next-info">
                  <p className="project-next-label">Next project:</p>
                  <h3 className="project-next-title">{nextProject.title}</h3>
                </div>
                <span className="project-next-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
