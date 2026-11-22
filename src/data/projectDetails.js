import engidaHome from '../assets/images/projects/engida/homepage.webp'
import engidaAdmin from '../assets/images/projects/engida/admindashboard.webp'

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

import adminOverview from '../assets/images/projects/sharkie/Admindash.webp'
import sellerDashboard from '../assets/images/projects/sharkie/seller_dashboard.webp'
import storeDecoration from '../assets/images/projects/sharkie/store_decoration.webp'

import admindash from '../assets/images/projects/pokedex/admindash.webp'
import saveditems from '../assets/images/projects/pokedex/saveditems.webp'
import items from '../assets/images/projects/pokedex/items.webp'
import itemdetail from '../assets/images/projects/pokedex/itemdetail.webp'
import qr from '../assets/images/projects/pokedex/QR.png'



import studentdashboard from '../assets/images/projects/gcode/studentdashboard.webp'
import admindashboard from '../assets/images/projects/gcode/admindshboard.webp'
import coursecreation from '../assets/images/projects/gcode/coursecreation.webp'
import gcodecertificate from '../assets/images/projects/gcode/certificate.webp'

export const projectDetailsById = {
  engida: [
    {
      type: 'video',
      src: 'https://res.cloudinary.com/dszqyplnn/video/upload/v1794987753/Engida_vid.mp4',
      caption: 'Platform overview & property marketplace workflow',
      fit: 'cover',
      objectPosition: 'top',
      aspectRatio: '1920 / 950',
    },
    {
      type: 'image',
      src: engidaHome,
      alt: 'Engida homepage & property discovery',
      caption: 'Homepage & property discovery',
      fit: 'contain',
      aspectRatio: '1901 / 904',
    },
    {
      type: 'image',
      src: engidaAdmin,
      alt: 'Engida admin dashboard',
      caption: 'Admin dashboard & management',
      fit: 'contain',
      aspectRatio: '1889 / 940',
    },
  ],
  'smart-campus': [
    { type: 'image', src: hero, alt: 'Hero section', caption: 'Hero section' },
    { type: 'image', src: Authentication, alt: 'Authentication', caption: 'Authentication' },
    { type: 'image', src: student, alt: 'Student dashboard', caption: 'Student dashboard' },
    { type: 'image', src: Admin, alt: 'Admin dashboard', caption: 'Admin dashboard' },
  ],
  gojo: [
   
    { type: 'image', src: landingPage, alt: 'Landing page', caption: 'Landing page' },
    { type: 'image', src: chatpage, alt: 'Messenger', caption: 'Messenger' },
    { type: 'image', src: authentication, alt: 'Authentication', caption: 'Authentication' },
    { type: 'image', src: adminDashboard, alt: 'Admin dashboard', caption: 'Admin dashboard' },
    { type: 'image', src: payment, alt: 'Payments', caption: 'Payments' },
    { type: 'image', src: notification, alt: 'Real-time notifications', caption: 'Real-time notifications' },
  ],
  millennium: [
    {
      type: 'video',
      src: 'https://res.cloudinary.com/cczrrt17/video/upload/v1794753474/quiz.mp4',
      caption: 'Taking a quiz',
      className: 'quiz-video',
    },
    { type: 'image', src: content, alt: 'Content creation', caption: 'Content creation', fit: 'contain' },
    { type: 'image', src: admin, alt: 'Admin dashboard', caption: 'Admin dashboard', fit: 'contain' },
    { type: 'image', src: ai, alt: 'AI assistant', caption: 'AI assistant', fit: 'contain' },
    { type: 'image', src: certificate, alt: 'Certificates and achievements', caption: 'Certificates and achievements', fit: 'contain' },
    { type: 'image', src: discussion, alt: 'Discussion forums', caption: 'Discussion forums', fit: 'contain' },
    { type: 'image', src: messages, alt: 'Messages', caption: 'Messages', fit: 'contain' },
  ],
  'gcode-lms': [
    {
      type: 'video',
      src: 'https://res.cloudinary.com/cczrrt17/video/upload/v1794752102/lv_0_20261115152530_1.mp4',
      caption: 'Content creation & discovery',
      fit: 'contain',
    },
    { type: 'image', src: studentdashboard, alt: 'Student dashboard', caption: 'Student dashboard', fit: 'contain', aspectRatio: '1897 / 937' },
    { type: 'image', src: admindashboard, alt: 'Admin dashboard', caption: 'Admin dashboard', fit: 'contain', aspectRatio: '1902 / 857' },
    { type: 'image', src: coursecreation, alt: 'Course creation', caption: 'Course creation', fit: 'contain', aspectRatio: '1906 / 857' },
    { type: 'image', src: gcodecertificate, alt: 'Certificate', caption: 'Certificate', fit: 'contain', aspectRatio: '1073 / 708' },
  ],
  'green-harvest': [
    {
        type: 'image',
      src: adminOverview,
      alt: 'Admin dashboard & business performance',
      caption: 'Admin dashboard & business performance',
      fit: 'contain',
      aspectRatio: '1919 / 938'
    },
    {
      type: 'image',
      src: sellerDashboard,
      alt: 'Seller Center & business performance dashboard',
      caption: 'Seller Center & business performance dashboard',
      fit: 'contain',
      aspectRatio: '1919 / 938',
    },
    {
      type: 'image',
      src: storeDecoration,
      alt: 'AgriWorkbench store decoration & visual builder',
      caption: 'AgriWorkbench store decoration & visual builder',
      fit: 'contain',
      aspectRatio: '1918 / 941',
    },
  ],
  gebeta: [
    {
      type: 'video',
      src: 'https://res.cloudinary.com/cczrrt17/video/upload/v1794753512/menu.mp4',
      caption: 'Menu exploration',
      fit: 'contain',
    },
    { type: 'image', src: qr, caption: 'QR image', fit: 'contain' },
    { type: 'image', src: items, alt: 'Customer menu', caption: 'Customer menu' },
    { type: 'image', src: admindash, alt: 'Admin dashboard', caption: 'Admin dashboard' },
    { type: 'image', src: saveditems, alt: 'Saved items', caption: 'Saved items' },
    { type: 'image', src: itemdetail, alt: 'Item detail', caption: 'Item detail' },
  ],
}
