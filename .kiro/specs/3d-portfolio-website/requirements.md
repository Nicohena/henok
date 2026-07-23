# Requirements Document

> ## Implementation Status (updated 2026-07-23)
>
> This spec was written as an aspirational design document. The shipped
> implementation differs in several ways. This status block documents
> what actually exists in the codebase so future readers can reconcile
> the spec against reality.
>
> **Implemented:**
> - ✅ Loading screen with progress bar (Req 1) — uses `useProgress` from drei
> - ✅ 3D scene with character + desk + chair + flower pot (Req 2, simplified)
> - ✅ HTML overlay with name, role badge (Req 7) — no GSAP entrance animation
> - ✅ Scroll-driven hero → about transition (character lerps position/scale/rotation)
> - ✅ Two-state animation crossfade: typing ↔ sitting_and_talking (not 3-phase Wave/Turn/Type)
> - ✅ Draco compression on all GLB models (Req 10.6)
> - ✅ `prefers-reduced-motion` support (Req 8.3) — freezes 3D choreography + CSS animations
> - ✅ Project gallery with full-screen detail overlay (URL-driven via `?project=<id>`)
> - ✅ Contact section with 3D waving character + social links
> - ✅ ErrorBoundary around all 3D canvases with static fallback
>
> **Not Implemented (deferred):**
> - ❌ Three-phase animation sequence (Wave → Turn → Type) — replaced with 2-state scroll-driven crossfade
> - ❌ GSAP timeline — choreography uses `useFrame` + `THREE.MathUtils.lerp` instead
> - ❌ ScreenTexture (scrolling code on monitor) — no dynamic canvas texture
> - ❌ Mouse parallax camera shift (Req 9.1) — camera is fixed
> - ❌ Character hover "look at camera" (Req 9.3)
> - ❌ `detect-gpu` tier-based shadow/texture downgrade (Req 10.3) — static `dpr={[0.9, 1.25]}` + `performance={{ min: 0.5 }}`
> - ❌ Mobile FOV adaptation (Req 11.1–11.2) — single FOV 42° for all viewports
> - ❌ Toon/cel shading (Req 2.5) — uses `meshStandardMaterial`
> - ❌ Asset load-failure error UI (Req 1.4) — `ErrorBoundary` catches but shows generic fallback
> - ❌ WebGL-unsupported static fallback page (Req 1.5) — `ErrorBoundary` shows hero fallback instead
>
> **Changed:**
> - 🔄 Animation crossfade duration is 0.5s (spec said 300–500ms) ✓ within range
> - 🔄 Shadow map is 512×512 (spec said 1024 on desktop) — deliberate perf downgrade
> - 🔄 Hero is scroll-driven, not time-driven — the character choreography responds to scroll position rather than playing on a timeline

## Introduction

The hero section is the full-viewport landing experience of a 3D portfolio website. It features a cozy cartoon room rendered in Three.js containing a character seated at a desk with dual monitors, surrounded by room props (plants, pinboard, shelf, speakers). On page load the character plays a three-phase animation sequence: waving and smiling → turning toward the monitors → typing on the keyboard while code scrolls on the monitor screen. An HTML overlay sits in front of the 3D scene and shows the developer's name, tagline, and a "Get in touch" CTA button. The hero section is the first — and at this stage the only — section to implement.

## Glossary

- **Hero_Section**: The full-viewport first screen of the portfolio site rendered as a 3D scene with an HTML overlay
- **Scene**: The Three.js 3D world rendered in the browser via a WebGL canvas
- **Character**: The cartoon 3D humanoid model seated at the desk inside the Scene
- **Desk**: The 3D prop model that the Character sits at, holding the monitors, keyboard, and accessories
- **Room**: The bounding 3D environment that contains the Desk and all room Props
- **Props**: Secondary 3D models that decorate the Room (plants, pinboard, shelf, speakers, accessories)
- **Monitor**: One of the two 3D screen models placed on the Desk; both are referred to collectively as Monitors
- **Keyboard**: The 3D input device model on the Desk in front of the Character
- **AnimationMixer**: The Three.js AnimationMixer instance that drives skeletal animations on the Character
- **WaveClip**: The Mixamo-sourced animation clip in which the Character raises an arm and waves while smiling
- **TurnClip**: The Mixamo-sourced animation clip in which the Character rotates its head and torso toward the Monitors
- **TypeClip**: The Mixamo-sourced animation clip in which the Character types on the Keyboard with a sitting-idle posture
- **ScreenTexture**: A dynamic canvas or render-target texture mapped to the Monitor face that displays scrolling code text
- **GSAP_Timeline**: The GSAP animation timeline that sequences phase transitions between WaveClip, TurnClip, and TypeClip
- **UI_Overlay**: The HTML/CSS layer rendered above the canvas containing the developer's name, tagline, and CTA button
- **CTA_Button**: The "Get in touch" button in the UI_Overlay that scrolls or navigates to the contact section
- **Loader**: The asset loading subsystem that fetches .glb/.gltf models, textures, and animation clips
- **Loading_Screen**: The full-viewport overlay shown while assets are being fetched, hiding the Scene until ready
- **Renderer**: The Three.js WebGLRenderer responsible for drawing the Scene to the canvas
- **Camera**: The Three.js PerspectiveCamera controlling the visitor's viewpoint into the Scene

---

## Requirements

### Requirement 1: Scene Initialization and Asset Loading

**User Story:** As a visitor, I want a loading screen to appear while the 3D scene loads, so that I see a smooth transition into the hero experience rather than a blank or broken page.

#### Acceptance Criteria

1. WHEN the Hero_Section page is opened in a browser, THE Loader SHALL begin fetching the Character .glb model, Room .glb model, and all animation clips (.glb or .fbx) before the first frame is rendered.
2. WHILE assets are being fetched, THE Loading_Screen SHALL be visible and SHALL display a numeric progress indicator representing the percentage of bytes received versus total bytes expected.
3. WHEN all assets required for the first frame have finished loading, THE Loader SHALL hide the Loading_Screen, make the Scene visible, and trigger the GSAP_Timeline to begin the animation sequence.
4. IF any required asset (Character model, Room model, or any animation clip) fails to load after one automatic retry, THEN THE Hero_Section SHALL hide the Loading_Screen, display a full-viewport error message stating "Could not load the 3D scene. Please refresh.", and log the failed asset URL to the browser console.
5. IF the visitor's browser does not support WebGL, THEN THE Hero_Section SHALL display a static fallback page containing the developer's name, tagline, and CTA button styled identically to the UI_Overlay, without attempting to initialize the Renderer.
6. THE Loader SHALL report loading progress for all assets combined as a single percentage value from 0 to 100, computed as (bytes loaded / total bytes) × 100, rounded to the nearest integer.

---

### Requirement 2: 3D Scene Composition

**User Story:** As a visitor, I want to see a cozy, visually detailed cartoon room when the hero section loads, so that the environment feels personal and sets the tone for the portfolio.

#### Acceptance Criteria

1. WHEN the Scene is rendered, THE Room SHALL contain the Desk, the Character seated at the Desk, two Monitors on the Desk, the Keyboard on the Desk, and at least four distinct Props (at minimum: one plant, one pinboard, one shelf, and one speaker).
2. WHEN the Scene is rendered, THE Camera SHALL be positioned at a fixed isometric-style angle that frames the Character, both Monitors, and the majority of the Room in a single view, with the Character's face clearly visible.
3. WHEN the Scene is rendered, THE Room SHALL be lit by at least two light sources: one ambient light with an intensity between 0.3 and 0.6, and one directional or point light positioned above and to the front-left of the Desk to produce soft shadows on the Character and Props.
4. WHEN the Scene is rendered, THE Renderer SHALL enable shadow casting on the Character and Desk, with a shadow map resolution of 1024×1024 pixels on viewports wider than 768px.
5. THE Scene SHALL use cartoon-style shading consistent with a toon or cel-shading approach (flat or stepped diffuse, no specular highlights on the Character) so that all models share a unified visual style.
6. WHEN the Scene is rendered on a viewport narrower than 768px, THE Camera SHALL adjust its field of view or position to ensure the Character and at least one Monitor remain fully within the viewport without cropping.

---

### Requirement 3: Character Animation Sequence — Phase 1 (Wave)

**User Story:** As a visitor, I want the character to greet me with a wave and a smile the moment the scene loads, so that the portfolio immediately feels friendly and personable.

#### Acceptance Criteria

1. WHEN the Loading_Screen is hidden and the Scene becomes visible, THE AnimationMixer SHALL immediately begin playing the WaveClip on the Character with no delay.
2. WHILE the WaveClip is playing, THE AnimationMixer SHALL play the clip to completion without looping, completing the full wave gesture over its natural clip duration.
3. WHEN the WaveClip has completed, THE GSAP_Timeline SHALL cross-fade from the WaveClip to the TurnClip over a transition duration of 300ms to 500ms, keeping the Character visually smooth across the phase boundary.
4. THE WaveClip SHALL be a Mixamo animation in which the Character raises one arm in a waving motion; the arm SHALL raise to at least shoulder height during the wave gesture.
5. IF the WaveClip fails to load, THEN THE GSAP_Timeline SHALL skip Phase 1 and immediately begin Phase 2 (TurnClip), logging a console warning "WaveClip unavailable, skipping to TurnClip".

---

### Requirement 4: Character Animation Sequence — Phase 2 (Turn)

**User Story:** As a visitor, I want to watch the character turn toward the monitors after waving, so that the transition from greeting to working feels natural and story-driven.

#### Acceptance Criteria

1. WHEN the GSAP_Timeline transitions to Phase 2, THE AnimationMixer SHALL play the TurnClip on the Character, rotating the Character's head and upper torso toward the Monitors.
2. WHILE the TurnClip is playing, THE AnimationMixer SHALL play the clip to completion without looping.
3. WHEN the TurnClip has completed, THE GSAP_Timeline SHALL cross-fade from the TurnClip to the TypeClip over a transition duration of 300ms to 500ms.
4. THE TurnClip animation SHALL bring the Character's eye-line to face toward the Monitor screens by the end of the clip, so that the Character appears to be looking at the Monitors before typing begins.
5. IF the TurnClip fails to load, THEN THE GSAP_Timeline SHALL skip Phase 2 and immediately begin Phase 3 (TypeClip), logging a console warning "TurnClip unavailable, skipping to TypeClip".

---

### Requirement 5: Character Animation Sequence — Phase 3 (Type)

**User Story:** As a visitor, I want to see the character typing on the keyboard with the monitor reacting in real time, so that the "developer at work" scene feels alive and immersive.

#### Acceptance Criteria

1. WHEN the GSAP_Timeline transitions to Phase 3, THE AnimationMixer SHALL begin playing the TypeClip on the Character, with the Character's hands moving over the Keyboard in a typing motion.
2. WHILE the TypeClip is playing, THE AnimationMixer SHALL loop the TypeClip continuously so that the Character types indefinitely for the duration of the visitor's session on the Hero_Section.
3. WHEN the TypeClip begins, THE ScreenTexture SHALL activate and begin displaying scrolling code text on at least one Monitor face.
4. WHILE the TypeClip is looping, THE ScreenTexture SHALL scroll the code text continuously downward at a speed between 20 and 60 pixels per second (measured in screen-texture pixel space), creating the visual impression that the Character is generating code on the screen.
5. THE ScreenTexture code text SHALL consist of syntactically plausible code lines (such as JavaScript or TypeScript snippets) rendered in a monospace font with a minimum canvas resolution of 512×256 pixels, with light-colored text on a dark background (minimum contrast ratio of 4.5:1).
6. IF the TypeClip fails to load, THEN THE AnimationMixer SHALL fall back to a sitting-idle animation if one is available, THE ScreenTexture SHALL still activate and begin scrolling, and THE Hero_Section SHALL log a console warning "TypeClip unavailable, falling back to idle".

---

### Requirement 6: Monitor Screen Texture Animation

**User Story:** As a visitor, I want to see code scrolling on the monitor screen while the character types, so that the portfolio communicates the developer's identity as a coder without needing to read text.

#### Acceptance Criteria

1. THE ScreenTexture SHALL be implemented as a dynamic HTML5 Canvas element or a Three.js RenderTarget, updated each animation frame while the TypeClip is looping.
2. WHEN the ScreenTexture is active, THE ScreenTexture SHALL render at least 20 visible lines of code text simultaneously within the Monitor face bounds at any given frame.
3. WHEN a code line scrolls off the top edge of the ScreenTexture, THE ScreenTexture SHALL append a new code line at the bottom edge so that the scrolling is continuous and uninterrupted.
4. THE ScreenTexture code lines SHALL vary in content and indentation across at least 50 unique pre-authored lines cycling in order, so that the scrolling does not visually loop in a short repetitive pattern.
5. WHEN the Hero_Section is not visible (browser tab hidden or page scrolled away), THE ScreenTexture SHALL pause updates to reduce CPU usage, and SHALL resume updating when the Hero_Section becomes visible again.

---

### Requirement 7: UI Overlay

**User Story:** As a visitor, I want to see the developer's name, a tagline, and a call-to-action button overlaid on the 3D scene, so that I immediately know whose portfolio I am viewing and how to get in touch.

#### Acceptance Criteria

1. WHEN the Loading_Screen is hidden, THE UI_Overlay SHALL become visible simultaneously with the Scene and SHALL remain visible for the entire duration of the visitor's session on the Hero_Section.
2. THE UI_Overlay SHALL display: a greeting or name line (e.g. "Hi, my name is [Name]."), a tagline line of no more than 80 characters, and the CTA_Button labeled "Get in touch".
3. THE UI_Overlay text SHALL have a color contrast ratio of at least 4.5:1 against its background (which may include a semi-transparent backdrop), in compliance with WCAG 2.1 AA.
4. THE UI_Overlay SHALL be positioned on the left side of the viewport on viewports wider than 768px, and SHALL be repositioned to the bottom of the viewport, above the canvas, on viewports narrower than 768px.
5. WHEN a visitor clicks the CTA_Button, THE Hero_Section SHALL scroll the page or trigger navigation to the contact section of the portfolio.
6. THE CTA_Button SHALL have a minimum touch target size of 44×44 CSS pixels and SHALL display a visible focus indicator with a minimum 2px outline when focused via keyboard, in compliance with WCAG 2.1 AA.
7. THE UI_Overlay SHALL carry appropriate ARIA landmark roles (e.g. role="banner" on the overlay container) and the CTA_Button SHALL have an aria-label attribute describing its action.

---

### Requirement 8: UI Overlay Entrance Animation

**User Story:** As a visitor, I want the overlay text and button to animate in gracefully once the scene is ready, so that the introduction feels polished and intentional rather than abrupt.

#### Acceptance Criteria

1. WHEN the Loading_Screen is hidden, THE UI_Overlay SHALL animate its opacity from 0 to 1 over a duration of 600ms to 900ms using the GSAP_Timeline.
2. WHEN the Loading_Screen is hidden, THE UI_Overlay greeting line, tagline line, and CTA_Button SHALL each animate in sequentially with a stagger delay of 150ms to 300ms between each element, starting from the greeting line.
3. WHERE the visitor's operating system or browser has the "prefers-reduced-motion" media feature enabled, THE UI_Overlay SHALL appear instantly at full opacity with no entrance animation, and all GSAP_Timeline tween durations for cosmetic transitions SHALL be set to 0.
4. WHEN the UI_Overlay entrance animation has completed, THE CTA_Button SHALL become interactive (responding to click and keyboard events); THE CTA_Button SHALL not be interactive during its entrance animation.

---

### Requirement 9: Interactivity and Hover Effects

**User Story:** As a visitor, I want the scene to respond subtly to my mouse movements and hovering, so that the experience feels alive and invites further exploration.

#### Acceptance Criteria

1. WHERE the visitor's device supports pointer events, WHEN the visitor moves the mouse over the Scene canvas, THE Camera SHALL perform a subtle parallax shift — translating at most ±5% of the viewport width horizontally and ±3% of the viewport height vertically relative to the default Camera position — in response to mouse position, creating a depth illusion.
2. WHERE the visitor's device supports pointer events, THE Camera parallax shift SHALL interpolate toward the target offset using a lerp factor of 0.05–0.10 per frame (at 60 fps), so that the Camera movement is smooth and slightly delayed rather than instant.
3. WHERE the visitor's device supports pointer events, WHEN the visitor hovers over the Character, THE Character SHALL play a brief one-time "look at camera" head-turn animation or the AnimationMixer SHALL blend the Character's head rotation toward the Camera over 400ms, reverting to the TypeClip head orientation when the pointer leaves.
4. WHERE the visitor's device supports pointer events, WHEN the visitor hovers over the CTA_Button, THE CTA_Button SHALL transition its background color and/or scale to a hover state over 150ms–200ms, and SHALL revert to its default style when the pointer leaves.
5. WHEN the visitor's device has no pointer events (touch-only), THE Camera parallax shift described in criterion 1 SHALL be disabled; THE Scene SHALL instead perform a slow continuous ambient camera sway of ±2° horizontally at a period of 6–10 seconds to maintain a sense of life.

---

### Requirement 10: Performance

**User Story:** As a visitor on a mid-range laptop or mobile device, I want the hero section to run at a smooth frame rate, so that the 3D experience is enjoyable rather than choppy.

#### Acceptance Criteria

1. THE Renderer SHALL sustain a minimum of 60 fps on desktop devices with a dedicated GPU (measured over a 5-second window after all assets have loaded and the animation sequence has begun).
2. THE Renderer SHALL sustain a minimum of 30 fps on mobile devices or devices where GPU detection indicates an integrated or low-tier GPU (measured over a 5-second window).
3. WHEN the Renderer detects a low-tier GPU (using the detect-gpu library or equivalent), THE Scene SHALL reduce shadow map resolution to 512×512 pixels, disable real-time shadows on Props, and reduce ScreenTexture canvas resolution to 256×128 pixels.
4. WHEN the browser tab containing the Hero_Section is hidden (document.visibilityState === "hidden"), THE Renderer SHALL pause the render loop and THE AnimationMixer SHALL pause all clip playback, resuming both when the tab becomes visible again.
5. THE total size of all assets fetched for the Hero_Section (Character model, Room model, animation clips, and textures combined) SHALL not exceed 15 MB when transferred over the network in their compressed form.
6. THE Character .glb model and Room .glb model SHALL use Draco compression (via DRACOLoader) or Meshopt compression to reduce geometry payload size.

---

### Requirement 11: Responsiveness

**User Story:** As a visitor on a phone or tablet, I want the hero section to adapt its layout and complexity so that the experience remains usable and visually coherent on smaller screens.

#### Acceptance Criteria

1. WHEN the viewport width is between 768px and 1279px (tablet), THE Camera SHALL adjust its field of view to be between 55° and 70° so that the full desk scene remains visible without horizontal clipping.
2. WHEN the viewport width is narrower than 768px (mobile), THE Camera SHALL adjust its field of view to be between 70° and 85° and SHALL zoom out sufficiently to show the Character and at least one Monitor within the viewport.
3. WHEN the viewport width is narrower than 768px, THE Renderer SHALL set the pixel ratio to a maximum of 1.5 (overriding devicePixelRatio) to limit fill-rate cost on high-DPI mobile screens.
4. WHEN the browser window is resized, THE Renderer SHALL update the canvas dimensions and Camera aspect ratio within 100ms of the resize event, without requiring a page reload.
5. WHEN the viewport width is narrower than 768px, THE UI_Overlay SHALL use a minimum font size of 18px for the greeting and tagline text, and the CTA_Button SHALL span the full width of the UI_Overlay container.
