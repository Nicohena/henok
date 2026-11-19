
import thumbnailEngida from '../assets/thumbnails/engida.webp'
import thumbnailGojo from '../assets/images/projects/cubewar/thumbnel_for_gojo.webp'
import thumbnailGebeta from '../assets/images/projects/pokedex/thumbnail.webp'
import thumbnailMillennium from '../assets/thumbnails/quibbo.webp'
import thumbnailGreenHarvest from '../assets/thumbnails/sharkie.webp'
import thumbnailSmartCampus from '../assets/thumbnails/campus.webp'
import thumbnailGcode from '../assets/thumbnails/gcode.webp'

export const projects = [
   {
    id: 'engida',
    title: 'Engida',
    shortDesc: 'Property rental and selling online marketplace',
    description:
      'ENGIDA connects property seekers with property vendors, facilitating transparent and efficient real estate transactions in Ethiopia. The platform leverages modern web technologies and AI-powered intelligence to provide personalized recommendations, accurate price predictions, and a seamless user experience.',
    thumbnail: thumbnailEngida,
    tags: ['Next.js', 'Nest.js', 'PostgreSQL','FastAPI',  'Chapa', 'Cloudinary'],
    theme: 'light',
    github: 'https://github.com/Engida-Platform/Nicohena-Engida.git',
    live: 'engida-virid.vercel.app',
  },

   {
    id: 'gcode-lms',
    title: 'gCODE LMS',
    shortDesc: 'Learning Management System',
    description:
      'A learning platform for authoring, selling, and delivering structured courses. It combines a course studio, graded assessments, progress tracking, verified certificates, course-scoped discussions, analytics, and Chapa-powered payments in one modular monolith.',
    thumbnail: thumbnailGcode,
    tags: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'WebSockets'],
    theme: 'dark',
    github: '',
    live: '',
  },
   
   {
    id: 'gojo',
    title: 'Gojo',
    shortDesc: 'Property rental marketplace',
    description:
      'A MERN stack property rental marketplace for Tenants, Owners, and Admins. Supports geospatial search, radius filtering, Leaflet maps, complete booking flow, real-time Socket.io notifications, Stripe payments, Cloudinary image management, reviews, ratings, and verified listing badges.',
    thumbnail: thumbnailGojo,
    tags: ['React', 'Node.js', 'MongoDB', 'WebSockets', 'Stripe', 'Cloudinary'],
    theme: 'dark',
    github: 'https://github.com/Nicohena/Gojo.git',
    live: '',
  },
  {
    id: 'green-harvest',
    title: 'Green Harvest Solution',
    shortDesc: 'Agricultural e-commerce platform',
    description:
      'Agricultural e-commerce platform for Buyers, Farmers, Delivery Partners, and Admins. Built on PostgreSQL database with real-time order tracking, proof-of-delivery workflows, farmer product lifecycle management, payment integration, and an admin analytics dashboard built on collaboration with my friend.',
    thumbnail: thumbnailGreenHarvest,
    tags: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind'],
    theme: 'light',
    github: 'https://github.com/HabtamuShewamene/GREENHARVEST-SOLUTIONS.git',
    live: '',
  },
  {
    id: 'smart-campus',
    title: 'Smart Campus',
    shortDesc: 'University campus management system',
    description:
      'University campus management system for Students, Staff, Proctors, Admin, and Maintenance teams. Includes full RBAC, AI Campus Assistant powered by DeepSeek API, dorm room booking, inventory and key circulation, digital ID replacement, semester clearance, and a device security registry.',
    thumbnail: thumbnailSmartCampus,
    tags: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'WebSockets'],
    theme: 'dark',
    github: 'https://github.com/Nicohena/Smart-Campus-System.git',
    live: '',
  },

  {
    id: 'millennium',
    title: 'Millennium E-Learning',
    shortDesc: 'Online learning platform',
    description:
      'E-learning platform for Students, Teachers, and Admins. Supports video streaming, assignment submission and grading, live class scheduling, 1000+ learning resources, performance tracking, grade visualization, certificate generation, and real-time communication.',
    thumbnail: thumbnailMillennium,
    tags: ['Typescript','MongoDB', 'Nextjs', 'Node.js', 'WebSockets'],
    theme: 'light',
    github: 'https://github.com/Nicohena/Millineum-E-learning.git',
    live: '',
  },

  {
    id: 'gebeta',
    title: 'Gebeta',
    shortDesc: 'Digital restaurant management system',
    description:
      'A mobile-first digital restaurant management system with a public customer menu and protected admin dashboard. Features 5-language support, multi-currency pricing with real-time exchange rates, rich menu item management, Supabase real-time subscriptions, dark mode, and responsive mobile-first interface.',
    thumbnail: thumbnailGebeta,
    tags: ['Next.js', 'TypeScript', 'Tailwind', 'Supabase', 'PostgreSQL'],
    theme: 'light',
    github: 'https://github.com/Nicohena/Gebeta.git',
    live: '',
  },
]
