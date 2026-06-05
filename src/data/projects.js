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
import cubewar4 from '../assets/images/projects/cubewar/cubewar-4.webp'
import cubewar5 from '../assets/images/projects/cubewar/cubewar-5.webp'

import quibbo0 from '../assets/images/projects/quibbo/quibbo-0.webp'
import quibbo1 from '../assets/images/projects/quibbo/quibbo-1.webp'
import quibbo2 from '../assets/images/projects/quibbo/quibbo-2.webp'
import quibbo3 from '../assets/images/projects/quibbo/quibbo-3.webp'
import quibbo4 from '../assets/images/projects/quibbo/quibbo-4.webp'
import quibbo5 from '../assets/images/projects/quibbo/quibbo-5.webp'

import sharkie0 from '../assets/images/projects/sharkie/sharkie-0.webp'
import sharkie1 from '../assets/images/projects/sharkie/sharkie-1.webp'
import sharkie2 from '../assets/images/projects/sharkie/sharkie-2.webp'
import sharkie3 from '../assets/images/projects/sharkie/sharkie-3.webp'
import sharkie4 from '../assets/images/projects/sharkie/sharkie-4.webp'

import pokedex0 from '../assets/images/projects/pokedex/pokedex-0.webp'
import pokedex1 from '../assets/images/projects/pokedex/pokedex-1.webp'
import pokedex2 from '../assets/images/projects/pokedex/pokedex-2.webp'
import pokedex3 from '../assets/images/projects/pokedex/pokedex-3.webp'

import videoCubewar from '../assets/videos/cubewar.mp4'
import videoQuibbo from '../assets/videos/quibbo.mp4'
import videoSharkie from '../assets/videos/sharkie.mp4'
import videoPokedex from '../assets/videos/pokedex.mp4'

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
    components: [
      { type: 'image', src: streakon0, alt: 'Campus management dashboard', caption: 'Campus management dashboard' },
      { type: 'image', src: streakon1, alt: 'Dorm and clearance modules', caption: 'Dorm and clearance modules' },
      { type: 'image', src: streakon2, alt: 'AI campus assistant', caption: 'AI campus assistant' },
      { type: 'image', src: streakon3, alt: 'Role-based workflows', caption: 'Role-based workflows' },
    ],
  },
  {
    id: 'cubewar',
    title: 'House Rental Platform',
    shortDesc: 'Property rental marketplace',
    description:
      'MERN property rental marketplace for Tenants, Owners, and Admins. Supports geospatial search, radius filtering, Leaflet maps, complete booking flow, real-time Socket.io notifications, Stripe payments, Cloudinary image management, reviews, ratings, and verified listing badges.',
    thumbnail: thumbnailCubewar,
    tags: ['React', 'Node.js', 'MongoDB', 'WebSockets', 'Stripe', 'Cloudinary'],
    theme: 'dark',
    github: '',
    live: '',
    components: [
      { type: 'video', src: videoCubewar, caption: 'Rental marketplace workflow' },
      { type: 'image', src: cubewar0, alt: 'Property discovery', caption: 'Property discovery' },
      { type: 'image', src: cubewar1, alt: 'Map-based search', caption: 'Map-based search' },
      { type: 'image', src: cubewar2, alt: 'Booking and authentication', caption: 'Booking and authentication' },
      { type: 'image', src: cubewar3, alt: 'Responsive rental experience', caption: 'Responsive rental experience' },
      { type: 'image', src: cubewar4, alt: 'Payments and reviews', caption: 'Payments and reviews' },
      { type: 'image', src: cubewar5, alt: 'Real-time notifications', caption: 'Real-time notifications' },
    ],
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
    components: [
      { type: 'video', src: videoQuibbo, caption: 'Learning platform experience' },
      { type: 'image', src: quibbo0, alt: 'Student dashboard', caption: 'Student dashboard' },
      { type: 'image', src: quibbo1, alt: 'Live classes', caption: 'Live classes' },
      { type: 'image', src: quibbo2, alt: 'Assignments and grading', caption: 'Assignments and grading' },
      { type: 'image', src: quibbo3, alt: 'Learning resources', caption: 'Learning resources' },
      { type: 'image', src: quibbo4, alt: 'Responsive learning UI', caption: 'Responsive learning UI' },
      { type: 'image', src: quibbo5, alt: 'Progress tracking', caption: 'Progress tracking' },
    ],
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
    components: [
      { type: 'video', src: videoSharkie, caption: 'Agricultural marketplace workflow' },
      { type: 'image', src: sharkie0, alt: 'Marketplace catalog', caption: 'Marketplace catalog' },
      { type: 'image', src: sharkie1, alt: 'Farmer product management', caption: 'Farmer product management' },
      { type: 'image', src: sharkie2, alt: 'Order tracking', caption: 'Order tracking' },
      { type: 'image', src: sharkie3, alt: 'Delivery proof workflow', caption: 'Delivery proof workflow' },
      { type: 'image', src: sharkie4, alt: 'Admin analytics', caption: 'Admin analytics' },
    ],
  },
  {
    id: 'pokedex',
    title: 'Panda Kitchen Menu',
    shortDesc: 'Digital restaurant management system',
    description:
      'Digital restaurant management system with a public customer menu and protected admin dashboard. Features 5-language support, multi-currency pricing with real-time exchange rates, rich menu item management, Supabase real-time subscriptions, dark mode, and responsive mobile-first interface.',
    thumbnail: thumbnailPokedex,
    tags: ['Next.js', 'TypeScript', 'Tailwind', 'Supabase', 'PostgreSQL'],
    theme: 'light',
    github: '',
    live: '',
    components: [
      { type: 'video', src: videoPokedex, caption: 'Digital restaurant menu' },
      { type: 'image', src: pokedex0, alt: 'Customer menu', caption: 'Customer menu' },
      { type: 'image', src: pokedex1, alt: 'Admin dashboard', caption: 'Admin dashboard' },
      { type: 'image', src: pokedex2, alt: 'Multi-language menu', caption: 'Multi-language menu' },
      { type: 'image', src: pokedex3, alt: 'Responsive mobile design', caption: 'Responsive mobile design' },
    ],
  },
]
