// Coletáveis do mapa (GDD §4.4): dumplings (stamina), pimenta (velocidade),
// temporizador (+10s) e as 3 Chaves Gastronômicas do restaurante secreto
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame } from '../game/store'
import { world } from '../game/world'
import { PICKUPS } from '../game/cityLayout'

const RESPAWN = { dumpling: 25 }

function PickupMesh({ type }) {
  switch (type) {
    case 'dumpling':
      return (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.34, 10, 8]} />
            <meshStandardMaterial color="#f5e6c8" />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <coneGeometry args={[0.12, 0.18, 8]} />
            <meshStandardMaterial color="#e8d4a8" />
          </mesh>
        </group>
      )
    case 'pimenta':
      return (
        <group>
          <mesh castShadow rotation={[0, 0, 0.4]}>
            <coneGeometry args={[0.18, 0.62, 8]} />
            <meshStandardMaterial color="#ff2222" emissive="#991111" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.12, 0.36, 0]}>
            <cylinderGeometry args={[0.03, 0.05, 0.16, 5]} />
            <meshStandardMaterial color="#2d7a2d" />
          </mesh>
        </group>
      )
    case 'tempo':
      return (
        <group>
          <mesh castShadow>
            <torusGeometry args={[0.32, 0.09, 8, 16]} />
            <meshStandardMaterial color="#22d3ee" emissive="#0e7490" emissiveIntensity={0.8} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.05, 0.4, 0.05]} />
            <meshStandardMaterial color="#22d3ee" emissive="#0e7490" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )
    case 'chave':
      return (
        <group>
          <mesh castShadow position={[0, 0.18, 0]}>
            <torusGeometry args={[0.2, 0.07, 8, 14]} />
            <meshStandardMaterial color="#ffd700" emissive="#aa7700" emissiveIntensity={0.9} metalness={0.7} />
          </mesh>
          <mesh position={[0, -0.18, 0]}>
            <boxGeometry args={[0.09, 0.45, 0.09]} />
            <meshStandardMaterial color="#ffd700" emissive="#aa7700" emissiveIntensity={0.9} metalness={0.7} />
          </mesh>
          <mesh position={[0.1, -0.32, 0]}>
            <boxGeometry args={[0.14, 0.07, 0.07]} />
            <meshStandardMaterial color="#ffd700" emissive="#aa7700" emissiveIntensity={0.9} metalness={0.7} />
          </mesh>
        </group>
      )
    default:
      return null
  }
}

function Pickup({ item, index }) {
  const ref = useRef()
  const st = useRef({ taken: false, respawnAt: 0 })

  useFrame(({ clock }, rawDt) => {
    const s = useGame.getState()
    const w = st.current
    const t = clock.getElapsedTime()
    if (!ref.current) return

    if (w.taken) {
      if (RESPAWN[item.type] && s.elapsed >= w.respawnAt) {
        w.taken = false
        ref.current.visible = true
      } else {
        return
      }
    }

    ref.current.position.y = 1 + Math.sin(t * 2.5 + index) * 0.18
    ref.current.rotation.y = t * 1.8 + index

    if (!s.running || s.paused || s.activeMinigame) return
    const d2 = (world.player.x - item.pos[0]) ** 2 + (world.player.z - item.pos[1]) ** 2
    if (d2 < 1.6 ** 2) {
      w.taken = true
      w.respawnAt = s.elapsed + (RESPAWN[item.type] || 99999)
      ref.current.visible = false
      s.collectPickup(item.type)
    }
  })

  return (
    <group ref={ref} position={[item.pos[0], 1, item.pos[1]]}>
      <PickupMesh type={item.type} />
    </group>
  )
}

export default function Pickups() {
  return (
    <group>
      {PICKUPS.map((item, i) => <Pickup key={i} item={item} index={i} />)}
    </group>
  )
}
