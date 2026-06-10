// Chef Kraken — antagonista ativo: escolhe restaurantes de maior valor, anda pelas ruas,
// "devora" e marca pontos; intercepta o combo de MobDyck se chegar perto (GDD §2.4, §3.2, §9.2)
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame } from '../game/store'
import { world } from '../game/world'
import { RESTAURANTS, DIFF_MULT } from '../game/constants'
import { roadPath, doorPos } from '../game/cityLayout'
import { sfx } from '../game/audio'

const KRAKEN_SPEED = 4.4

export default function Kraken() {
  const group = useRef()
  const bodyRef = useRef()
  const forkRef = useRef()
  const ai = useRef({
    phase: 'choose', path: [], wpIdx: 0, eatUntil: 0, target: null,
    stealCd: 0, stingCd: 0, t: 0,
  })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const s = useGame.getState()
    if (!s.running || s.paused) return
    const a = ai.current
    const k = world.kraken
    const now = s.elapsed
    a.t += dt

    if (a.phase === 'choose') {
      const candidates = RESTAURANTS.filter(
        (r) => !r.secreto && !s.kraken.finished.includes(r.id) && s.activeMinigame?.restaurantId !== r.id,
      )
      if (candidates.length === 0) {
        a.phase = 'stalk' // tudo devorado: persegue MobDyck para roubar combo
      } else {
        let best = null, bestV = -1
        for (const r of candidates) {
          const [dx, dz] = doorPos(r)
          const dist = Math.hypot(k.x - dx, k.z - dz)
          const playerDist = Math.hypot(world.player.x - r.pos[0], world.player.z - r.pos[1])
          let v = (r.maxScore * DIFF_MULT[r.diff]) / (dist + 15)
          if (playerDist < 28) v *= 1.6 // "visão de chef": disputa o que MobDyck está mirando
          if (v > bestV) { bestV = v; best = r }
        }
        const [dx, dz] = doorPos(best)
        a.target = best
        a.path = roadPath(k.x, k.z, dx, dz)
        a.wpIdx = 0
        a.phase = 'travel'
        s.krakenSetTarget(best.id)
      }
    }

    if (a.phase === 'travel' && a.path.length) {
      const wp = a.path[a.wpIdx]
      const dx = wp[0] - k.x
      const dz = wp[1] - k.z
      const d = Math.hypot(dx, dz)
      if (d < 0.6) {
        a.wpIdx++
        if (a.wpIdx >= a.path.length) {
          // chegou à porta
          a.phase = 'eating'
          a.eatUntil = now + 8 + Math.random() * 5
          s.krakenEnter(a.target.id)
          k.eating = true
        }
      } else {
        const sp = KRAKEN_SPEED * dt
        k.x += (dx / d) * sp
        k.z += (dz / d) * sp
        k.rot = Math.atan2(dx, dz)
      }
    }

    if (a.phase === 'eating') {
      if (now >= a.eatUntil) {
        const r = a.target
        const pts = Math.round(r.maxScore * (0.45 + Math.random() * 0.35) * DIFF_MULT[r.diff])
        s.krakenFinish(r.id, pts)
        k.eating = false
        a.phase = 'choose'
      }
    }

    if (a.phase === 'stalk') {
      const dx = world.player.x - k.x
      const dz = world.player.z - k.z
      const d = Math.hypot(dx, dz)
      if (d > 3) {
        k.x += (dx / d) * KRAKEN_SPEED * 0.9 * dt
        k.z += (dz / d) * KRAKEN_SPEED * 0.9 * dt
        k.rot = Math.atan2(dx, dz)
      }
    }

    // proximidade com o jogador: sting sonoro e roubo de combo
    if (!s.activeMinigame) {
      const pd = Math.hypot(world.player.x - k.x, world.player.z - k.z)
      if (pd < 14 && now > a.stingCd && !k.eating) {
        a.stingCd = now + 22
        sfx.kraken()
        s.addToast('Chef Kraken está por perto...', '🦑', 2200)
      }
      if (pd < 3 && now > a.stealCd && !k.eating) {
        a.stealCd = now + 16
        s.krakenSteal()
        world.cameraShake = Math.max(world.cameraShake, 0.5)
      }
    }

    // visual
    if (group.current) {
      group.current.position.set(k.x, 0, k.z)
      group.current.rotation.y = k.rot
      group.current.visible = !k.eating
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.abs(Math.sin(a.t * 9)) * 0.07
    }
    if (forkRef.current) {
      forkRef.current.rotation.z = -0.3 + Math.sin(a.t * 4) * 0.12
    }
  })

  return (
    <group ref={group} position={[40, 0, 40]}>
      <group ref={bodyRef}>
        {/* jaleco branco imaculado */}
        <mesh castShadow position={[0, 1.25, 0]}>
          <capsuleGeometry args={[0.45, 1.4, 6, 12]} />
          <meshStandardMaterial color="#f5f5f0" roughness={0.5} />
        </mesh>
        {/* detalhes dourados */}
        {[0.8, 1.15, 1.5].map((y) => (
          <mesh key={y} position={[0, y, 0.42]}>
            <sphereGeometry args={[0.06, 8, 6]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {/* cabeça */}
        <mesh castShadow position={[0, 2.35, 0]}>
          <sphereGeometry args={[0.38, 14, 12]} />
          <meshStandardMaterial color="#e8d8c8" />
        </mesh>
        {/* olhos severos */}
        <mesh position={[-0.13, 2.4, 0.32]}>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshStandardMaterial color="#222244" />
        </mesh>
        <mesh position={[0.13, 2.4, 0.32]}>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshStandardMaterial color="#222244" />
        </mesh>
        {/* cabelo branco pontiagudo */}
        {[-0.18, 0, 0.18].map((x, i) => (
          <mesh key={i} position={[x, 2.72, -0.05]} rotation={[0.25, 0, x * 1.4]}>
            <coneGeometry args={[0.12, 0.45, 6]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
        {/* garfo-cetro gigante */}
        <group ref={forkRef} position={[0.62, 1.4, 0]}>
          <mesh>
            <cylinderGeometry args={[0.045, 0.045, 2.6, 6]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
          </mesh>
          {[-0.1, 0, 0.1].map((x, i) => (
            <mesh key={i} position={[x, 1.45, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.35, 5]} />
              <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
            </mesh>
          ))}
        </group>
        {/* tentáculos nas costas */}
        {[[-0.35, 0.4], [0.35, 0.4], [-0.2, 0.9], [0.2, 0.9]].map(([x, sw], i) => (
          <mesh key={i} position={[x, 1.4, -0.45]} rotation={[0.8, 0, x * 2]}>
            <coneGeometry args={[0.1, 0.8, 6]} />
            <meshStandardMaterial color="#8b5fbf" />
          </mesh>
        ))}
      </group>
    </group>
  )
}
