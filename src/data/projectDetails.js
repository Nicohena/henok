import streakon0 from '../assets/images/projects/streakon/streakon-0.webp'
import streakon1 from '../assets/images/projects/streakon/streakon-1.webp'
import streakon2 from '../assets/images/projects/streakon/streakon-2.webp'
import streakon3 from '../assets/images/projects/streakon/streakon-3.webp'
import Admin from '../assets/images/projects/streakon/Admin.png'
import Authentication from '../assets/images/projects/streakon/Authentication.png'
import hero from '../assets/images/projects/streakon/hero.png'
import student from '../assets/images/projects/streakon/student.png'


import payment from '../assets/images/projects/cubewar/payment.webp'
import notification from '../assets/images/projects/cubewar/notification.webp'
import authentication from '../assets/images/projects/cubewar/authentication.webp'
import adminDashboard from '../assets/images/projects/cubewar/admin-dashboard.webp'
import landingPage from '../assets/images/projects/cubewar/landingpage.webp'
import chatpage from '../assets/images/projects/cubewar/chatpage.webp'

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

import admindash from '../assets/images/projects/pokedex/admindash.webp'
import saveditems from '../assets/images/projects/pokedex/saveditems.webp'
import items from '../assets/images/projects/pokedex/items.webp'
import itemdetail from '../assets/images/projects/pokedex/itemdetail.webp'

import videoCubewar from '../assets/videos/cubewar.mp4'
import videoQuibbo from '../assets/videos/quibbo.mp4'
import videoSharkie from '../assets/videos/sharkie.mp4'
import videoPokedex from '../assets/videos/pokedex.mp4'
import quiz from '../assets/videos/quiz.mp4'


export const projectDetailsById = {
  streakon: [
    { type: 'image', src: hero, alt: 'Hero section', caption: 'Hero section' },
    { type: 'image', src: Authentication, alt: 'Authentication', caption: 'Authentication' },
    { type: 'image', src: student, alt: 'Student dashboard', caption: 'Student dashboard' },
    { type: 'image', src: Admin, alt: 'Admin dashboard', caption: 'Admin dashboard' },
  ],
  cubewar: [
    { type: 'video', src: videoCubewar, caption: 'Rental marketplace workflow' },
    { type: 'image', src: landingPage, alt: 'Landing page', caption: 'Landing page' },
    { type: 'image', src: chatpage, alt: 'Messenger', caption: 'Messenger' },
    { type: 'image', src: authentication, alt: 'Authentication', caption: 'Authentication' },
    { type: 'image', src: adminDashboard, alt: 'Admin dashboard', caption: 'Admin dashboard' },
    { type: 'image', src: payment, alt: 'Payments', caption: 'Payments' },
    { type: 'image', src: notification, alt: 'Real-time notifications', caption: 'Real-time notifications' },
  ],
  quibbo: [
    { type: 'video', src: quiz, caption: 'Taking a quiz', className: 'quiz-video' },
    { type: 'image', src: quibbo0, alt: 'Student dashboard', caption: 'Student dashboard' },
    { type: 'image', src: quibbo1, alt: 'Live classes', caption: 'Live classes' },
    { type: 'image', src: quibbo2, alt: 'Assignments and grading', caption: 'Assignments and grading' },
    { type: 'image', src: quibbo3, alt: 'Learning resources', caption: 'Learning resources' },
    { type: 'image', src: quibbo4, alt: 'Responsive learning UI', caption: 'Responsive learning UI' },
    { type: 'image', src: quibbo5, alt: 'Progress tracking', caption: 'Progress tracking' },
  ],
  sharkie: [
    { type: 'video', src: videoSharkie, caption: 'Agricultural marketplace workflow' },
    { type: 'image', src: sharkie0, alt: 'Marketplace catalog', caption: 'Marketplace catalog' },
    { type: 'image', src: sharkie1, alt: 'Farmer product management', caption: 'Farmer product management' },
    { type: 'image', src: sharkie2, alt: 'Order tracking', caption: 'Order tracking' },
    { type: 'image', src: sharkie3, alt: 'Delivery proof workflow', caption: 'Delivery proof workflow' },
    { type: 'image', src: sharkie4, alt: 'Admin analytics', caption: 'Admin analytics' },
  ],
  pokedex: [
    { type: 'video', src: videoPokedex, caption: 'Digital restaurant menu' },
    { type: 'image', src: items, alt: 'Customer menu', caption: 'Customer menu' },
    { type: 'image', src: admindash, alt: 'Admin dashboard', caption: 'Admin dashboard' },
    { type: 'image', src: saveditems, alt: 'Saved items', caption: 'Saved items' },
    { type: 'image', src: itemdetail, alt: 'Item detail', caption: 'Item detail' },
  ],
}
