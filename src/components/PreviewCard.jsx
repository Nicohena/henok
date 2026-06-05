import './PreviewCard.css'

export default function PreviewCard({ project, onSelect }) {
  return (
    <div className="preview-card" onClick={() => onSelect(project)}>
      {/* Thumbnail */}
      <div className="preview-card-top">
        <div className="preview-card-image-wrapper">
          <div className="preview-card-image-container">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="preview-card-image"
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
    </div>
  )
}
