import thumbnailStreakon from '../assets/thumbnails/streakon.webp'
import thumbnel_for_gojo from '../assets/images/projects/cubewar/thumbnel_for_gojo.webp'
import thumbnail from '../assets/images/projects/pokedex/thumbnail.webp'
import thumbnailQuibbo from '../assets/thumbnails/quibbo.webp'
import thumbnailSharkie from '../assets/thumbnails/sharkie.webp'

export const projects = [
  {
    id: 'streakon',
    title: 'Smart Campus',
    shortDesc: 'University campus management system',
    description:
      'University campus management system for Students, Staff, Proctors, Admin, and Maintenance teams. Includes full RBAC, AI Campus Assistant powered by DeepSeek API, dorm room booking, inventory and key circulation, digital ID replacement, semester clearance, and a device security registry.',
    thumbnail: thumbnailStreakon,
    tags: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'WebSockets'],
    theme: 'dark',
    github: '',
    live: '',
  },
  {
    id: 'cubewar',
    title: 'Gojo',
    shortDesc: 'Property rental marketplace',
    description:
      'MERN property rental marketplace for Tenants, Owners, and Admins. Supports geospatial search, radius filtering, Leaflet maps, complete booking flow, real-time Socket.io notifications, Stripe payments, Cloudinary image management, reviews, ratings, and verified listing badges.',
    thumbnail: thumbnel_for_gojo,
    tags: ['React', 'Node.js', 'MongoDB', 'WebSockets', 'Stripe', 'Cloudinary'],
    theme: 'dark',
    github: 'https://github.com/Nicohena/Gojo.git',
    live: '',
  },
  {
    id: 'quibbo',
    title: 'Minilleum E-Learning',
    shortDesc: 'Online learning platform',
    description:
      'E-learning platform for Students, Teachers, and Admins. Supports video streaming, assignment submission and grading, live class scheduling, 1000+ learning resources, performance tracking, grade visualization, certificate generation, and real-time communication.',
    thumbnail: thumbnailQuibbo,
    tags: ['React', 'PHP', 'MySQL', 'Node.js', 'WebSockets'],
    theme: 'light',
    github: '',
    live: '',
  },
  {
    id: 'sharkie',
    title: 'Green Harvest Solution',
    shortDesc: 'Agricultural e-commerce platform',
    description:
      'Agricultural e-commerce platform for Buyers, Farmers, Delivery Partners, and Admins. Built on a 22-table PostgreSQL schema with real-time order tracking, proof-of-delivery workflows, farmer product lifecycle management, payment integration, and an admin analytics dashboard.',
    thumbnail: thumbnailSharkie,
    tags: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind'],
    theme: 'light',
    github: '',
    live: '',
  },
  {
    id: 'pokedex',
    title: 'Gebeta',
    shortDesc: 'Digital restaurant management system',
    description:
      'Digital restaurant management system with a public customer menu and protected admin dashboard. Features 5-language support, multi-currency pricing with real-time exchange rates, rich menu item management, Supabase real-time subscriptions, dark mode, and responsive mobile-first interface.',
    thumbnail: thumbnail,
    tags: ['Next.js', 'TypeScript', 'Tailwind', 'Supabase', 'PostgreSQL'],
    theme: 'light',
    github: 'https://github.com/Nicohena/Gebeta.git',
    live: '',
  },
]
