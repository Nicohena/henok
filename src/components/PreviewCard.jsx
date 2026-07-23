import { memo } from 'react'
import './PreviewCard.css'

const PreviewCard = memo(function PreviewCard({ project, onSelect }) {
  const handleKeyDown = (e) => {
    // Button elements already handle Enter and Space natively, but
    // we keep this defensive in case the element type changes.
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(project)
    }
  }

  return (
    <button
      type="button"
      className="preview-card"
      onClick={() => onSelect(project)}
      onKeyDown={handleKeyDown}
      aria-label={`View ${project.title} project details`}
    >
      {/* Thumbnail */}
      <div className="preview-card-top">
        <div className="preview-card-image-wrapper">
          <div className="preview-card-image-container">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="preview-card-image"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        {/* Hover overlay with arrow */}
        <div className="preview-card-overlay">
          <span className="preview-card-arrow-btn" aria-hidden="true">→</span>
        </div>
      </div>

      {/* Text */}
      <div className="preview-card-content">
        <h3 className="preview-card-title">{project.title}</h3>
        <p className="preview-card-description">{project.shortDesc}</p>
      </div>
    </button>
  )
})

export default PreviewCard
