// Prédios dos restaurantes — fachada, placa luminosa, bandeirinha de estado (GDD §4.2, §5.3)
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RESTAURANTS, DIFF_COLOR } from '../game/constants'
import { doorPos } from '../game/cityLayout'
import { useGame } from '../game/store'
import { signTexture } from './textures'

function flagColor(st, secretLocked) {
  if (secretLocked) return '#222222'
  if (st.visited) return st.rating && st.rating.stars >= 2 ? '#22c55e' : '#eab308' // verde / amarelo
  if (st.krakenAte) return '#a855f7'
  return '#ef4444' // vermelho = não visitado
}

function Restaurant({ r }) {
  const st = useGame((s) => s.restaurants[r.id])
  const krakenInside = useGame((s) => s.kraken.insideId === r.id)
  const secretUnlocked = useGame((s) => s.secretUnlocked)
  const hintRevealed = useGame((s) => s.hintRevealed)
  const isBonus = useGame((s) => s.bonusRestaurantId === r.id)

  const locked = r.secreto && !secretUnlocked
  const [dx, dz] = useMemo(() => doorPos(r), [r])
  const signTx = useMemo(
    () => signTexture(locked ? '? ? ?' : r.nome, locked ? '#0a0a12' : r.cor, locked ? '#39ff8e' : r.corPlaca, locked ? '🔒' : r.emoji),
    [r, locked],
  )

  const padRef = useRef()
  const flagRef = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (padRef.current) {
      const avail = !st.visited && !locked && !krakenInside
      padRef.current.material.opacity = avail ? 0.45 + Math.sin(t * 3.5) * 0.25 : 0.18
    }
    if (flagRef.current) flagRef.current.rotation.y = Math.sin(t * 2 + r.pos[0]) * 0.25
  })

  const padColor = krakenInside ? '#a855f7' : st.visited ? '#6b7280' : locked ? '#1f2937' : (isBonus && hintRevealed) ? '#fbbf24' : '#4ade80'
  const corpoCor = locked ? '#141022' : r.cor

  return (
    <group position={[r.pos[0], 0, r.pos[1]]} rotation={[0, r.rot, 0]}>
      {/* corpo do prédio (13 × 7 × 10, porta voltada para +z local) */}
      <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[13, 7, 10]} />
        <meshStandardMaterial color={corpoCor} roughness={0.8} />
      </mesh>
      {/* telhado */}
      <mesh position={[0, 7.3, 0]} castShadow>
        <boxGeometry args={[13.8, 0.6, 10.8]} />
        <meshStandardMaterial color="#33262b" />
      </mesh>
      {/* vitrines */}
      <mesh position={[-3.6, 2, 5.05]}>
        <boxGeometry args={[3.4, 2.6, 0.12]} />
        <meshStandardMaterial color="#bfe3f2" roughness={0.1} metalness={0.3} emissive="#9fd8ee" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[3.6, 2, 5.05]}>
        <boxGeometry args={[3.4, 2.6, 0.12]} />
        <meshStandardMaterial color="#bfe3f2" roughness={0.1} metalness={0.3} emissive="#9fd8ee" emissiveIntensity={0.35} />
      </mesh>
      {/* porta */}
      <mesh position={[0, 1.6, 5.06]}>
        <boxGeometry args={[2.2, 3.2, 0.15]} />
        <meshStandardMaterial color={locked ? '#0c0c14' : '#4a2c17'} />
      </mesh>
      {/* toldo */}
      <mesh position={[0, 3.6, 5.7]} rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[4.2, 0.18, 1.8]} />
        <meshStandardMaterial color={r.corPlaca} />
      </mesh>
      {/* placa luminosa */}
      <mesh position={[0, 5.9, 5.2]}>
        <planeGeometry args={[11, 2.6]} />
        <meshBasicMaterial map={signTx} toneMapped={false} />
      </mesh>
      {/* selo de dificuldade */}
      <mesh position={[5.2, 4.4, 5.06]}>
        <circleGeometry args={[0.55, 14]} />
        <meshBasicMaterial color={DIFF_COLOR[r.diff]} toneMapped={false} />
      </mesh>
      {/* bandeirinha de estado no mastro */}
      <group position={[-6, 0, 5.5]}>
        <mesh position={[0, 4.2, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 8.4, 6]} />
          <meshStandardMaterial color="#3f3f46" />
        </mesh>
        <group ref={flagRef} position={[0, 7.6, 0]}>
          <mesh position={[0.75, 0, 0]}>
            <boxGeometry args={[1.5, 0.95, 0.06]} />
            <meshBasicMaterial color={flagColor(st, locked)} toneMapped={false} />
          </mesh>
        </group>
      </group>
      {/* tapete de entrada (zona de interação) — em coords do grupo: porta local fica em z+ */}
      <mesh ref={padRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 6.6]}>
        <circleGeometry args={[1.9, 20]} />
        <meshBasicMaterial color={padColor} transparent opacity={0.4} toneMapped={false} />
      </mesh>
      {/* vapor de comida (partícula simples) */}
      {!locked && <Steam x={4.5} z={3} />}
    </group>
  )
}

function Steam({ x, z }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * 0.5 + x) % 1
    if (ref.current) {
      ref.current.position.y = 7.6 + t * 2.2
      ref.current.material.opacity = 0.5 * (1 - t)
      ref.current.scale.setScalar(0.6 + t * 1.1)
    }
  })
  return (
    <mesh ref={ref} position={[x, 8, z]}>
      <sphereGeometry args={[0.5, 8, 6]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.4} depthWrite={false} />
    </mesh>
  )
}

export default function Restaurants() {
  return (
    <group>
      {RESTAURANTS.map((r) => <Restaurant key={r.id} r={r} />)}
    </group>
  )
}
