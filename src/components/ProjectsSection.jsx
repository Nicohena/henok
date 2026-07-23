import { lazy, Suspense, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { projects } from '../data/projects'
import PreviewCard from './PreviewCard'
import './ProjectsSection.css'

const ProjectOverlay = lazy(() => import('./ProjectOverlay'))

export default function ProjectsSection() {
  // Read/write the selected project ID from the URL query string.
  // Example: /?project=cubewar opens the Gojo overlay.
  // Closing the overlay removes the param, leaving the user on /.
  // This makes projects deep-linkable, supports browser back/forward,
  // and survives page refresh.
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('project')

  // Resolve the selected project object from the ID. useMemo so we
  // don't re-filter the array on every render.
  const selectedProject = useMemo(() => {
    if (!selectedId) return null
    return projects.find((p) => p.id === selectedId) || null
  }, [selectedId])

  // Open: set ?project=<id> in the URL (preserves any other params).
  const handleSelect = useCallback((project) => {
    setSearchParams(
      (prev) => {
        prev.set('project', project.id)
        return prev
      },
      { replace: false } // push to history so back button closes overlay
    )
  }, [setSearchParams])

  // Close: remove ?project from the URL.
  const handleClose = useCallback(() => {
    setSearchParams(
      (prev) => {
        prev.delete('project')
        return prev
      },
      { replace: false }
    )
  }, [setSearchParams])

  return (
    <>
      <section className="projects-section" id="projects">
        {/* Heading */}
        <div className="projects-header">
          <span className="projects-banner">Selected</span>
          <h2 className="projects-title">Projects</h2>
        </div>

        {/* Card grid */}
        <div className="projects-grid">
          {projects.map((project) => (
            <PreviewCard
              key={project.id}
              project={project}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </section>

      {/* Full-screen detail overlay — rendered only when URL has ?project=... */}
      {selectedProject && (
        <Suspense fallback={null}>
          <ProjectOverlay
            project={selectedProject}
            onClose={handleClose}
            onSelectProject={handleSelect}
          />
        </Suspense>
      )}
    </>
  )
}
