# Henok Kebede — 3D Portfolio

A 3D portfolio site featuring a character seated at a desk (Three.js / React Three Fiber), scroll-driven scene choreography, and a project gallery with full-screen detail overlays.

## Stack

- **Vite 8** + **React 19** — build tooling and UI framework
- **Three.js** + **@react-three/fiber** + **@react-three/drei** — 3D scene, GLB model loading, animations
- **OGL** — LightRays shader background
- **Tailwind CSS 4** — utility classes (used sparingly; most styles are colocated CSS)
- **React Router 7** — project overlay URL state (`/?project=<id>`)
- Self-hosted fonts: **Urbanist** (display/body) + **Pro Font Windows** (mono accents)

## Getting Started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build
npm run lint     # ESLint
```

## Project Structure

```
public/
  *.glb              # 3D models (Draco-compressed)
  music.mp3          # background audio (loaded on first interaction)
  *.woff2            # self-hosted fonts
src/
  App.jsx            # root: scroll-driven bg color, lazy sections, error boundaries
  main.jsx           # entry: BrowserRouter wrap
  index.css          # font tokens, global reset, reduced-motion rules
  hooks/
    useReducedMotion.js   # prefers-reduced-motion subscription
    useScrollProgress.js  # shared scroll listener (single source of truth)
  components/
    MainScene.jsx        # hero 3D canvas + about overlay (DOM)
    SceneContent.jsx     # character + desk, scroll-driven choreography
    SceneBackground.jsx  # sci-fi pedestal, rings, orbiting shards
    SceneLoader.jsx      # reports useProgress to LoadingScreen
    LightRays.jsx        # OGL shader background (about section)
    TiltWrapper.jsx      # 3D mouse-tilt for about cards
    Navbar.jsx           # scroll-aware themed nav pill
    TopRightActions.jsx  # "Get In Touch" + sound toggle
    LoadingScreen.jsx    # asset-loading overlay
    ProjectsSection.jsx  # project grid + URL-driven overlay mount
    PreviewCard.jsx      # keyboard-accessible project card (button element)
    ProjectOverlay.jsx   # full-screen project detail (slide-up panel)
    ContactSection.jsx   # 3D waving character + social links
    ContactScene.jsx     # contact 3D models
    ErrorBoundary.jsx    # class-based error boundary with fallback
  data/
    projects.js          # project metadata (id, title, tags, links)
    projectDetails.js    # per-project media (images + videos)
```

## Adding a New Project

1. Add project metadata to `src/data/projects.js` (id, title, description, tags, github/live URLs)
2. Add media (images + videos) to `src/assets/images/projects/<id>/` and `src/assets/videos/<id>.mp4`
3. Import the assets in `src/data/projectDetails.js` and add them to the `projectDetailsById` map
4. The project card appears automatically in the grid; the overlay opens at `/?project=<id>`

## Asset Pipeline

3D models in `public/` are Draco-compressed with `gltf-transform optimize --compress draco`.
Originals are backed up in `.backup/original-assets/` before compression.

Project images use `.webp` (converted from PNG with `cwebp -q 80`).
Project videos are re-encoded with `ffmpeg -crf 28 -preset slow -movflags +faststart`.

## Performance Notes

- Hero GLB models and fonts are preloaded via `<link rel="preload">` in `index.html`
- Below-the-fold sections (`ProjectsSection`, `ContactSection`) are `React.lazy()` + `IntersectionObserver`-gated
- `ContactSection`'s second WebGL canvas only mounts when scrolled near (saves GPU on initial load)
- All `<img>` use `loading="lazy"` + `decoding="async"`; videos use `preload="metadata"`
- `prefers-reduced-motion` freezes 3D choreography, disables LightRays, kills CSS animations

## Accessibility

- `prefers-reduced-motion` fully respected (3D + CSS + shader animations)
- Project cards are `<button>` elements with `aria-label` + `:focus-visible` ring
- All interactive elements have ARIA labels
- Overlay supports Escape key + body scroll lock

## Deployment

The build output in `dist/` is fully static. Deploy to any static host:

- **Vercel:** `vercel --prod` (auto-detects Vite)
- **Netlify:** build command `npm run build`, publish directory `dist`
- **GitHub Pages:** `npm run build` then push `dist/` to `gh-pages` branch

## License

MIT
