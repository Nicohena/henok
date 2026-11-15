import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import './LoadingMascot.css'

/**
 * LoadingMascot — faithful 3D recreation of Samuel Briskar's "Loading"
 * shot (ThreeDee / Dribbble), rebuilt from procedural three.js primitives
 * (no external assets — an original interpretation of the reference):
 *
 *   loading: a white seal pup reads a manila folder, files it into a
 *            small cardboard box, strikes a proud hands-on-hips pose,
 *            then turns to the tall blue cabinet and pulls a new folder
 *            from the middle drawer. Loop.
 *   loaded:  hard cut to a party-face emoji — puffy eyelids that blink
 *            between closed and half-open, purple blowout, polka-dot
 *            party hat, tumbling purple/pink confetti and gold stars.
 *
 * The `reduced` prop freezes everything into a static pose for
 * prefers-reduced-motion users.
 */

const C = {
  seal: '#e1e0e6',
  sealDark: '#d8d7dd',
  belly: '#f7f6f8',
  flipper: '#8f8e98',
  ink: '#1b1a20',
  paper: '#fbfaf8',
  folder: '#e3cf9f',
  pinkSheet: '#e86a7a',
  cabinet: '#1a70e8',
  cabinetDrawer: '#3b93ff',
  handle: '#f4f6fa',
  box: '#e0c9a2',
  boxInner: '#9a7f5c',
  boxTape: '#ead9b8',
  face: '#f4b25a',
  blower: '#7a5cf0',
  hat: '#7a5cf5',
  hatDot: '#f291c8',
  lid: '#5a4030',
  pupil: '#2b2430',
  mouth: '#33283c',
  star: '#f2b445',
  confetti: ['#8b7bf5', '#a99cf8', '#f6a8cc'],
}

/**
 * Dev-only capture hook: `?pt=SECONDS` freezes the shared clock at that
 * point of the loop so individual animation phases can be screenshotted
 * deterministically. Inert in production builds.
 */
const ptParam = import.meta.env.DEV
  ? new URLSearchParams(window.location.search).get('pt')
  : null
const PHASE_FROZEN = ptParam !== null
const FORCE_T = PHASE_FROZEN ? Number(ptParam) : null

/**
 * Shared animation clock.
 *
 * r3f's `state.delta` can be NaN on the first frame in some environments
 * (headless capture, odd rAF timestamps), and one NaN delta poisons any
 * `+= delta` accumulator forever. Deriving dt from performance.now()
 * with a clamp keeps every animation finite.
 */
const clock = { t: 0, last: null }
function tick(now) {
  if (FORCE_T !== null) return { t: FORCE_T, dt: 0 }
  const dt = clock.last === null ? 1 / 60 : Math.min(Math.max(now - clock.last, 0), 0.05)
  clock.last = now
  clock.t += dt
  return { t: clock.t, dt }
}

function easeOutBack(x) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

/** smoothstep ramp from a→b */
function smooth(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const up = (p, a, b) => smooth(a, b, p)
const down = (p, a, b) => 1 - smooth(a, b, p)
/** rises 0→1 over [a,b] and falls back to 0 over [c,d] */
const bump = (p, a, b, c, d) => up(p, a, b) * down(p, c, d)
const lerp = (x, y, s) => x + (y - x) * s

/** Deterministic pseudo-random in [0, 1) — pure, render-safe */
function prand(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/* Shared geometries — built once, reused by every instance */
const CONFETTI_GEO = (() => {
  const g = new THREE.OctahedronGeometry(0.09)
  g.scale(0.9, 1.3, 0.35)
  return g
})()

function buildStarGeometry(outer = 0.17, inner = 0.085, depth = 0.06) {
  const shape = new THREE.Shape()
  const spikes = 5
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.028,
    bevelSegments: 3,
  })
  geo.translate(0, 0, -depth / 2)
  return geo
}
const STAR_GEO = buildStarGeometry()

/* ------------------------------------------------------------------ */
/*  Seal pup — plump white character that files the folders            */
/* ------------------------------------------------------------------ */
/*
 * Behaviour loop (7.2s, matching the reference's rhythm):
 *   0.00-0.17  READ        holds the folder at its chest, head down
 *   0.17-0.31  FILE        bends over the box, folder arcs into it
 *   0.31-0.42  PROUD       hands on hips, chest out, little hop
 *   0.42-0.52  TURN        rotates toward the cabinet
 *   0.52-0.62  PULL        middle drawer slides open, folder inside
 *   0.62-0.74  GRAB        flipper takes the folder, drawer closes,
 *                          body turns back
 *   0.74-1.00  IDLE        faces camera holding the new folder, bobs
 */
const LOOP = 7.2

const POSE_CHEST = { rx: -1.55, rz: 0.2 } // folded up in front of the chest
const POSE_DOWN = { rx: -0.4, rz: 0.12 } // reaching down while filing
const POSE_HIPS = { rx: 0, rz: 0.5 } // hands-on-hips
const POSE_REST = { rx: 0, rz: 0.15 }
const POSE_REACH = { rx: -1.45, rz: 0.05 } // extended toward the drawer

/** Sequential pose blend for one flipper (weights fire in order) */
function flipperPose(p, isCabinetSide) {
  let rx = 0
  let rz = POSE_REST.rz
  const blend = (pose, w) => {
    rx = lerp(rx, pose.rx, w)
    rz = lerp(rz, pose.rz, w)
  }
  // start and end of the loop hold the folder at the chest
  blend(POSE_CHEST, Math.max(up(p, 0.02, 0.05), down(p, 0.80, 0.88)))
  blend(POSE_DOWN, up(p, 0.17, 0.23))
  blend(POSE_HIPS, up(p, 0.31, 0.37))
  if (isCabinetSide) {
    blend(POSE_REACH, up(p, 0.44, 0.52))
    blend(POSE_CHEST, up(p, 0.66, 0.74))
  } else {
    blend(POSE_REST, up(p, 0.44, 0.52))
    blend(POSE_CHEST, up(p, 0.80, 0.88))
  }
  return { rx, rz }
}

function Seal({ reduced }) {
  const root = useRef()
  const bend = useRef()
  const head = useRef()
  const flipL = useRef()
  const flipR = useRef()

  useFrame(() => {
    if (!root.current || !bend.current) return
    const { t } = tick(performance.now())
    const p = reduced ? 0.05 : (t % LOOP) / LOOP

    /* body: hop during the proud beat, gentle idle bob */
    const hop = Math.sin(Math.PI * up(p, 0.31, 0.40)) * 0.055
    root.current.position.y = reduced ? 0 : hop + Math.sin(t * 1.7) * 0.012

    /* bend over the box while filing */
    const bendAmt = bump(p, 0.17, 0.23, 0.26, 0.32)
    bend.current.rotation.x = 0.4 * bendAmt
    bend.current.rotation.z = -0.35 * bendAmt
    root.current.position.x = -0.15 * bendAmt

    /* turn toward the cabinet and back */
    const turnAmt = bump(p, 0.42, 0.50, 0.74, 0.82)
    root.current.rotation.y = 1.18 * turnAmt

    /* head: down while reading, up when proud, up at the cabinet */
    const reading = Math.max(bump(p, 0.0, 0.05, 0.26, 0.32), bump(p, 0.86, 0.92, 0.99, 1.01))
    const proud = bump(p, 0.31, 0.36, 0.42, 0.47)
    if (head.current) {
      head.current.rotation.x = 0.45 * reading - 0.3 * proud - 0.12 * bump(p, 0.5, 0.56, 0.68, 0.74)
      head.current.rotation.y = -0.2 * bendAmt
    }

    if (flipL.current) {
      const pose = flipperPose(p, false)
      flipL.current.rotation.x = pose.rx
      flipL.current.rotation.z = pose.rz
    }
    if (flipR.current) {
      const pose = flipperPose(p, true)
      flipR.current.rotation.x = pose.rx
      flipR.current.rotation.z = -pose.rz // mirrored
    }
  })

  return (
    <group ref={root}>
      {/* bend hinge near the base so the whole body tips over the box */}
      <group ref={bend} position={[0, 0.3, 0]}>
        <group position={[0, -0.3, 0]}>
          {/* hind feet — flat dark flippers */}
          <mesh position={[-0.2, 0.09, 0.18]} scale={[1.2, 0.5, 1.6]}>
            <sphereGeometry args={[0.19, 16, 16]} />
            <meshStandardMaterial color={C.flipper} roughness={0.6} />
          </mesh>
          <mesh position={[0.2, 0.09, 0.18]} scale={[1.2, 0.5, 1.6]}>
            <sphereGeometry args={[0.19, 16, 16]} />
            <meshStandardMaterial color={C.flipper} roughness={0.6} />
          </mesh>
          {/* stubby tail */}
          <mesh position={[0, 0.42, -0.52]} scale={[1.2, 0.7, 0.8]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color={C.sealDark} roughness={0.6} />
          </mesh>

          {/* body + belly */}
          <mesh position={[0, 0.7, 0]} scale={[0.95, 1.0, 0.88]}>
            <sphereGeometry args={[0.6, 40, 40]} />
            <meshStandardMaterial color={C.seal} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.56, 0.18]} scale={[0.88, 0.92, 0.65]}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color={C.belly} roughness={0.55} />
          </mesh>

          {/* head */}
          <group ref={head} position={[0, 1.3, 0.05]}>
            <mesh scale={[1, 0.95, 0.95]}>
              <sphereGeometry args={[0.4, 32, 32]} />
              <meshStandardMaterial color={C.sealDark} roughness={0.55} />
            </mesh>
            {/* muzzle + nose */}
            <mesh position={[0, -0.11, 0.28]} scale={[1.15, 0.8, 0.75]}>
              <sphereGeometry args={[0.22, 24, 24]} />
              <meshStandardMaterial color={C.belly} roughness={0.55} />
            </mesh>
            <mesh position={[0, -0.05, 0.46]}>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshStandardMaterial color="#3a3842" roughness={0.4} />
            </mesh>
            {/* eyes */}
            <mesh position={[-0.16, 0.07, 0.3]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial color={C.ink} roughness={0.35} />
            </mesh>
            <mesh position={[0.16, 0.07, 0.3]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial color={C.ink} roughness={0.35} />
            </mesh>
            {/* ears */}
            <mesh position={[-0.34, 0.21, -0.02]}>
              <sphereGeometry args={[0.06, 10, 10]} />
              <meshStandardMaterial color={C.sealDark} roughness={0.55} />
            </mesh>
            <mesh position={[0.34, 0.21, -0.02]}>
              <sphereGeometry args={[0.06, 10, 10]} />
              <meshStandardMaterial color={C.sealDark} roughness={0.55} />
            </mesh>
            {/* whiskers */}
            {[-1, 1].map((s) =>
              [0.18, 0.32].map((rz, i) => (
                <mesh
                  key={`${s}-${i}`}
                  position={[s * 0.2, -0.06 - i * 0.015, 0.3]}
                  rotation={[0, s * 0.55, s * (0.28 - i * 0.1)]}
                >
                  <boxGeometry args={[0.17, 0.005, 0.005]} />
                  <meshStandardMaterial color="#6b6a72" roughness={0.5} />
                </mesh>
              )),
            )}
          </group>

          {/* flippers — pivots at the shoulders */}
          <group ref={flipL} position={[-0.5, 1.05, 0.02]}>
            <mesh position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.075, 0.34, 4, 12]} />
              <meshStandardMaterial color={C.flipper} roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <sphereGeometry args={[0.085, 12, 12]} />
              <meshStandardMaterial color={C.flipper} roughness={0.6} />
            </mesh>
          </group>
          <group ref={flipR} position={[0.5, 1.05, 0.02]}>
            <mesh position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.075, 0.34, 4, 12]} />
              <meshStandardMaterial color={C.flipper} roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <sphereGeometry args={[0.085, 12, 12]} />
              <meshStandardMaterial color={C.flipper} roughness={0.6} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Filing cabinet — tall, blue, three drawers, middle one opens       */
/* ------------------------------------------------------------------ */
function Cabinet({ reduced }) {
  const drawer = useRef()

  useFrame(() => {
    if (!drawer.current) return
    const { t } = tick(performance.now())
    const p = reduced ? 0.05 : (t % LOOP) / LOOP
    const open = up(p, 0.52, 0.6) * down(p, 0.66, 0.72)
    drawer.current.position.z = 0.36 + 0.26 * open
  })

  return (
    <group position={[1.45, 0, -0.7]} rotation={[0, -0.32, 0]}>
      <mesh position={[0, 0.725, 0]}>
        <boxGeometry args={[0.95, 1.45, 0.7]} />
        <meshStandardMaterial color={C.cabinet} roughness={0.4} />
      </mesh>

      {/* bottom + top drawers (static fronts) */}
      {[0.32, 1.14].map((y) => (
        <group key={y}>
          <mesh position={[0, y, 0.36]}>
            <boxGeometry args={[0.84, 0.4, 0.05]} />
            <meshStandardMaterial color={C.cabinetDrawer} roughness={0.4} />
          </mesh>
          <mesh position={[0, y, 0.4]}>
            <boxGeometry args={[0.26, 0.06, 0.035]} />
            <meshStandardMaterial color={C.handle} roughness={0.35} />
          </mesh>
        </group>
      ))}

      {/* middle drawer — slides out on the pull */}
      <group ref={drawer} position={[0, 0.73, 0.36]}>
        <mesh>
          <boxGeometry args={[0.84, 0.4, 0.05]} />
          <meshStandardMaterial color={C.cabinetDrawer} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <boxGeometry args={[0.26, 0.06, 0.035]} />
          <meshStandardMaterial color={C.handle} roughness={0.35} />
        </mesh>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Cardboard box — small, open, papers + a pink sheet inside          */
/* ------------------------------------------------------------------ */
function CardboardBox() {
  return (
    <group position={[-1.42, 0, 0.1]} rotation={[0, -0.5, 0]}>
      {/* walls (open top) */}
      <mesh position={[0, 0.27, 0.34]}>
        <boxGeometry args={[0.85, 0.54, 0.04]} />
        <meshStandardMaterial color={C.box} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.27, -0.34]}>
        <boxGeometry args={[0.85, 0.54, 0.04]} />
        <meshStandardMaterial color={C.box} roughness={0.65} />
      </mesh>
      <mesh position={[0.4, 0.27, 0]}>
        <boxGeometry args={[0.04, 0.54, 0.68]} />
        <meshStandardMaterial color={C.box} roughness={0.65} />
      </mesh>
      <mesh position={[-0.4, 0.27, 0]}>
        <boxGeometry args={[0.04, 0.54, 0.68]} />
        <meshStandardMaterial color={C.box} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.64]} />
        <meshStandardMaterial color={C.box} roughness={0.65} />
      </mesh>

      {/* tape stripe + emblem on the front */}
      <mesh position={[0, 0.3, 0.365]}>
        <boxGeometry args={[0.86, 0.09, 0.005]} />
        <meshStandardMaterial color={C.boxTape} roughness={0.6} />
      </mesh>
      <mesh position={[0.12, 0.14, 0.367]}>
        <boxGeometry args={[0.08, 0.08, 0.004]} />
        <meshStandardMaterial color={C.handle} roughness={0.5} />
      </mesh>

      {/* dark interior + papers poking above the rim */}
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.76, 0.62]} />
        <meshStandardMaterial color={C.boxInner} roughness={0.8} />
      </mesh>
      <mesh position={[-0.03, 0.54, 0]} rotation={[0, 0.35, 0.05]}>
        <boxGeometry args={[0.32, 0.04, 0.4]} />
        <meshStandardMaterial color={C.paper} roughness={0.7} />
      </mesh>
      <mesh position={[0.02, 0.58, -0.04]} rotation={[0, -0.25, -0.06]}>
        <boxGeometry args={[0.3, 0.025, 0.38]} />
        <meshStandardMaterial color={C.pinkSheet} roughness={0.7} />
      </mesh>
      <mesh position={[-0.04, 0.62, 0.02]} rotation={[0, 0.5, 0.08]}>
        <boxGeometry args={[0.3, 0.02, 0.38]} />
        <meshStandardMaterial color={C.paper} roughness={0.7} />
      </mesh>

      {/* front flap folds down outside, left flap stands open */}
      <group position={[0, 0.52, 0.36]} rotation={[-1.9, 0, 0]}>
        <mesh position={[0, 0, 0.19]}>
          <boxGeometry args={[0.8, 0.03, 0.38]} />
          <meshStandardMaterial color={C.box} roughness={0.65} />
        </mesh>
      </group>
      <group position={[-0.42, 0.52, 0]} rotation={[0, 0, 2.1]}>
        <mesh position={[-0.19, 0, 0]}>
          <boxGeometry args={[0.38, 0.03, 0.64]} />
          <meshStandardMaterial color={C.box} roughness={0.65} />
        </mesh>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Manila folder — held, filed into the box, pulled from the drawer   */
/* ------------------------------------------------------------------ */
const POS_CHEST = { x: 0, y: 0.95, z: 0.62, rx: -1.0, ry: 0 }
const POS_DRAWER = { x: 1.2, y: 0.78, z: -0.05, rx: 0, ry: -0.32 }

function Folder({ reduced }) {
  const mesh = useRef()

  useFrame(() => {
    if (!mesh.current) return
    const { t } = tick(performance.now())
    const p = reduced ? 0.05 : (t % LOOP) / LOOP

    let x = POS_CHEST.x
    let y = POS_CHEST.y
    let z = POS_CHEST.z
    let rx = POS_CHEST.rx
    let ry = POS_CHEST.ry
    let scale = 1

    if (p >= 0.17 && p < 0.27) {
      /* carried down with the bending body: bezier chest → head → box mouth */
      const s = smooth(0.17, 0.27, p)
      const it = 1 - s
      x = it * it * 0 + 2 * it * s * -0.5 + s * s * -1.38
      y = it * it * 0.95 + 2 * it * s * 0.95 + s * s * 0.62
      z = it * it * 0.62 + 2 * it * s * 0.5 + s * s * 0.28
      rx = lerp(-1.0, 0.35, s)
      ry = lerp(0, -0.4, s)
    } else if (p >= 0.27 && p < 0.31) {
      /* dropped into the box, sinking out of sight */
      const s = smooth(0.27, 0.31, p)
      x = -1.38
      y = lerp(0.62, 0.46, s)
      z = 0.28
      rx = 0.35
      ry = -0.4
      scale = 1 - s * 0.9
    } else if (p >= 0.31 && p < 0.52) {
      scale = 0 // inside the box
    } else if (p >= 0.52 && p < 0.62) {
      /* appears in the open drawer */
      x = POS_DRAWER.x
      y = POS_DRAWER.y
      z = POS_DRAWER.z
      rx = POS_DRAWER.rx
      ry = POS_DRAWER.ry
      scale = smooth(0.52, 0.545, p)
    } else if (p >= 0.62) {
      /* carried back to the chest as the body turns around */
      const s = smooth(0.62, 0.74, p)
      x = lerp(POS_DRAWER.x, POS_CHEST.x, s)
      y = lerp(POS_DRAWER.y, POS_CHEST.y, s)
      z = lerp(POS_DRAWER.z, POS_CHEST.z, s)
      rx = lerp(POS_DRAWER.rx, POS_CHEST.rx, s)
      ry = lerp(POS_DRAWER.ry, POS_CHEST.ry, s)
    }

    mesh.current.position.set(x, y, z)
    mesh.current.rotation.set(rx, ry, 0)
    mesh.current.scale.setScalar(Math.max(0.0001, scale))
    if (import.meta.env.DEV && window.__folderDebug !== false) {
      // eslint-disable-next-line no-console
      console.log('[folder]', { p: p.toFixed(3), x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2), scale: scale.toFixed(2) })
    }
  })

  return (
    <group ref={mesh}>
      {/* manila folder with a white sheet inside */}
      <mesh>
        <boxGeometry args={[0.44, 0.018, 0.3]} />
        <meshStandardMaterial color={C.folder} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.012, -0.015]} rotation={[0, 0.06, 0]}>
        <boxGeometry args={[0.39, 0.014, 0.26]} />
        <meshStandardMaterial color={C.paper} roughness={0.7} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Loading scene — seal, cabinet, box, soft contact shadows           */
/* ------------------------------------------------------------------ */
function LoadingScene({ reduced }) {
  return (
    <group>
      <Seal reduced={reduced} />
      <Cabinet reduced={reduced} />
      <CardboardBox />
      <Folder reduced={reduced} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.05, 0.004, 0.06]} scale={[1, 1.25, 1]}>
        <circleGeometry args={[0.62, 28]} />
        <meshBasicMaterial color="#2a2f3c" transparent opacity={0.09} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.45, 0.004, -0.7]} scale={[1.2, 1, 1]}>
        <circleGeometry args={[0.6, 28]} />
        <meshBasicMaterial color="#2a2f3c" transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.42, 0.004, 0.1]} scale={[1.15, 1, 1]}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial color="#2a2f3c" transparent opacity={0.09} depthWrite={false} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Party scene — emoji face with blinking puffy eyelids               */
/* ------------------------------------------------------------------ */
function PartyConfetti({ reduced }) {
  const group = useRef()

  useFrame(() => {
    if (!group.current || reduced) return
    const { t, dt } = tick(performance.now())
    group.current.children.forEach((c, i) => {
      const phase = (t * 0.22 + i / 20) % 1
      c.position.set(
        (prand(i + 3) - 0.5) * 3.9 + Math.sin(t * 1.1 + i) * 0.1,
        1.95 - phase * 2.2,
        (prand(i + 31) - 0.5) * 1.2,
      )
      c.rotation.x += dt * (1.2 + (i % 4) * 0.35)
      c.rotation.z += dt * (0.8 + (i % 3) * 0.4)
    })
  })

  return (
    <group ref={group}>
      {Array.from({ length: 26 }, (_, i) => (
        <mesh key={i} geometry={i % 3 === 2 ? undefined : CONFETTI_GEO}>
          {i % 3 === 2 && <tetrahedronGeometry args={[0.085, 0]} />}
          <meshStandardMaterial color={C.confetti[i % C.confetti.length]} roughness={0.45} />
        </mesh>
      ))}
    </group>
  )
}

function PartyStars({ reduced }) {
  const group = useRef()

  useFrame(() => {
    if (!group.current || reduced) return
    const { t } = tick(performance.now())
    group.current.children.forEach((s, i) => {
      s.position.y = [1.3, 0.05][i] + Math.sin(t * 1.3 + i * 2.4) * 0.055
      s.rotation.z = [0.2, -0.3][i] + Math.sin(t * 0.8 + i) * 0.15
      s.rotation.y = Math.sin(t * 0.7 + i) * 0.3
    })
  })

  return (
    <group ref={group}>
      <mesh geometry={STAR_GEO} position={[-1.35, 1.3, 0.1]} scale={1.35}>
        <meshStandardMaterial color={C.star} roughness={0.5} />
      </mesh>
      <mesh geometry={STAR_GEO} position={[1.35, 0.05, 0.05]} scale={1.1}>
        <meshStandardMaterial color={C.star} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Eye({ side, reduced }) {
  const lidLine = useRef()
  const smug = useRef()

  useFrame(() => {
    if (!lidLine.current || !smug.current) return
    const { t } = tick(performance.now())
    if (reduced) {
      lidLine.current.scale.y = 1
      smug.current.scale.setScalar(0.0001)
      return
    }
    /* blink cycle: closed crease ↔ half-open smug look, ~3.2s */
    const cyc = (t * 0.31) % 1
    const open = smooth(0.45, 0.52, cyc) * (1 - smooth(0.92, 0.99, cyc))
    lidLine.current.scale.y = Math.max(0.0001, 1 - open)
    smug.current.scale.setScalar(Math.max(0.0001, open))
  })

  return (
    <group position={[side * 0.28, 0.24, 0.5]}>
      {/* puffy eyelid bump */}
      <mesh scale={[1, 0.9, 0.75]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color={C.face} roughness={0.5} />
      </mesh>
      {/* closed lid crease */}
      <group ref={lidLine} position={[0, 0, 0.14]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.022, 0.16, 4, 10]} />
          <meshStandardMaterial color={C.lid} roughness={0.5} />
        </mesh>
      </group>
      {/* half-open smug eye: pupil under a heavy lid */}
      <group ref={smug}>
        <mesh position={[0, -0.02, 0.13]} scale={[1.5, 0.5, 0.5]}>
          <sphereGeometry args={[0.085, 16, 16]} />
          <meshStandardMaterial color={C.pupil} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.06, 0.12]} scale={[1.15, 0.55, 0.55]}>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshStandardMaterial color={C.face} roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

function PartyFace({ reduced }) {
  const root = useRef()
  const face = useRef()
  const blower = useRef()
  const blowerTip = useRef()
  const born = useRef(null)

  useFrame(() => {
    if (!root.current || !face.current) return
    const { t } = tick(performance.now())
    if (born.current === null) born.current = t

    /* pop-in on the loaded beat (video does a hard cut + grow) */
    const mt = PHASE_FROZEN ? 999 : t - born.current
    root.current.scale.setScalar(
      Math.max(0.0001, reduced ? 1 : easeOutBack(Math.min(1, mt / 0.45))),
    )

    if (reduced) return

    /* bounce + squash & stretch */
    const b = Math.abs(Math.sin(t * 2.6))
    face.current.position.y = 0.78 + b * 0.04
    face.current.scale.set(1 + 0.03 * b, 0.96 - 0.04 * b, 0.94)

    /* blowout unrolls and retracts, wiggling */
    if (blower.current && blowerTip.current) {
      const len = 0.13 + 0.2 * Math.pow(Math.max(0, Math.sin(t * 2.2)), 3)
      blower.current.scale.y = len
      blower.current.position.y = -len / 2
      blowerTip.current.position.y = -len
      blower.current.parent.rotation.z = Math.sin(t * 6) * 0.08
    }
  })

  return (
    <group ref={root}>
      <group ref={face} position={[0, 0.78, 0]} scale={[1, 0.96, 0.94]}>
        <mesh>
          <sphereGeometry args={[0.78, 48, 48]} />
          <meshStandardMaterial color={C.face} roughness={0.5} />
        </mesh>

        <Eye side={-1} reduced={reduced} />
        <Eye side={1} reduced={reduced} />

        {/* mouth + purple blowout hanging down */}
        <mesh position={[0, -0.16, 0.63]} scale={[1.15, 1, 0.5]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={C.mouth} roughness={0.5} />
        </mesh>
        <group position={[0, -0.22, 0.62]} rotation={[0.25, 0, 0]}>
          <group ref={blower}>
            <mesh>
              <cylinderGeometry args={[0.055, 0.05, 1, 12]} />
              <meshStandardMaterial color={C.blower} roughness={0.45} />
            </mesh>
          </group>
          <mesh ref={blowerTip}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color={C.blower} roughness={0.45} />
          </mesh>
        </group>

        {/* purple polka-dot party hat */}
        <group position={[0.3, 0.5, 0.05]} rotation={[0, 0, -0.45]}>
          <mesh position={[0, 0.3, 0]}>
            <coneGeometry args={[0.3, 0.6, 24]} />
            <meshStandardMaterial color={C.hat} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.62, 0]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color={C.hatDot} roughness={0.5} />
          </mesh>
          {[
            [-0.09, 0.14, 0.22], [0.08, 0.1, 0.23], [-0.04, 0.26, 0.21],
            [0.11, 0.24, 0.2], [-0.12, 0.38, 0.17], [0.03, 0.42, 0.17],
            [0.14, 0.36, 0.16],
          ].map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshStandardMaterial color={C.hatDot} roughness={0.45} />
            </mesh>
          ))}
        </group>
      </group>

      <PartyConfetti reduced={reduced} />
      <PartyStars reduced={reduced} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Stage                                                              */
/* ------------------------------------------------------------------ */
function Stage({ celebrate, reduced }) {
  return (
    <>
      <ambientLight intensity={0.95} />
      <hemisphereLight args={['#ffffff', '#dfe3ee', 0.5]} />
      <directionalLight position={[2.5, 4.5, 3.5]} intensity={1.05} />
      <directionalLight position={[-3, 2.5, -2]} intensity={0.35} />
      <directionalLight position={[3, 2, 0.5]} intensity={0.3} />
      <group scale={0.95}>
        {/* Video-style hard cut between the two phases */}
        {!celebrate ? <LoadingScene reduced={reduced} /> : <PartyFace reduced={reduced} />}
      </group>
    </>
  )
}

/**
 * R3F re-aims the default camera at the world origin on resize /
 * camera-prop updates, which would clip the top of the scene.
 * Re-aiming per frame is cheap and always wins.
 */
function CameraRig() {
  useFrame(({ camera }) => {
    camera.lookAt(0, 0.8, 0)
  })
  return null
}

/**
 * @param {boolean} celebrate  true when progress has reached 100%
 * @param {boolean} reduced    prefers-reduced-motion — static pose, no loops
 * @param {boolean} visible    false once the loading screen starts fading out
 */
export default function LoadingMascot({ celebrate, reduced, visible }) {
  const frameloop = reduced ? 'demand' : visible ? 'always' : 'never'

  return (
    <div className="loading-mascot" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={frameloop}
        camera={{ position: [0, 0.85, 4.0], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <CameraRig />
        <Stage celebrate={celebrate} reduced={reduced} />
      </Canvas>
    </div>
  )
}
