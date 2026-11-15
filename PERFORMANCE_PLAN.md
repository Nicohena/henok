# Performance Analysis & Optimization Plan

**Project:** `/home/benoch/Projects/henok-1` — Henok Kebede portfolio  
**Production:** `https://henokkebede.pro.et/` — Vercel  
**Date:** 2026-11-14  
**Status:** Analysis complete. No application source files were modified while producing this plan. The only new file is this document.

---

## 0. TL;DR

The deployed site is not slow because of CSS, fonts, or project screenshots. It is slow because **the first usable hero frame waits on roughly 5.9 MB of 3D assets, including two full character models that are not needed yet**, and because the page keeps **multiple WebGL canvases and scroll-driven React renders alive after they leave the screen**.

Measured locally against a production build with an empty cache:

| Metric | Current |
|---|---:|
| Initial transfer | **6.18 MB** |
| Initial requests | **52** |
| Of that, character models | **~5.7 MB** (`typing`, `sitting`, `waving`) |
| Character texture data | **4 × 2048² per character**; ~89.5 MB GPU each |
| Initial JS | 1.14 MB raw / **315.6 KB gzip** |
| WebGL contexts at startup | **2** (loading mascot + hero) |
| WebGL contexts during “about” | **3** (loading mascot + hero + LightRays) |
| Scroll listeners | **5** (4 from `useScrollProgress`, 1 in Navbar) |
| Scroll-driven React renders | **4+ per animation frame** |

The live site is deployed on Vercel at **`https://henokkebede.pro.et/`**; production headers and deployment state are covered in §2.5 and §2.8.

The fastest high-impact sequence is:

1. **Stop preloading the contact scene and the full sitting model during the initial load.**
2. **Replace `sitting_and_talking.glb` with an animation-only file** (1.93 MB → ~89 KB).
3. **Resize and recompress the character textures** (1.82 MB → ~538 KB for the hero at 1024², ~371 KB for contact at 512², ~150 KB for the chair).
4. **Pause/unmount offscreen canvases and shader effects**, and **unmount the loading mascot after its fade**.
5. **Gate the loading screen on hero assets only**, and remove the unnecessary 400 ms delay.
6. **Add immutable caching for hashed `/assets/*`** — production currently revalidates every hashed JS/CSS/WebP — and remove the dead Netlify/Cloudflare header files.

Expected result after Phases 0–1:

| Metric | Target |
|---|---:|
| Initial transfer | **~0.9–1.2 MB** |
| Initial requests | ~20 |
| Hero model payload | ~0.85–0.95 MB |
| Contact model payload (on demand) | ~0.38 MB |
| GPU texture memory (hero + contact + chair) | **~30–35 MB** |
| Concurrent WebGL contexts | **1** during normal use, **2** max during contact |
| Repeat visits | JS/CSS/images/models served from immutable cache |

That is roughly a **5–6× reduction in initial bytes** and a **5–6× reduction in GPU texture memory**, without changing the visual design.

---

## 1. How the measurements were taken

- `npm run build` on the current working tree.
- `vite preview` + headless Chrome with `Network.setCacheDisabled: true`.
- A CDP script recorded every request, encoded bytes, initiator, response status, and resource timing.
- `gltf-transform inspect` on each GLB for mesh, animation, texture, and GPU-size details.
- `file`/MP4 header parsing for video and audio metadata.
- Live production checks with `curl -I` and DNS lookups against **`https://henokkebede.pro.et/`** (Vercel). Headers and domain behavior below are from the live site, not from the local preview.
- The deployed entry bundle is **`index-DGnvlA4P.js`**; the current working tree builds **`index-BLnh-Bko.js`**. Production is therefore **not on the latest local build**, so deploy before comparing before/after numbers. The legacy `https://henok-kebede.vercel.app/` hostname returns 404.

The local test machine is fast and on localhost, so **wall-clock load time is not meaningful**. The byte counts, request counts, GLB internals, and code paths are the evidence.

---

## 2. Measured baseline

### 2.1 Initial network waterfall

The production build requests this before the user can use the hero:

| Asset | Transfer | Why it loads now |
|---|---:|---|
| `waving.glb` | ~1.9 MB | `ContactScene` module-level `useGLTF.preload`; the Contact section module is imported eagerly |
| `sitting_and_talking.glb` | ~1.9 MB | `SceneContent` calls `useGLTF` and `useGLTF.preload`; only its animations are used |
| `typing.glb` | ~1.8 MB | Hero character; required |
| `chair.glb` | 199 KB | Hero chair; required |
| `desk_and_pc.glb` | 37 KB | Hero desk; required |
| `contact.glb` | 11 KB | Contact scene; not needed initially |
| Entry JS | 306 KB gzip | React, three, R3F, drei, loading mascot |
| Fonts | 46 KB | 4 preloaded WOFF2 files |
| CSS | ~5 KB | Initial stylesheet |
| Project thumbnails | ~130 KB | `LazyWhenNear` with `600px` rootMargin can trigger at short viewport heights |
| **Total** | **6.18 MB / 52 requests** | |

The three character files alone are **~5.7 MB** of the 6.18 MB. None of the three is a different character: they are three full copies of the same mesh, skeleton, and texture set, each carrying a different animation.

### 2.2 Character GLB anatomy

`gltf-transform inspect` on `typing.glb`:

| Texture | Resolution | File size | GPU size (with mips) |
|---|---:|---:|---:|
| `Boy01_spec` | 2048×2048 | 72.6 KB | 22.37 MB |
| `Boy01_normal` | 2048×2048 | 401.4 KB | 22.37 MB |
| `Boy01_diffuse` | 2048×2048 | 294.3 KB | 22.37 MB |
| `Boy01_FacialAnimMap` | 2048×2048 PNG | 764.2 KB | 22.37 MB |
| **Per character** | | **~1.5 MB textures** | **~89.5 MB** |

- The mesh itself is small: ~24k render vertices, ~5k uploaded vertices.
- The animation is ~237 KB for the 16 s typing clip.
- The `FacialAnimMap` alone is a 764 KB PNG used as the brows’ base color. At 2048² it is far beyond what the character’s on-screen size can resolve.
- All three character GLBs share identical mesh names, bone names, and node names. That is why animation-only files work.
- Two full character models are potentially resident at once (hero `typing` + contact `waving`), so **peak GPU texture use is ~179 MB**, plus the chair (~14 MB for ten 512² textures), before any render targets. The sitting model is parsed but its scene is never rendered, so its textures may not be uploaded, but its parse/decode cost is still paid.
- This is the main cause of “3D characters feel slow / phone gets hot / scrolling stutters.”

### 2.3 Why the loading gate waits for everything

The loading flow is:

```
App
 └─ LoadingScreen (full-screen, blocking)
 └─ MainScene (lazy)
     └─ Canvas
         ├─ SceneLoader  → drei useProgress()  ← global progress
         └─ SceneContent
             ├─ useGLTF('/typing.glb')          ← suspends
             ├─ useGLTF('/sitting_and_talking.glb') ← suspends
             ├─ useGLTF('/chair.glb')           ← suspends
             └─ DeskSetup → useGLTF('/desk_and_pc.glb') ← suspends
```

`useProgress` is global to three’s loading manager. It does not know which assets the hero needs. Because these preloads run during the initial load, the loader waits for them too:

- `SceneContent` calls `useGLTF.preload('/sitting_and_talking.glb')`.
- `ContactScene` calls `useGLTF.preload('/waving.glb')` and `useGLTF.preload('/contact.glb')`.
- `ContactSection` is **not** wrapped in `LazyWhenNear`; it is rendered under a `Suspense` immediately in `App.jsx`. Its lazy chunk is therefore imported at startup, and the module-level preloads execute before the user ever scrolls.
- `index.html` correctly preloads only `typing`, `chair`, and `desk`, but that is undermined by the module-level preloads above.
- The comment in `index.html` says `sitting_and_talking.glb` is not preloaded; it is, by `SceneContent`’s module.

So the first usable hero frame waits for roughly **5.95 MB of models**, not the ~2.06 MB that the hero actually needs.

### 2.4 Runtime costs after the first frame

| Issue | Where | Effect |
|---|---|---|
| Hero canvas never pauses | `MainScene.jsx` | The full 3D scene, shadows, and `useFrame` loops keep running while the user reads projects/contact |
| LightRays never unmounts | `MainScene.jsx` | `showLightRays = progress > 0.05` stays true forever; a second OGL renderer keeps drawing offscreen |
| Loading mascot never unmounts | `LoadingScreen.jsx` | Its WebGL context and 108 meshes remain after loading, even with `frameloop="never"` |
| Contact canvas unmounts/remounts | `ContactSection.jsx` | Every enter/exit recreates a WebGL context, re-uploads textures, and recompiles shaders |
| Contact canvas has no DPR cap and uses `antialias: true` | `ContactSection.jsx` | R3F defaults to up to 2× device pixels for a full-viewport canvas |
| `ContactShadows` renders every frame | `MainScene.jsx` | Extra depth render + blur passes every frame; default `frames={Infinity}` |
| `backdrop-filter: blur()` over WebGL | `MainScene.css`, `Navbar.css` | Forces expensive compositing of three glass panels over an animating canvas |
| Four `useScrollProgress` calls | `App`, `MainScene`, `SceneContent`, `SceneBackground` | Each creates its own scroll listener and its own `setProgress` state; SceneContent/Background only need a ref but still re-render every frame |
| Navbar scroll handler | `Navbar.jsx` | Reads `offsetTop` for four sections on every scroll frame; forced layout reads |
| Loading mascot: 108 meshes / 108 materials | `LoadingMascot.jsx` | ~108 draw calls at up to 1.5 DPR while the 6 MB download and shader compile are happening |

### 2.5 Vercel hosting, caching, and the production domain

Production is **`https://henokkebede.pro.et/`**, deployed on Vercel. Verified on 2026-11-14:

- DNS resolves to Vercel (`216.198.79.1`, `64.29.17.1`, via `*.vercel-dns-017.com`).
- `http://henokkebede.pro.et/` returns **308** to HTTPS.
- `https://henokkebede.pro.et/` returns **200**, served with `server: Vercel`, `x-vercel-cache: HIT`, edge `cdg1`.
- `https://henok-kebede.vercel.app/` returns **404** (`x-vercel-error: NOT_FOUND`).
- `www.henokkebede.pro.et` **does not resolve** — there is no `www` record.
- Production currently serves `index-DGnvlA4P.js` / `index-DMWJhsgg.css`; the local build is `index-BLnh-Bko.js`, so production is behind the working tree.

**Verified cache headers**

| Response | `cache-control` | Verdict |
|---|---|---|
| `/` (HTML) | `public, max-age=0, must-revalidate` | correct |
| `/assets/index-DGnvlA4P.js` | `public, max-age=0, must-revalidate` | **wrong** — hashed, should be immutable |
| `/assets/index-DMWJhsgg.css` | `public, max-age=0, must-revalidate` | **wrong** — hashed, should be immutable |
| `/assets/thumbnail-*.webp` | `public, max-age=0, must-revalidate` | **wrong** — hashed, should be immutable |
| `/typing.glb` | `public, max-age=31536000, immutable` | correct, but forces versioned filenames |
| `/music.mp3` | `public, max-age=31536000, immutable` | correct |

`vercel.json` sets immutable caching for `.glb`, `.woff2`, `.mp3`, and `.mp4`, but **not for the hashed JS/CSS/WebP assets under `/assets/*`**. Vite fingerprints those filenames, so they are safe to cache forever. Today every repeat visit revalidates the entire JS/CSS bundle and all project thumbnails, which is pure latency on a mobile connection even when the response is a cheap 304.

Also:

- `vercel.json`'s catch-all `/(.*)` rule does not set `Cache-Control`, so Vercel's default (`max-age=0, must-revalidate`) applies to `/assets/*`. The fix is one additional rule (Phase 0.10).
- `netlify.toml` is not valid Netlify TOML. It uses Cloudflare `_headers` syntax (`/*`, `Content-Security-Policy:` lines), which a TOML parser cannot read. If Netlify is used, this file can break the build or be ignored. Since production is Vercel, deleting it is the cleanest option.
- The root `_headers` file is **not inside `public/`**, so Vite does not copy it into `dist/`. Cloudflare Pages reads `_headers` from the build output, so the header rules will not apply.
- `_headers` also lacks the `/assets/*` immutable rule and an HTML revalidation rule.
- The public model filenames (`/typing.glb`, etc.) are **unhashed but served `immutable` for one year**. If the files are replaced at the same paths, returning visitors will keep the old 1.8 MB versions for a year. Any model change must use a new filename or a `?v=` query.
- The sampled Vercel response came from `cdg1` (Paris). If most visitors are in Ethiopia, measure real TTFB from there. This matters more than usual because the initial payload is 6 MB. Cloudflare has an Addis Ababa PoP, so a Cloudflare proxy or Cloudflare Pages is an option if Vercel edge latency is the bottleneck — but fix the 6 MB payload first; edge location is secondary to bytes.
- Because the deployed bundle is older than the local tree, verify the production deployment is on the intended commit before recording “after” measurements. A Git push to the production branch or `vercel --prod` is required; local builds do not update `henokkebede.pro.et`.

### 2.6 Video and music

**Videos**

Four referenced MP4s are deployed:

| File | Size | Resolution | Duration | Bitrate |
|---|---:|---|---:|---:|
| `sharkie.mp4` | 2.62 MB | 900×506 | 42.6 s | 492 kbps |
| `menu.mp4` | 1.96 MB | 1280×720 | 130.7 s | 120 kbps |
| `cubewar.mp4` | 1.43 MB | 900×506 | 35.3 s | 325 kbps |
| `quiz.mp4` | 1.05 MB | 1280×720 | 79.6 s | 106 kbps |
| **Total** | **7.06 MB** | | | |

- They are already reasonably compressed; the main problem is not bitrate, it is **when** they load.
- `ProjectOverlay` renders every media block at once, and every `<video>` has `autoPlay`. Even with `preload="metadata"`, autoplay causes the browser to fetch and start playing videos that are below the overlay fold. Opening one project can pull 1–2.6 MB of video immediately.
- `pokedex.mp4` (545 KB) and `quibbo.mp4` (304 KB) exist in `src/assets/videos` but are never imported, so they are not deployed. Remove them to avoid accidental use.

**Music**

- `public/music.mp3` is 2.27 MB, 96 kbps mono, 44.1 kHz.
- `TopRightActions` sets `preload="none"`, but it creates the `Audio` object on mount, attempts `play()` on mount, and attaches a `pointerdown` listener that starts playback on the first tap/click. On mobile, the first touch while scrolling is a `pointerdown`, so most engaged visitors will start the 2.27 MB download.
- It is not part of the initial loading gate, but it competes with hero/model downloads and consumes mobile data without an explicit opt-in.

### 2.7 Bundle

| Chunk | Raw | Gzip |
|---|---:|---:|
| Entry `index-*.js` | 1,139 KB | 315.6 KB |
| `MainScene-*.js` | 70.5 KB | 21.1 KB |
| `useAnimations-*.js` | 73.2 KB | 21.7 KB |
| Initial CSS | 16.4 KB | 4.4 KB |

`three` is in the entry chunk because `LoadingScreen` statically imports `LoadingMascot`, which statically imports R3F and `three`. That is not the primary problem (three is needed for the hero anyway), but it means the loading animation cannot paint until the 3D runtime is parsed. `react-router-dom` is also in the entry only because `main.jsx` wraps the app in `BrowserRouter`; only `ProjectsSection` uses `useSearchParams`.

### 2.8 Deployment hygiene

- `index.html` still uses `https://henok-kebede.vercel.app/` for `og:url` and `og:image`, but that hostname returns 404. Social previews point at a dead host. The live domain has **no `<link rel="canonical">`**, so search engines see no declared canonical URL.
- The deployed HTML also has `twitter:url` set to the legacy host. The current source has changed that tag to the X profile (`https://x.com/NicoHena`), which is not a standard Twitter Card field; either remove it or point it at `https://henokkebede.pro.et/`. Keep `twitter:image` on the production domain.
- `www.henokkebede.pro.et` has no DNS record. Decide explicitly: add a `www` CNAME plus a Vercel redirect to the apex, or intentionally stay apex-only. Do not leave a half-configured hostname.
- Production is serving an older build (`index-DGnvlA4P.js`) than the current working tree (`index-BLnh-Bko.js`). Deploy and verify the commit before recording post-fix numbers.
- `og-image.png` is 163 KB. It is not part of page load, but converting it to a smaller JPEG/WebP would improve link previews.
- No visual regression or performance budget is enforced in CI.

---

## 3. Root causes ranked by impact

| Rank | Cause | Why it matters | Fix | Effort |
|---|---|---|---|---|
| **P0-1** | 5.95 MB of 3D assets gate the hero | Dominates initial transfer and time-to-hero | Defer contact/sitting; gate loader on hero only | S–M |
| **P0-2** | Three full character copies; 2048² textures | ~5.7 MB network, ~179 MB peak GPU | Animation-only sitting + resized WebP/meshopt models | M |
| **P0-3** | Offscreen hero/LightRays/loading canvases keep running | Battery, heat, scroll jank, context pressure | IntersectionObserver pause; unmount loader and rays | S |
| **P0-4** | Four scroll listeners + state updates per frame | 4+ React renders per rAF; long tasks while scrolling | One shared scroll store; refs + direct DOM | M |
| **P0-5** | Contact canvas DPR/antialias/shadows | Full-viewport canvas at 2–3× pixels | Cap DPR, disable AA, reduce shadows | S |
| **P1-1** | No explicit immutable cache rule for `/assets/*` | Production confirms hashed JS/CSS/WebP return `max-age=0, must-revalidate`, so repeat visits revalidate the whole bundle | Add Vercel `/assets/(.*)` immutable rule; delete/fix Netlify/Cloudflare files | S |
| **P1-2** | Autoplay videos load below the fold | Up to 7 MB per overlay session | Lazy-mount videos + pause offscreen | S |
| **P1-3** | Music starts on first touch | 2.27 MB unexpected mobile data | Opt-in only; optionally transcode | S |
| **P1-4** | `backdrop-filter` over WebGL; LightRays on mobile | GPU compositing/shader cost | Disable on coarse pointers/mobile | S |
| **P1-5** | Loading mascot: 108 draw calls + second context | Stutter during the slowest part of the load | Share materials, lower DPR, unmount after fade | S |
| **P2-1** | Bundle/router/loader coupling | 315 KB gzip entry; three in entry | Optional code-splitting; remove unused router wrapper | M |
| **P2-2** | Project image CLS and thumbnails | Layout shifts, minor bytes | Width/height/aspect-ratio; lazy attrs | S |
| **P2-3** | No performance budget/CI | Regressions return | Lighthouse CI + bundle/asset checks | S |

---

## 4. Performance budgets

Set these as merge gates. They preserve the design while making “slow” measurable.

| Budget | Target | Hard limit |
|---|---:|---:|
| Initial transfer (HTML+CSS+JS+fonts+hero models) | **1.0 MB** | 1.3 MB |
| Initial requests | **20** | 30 |
| Entry JS (gzip) | 300 KB | 350 KB |
| Hero character model | 550 KB | 650 KB |
| Sitting animation | 100 KB | 150 KB |
| Chair model | 180 KB | 250 KB |
| Contact models (on demand) | 400 KB | 600 KB |
| GPU texture memory after hero + contact | **35 MB** | 45 MB |
| Concurrent WebGL contexts | **1** | 2 |
| Lighthouse mobile (Slow 4G, 4× CPU) LCP | < 3.5 s | 4.5 s |
| Real mid-range phone / good 4G LCP | < 2.5 s | 3.5 s |
| Hero usable (loading screen gone) | < 3 s good 4G | 5 s |
| CLS | < 0.05 | 0.1 |
| Long tasks during scroll | < 50 ms | 100 ms |

“Initial” means before the user scrolls. Contact and projects are explicitly on-demand.

---

## 5. Roadmap

### Phase 0 — Stop the bleeding (2–4 hours, no model-quality risk)

These changes can ship before any GLB is re-exported. They remove bytes from the gate and stop offscreen work.

#### 0.1 Defer the contact scene and its preloads

**Files:** `src/App.jsx`, `src/components/ContactScene.jsx`

1. Wrap `ContactSection` in `LazyWhenNear` (the component already exists in `App.jsx`), with a `300px` rootMargin. It is currently rendered eagerly under `Suspense`, so its lazy chunk and module-level preloads run at startup.
2. Remove the two module-level calls at the bottom of `ContactScene.jsx`:
   ```js
   useGLTF.preload('/waving.glb')
   useGLTF.preload('/contact.glb')
   ```
   The `useGLTF()` calls inside `ContactScene` will fetch them when the contact canvas mounts, which is already gated by `ContactSection`’s IntersectionObserver.

**Expected:** removes **~1.9 MB** (`waving` + `contact`) from the initial load.

Do not “fix” this by keeping the preload and relying on the observer; module-level preloads execute when the chunk is evaluated, not when the component renders.

#### 0.2 Replace the full sitting model with an animation-only file

**Files:** `src/components/SceneContent.jsx`, `public/`

The sitting model is never rendered. `SceneContent` only reads `talking.animations` and creates a clip action on the hero character. It can load an 89 KB animation-only GLB instead of the 1.93 MB full model.

Use the validated pipeline (see §6.2):

```
public/sitting_and_talking.glb  1,926,368 bytes
        ↓ strip meshes/skins/textures, keep "Armature|mixamo.com|Layer0"
        ↓ meshopt
public/sitting.anim.glb           90,820 bytes
```

Then change:

```js
// SceneContent.jsx
const talking = useGLTF('/sitting.anim.glb')
// ...
useGLTF.preload('/sitting.anim.glb') // optional; now only 89 KB
```

Because the clip targets bones by name and the hero character already has the same skeleton, `mixer.clipAction(sittingClip, charRef.current)` continues to work unchanged. `talking.scene` is empty, but the code never renders it.

**Expected:** removes **~1.8 MB** from the initial load.

This is the single best byte-for-byte change in the whole plan and it requires no animation retargeting.

#### 0.3 Gate the loader on hero assets only

**Files:** `src/components/SceneLoader.jsx`, `src/App.jsx`

After 0.1 and 0.2, the only assets in the global `useProgress` are the hero’s typing, sitting animation, chair, and desk. That is acceptable. But make the gate explicit:

- Keep `useProgress` for the hero, but do not preload contact/projects.
- Replace the 400 ms delay with one or two animation frames:
  ```js
  const id = requestAnimationFrame(() => requestAnimationFrame(() => onLoaded()))
  ```
  The 400 ms is pure added time after the assets are already decoded.
- Add a safety timeout in `App.jsx` (for example 20 s) that calls `handleHeroError()` so a stalled network or a hung decoder cannot leave the user on the loading screen forever.
- If the hero model throws, the existing `HeroErrorBoundary` already reveals `HeroFallback`; keep that behavior.

**Expected:** ~0.3–0.4 s faster dismissal once assets are ready, plus a real failure path.

#### 0.4 Pause the hero canvas and unmount LightRays when offscreen

**File:** `src/components/MainScene.jsx`

1. Add an `IntersectionObserver` on the sticky canvas wrapper (or `#hero`). Keep a `heroInView` state.
2. Pass `frameloop={heroInView ? 'always' : 'never'}` to the hero `<Canvas>`.
3. Only render `<LightRays>` when `showLightRays && heroInView`. The current condition (`progress > 0.05`) stays true for the rest of the page, so the OGL renderer continues drawing even after the hero has scrolled away.
4. Cache the about-card NodeList once instead of calling `querySelectorAll` on every progress change.

**Expected:** eliminates an entire 3D render loop, shadow pass, and full-screen shader pass while the user is in projects/contact. This is the biggest runtime/battery win.

#### 0.5 Stop the loading mascot after the fade

**Files:** `src/components/LoadingScreen.jsx`, `src/App.jsx`

The mascot’s `<Canvas>` remains mounted forever. Even with `frameloop="never"`, it holds a WebGL context and 108 mesh objects.

- Unmount the entire `LoadingScreen` (or at least the mascot) about 900 ms after `isVisible` becomes false, once the CSS fade completes.
- Keep the fade: `opacity`/`visibility` transition is 0.8 s.
- If you need the mascot for a future reload, remount it on demand rather than keeping it alive.

**Expected:** frees a WebGL context and removes 108 meshes from memory during the whole session.

#### 0.6 Cap the contact canvas and reuse it

**Files:** `src/components/ContactSection.jsx`

- Once the section has been near the viewport, keep the `<Canvas>` mounted. Use `frameloop={inView ? 'always' : 'never'}` instead of `{inView && <Canvas>}`. This avoids context creation, texture re-upload, and shader recompilation every time the user scrolls past.
- Add `dpr={[1, 1.5]}` (or `1` on mobile). There is no explicit DPR cap today; R3F’s default is `[1, 2]`.
- Set `gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}`. The canvas sits on a cream background; MSAA is not worth the cost at this size.
- On mobile, consider dropping `shadows` and using a soft blob shadow under the character. Keep the desktop shadow if it is visually important.

**Expected:** lower GPU memory/fill-rate, no context churn.

#### 0.7 Make the contact shadows cheap

**File:** `src/components/MainScene.jsx`

`<ContactShadows>` defaults to rendering every frame. The main scene already has a directional shadow map. Options, in order:

1. Set `frames={1}` on desktop/mobile and accept a static soft shadow. At `opacity={0.08}` it is barely visible; this is usually fine.
2. If the static shadow looks wrong during the hero→about transition, keep it dynamic only while `progress` is changing, or use a baked radial-gradient plane under the character.
3. On mobile, prefer the blob shadow unconditionally.

**Expected:** removes one full depth render + blur pass per frame.

#### 0.8 Mobile quality switch

**Files:** `MainScene.jsx`, `ContactSection.jsx`, `LoadingMascot.jsx`, CSS

Add one shared hook, for example:

```js
const isCoarse = window.matchMedia('(pointer: coarse)').matches
const isNarrow = window.matchMedia('(max-width: 768px)').matches
const lowPower = isCoarse || isNarrow
```

Use it to:

- Lower hero `dpr` to `[0.75, 1]` and contact to `1`.
- Disable `LightRays` on mobile (replace with a CSS gradient/noise if the section looks empty).
- Disable `ContactShadows` in favor of a blob.
- Use `antialias: false` on the contact canvas.
- In CSS, remove `backdrop-filter` on `.glass-panel`, `.navbar-pill`, and related elements under `(max-width: 768px), (pointer: coarse)`, replacing it with a slightly more opaque solid background. Keep the desktop look.

**Expected:** large improvement on mid-range Android and older iPhones, where backdrop-filter over WebGL and a second shader canvas are disproportionately expensive.

#### 0.9 Reduce loading-mascot cost (optional but cheap)

**File:** `src/components/LoadingMascot.jsx`

- Set `dpr={1}` (currently `[1, 1.5]`).
- Set `gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}` (keep low-power).
- Share `meshStandardMaterial` instances across repeated parts instead of creating a new material per mesh. 108 materials and 108 draw calls are unnecessary for simple colored primitives.
- Reduce sphere segments where the shape is small (40×40 body is fine; 48×48 face is not necessary at the mascot’s display size).
- Keep the animations; this is about draw calls, not removing the design.

#### 0.10 Fix Vercel caching and deploy the current build

**Files:** `vercel.json`, `netlify.toml`, `_headers` → `public/_headers`

Production was verified to return `cache-control: public, max-age=0, must-revalidate` on every hashed `/assets/*` file. Vercel's default applies because `vercel.json` has no rule for that path. Add one:

```json
{
  "source": "/assets/(.*)",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
  ]
}
```

The explicit HTML rule is optional because Vercel already sends `max-age=0, must-revalidate` for `/`, but make it intentional if you want it documented:

```json
{
  "source": "/",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
  ]
}
```

Then deploy through the normal Vercel flow (Git push to the production branch, or `npx vercel --prod`). Local `dist/` output does not update `henokkebede.pro.et`.

Verify from the live domain, not localhost:

```bash
# 1. The production bundle should match the local build hash.
grep -o '/assets/index-[^"]*\.js' dist/index.html
curl -s https://henokkebede.pro.et/ | grep -o '/assets/index-[^"]*\.js'

# 2. Hashed assets should be immutable.
curl -sI https://henokkebede.pro.et/assets/index-<hash>.js | grep -i cache-control

# 3. HTML should still revalidate.
curl -sI https://henokkebede.pro.et/ | grep -i cache-control
```

Expected after the redeploy:

- `/assets/*` → `public, max-age=31536000, immutable`
- `/` → `public, max-age=0, must-revalidate`
- The HTML references the same bundle hash that `npm run build` produced.

**Domain and `www`:** the apex is live and correctly redirects HTTP→HTTPS. `www.henokkebede.pro.et` has no DNS record. Pick one:

- **Apex-only (simplest):** do nothing; the site is reachable at `https://henokkebede.pro.et/`.
- **Add `www`:** add a `www` CNAME in DNS (Vercel shows the target), add the domain in Vercel → Project → Settings → Domains, and configure `www` to redirect to the apex. Then verify `curl -sI https://www.henokkebede.pro.et/` returns a 308/301 to the apex.

**Netlify/Cloudflare cleanup:** since production is Vercel, delete `netlify.toml` rather than leaving invalid TOML that can confuse contributors or a future deploy. If you ever add Netlify, recreate it with valid `[[headers]]` TOML. Move `_headers` into `public/_headers` only if you actually use Cloudflare Pages; otherwise delete it too.

**Critical rollout note:** the current public models are served `immutable` for one year. If you replace `typing.glb` in place, returning visitors will not see it. Use `typing.v2.glb` / `?v=2` (and update the preload URL to match exactly) or move models into `src/assets` so Vite fingerprints them. This applies to the Vercel edge cache as well: a new deployment does not invalidate an already-cached immutable URL.

#### 0.11 Fix the production metadata and canonical URL

**Files:** `index.html`

The deployed page still advertises the dead `henok-kebede.vercel.app` host. Update all absolute URLs to the real domain and add a canonical link:

```html
<link rel="canonical" href="https://henokkebede.pro.et/" />

<meta property="og:url" content="https://henokkebede.pro.et/" />
<meta property="og:image" content="https://henokkebede.pro.et/og-image.png" />

<meta name="twitter:image" content="https://henokkebede.pro.et/og-image.png" />
```

Notes:

- `twitter:url` is not part of the standard Twitter Card spec. The current source points it at `https://x.com/NicoHena`; either remove the tag or set it to the production URL. Do not leave the legacy vercel.app URL.
- Keep `og:image` absolute. Relative image URLs are not resolved reliably by social crawlers, even with a canonical link.
- After deploying, re-scrape with the LinkedIn Post Inspector and the X Card Validator. Cached previews can persist for days.
- This is a metadata-only change; it does not affect the visual design or the loading path.

#### Phase 0 expected result

| | Before | After Phase 0 |
|---|---:|---:|
| Initial transfer | 6.18 MB | ~2.3 MB |
| Initial models | 5.95 MB | ~2.1 MB (typing full + sitting animation + chair/desk) |
| WebGL contexts at rest | 2 | 1 |
| Offscreen hero rendering | yes | no |

Phase 0 is deliberately safe: no texture-quality decisions, no animation changes.

---

### Phase 1 — 3D asset pipeline (2–4 hours + visual QA)

This is where the remaining ~1.2 MB and the GPU memory go.

#### 1.1 Optimize the hero character

Target: `typing.glb` 1.82 MB → **~538 KB**, textures 2048² → **1024²**, GPU 89.5 MB → **22.4 MB**.

Validated pipeline:

```bash
cd /home/benoch/Projects/henok-1
mkdir -p /tmp/portfolio-models

npx --yes @gltf-transform/cli@4.5.1 resize \
  public/typing.glb /tmp/portfolio-models/typing.1024.glb \
  --width 1024 --height 1024

npx --yes @gltf-transform/cli@4.5.1 webp \
  /tmp/portfolio-models/typing.1024.glb /tmp/portfolio-models/typing.webp.glb \
  --quality 82

npx --yes @gltf-transform/cli@4.5.1 meshopt \
  /tmp/portfolio-models/typing.webp.glb public/typing.v2.glb
```

Validated result: **537,708 bytes**, textures 1024×1024, animation preserved, `EXT_texture_webp` + `EXT_meshopt_compression`.

Notes:

- `useGLTF` from drei already configures `MeshoptDecoder`; the existing CSP already allows `wasm-unsafe-eval`. No decoder changes needed.
- WebP is supported by every browser that supports the rest of this site.
- If normal-map artifacts appear at q82, re-run WebP at q90 for the normal map only, or keep the normal map as JPEG and compress the other textures. Do a side-by-side at the hero’s actual on-screen size, not at 100% zoom.
- A 512² hero variant is **371 KB** (`typing.512.opt.glb`) and 5.6 MB GPU. Keep it as a mobile/low-power option if 1024² looks too soft on a 3× phone.

#### 1.2 Replace sitting with the animation-only file

Validated result: **90,820 bytes** (from 1.93 MB).

```bash
node /tmp/opencode/perf/strip-anim.mjs \
  public/sitting_and_talking.glb \
  /tmp/portfolio-models/sitting.anim.raw.glb \
  'Armature|mixamo.com|Layer0'

npx --yes @gltf-transform/cli@4.5.1 meshopt \
  /tmp/portfolio-models/sitting.anim.raw.glb public/sitting.anim.glb
```

The sample script is in `/tmp/opencode/perf/strip-anim.mjs`; check it into a `scripts/` folder if you want the pipeline reproducible. It removes all meshes/skins/textures and keeps only the named clip, then meshopt compresses the animation accessors.

Verify:

```bash
npx @gltf-transform/cli inspect public/sitting.anim.glb
# animations: Armature|mixamo.com|Layer0
# no meshes
```

#### 1.3 Optimize the contact character at 512²

Target: `waving.glb` 1.96 MB → **~371 KB**, GPU 89.5 MB → **5.6 MB**.

Same resize/webp/meshopt pipeline at 512×512. The contact character is displayed smaller and on a cream background; 512² is a good tradeoff. If visual QA rejects it, use 1024² (~538 KB, 22.4 MB GPU) and accept a higher GPU budget.

The contact character still needs its mesh, so keep a full `waving.v2.glb` for now. The animation-only option is a Phase 2 optimization:

- Load the cached hero `typing` scene, clone it with `SkeletonUtils.clone`, and play `wave.anim.glb` (55,704 bytes) on the clone.
- This saves another ~315 KB of network versus the 512² full model, but the clone reuses the hero’s 1024² textures in the contact context, so GPU cost becomes ~22.4 MB instead of ~5.6 MB. That is a worse GPU trade.
- It adds clone/material-sharing complexity. Keep the 512² full model unless network bytes are the binding constraint.

#### 1.4 Optimize the chair

Target: `chair.glb` 199 KB → **~100–150 KB**, GPU ~14 MB → **~3.5 MB**.

The chair’s ten textures are already 512²; resize to 256², WebP q80, then meshopt. It is a small prop under the character; 256² is plenty.

```bash
npx @gltf-transform/cli resize public/chair.glb /tmp/portfolio-models/chair.256.glb --width 256 --height 256
npx @gltf-transform/cli webp /tmp/portfolio-models/chair.256.glb /tmp/portfolio-models/chair.webp.glb --quality 80
npx @gltf-transform/cli meshopt /tmp/portfolio-models/chair.webp.glb public/chair.v2.glb
```

If the chair has material-specific normal/ORM maps that look wrong at 256², keep 512² and accept ~14 MB GPU; the byte savings are smaller than the character savings.

#### 1.5 Leave the desk and contact environment alone

- `desk_and_pc.glb` is 37 KB, one 2×8 texture. Not worth touching.
- `contact.glb` is 10.5 KB. Not worth touching.

#### 1.6 Update references and preloads

Search for every URL:

```bash
grep -rn "typing.glb\|sitting_and_talking.glb\|waving.glb\|chair.glb\|desk_and_pc.glb" src index.html
```

Update:

- `index.html` preload links (typing, chair, desk only; add `?v=2` or use the new filenames).
- `SceneContent.jsx` (typing, sitting animation, chair; its `useGLTF.preload` calls).
- `ContactScene.jsx` (waving, contact; remove preloads per Phase 0).
- `DeskSetup.jsx` (desk).
- Any comments that claim sitting is not preloaded.

Then delete the old unversioned model files from `public/` after QA. Vite copies everything in `public/` into `dist/`, so leaving the 1.8 MB originals there bloats the deployment even if nothing references them.

#### 1.7 Visual QA checklist

- Hero at 1440p, 768p, and a 390px-wide phone: face, brows (alpha), skin specular, normal-map detail.
- Hero→about scroll: chair alignment, shadow quality, no popping.
- Contact: wave loop, hand/arm deformation, cream environment colors.
- Reduced motion: static pose still correct with the animation-only sitting file.
- Compare screenshots at the same camera distance, not at 1:1 texture resolution.

#### Phase 1 expected result

| | Current | After Phase 1 |
|---|---:|---:|
| Hero models (typing + sitting + chair + desk) | 3.95 MB | **~0.85–0.95 MB** |
| Contact models (on demand) | 1.97 MB | **~0.38 MB** |
| Total 3D bytes after visiting contact | 5.95 MB | **~1.3 MB** |
| Character GPU texture | 89.5 MB each | **22.4 MB hero / 5.6 MB contact** |
| Chair GPU texture | ~14 MB | **~3.5 MB** |
| Peak GPU texture (hero + contact) | ~179 MB | **~31.5 MB** |

---

### Phase 2 — Runtime and UX (1–2 days)

#### 2.1 Replace the per-hook scroll listeners with one shared store

**Files:** `src/hooks/useScrollProgress.js`, `src/App.jsx`, `src/components/MainScene.jsx`, `src/components/SceneContent.jsx`, `src/components/SceneBackground.jsx`, `src/components/Navbar.jsx`

Current behavior despite the comment:

- Every `useScrollProgress()` call attaches its own `scroll` listener and its own `resize` listener.
- Every call owns a `setProgress` state, even consumers that only read `progressRef`.
- `App`, `MainScene`, `SceneContent`, and `SceneBackground` each subscribe. That is four rAF callbacks and up to four React renders per scroll frame.
- `Navbar` adds a fifth listener and reads `offsetTop` for four sections inside the rAF.

Recommended design:

- One module-level scroll controller with a single passive `scroll` listener and one rAF.
- `progressRef` is a shared ref object updated in the rAF.
- `subscribe(fn)` for consumers that want direct DOM updates without React.
- `useScrollProgressRef()` for `useFrame` consumers; no state, no re-render.
- `useScrollProgressState()` only for the rare consumer that truly needs a render, with a quantized threshold (for example only notify when the value changes by >0.01).
- Move `App`’s background color interpolation into a subscription that writes `bgRef.current.style.backgroundColor` directly.
- Move `MainScene`’s card opacity/lightfall opacity writes into the same subscription. Keep `setShowLightRays` only for the threshold crossing (one render, not one per frame).
- Replace `Navbar`’s scroll handler with an `IntersectionObserver` using a mid-viewport root margin, or cache section offsets on mount/resize.

Expected: scroll becomes a direct DOM write, not a React render cascade.

#### 2.2 Keep the contact canvas mounted and pause it

Covered in Phase 0.6, but verify with React DevTools that entering/leaving contact no longer creates a new context.

#### 2.3 Lazy-mount project videos

**File:** `src/components/ProjectOverlay.jsx`

Render a lightweight `LazyVideo` per media block:

- Start with no `src`, `preload="none"`, and a poster (or a solid placeholder).
- Use an `IntersectionObserver` with `rootMargin: "200px"`; set `src` only when the block is near the viewport.
- Autoplay only the first visible video; pause when it leaves the viewport.
- Keep `muted`, `playsInline`, `loop`.
- Add `loading="lazy"` and `decoding="async"` to the next-project thumbnail.

Expected: opening `green-harvest` no longer immediately pulls `sharkie.mp4` plus every image; videos load as the user scrolls. This alone can save 1–2.6 MB per overlay session.

#### 2.4 Make music opt-in

**File:** `src/components/TopRightActions.jsx`

- Remove the mount-time `startMusic()` attempt and the global `pointerdown` autostart, or gate them behind an explicit “sound on” preference.
- Create the `Audio` object on the sound-button click, not on mount.
- If background music must remain automatic, check `navigator.connection?.saveData` and `effectiveType` and skip autoplay on `slow-2g`/`2g`/`3g`.
- Optional transcode:
  ```bash
  ffmpeg -i public/music.mp3 -ac 1 -ar 44100 -b:a 64k public/music-64.mp3
  ```
  2.27 MB → ~1.5 MB. Use Opus/WebM at 48 kbps if you are comfortable with the compatibility matrix; keep MP3 as fallback.

Expected: most visitors never download the 2.27 MB track; those who opt in get it after the page is interactive.

#### 2.5 Trim the loading mascot / entry coupling

**Files:** `LoadingScreen.jsx`, `LoadingMascot.jsx`, `main.jsx`, `ProjectsSection.jsx`

- The loading mascot is a nice design; keep it, but make it cheaper (Phase 0.9) and unmount it after the fade.
- `three` is in the entry because the mascot is statically imported. If you want the loading shell to paint before three is parsed, lazy-load `LoadingMascot` and provide a CSS-only placeholder until it arrives. The hero still needs three, so this is a perceived-speed win, not a byte win.
- `react-router-dom` is in the entry only because of `BrowserRouter` in `main.jsx`; only `ProjectsSection` uses `useSearchParams`. If bundle size matters, replace that one hook with `URLSearchParams` + `history.pushState`/`popstate`, remove `BrowserRouter`, and drop the dependency. Do this after the model work; it is not the main bottleneck.

#### 2.6 Smooth the loading bar

The bar currently jumps as `useProgress` moves between files. It is cosmetic, but “loading animation feels slow” is partly perceived:

- Ease the displayed width toward the actual progress (`width += (target - width) * 0.15` per frame) instead of a CSS transition on every jump.
- Show the loaded/total asset count only in development.
- Keep the 100% → “Loaded” beat, but shorten the post-load delay (Phase 0.3).

#### 2.7 CI budgets

Add a small script to fail the build or PR when:

- Initial model bytes exceed 1.0 MB.
- Entry JS gzip exceeds 350 KB.
- A new full character model or an unversioned public GLB is added.
- `dist` contains the old unversioned models.

A simple Node script that sums `public/*.glb` and `dist/assets/*.js` is enough; Lighthouse CI can cover the runtime metrics.

---

### Phase 3 — Polish (ongoing)

- **Project images:** they are already WebP and lazy-loaded; total source images are ~1.1 MB across 42 files. Add `width`/`height` or `aspect-ratio` to media blocks to eliminate layout shift while images decode. Add `loading="lazy"` to the next-project thumbnail.
- **OG image:** convert `og-image.png` (163 KB) to a ~50 KB JPEG/WebP and update `og:image`.
- **Canonical URL:** after Phase 0.11, verify the live HTML has exactly one canonical link and that `og:url`/`og:image` point to `https://henokkebede.pro.et/`; re-scrape previews with the LinkedIn Post Inspector / X card validator.
- **Fonts:** 46 KB is fine. Do not subset unless the visual QA is thorough; the current preload list is reasonable.
- **CSS:** remove duplicated `.loading-mascot` rules between `LoadingScreen.css` and `LoadingMascot.css`.
- **Images:** consider `srcset` only for the largest project screenshots, and only if real-device testing shows a decode problem. They are not the bottleneck.
- **Monitoring:** enable Vercel Speed Insights for real-user LCP/INP/CLS. Its script and beacon are same-origin (`/_vercel/speed-insights/*`), so the current self-only CSP can stay; verify the deployed CSP after enabling it. Alternatively, self-host a small RUM snippet.

---

## 6. File-by-file action map

| File | Action | Phase |
|---|---|---|
| `index.html` | Keep only typing/chair/desk preloads; update URLs/version; fix comments; set `og:url`/`og:image`/`twitter:image` and canonical to `https://henokkebede.pro.et/` | 0–1 |
| `src/App.jsx` | Wrap `ContactSection` in `LazyWhenNear`; unmount loader after fade; add load timeout; move background color to direct DOM subscription | 0, 2 |
| `src/components/MainScene.jsx` | Pause canvas offscreen; gate LightRays to hero-in-view; `ContactShadows frames={1}` or blob; mobile DPR/LightRays switch; cache NodeList | 0, 2 |
| `src/components/SceneContent.jsx` | Use `sitting.anim.glb`; remove full sitting preload; cache action keys; avoid needless transparent material churn | 0–1 |
| `src/components/SceneLoader.jsx` | Remove 400 ms delay; use two rAFs; keep global progress gate limited to hero assets | 0 |
| `src/components/ContactSection.jsx` | Mount once and pause with `frameloop`; cap DPR; disable AA; mobile shadow strategy | 0 |
| `src/components/ContactScene.jsx` | Remove module preloads; point to 512² waving; optional animation-only clone in Phase 2 | 0–2 |
| `src/components/LoadingScreen.jsx` | Unmount after fade; shorten post-load delay | 0 |
| `src/components/LoadingMascot.jsx` | DPR 1, no AA, shared materials, lower segment counts | 0 |
| `src/components/LoadingMascot.css` | Remove duplicate `.loading-mascot` rules | 3 |
| `src/hooks/useScrollProgress.js` | Single shared listener/store; ref-only and state APIs; no per-consumer state | 2 |
| `src/components/Navbar.jsx` | IntersectionObserver or cached offsets | 2 |
| `src/components/TopRightActions.jsx` | Opt-in music; saveData guard; optional 64 kbps transcode | 2 |
| `src/components/ProjectOverlay.jsx` | Lazy-mount videos, pause offscreen, poster; lazy next thumb | 2 |
| `src/data/projectDetails.js` | Add aspect ratios/width/height metadata where missing; no unused imports | 2–3 |
| `src/assets/videos/` | Delete unused `pokedex.mp4` and `quibbo.mp4` | 0 |
| `public/` | Replace models with optimized/versioned files; remove old copies; optional music transcode | 0–1 |
| `vercel.json` | Add `/assets/(.*)` immutable; explicit HTML no-cache | 0 |
| Vercel project | Deploy the current commit to `henokkebede.pro.et`; verify bundle hash and headers from the live domain | 0 |
| `netlify.toml` | Delete (production is Vercel); recreate as valid `[[headers]]` TOML only if Netlify is ever used | 0 |
| `_headers` → `public/_headers` | Move into build output; add `/assets/*` and HTML rules | 0 |
| `vite.config.js` | Optional manual chunk for three/loading mascot; CI budget hook | 2–3 |
| `package.json` | Optional remove `react-router-dom` if router removed | 3 |

---

## 7. Exact commands

### 7.1 Inspect before/after

```bash
cd /home/benoch/Projects/henok-1

npx --yes @gltf-transform/cli@4.5.1 inspect public/typing.glb
npx --yes @gltf-transform/cli@4.5.1 inspect public/typing.v2.glb
```

Look for:

- `TEXTURES` resolution and `gpuSize`
- `ANIMATIONS` names and durations
- `extensionsRequired` (`EXT_meshopt_compression`, `EXT_texture_webp`)
- No accidental extra scenes/meshes

### 7.2 Full model chain

```bash
# Hero character: 1024²
npx @gltf-transform/cli resize public/typing.glb /tmp/portfolio-models/typing.1024.glb --width 1024 --height 1024
npx @gltf-transform/cli webp /tmp/portfolio-models/typing.1024.glb /tmp/portfolio-models/typing.webp.glb --quality 82
npx @gltf-transform/cli meshopt /tmp/portfolio-models/typing.webp.glb public/typing.v2.glb

# Contact character: 512²
npx @gltf-transform/cli resize public/waving.glb /tmp/portfolio-models/waving.512.glb --width 512 --height 512
npx @gltf-transform/cli webp /tmp/portfolio-models/waving.512.glb /tmp/portfolio-models/waving.webp.glb --quality 82
npx @gltf-transform/cli meshopt /tmp/portfolio-models/waving.webp.glb public/waving.v2.glb

# Chair: 256²
npx @gltf-transform/cli resize public/chair.glb /tmp/portfolio-models/chair.256.glb --width 256 --height 256
npx @gltf-transform/cli webp /tmp/portfolio-models/chair.256.glb /tmp/portfolio-models/chair.webp.glb --quality 80
npx @gltf-transform/cli meshopt /tmp/portfolio-models/chair.webp.glb public/chair.v2.glb
```

### 7.3 Animation-only chain

```bash
node /tmp/opencode/perf/strip-anim.mjs \
  public/sitting_and_talking.glb \
  /tmp/portfolio-models/sitting.anim.raw.glb \
  'Armature|mixamo.com|Layer0'

npx @gltf-transform/cli meshopt \
  /tmp/portfolio-models/sitting.anim.raw.glb public/sitting.anim.glb

# Optional contact wave clip
node /tmp/opencode/perf/strip-anim.mjs \
  public/waving.glb \
  /tmp/portfolio-models/wave.anim.raw.glb \
  'mixamo.com.001'

npx @gltf-transform/cli meshopt \
  /tmp/portfolio-models/wave.anim.raw.glb public/wave.anim.glb
```

Validated outputs:

| File | Bytes |
|---|---:|
| `typing.v2.glb` (1024²) | 537,708 |
| `typing.512.opt.glb` | 379,464 |
| `sitting.anim.opt.glb` | 90,820 |
| `wave.anim.opt.glb` | 55,704 |

### 7.4 Video transcode examples

Only after lazy-mounting; compression is secondary.

```bash
# 900×506 source: keep resolution, CRF 27, strip audio, faststart
ffmpeg -i src/assets/videos/sharkie.mp4 -c:v libx264 -crf 27 -preset slow \
  -pix_fmt yuv420p -an -movflags +faststart /tmp/sharkie.opt.mp4

# 1280×720 source: downscale to 960×540, CRF 27
ffmpeg -i src/assets/videos/menu.mp4 -vf "scale=960:-2" -c:v libx264 -crf 27 \
  -preset slow -pix_fmt yuv420p -an -movflags +faststart /tmp/menu.opt.mp4
```

Check the UI text at 100% before accepting; screen recordings of dashboards are sensitive to CRF.

### 7.5 Music transcode

```bash
ffmpeg -i public/music.mp3 -ac 1 -ar 44100 -b:a 64k public/music-64.mp3
```

### 7.6 Verify no duplicate requests

After the changes, a cold load should show:

- `typing`, `sitting.anim`, `chair`, `desk` only.
- No `waving.glb` / `contact.glb` until the contact section is near the viewport.
- No duplicate GLB requests (the preload URL must exactly match the `useGLTF` URL, including the query/version).

### 7.7 Deploy and verify on Vercel

```bash
cd /home/benoch/Projects/henok-1
npm run build

# Git push to the production branch is the normal flow.
# For a direct CLI deploy instead:
npx vercel --prod
```

Then verify the live domain, not the local preview:

```bash
LOCAL=$(grep -o '/assets/index-[^"]*\.js' dist/index.html | head -1)
LIVE=$(curl -s https://henokkebede.pro.et/ | grep -o '/assets/index-[^"]*\.js' | head -1)
printf 'local %s\nlive  %s\n' "$LOCAL" "$LIVE"

curl -sI "https://henokkebede.pro.et$LOCAL" | grep -i 'cache-control\|content-type'
curl -sI https://henokkebede.pro.et/ | grep -i cache-control
curl -sI http://henokkebede.pro.et/ | sed -n '1,4p'
```

Expected:

- `local` and `live` hashes match.
- The hashed JS returns `public, max-age=31536000, immutable`.
- The HTML returns `public, max-age=0, must-revalidate`.
- HTTP returns `308` to HTTPS.

If the live HTML still references the old hash, the deployment has not finished or was not promoted to production. Vercel serves the last successful production deployment until the new one is ready.

---

## 8. Expected gains

### 8.1 Network

| Change | Initial bytes saved | Contact bytes saved |
|---|---:|---:|
| Defer contact preloads (`waving` + `contact`) | ~1.9 MB | — |
| Sitting full → animation-only | ~1.8 MB | — |
| Typing 2048² → 1024² WebP/meshopt | ~1.3 MB | — |
| Chair 512² → 256² + meshopt | ~0.05–0.10 MB | — |
| Waving 2048² → 512² | — | ~1.6 MB |
| Thumbnails deferred (viewport-dependent) | ~0.13 MB | — |
| **Initial total** | **6.18 MB → ~0.9–1.2 MB** | |
| **Contact added on demand** | | **~0.38 MB** |

### 8.2 GPU / runtime

| Change | Before | After |
|---|---:|---:|
| Hero character textures | 89.5 MB | 22.4 MB |
| Contact character textures | 89.5 MB | 5.6 MB |
| Chair textures | ~14 MB | ~3.5 MB |
| Peak texture memory (hero + contact) | ~179 MB | ~31.5 MB |
| Concurrent WebGL contexts | 2–3 | 1–2 |
| Offscreen 3D/shader rendering | always | paused |
| React renders per scroll frame | 4+ | 0 (direct DOM) or 1 at thresholds |

### 8.3 Perceived load

- The loader dismisses after the hero’s ~0.85–0.95 MB instead of 5.95 MB.
- The 400 ms post-load delay and 0.8 s full-screen fade are no longer adding a second of dead time.
- On a good 4G connection, the hero should be usable in roughly 2–3 s instead of 10–20 s on a cold cache.
- On repeat visits, the hashed assets and versioned models come from cache; only HTML revalidates. Today production revalidates every `/assets/*` file, so this benefit is not active until Phase 0.10 ships.

---

## 9. Validation checklist

### Cold load

- [ ] Network panel: initial requests only HTML, entry JS/CSS, fonts, typing/chair/desk + sitting animation.
- [ ] No `waving.glb`, `contact.glb`, project videos, or music before interaction/scroll.
- [ ] No duplicate GLB requests.
- [ ] Initial transfer < 1.3 MB (target 1.0 MB).
- [ ] Loading screen dismisses when the hero is ready; fallback appears if the model fails.
- [ ] Loading mascot is removed from the DOM after the fade.

### Scroll/runtime

- [ ] Scrolling from hero to projects/contact produces no long tasks > 50 ms on a mid-range phone.
- [ ] Hero canvas stops rendering when `#hero` is offscreen.
- [ ] LightRays is unmounted when the hero is offscreen.
- [ ] Contact canvas is created once and paused when offscreen.
- [ ] `ContactShadows` is static or absent on mobile; no visible artifact.
- [ ] Navbar active section changes without layout thrash.
- [ ] React DevTools highlight updates: scroll does not re-render the whole App tree.

### Visual

- [ ] Hero face/brows/skin at desktop and mobile sizes.
- [ ] Sitting crossfade still works with the animation-only file.
- [ ] Contact wave loop and environment colors.
- [ ] Reduced-motion static pose.
- [ ] Chair alignment and shadow.
- [ ] Glass panels still match the design after removing backdrop-filter on mobile.

### Caching

- [ ] `curl -I https://henokkebede.pro.et/assets/index-<hash>.js` → `cache-control: public, max-age=31536000, immutable`.
- [ ] `curl -I https://henokkebede.pro.et/assets/index-<hash>.css` → immutable.
- [ ] `curl -I https://henokkebede.pro.et/assets/thumbnail-<hash>.webp` → immutable.
- [ ] `curl -I https://henokkebede.pro.et/typing.v2.glb` → immutable.
- [ ] `curl -I https://henokkebede.pro.et/` → `max-age=0, must-revalidate`.
- [ ] Repeat visit serves models/JS/CSS/images from disk/memory cache (no full transfer, no revalidation of hashed files).
- [ ] Old unversioned models are not in `dist/` and are not reachable from the deployed HTML.

### Device/network

- [ ] Mid-range Android (4–6 GB RAM) over 4G: no context loss, no thermal throttle in 2 minutes.
- [ ] iPhone Safari: no canvas context limit issues, video autoplay works when scrolled into view.
- [ ] Slow 4G / Lighthouse mobile: LCP and TBT within budget.
- [ ] `prefers-reduced-motion`: no shader loops, no unnecessary animation.
- [ ] WebGL disabled: static hero fallback appears, page remains usable.

### Vercel deployment

- [ ] `npm run build` succeeds and `dist/index.html` references the expected bundle hash.
- [ ] The production deployment is on the tested commit — `curl -s https://henokkebede.pro.et/` returns that same hash. (Today it returns `index-DGnvlA4P.js`, not the local `index-BLnh-Bko.js`.)
- [ ] `https://henokkebede.pro.et/` → 200; `http://henokkebede.pro.et/` → 308 to HTTPS.
- [ ] Cache headers verified from the live domain, not localhost or a preview URL.
- [ ] `og:url`, `og:image`, `twitter:image`, and `<link rel="canonical">` all use `https://henokkebede.pro.et/`; the legacy `henok-kebede.vercel.app` host appears nowhere in the HTML.
- [ ] `www.henokkebede.pro.et` either resolves and redirects to the apex, or is intentionally left absent.
- [ ] If the apex is the only hostname, confirm that decision is documented; do not add a half-configured `www` record.
- [ ] OG/Twitter previews render with the correct image and URL after re-scraping.
- [ ] Measure TTFB from Ethiopia/target region. If Vercel consistently routes to `cdg1` and TTFB is poor, evaluate a Cloudflare proxy or another edge — but only after the 6 MB payload is reduced.

---

## 10. Risks, tradeoffs, and rollout

### Visual quality

- 1024² textures are the main quality tradeoff. The character is large in the hero, so QA at actual display size is essential. If 1024² is too soft, use 1024² diffuse + 2048² normal (GPU cost rises), or keep 1024² and increase texture anisotropy slightly.
- 512² contact textures may soften the waving character. Test on a 390px phone; if unacceptable, use 1024² and accept ~48 MB peak GPU.
- WebP q82 on normal maps can introduce blockiness. If visible, use q90 or keep the normal map as JPEG.
- `ContactShadows frames={1}` changes the shadow from animated to static. At 8% opacity this is usually invisible; if not, use a blob shadow rather than restoring the per-frame pass.

### Functional risks

- Animation-only sitting depends on identical bone names. They were verified identical; add a runtime/dev assertion that the clip loads and the action is created.
- `useGLTF` caches by URL. If the preload URL and the component URL differ (`/typing.glb` vs `/typing.glb?v=2`), the browser may fetch twice. Keep them exactly equal.
- Removing the eager contact render changes when the contact module is evaluated. Verify that `#contact` navigation still scrolls correctly and that the canvas mounts when the section is 200–300 px away.
- Pausing the hero canvas with `frameloop="never"` must resume cleanly when scrolling back. Test rapid back-and-forth scrolling.
- Unmounting the loading screen while its fade is in progress can cause a flash. Use the 900 ms timeout (fade is 800 ms) or `onTransitionEnd`.

### Caching and Vercel risks

- The existing public models are served `immutable` for one year. Replacing them in place is a **silent no-op for returning visitors**. Version them. The same applies to the Vercel edge cache: redeploying does not change the bytes behind an already-cached immutable URL.
- Do not mark HTML immutable. Keep `max-age=0, must-revalidate` so new deploys are picked up.
- Adding `immutable` to `/assets/*` is safe only because Vite content-hashes those filenames. Never apply the same rule to `/`, `favicon.svg`, `og-image.png`, or any other unhashed public file.
- `vercel.json` changes take effect only on a new deployment. Test headers on the production domain after deploying, not on a local preview. Preview deployments use different hostnames and may behave differently with domain-level redirects.
- If you move models into `src/assets`, Vite will hash them and `vercel.json`’s `/assets/*` rule will cover them. Update the `<link rel="preload">` URLs (Vite can inject them via a plugin or you can keep public models with a version query).
- Production is currently behind the working tree. Deploy first, or every “before/after” comparison mixes code changes with cache changes.
- The apex domain is the canonical host. If `www` is added later, configure the redirect in Vercel as well as DNS; a CNAME alone will serve a duplicate hostname rather than redirect it.

### Uncommitted work

The working tree contains user changes, including new `LoadingMascot.jsx` / `LoadingMascot.css`. Do not overwrite or revert those files. The Phase 0 loading-mascot suggestions are additive and should be applied on top of the current versions.

---

## 11. Suggested first PR (small, safe, high impact)

If you want a single reviewable change before touching model files:

1. Wrap `ContactSection` in `LazyWhenNear` in `App.jsx`.
2. Remove the two `useGLTF.preload` calls from `ContactScene.jsx`.
3. Add `frames={1}` to `ContactShadows` in `MainScene.jsx`.
4. Add `dpr={[1, 1.5]}` and `antialias: false` to the contact Canvas.
5. Unmount `LoadingScreen` after its fade.
6. Add the `/assets/(.*)` immutable rule to `vercel.json`.
7. Update `og:url`, `og:image`, and `twitter:image` to `https://henokkebede.pro.et/` and add `<link rel="canonical" href="https://henokkebede.pro.et/" />`.
8. Remove the 400 ms delay in `SceneLoader.jsx`.

This PR alone removes ~1.9 MB from the initial load, frees a WebGL context, removes an extra render pass, and makes repeat visits cache-correct. It does not change the look of the site.

Deploy it to Vercel and verify the live domain before moving on:

```bash
curl -sI https://henokkebede.pro.et/assets/index-<hash>.js | grep -i cache-control
# expect: public, max-age=31536000, immutable
```

Also confirm the deployed HTML hash matches `dist/index.html`; otherwise you are measuring the old build.

The second PR should be the sitting animation-only replacement (another ~1.8 MB). The third should be the texture pipeline. That order lets you measure each gain independently and isolate any visual regression.

---

## Appendix A — Current asset inventory

### Public models

| File | Bytes | Notes |
|---|---:|---|
| `typing.glb` | 1,815,940 | Hero character; 4×2048² textures; 1 animation |
| `sitting_and_talking.glb` | 1,926,368 | Only animations used; 3 textures shared + facial map; 2 animations |
| `waving.glb` | 1,958,552 | Contact character; 3 animations; only `mixamo.com.001` used |
| `chair.glb` | 203,508 | 10×512² textures |
| `desk_and_pc.glb` | 37,128 | 2×8 texture; negligible |
| `contact.glb` | 10,580 | Contact environment; negligible |
| `music.mp3` | 2,270,189 | 96 kbps mono |
| `og-image.png` | 163,388 | Social preview only |

### Built JS/CSS

| File | Raw | Gzip |
|---|---:|---:|
| `index-*.js` | 1,139 KB | 315.6 KB |
| `MainScene-*.js` | 70.5 KB | 21.1 KB |
| `useAnimations-*.js` | 73.2 KB | 21.7 KB |
| `index-*.css` | 16.4 KB | 4.4 KB |

### Videos

| File | Bytes | Resolution | Duration |
|---|---:|---|---:|
| `sharkie.mp4` | 2,618,772 | 900×506 | 42.6 s |
| `menu.mp4` | 1,955,493 | 1280×720 | 130.7 s |
| `cubewar.mp4` | 1,434,498 | 900×506 | 35.3 s |
| `quiz.mp4` | 1,054,958 | 1280×720 | 79.6 s |
| `pokedex.mp4` | 545,112 | unused | — |
| `quibbo.mp4` | 303,501 | unused | — |

---

## Appendix B — Why not optimize X first?

- **Fonts:** 46 KB total, already self-hosted WOFF2 with `font-display: swap`. Not the bottleneck.
- **Project images:** ~1.1 MB across 42 WebP files, lazy-loaded only inside project overlays. Not the initial bottleneck.
- **CSS:** 16.4 KB raw / 4.4 KB gzip. Not the bottleneck.
- **JS micro-splitting:** 315 KB gzip is meaningful, but it is smaller than the 5.95 MB of models and does not explain the load time. Remove the router later if you want a small win.
- **Music:** 2.27 MB is significant, but it is not part of the initial gate and is only fetched after interaction. Fix it after the models and the loading gate.
- **Video compression:** the clips are already 106–492 kbps. Lazy-mounting them is a much bigger win than re-encoding.

The order above follows Amdahl’s law: remove the bytes and GPU work that block the first screen, then fix the runtime loops, then polish.
