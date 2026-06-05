import thumbnailStreakon from '../assets/thumbnails/streakon.webp'
import thumbnailCubewar from '../assets/thumbnails/cubewar.webp'
import thumbnailQuibbo from '../assets/thumbnails/quibbo.webp'
import thumbnailSharkie from '../assets/thumbnails/sharkie.webp'
import thumbnailPokedex from '../assets/thumbnails/pokedex.webp'

import streakon0 from '../assets/images/projects/streakon/streakon-0.webp'
import streakon1 from '../assets/images/projects/streakon/streakon-1.webp'
import streakon2 from '../assets/images/projects/streakon/streakon-2.webp'
import streakon3 from '../assets/images/projects/streakon/streakon-3.webp'

import cubewar0 from '../assets/images/projects/cubewar/cubewar-0.webp'
import cubewar1 from '../assets/images/projects/cubewar/cubewar-1.webp'
import cubewar2 from '../assets/images/projects/cubewar/cubewar-2.webp'
import cubewar3 from '../assets/images/projects/cubewar/cubewar-3.webp'

import quibbo0 from '../assets/images/projects/quibbo/quibbo-0.webp'
import quibbo1 from '../assets/images/projects/quibbo/quibbo-1.webp'
import quibbo2 from '../assets/images/projects/quibbo/quibbo-2.webp'
import quibbo3 from '../assets/images/projects/quibbo/quibbo-3.webp'

import sharkie0 from '../assets/images/projects/sharkie/sharkie-0.webp'
import sharkie1 from '../assets/images/projects/sharkie/sharkie-1.webp'
import sharkie2 from '../assets/images/projects/sharkie/sharkie-2.webp'
import sharkie3 from '../assets/images/projects/sharkie/sharkie-3.webp'

import pokedex0 from '../assets/images/projects/pokedex/pokedex-0.webp'
import pokedex1 from '../assets/images/projects/pokedex/pokedex-1.webp'
import pokedex2 from '../assets/images/projects/pokedex/pokedex-2.webp'
import pokedex3 from '../assets/images/projects/pokedex/pokedex-3.webp'

export const projects = [
  {
    id: 'streakon',
    title: 'Smart Campus',
    shortDesc: 'University campus management system',
    description: 'University campus management system for Students, Staff, Proctors, Admin, and Maintenance teams. Includes full RBAC, AI Campus Assistant powered by DeepSeek API, dorm room booking, inventory and key circulation, digital ID replacement, semester clearance, and a device security registry.',
    thumbnail: thumbnailStreakon,
    tags: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'WebSockets'],
    images: [streakon0, streakon1, streakon2, streakon3],
    github: '',
    live: '',
  },
  {
    id: 'cubewar',
    title: 'House Rental Platform',
    shortDesc: 'Property rental marketplace',
    description: 'MERN property rental marketplace for Tenants, Owners, and Admins. Supports geospatial search, radius filtering, Leaflet maps, complete booking flow, real-time Socket.io notifications, Stripe payments, Cloudinary image management, reviews, ratings, and verified listing badges.',
    thumbnail: thumbnailCubewar,
    tags: ['React', 'Node.js', 'MongoDB', 'WebSockets', 'Stripe', 'Cloudinary'],
    images: [cubewar0, cubewar1, cubewar2, cubewar3],
    github: '',
    live: '',
  },
  {
    id: 'quibbo',
    title: 'Minilleum E-Learning',
    shortDesc: 'Online learning platform',
    description: 'E-learning platform for Students, Teachers, and Admins. Supports video streaming, assignment submission and grading, live class scheduling, 1000+ learning resources, performance tracking, grade visualization, certificate generation, and real-time communication.',
    thumbnail: thumbnailQuibbo,
    tags: ['React', 'PHP', 'MySQL', 'Node.js', 'WebSockets'],
    images: [quibbo0, quibbo1, quibbo2, quibbo3],
    github: '',
    live: '',
  },
  {
    id: 'sharkie',
    title: 'Green Harvest Solution',
    shortDesc: 'Agricultural e-commerce platform',
    description: 'Agricultural e-commerce platform for Buyers, Farmers, Delivery Partners, and Admins. Built on a 22-table PostgreSQL schema with real-time order tracking, proof-of-delivery workflows, farmer product lifecycle management, payment integration, and an admin analytics dashboard.',
    thumbnail: thumbnailSharkie,
    tags: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind'],
    images: [sharkie0, sharkie1, sharkie2, sharkie3],
    github: '',
    live: '',
  },
  {
    id: 'pokedex',
    title: 'Panda Kitchen Menu',
    shortDesc: 'Digital restaurant management system',
    description: 'Digital restaurant management system with a public customer menu and protected admin dashboard. Features 5-language support, multi-currency pricing with real-time exchange rates, rich menu item management, Supabase real-time subscriptions, dark mode, and responsive mobile-first interface.',
    thumbnail: thumbnailPokedex,
    tags: ['Next.js', 'TypeScript', 'Tailwind', 'Supabase', 'PostgreSQL'],
    images: [pokedex0, pokedex1, pokedex2, pokedex3],
    github: '',
    live: '',
  },
]
