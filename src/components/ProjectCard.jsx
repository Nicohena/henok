export default function ProjectCard({ project, onClick }) {
  return (
    <div
      className="group cursor-pointer"
      onClick={() => onClick(project)}
    >
      {/* Thumbnail — fills card, rounded corners, no border */}
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
        <img
          src={project.thumbnail}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Text below image */}
      <div className="pt-3 pb-1">
        <h3 className="text-base font-semibold text-gray-900">{project.title}</h3>
        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{project.shortDesc}</p>
      </div>
    </div>
  )
}
