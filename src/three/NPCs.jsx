// NPCs de Bellyport (GDD §3.3, §9.1): transeuntes neutros, Dr. Gastro (obstáculo),
// Madame Papille, Vendedor de Cachorro-Quente e Zé Roda (interativos)
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame } from '../game/store'
import { world } from '../game/world'
import { VENDOR_POS, SKATER_POS } from '../game/cityLayout'

const ROAD = [-40, 0, 40]
const WALKER_COLORS = ['#e76f51', '#2a9d8f', '#e9c46a', '#9b5de5', '#f15bb5', '#00bbf9', '#fb8500', '#80b918']

function randRoadPoint() {
  if (Math.random() < 0.5) {
    return [ROAD[Math.floor(Math.random() * 3)] + (Math.random() * 8 - 4), Math.random() * 140 - 70]
  }
  return [Math.random() * 140 - 70, ROAD[Math.floor(Math.random() * 3)] + (Math.random() * 8 - 4)]
}

function Walker({ seed }) {
  const ref = useRef()
  const st = useRef({
    pos: randRoadPoint(),
    target: randRoadPoint(),
    speed: 1.2 + Math.random() * 1.4,
    pause: 0,
    t: Math.random() * 10,
  })
  const color = WALKER_COLORS[seed % WALKER_COLORS.length]
  const scale = 0.8 + (seed % 5) * 0.07

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const w = st.current
    w.t += dt
    const s = useGame.getState()
    if (!s.running || s.paused) return
    if (w.pause > 0) {
      w.pause -= dt
    } else {
      const dx = w.target[0] - w.pos[0]
      const dz = w.target[1] - w.pos[1]
      const d = Math.hypot(dx, dz)
      if (d < 1) {
        w.target = randRoadPoint()
        if (Math.random() < 0.3) w.pause = 1 + Math.random() * 2 // turista parado tirando foto
      } else {
        w.pos[0] += (dx / d) * w.speed * dt
        w.pos[1] += (dz / d) * w.speed * dt
        if (ref.current) ref.current.rotation.y = Math.atan2(dx, dz)
      }
    }
    if (ref.current) {
      ref.current.position.set(w.pos[0], Math.abs(Math.sin(w.t * 7)) * 0.06, w.pos[1])
    }
  })

  return (
    <group ref={ref} scale={scale}>
      <mesh castShadow position={[0, 0.75, 0]}>
        <capsuleGeometry args={[0.3, 0.8, 4, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.24, 10, 8]} />
        <meshStandardMaterial color="#ecbf94" />
      </mesh>
    </group>
  )
}

// Dr. Gastro — Inspetor de Saúde (GDD §3.3.3): detecta, persegue e congela MobDyck por 3s
function Inspector() {
  const ref = useRef()
  const st = useRef({
    pos: [-6, -6], patrol: [[-6, -6], [6, -6], [6, 6], [-6, 6]], pi: 0,
    mode: 'patrol', chaseT: 0, catchCd: 0, t: 0,
  })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const s = useGame.getState()
    const w = st.current
    w.t += dt
    if (!s.running || s.paused) return
    const now = s.elapsed
    const px = world.player.x, pz = world.player.z
    const d = Math.hypot(px - w.pos[0], pz - w.pos[1])

    // NPCs obstáculo ficam mais agressivos no fim (GDD §9.1 camada 3)
    const aggro = s.timeLeft < 60 ? 10 : 7

    if (w.mode === 'patrol') {
      const tgt = w.patrol[w.pi]
      const dx = tgt[0] - w.pos[0], dz = tgt[1] - w.pos[1]
      const dd = Math.hypot(dx, dz)
      if (dd < 0.8) w.pi = (w.pi + 1) % w.patrol.length
      else {
        w.pos[0] += (dx / dd) * 2 * dt
        w.pos[1] += (dz / dd) * 2 * dt
        if (ref.current) ref.current.rotation.y = Math.atan2(dx, dz)
      }
      if (d < aggro && now > w.catchCd && !s.activeMinigame) {
        w.mode = 'chase'; w.chaseT = 0
      }
    } else {
      // perseguição
      w.chaseT += dt
      const dx = px - w.pos[0], dz = pz - w.pos[1]
      const dd = Math.hypot(dx, dz) || 1
      const speed = s.timeLeft < 60 ? 5.2 : 4.6
      w.pos[0] += (dx / dd) * speed * dt
      w.pos[1] += (dz / dd) * speed * dt
      if (ref.current) ref.current.rotation.y = Math.atan2(dx, dz)
      if (dd < 1.2 && !world.player.rolling && !s.activeMinigame) {
        s.inspectorCatch()
        world.cameraShake = Math.max(world.cameraShake, 0.4)
        w.mode = 'patrol'
        w.catchCd = now + 9
      } else if (w.chaseT > 9 || d > 22 || s.activeMinigame) {
        w.mode = 'patrol'
        w.catchCd = now + 4
      }
    }
    if (ref.current) {
      ref.current.position.set(w.pos[0], Math.abs(Math.sin(w.t * 9)) * 0.05, w.pos[1])
    }
  })

  return (
    <group ref={ref}>
      <mesh castShadow position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.32, 0.9, 4, 10]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      <mesh castShadow position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.25, 10, 8]} />
        <meshStandardMaterial color="#d9a679" />
      </mesh>
      {/* quepe de inspetor */}
      <mesh position={[0, 1.88, 0]}>
        <cylinderGeometry args={[0.26, 0.28, 0.12, 10]} />
        <meshStandardMaterial color="#2c3e6b" />
      </mesh>
      {/* prancheta */}
      <mesh position={[0.4, 1, 0.2]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.3, 0.4, 0.04]} />
        <meshStandardMaterial color="#c8a165" />
      </mesh>
      <Exclaim />
    </group>
  )
}

function Exclaim() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = 2.3 + Math.sin(clock.getElapsedTime() * 5) * 0.08
  })
  return (
    <mesh ref={ref} position={[0, 2.3, 0]}>
      <coneGeometry args={[0.09, 0.3, 6]} />
      <meshBasicMaterial color="#ff3333" toneMapped={false} />
    </mesh>
  )
}

function Papille() {
  const spot = useGame((s) => s.papilleSpot)
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.03
  })
  return (
    <group position={[spot[0], 0, spot[1]]}>
      <group ref={ref}>
        <mesh castShadow position={[0, 0.85, 0]}>
          <coneGeometry args={[0.55, 1.7, 12]} />
          <meshStandardMaterial color="#7d3c98" />
        </mesh>
        <mesh castShadow position={[0, 1.85, 0]}>
          <sphereGeometry args={[0.24, 10, 8]} />
          <meshStandardMaterial color="#f5d5b8" />
        </mesh>
        {/* chapéu chique */}
        <mesh position={[0, 2.1, 0]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.45, 0.45, 0.08, 12]} />
          <meshStandardMaterial color="#c2185b" />
        </mesh>
        <mesh position={[0, 2.25, 0]}>
          <cylinderGeometry args={[0.2, 0.22, 0.3, 10]} />
          <meshStandardMaterial color="#c2185b" />
        </mesh>
        {/* monóculo */}
        <mesh position={[0.12, 1.88, 0.22]}>
          <torusGeometry args={[0.07, 0.015, 6, 12]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} />
        </mesh>
      </group>
      <Balloon icon="💬" />
    </group>
  )
}

function Balloon() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = 2.8 + Math.sin(clock.getElapsedTime() * 3) * 0.1
      ref.current.rotation.y = clock.getElapsedTime() * 1.5
    }
  })
  return (
    <mesh ref={ref} position={[0, 2.8, 0]}>
      <octahedronGeometry args={[0.18]} />
      <meshBasicMaterial color="#ffd700" toneMapped={false} />
    </mesh>
  )
}

function Vendor() {
  return (
    <group position={[VENDOR_POS[0], 0, VENDOR_POS[1]]}>
      {/* carrinho */}
      <mesh castShadow position={[0, 0.6, -0.8]}>
        <boxGeometry args={[1.8, 1, 1]} />
        <meshStandardMaterial color="#d35400" />
      </mesh>
      <mesh position={[0, 1.9, -0.8]}>
        <coneGeometry args={[1.2, 0.7, 8]} />
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
      <mesh position={[0, 1.35, -0.8]}>
        <cylinderGeometry args={[0.05, 0.05, 1.4, 6]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      {/* vendedor */}
      <mesh castShadow position={[0, 0.75, 0.3]}>
        <capsuleGeometry args={[0.3, 0.8, 4, 10]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0.3]}>
        <sphereGeometry args={[0.23, 10, 8]} />
        <meshStandardMaterial color="#caa472" />
      </mesh>
      <Balloon />
    </group>
  )
}

function Skater() {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.rotation.y = Math.sin(t * 1.4) * 0.7
      ref.current.position.y = Math.abs(Math.sin(t * 4)) * 0.12
    }
  })
  return (
    <group position={[SKATER_POS[0], 0, SKATER_POS[1]]}>
      <group ref={ref}>
        {/* skate */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.9, 0.06, 0.32]} />
          <meshStandardMaterial color="#27ae60" />
        </mesh>
        <mesh castShadow position={[0, 0.85, 0]}>
          <capsuleGeometry args={[0.28, 0.75, 4, 10]} />
          <meshStandardMaterial color="#f39c12" />
        </mesh>
        <mesh castShadow position={[0, 1.6, 0]}>
          <sphereGeometry args={[0.23, 10, 8]} />
          <meshStandardMaterial color="#b07c4f" />
        </mesh>
        {/* boné para trás */}
        <mesh position={[0, 1.78, -0.08]} rotation={[-0.3, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.25, 0.12, 10]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      </group>
      <Balloon />
    </group>
  )
}

export default function NPCs() {
  const seeds = useMemo(() => Array.from({ length: 14 }, (_, i) => i), [])
  return (
    <group>
      {seeds.map((i) => <Walker key={i} seed={i} />)}
      <Inspector />
      <Papille />
      <Vendor />
      <Skater />
    </group>
  )
}
