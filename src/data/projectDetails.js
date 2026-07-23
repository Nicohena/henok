import Admin from '../assets/images/projects/streakon/Admin.webp'
import Authentication from '../assets/images/projects/streakon/Authentication.webp'
import hero from '../assets/images/projects/streakon/hero.webp'
import student from '../assets/images/projects/streakon/student.webp'


import payment from '../assets/images/projects/cubewar/payment.webp'
import notification from '../assets/images/projects/cubewar/notification.webp'
import authentication from '../assets/images/projects/cubewar/authentication.webp'
import adminDashboard from '../assets/images/projects/cubewar/admin-dashboard.webp'
import landingPage from '../assets/images/projects/cubewar/landingpage.webp'
import chatpage from '../assets/images/projects/cubewar/chatpage.webp'


import admin from '../assets/images/projects/quibbo/admindashboard.webp'
import ai from '../assets/images/projects/quibbo/ai_assistant.webp'
import content from '../assets/images/projects/quibbo/content_creation.webp'
import certificate from '../assets/images/projects/quibbo/certificates_and_acheievements.webp'
import discussion from '../assets/images/projects/quibbo/disussion.webp'
import messages from '../assets/images/projects/quibbo/messages.webp'


import sharkie0 from '../assets/images/projects/sharkie/sharkie-0.webp'
import sharkie1 from '../assets/images/projects/sharkie/sharkie-1.webp'
import sharkie2 from '../assets/images/projects/sharkie/sharkie-2.webp'
import sharkie3 from '../assets/images/projects/sharkie/sharkie-3.webp'
import sharkie4 from '../assets/images/projects/sharkie/sharkie-4.webp'

import admindash from '../assets/images/projects/pokedex/admindash.webp'
import saveditems from '../assets/images/projects/pokedex/saveditems.webp'
import items from '../assets/images/projects/pokedex/items.webp'
import itemdetail from '../assets/images/projects/pokedex/itemdetail.webp'

import videoCubewar from '../assets/videos/cubewar.mp4'
import videoSharkie from '../assets/videos/sharkie.mp4'
import quiz from '../assets/videos/quiz.mp4'
import menu from '../assets/videos/menu.mp4'


export const projectDetailsById = {
  'smart-campus': [
    { type: 'image', src: hero, alt: 'Hero section', caption: 'Hero section' },
    { type: 'image', src: Authentication, alt: 'Authentication', caption: 'Authentication' },
    { type: 'image', src: student, alt: 'Student dashboard', caption: 'Student dashboard' },
    { type: 'image', src: Admin, alt: 'Admin dashboard', caption: 'Admin dashboard' },
  ],
  gojo: [
    { type: 'video', src: videoCubewar, caption: 'Rental marketplace workflow' },
    { type: 'image', src: landingPage, alt: 'Landing page', caption: 'Landing page' },
    { type: 'image', src: chatpage, alt: 'Messenger', caption: 'Messenger' },
    { type: 'image', src: authentication, alt: 'Authentication', caption: 'Authentication' },
    { type: 'image', src: adminDashboard, alt: 'Admin dashboard', caption: 'Admin dashboard' },
    { type: 'image', src: payment, alt: 'Payments', caption: 'Payments' },
    { type: 'image', src: notification, alt: 'Real-time notifications', caption: 'Real-time notifications' },
  ],
  millennium: [
    { type: 'video', src: quiz, caption: 'Taking a quiz', className: 'quiz-video' },
    { type: 'image', src: content, alt: 'Content creation', caption: 'Content creation', fit: 'contain' },
    { type: 'image', src: admin, alt: 'Admin dashboard', caption: 'Admin dashboard', fit: 'contain' },
    { type: 'image', src: ai, alt: 'AI assistant', caption: 'AI assistant', fit: 'contain' },
    { type: 'image', src: certificate, alt: 'Certificates and achievements', caption: 'Certificates and achievements', fit: 'contain' },
    { type: 'image', src: discussion, alt: 'Discussion forums', caption: 'Discussion forums', fit: 'contain' },
    { type: 'image', src: messages, alt: 'Messages', caption: 'Messages', fit: 'contain' },
  ],
  'green-harvest': [
    { type: 'video', src: videoSharkie, caption: 'Agricultural marketplace workflow' },
    { type: 'image', src: sharkie0, alt: 'Marketplace catalog', caption: 'Marketplace catalog' },
    { type: 'image', src: sharkie1, alt: 'Farmer product management', caption: 'Farmer product management' },
    { type: 'image', src: sharkie2, alt: 'Order tracking', caption: 'Order tracking' },
    { type: 'image', src: sharkie3, alt: 'Delivery proof workflow', caption: 'Delivery proof workflow' },
    { type: 'image', src: sharkie4, alt: 'Admin analytics', caption: 'Admin analytics' },
  ],
  gebeta: [
    { type: 'video', src: menu, caption: 'Menu exploration' },
    { type: 'image', src: items, alt: 'Customer menu', caption: 'Customer menu' },
    { type: 'image', src: admindash, alt: 'Admin dashboard', caption: 'Admin dashboard' },
    { type: 'image', src: saveditems, alt: 'Saved items', caption: 'Saved items' },
    { type: 'image', src: itemdetail, alt: 'Item detail', caption: 'Item detail' },
  ],
}
