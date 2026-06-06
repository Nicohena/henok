import thumbnailStreakon from '../assets/thumbnails/streakon.webp'
import thumbnel_for_gojo from '../assets/images/projects/cubewar/thumbnel_for_gojo.png'
import thumbnail from '../assets/images/projects/pokedex/thumbnail.png'
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
import payment from '../assets/images/projects/cubewar/payment.png'
import notification from '../assets/images/projects/cubewar/notification.png'
import authentication from '../assets/images/projects/cubewar/authentication.png'
import admin_dashboard from '../assets/images/projects/cubewar/admin-dashboard.png'
import landing_page from '../assets/images/projects/cubewar/landingpage.png'
import chatpage from '../assets/images/projects/cubewar/chatpage.png'

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


import admindash from '../assets/images/projects/pokedex/admindash.png'
import preference from '../assets/images/projects/pokedex/preference.png'
import saveditems from '../assets/images/projects/pokedex/saveditems.png'
import items from '../assets/images/projects/pokedex/items.png'
import itemdetail from '../assets/images/projects/pokedex/itemdetail.png'

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
    title: 'Gojo',
    shortDesc: 'Property rental marketplace',
    description:
      'MERN property rental marketplace for Tenants, Owners, and Admins. Supports geospatial search, radius filtering, Leaflet maps, complete booking flow, real-time Socket.io notifications, Stripe payments, Cloudinary image management, reviews, ratings, and verified listing badges.',
    thumbnail: thumbnel_for_gojo,
    tags: ['React', 'Node.js', 'MongoDB', 'WebSockets', 'Stripe', 'Cloudinary'],
    theme: 'dark',
    github: 'https://github.com/Nicohena/Gojo.git',
    live: '',
    components: [
      { type: 'video', src: videoCubewar, caption: 'Rental marketplace workflow' },
      { type: 'image', src: landing_page, alt: 'Landing page', caption: 'Landing page' },
      { type: 'image', src: chatpage, alt: 'Messenger', caption: 'Messenger' },
      { type: 'image', src: authentication, alt: 'Authentication', caption: 'Authentication' },
      { type: 'image', src: admin_dashboard, alt: 'Admin dashboard', caption: 'Admin dashboard' },
      { type: 'image', src: payment, alt: 'Payments', caption: 'Payments' },
      { type: 'image', src: notification, alt: 'Real-time notifications', caption: 'Real-time notifications' },
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
    title: 'Gebeta',
    shortDesc: 'Digital restaurant management system',
    description:
      'Digital restaurant management system with a public customer menu and protected admin dashboard. Features 5-language support, multi-currency pricing with real-time exchange rates, rich menu item management, Supabase real-time subscriptions, dark mode, and responsive mobile-first interface.',
    thumbnail: thumbnail,
    tags: ['Next.js', 'TypeScript', 'Tailwind', 'Supabase', 'PostgreSQL'],
    theme: 'light',
    github: 'https://github.com/Nicohena/Gebeta.git',
    live: '',
    components: [
      { type: 'video', src: videoPokedex, caption: 'Digital restaurant menu' },
      { type: 'image', src: items, alt: 'Customer menu', caption: 'Customer menu' },
      { type: 'image', src: admindash, alt: 'Admin dashboard', caption: 'Admin dashboard' },
      { type: 'image', src: saveditems, alt: 'Saved items', caption: 'Saved items' },
      { type: 'image', src: itemdetail, alt: 'Item detail', caption: 'Item detail' },
    ],
  },
]
