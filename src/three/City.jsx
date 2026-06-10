// Bellyport — chão pintado em canvas, prédios das quadras, props e poças
import { useMemo } from 'react'
import * as THREE from 'three'
import { BAIRROS } from '../game/constants'
import { BLOCK_CENTERS, BLOCK_HALF, bairroOfBlock, FILLERS, FOUNTAIN, PUDDLES } from '../game/cityLayout'
import { windowsTexture } from './textures'

const WORLD = 200 // textura cobre [-100, 100]²

function makeGroundTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 1024
  const g = c.getContext('2d')
  const s = 1024 / WORLD
  const wx = (x) => (x + WORLD / 2) * s
  const wz = (z) => (z + WORLD / 2) * s

  // base: calçadão perimetral
  g.fillStyle = '#8e9298'
  g.fillRect(0, 0, 1024, 1024)

  // água do porto (norte)
  g.fillStyle = '#2c6e9e'
  g.fillRect(0, 0, 1024, wz(-91))
  g.fillStyle = '#3a82b5'
  for (let i = 0; i < 40; i++) {
    g.fillRect((i * 53) % 1024, (i * 31) % wz(-92), 28, 3)
  }
  // deck de madeira do porto
  g.fillStyle = '#9a6b42'
  g.fillRect(0, wz(-91), 1024, wz(-76) - wz(-91))
  g.strokeStyle = 'rgba(0,0,0,0.25)'
  g.lineWidth = 1
  for (let x = 0; x < 1024; x += 14) {
    g.beginPath(); g.moveTo(x, wz(-91)); g.lineTo(x, wz(-76)); g.stroke()
  }

  // quadras com a cor do bairro
  for (const bx of BLOCK_CENTERS) {
    for (const bz of BLOCK_CENTERS) {
      const pal = BAIRROS[bairroOfBlock(bx, bz)]
      g.fillStyle = pal.chao
      g.fillRect(wx(bx - BLOCK_HALF), wz(bz - BLOCK_HALF), BLOCK_HALF * 2 * s, BLOCK_HALF * 2 * s)
      // meio-fio
      g.strokeStyle = 'rgba(255,255,255,0.35)'
      g.lineWidth = 2
      g.strokeRect(wx(bx - BLOCK_HALF), wz(bz - BLOCK_HALF), BLOCK_HALF * 2 * s, BLOCK_HALF * 2 * s)
    }
  }

  // ruas
  g.fillStyle = '#3b3d44'
  for (const r of [-40, 0, 40]) {
    g.fillRect(wx(r - 5), wz(-75), 10 * s, (150) * s)  // vertical
    g.fillRect(wx(-75), wz(r - 5), 150 * s, 10 * s)    // horizontal
  }
  // faixas centrais tracejadas
  g.fillStyle = '#d9d9d9'
  for (const r of [-40, 0, 40]) {
    for (let t = -72; t < 72; t += 8) {
      g.fillRect(wx(r - 0.35), wz(t), 0.7 * s, 4 * s)
      g.fillRect(wx(t), wz(r - 0.35), 4 * s, 0.7 * s)
    }
  }
  // faixas de pedestre nos cruzamentos
  g.fillStyle = '#e8e8e8'
  for (const ix of [-40, 0, 40]) {
    for (const iz of [-40, 0, 40]) {
      for (let k = -4; k <= 4; k += 2) {
        g.fillRect(wx(ix + k - 0.6), wz(iz - 7.5), 1.2 * s, 2 * s)
        g.fillRect(wx(ix + k - 0.6), wz(iz + 5.5), 1.2 * s, 2 * s)
      }
    }
  }

  // praça central — piso decorado em círculos
  const cx = wx(-20), cz = wz(-20)
  g.fillStyle = '#d9cdb4'
  g.beginPath(); g.arc(cx, cz, 14 * s, 0, Math.PI * 2); g.fill()
  g.strokeStyle = '#bfae8e'
  g.lineWidth = 3
  for (const rr of [5, 9, 13]) {
    g.beginPath(); g.arc(cx, cz, rr * s, 0, Math.PI * 2); g.stroke()
  }

  const tx = new THREE.CanvasTexture(c)
  tx.anisotropy = 8
  return tx
}

function Filler({ f }) {
  const winTx = useMemo(() => windowsTexture(f.cor, true), [f.cor])
  return (
    <group position={[f.x, 0, f.z]}>
      <mesh position={[0, f.h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[f.hx * 2, f.h, f.hz * 2]} />
        <meshStandardMaterial map={winTx} color="#ffffff" roughness={0.85} />
      </mesh>
      <mesh position={[0, f.h + 0.25, 0]}>
        <boxGeometry args={[f.hx * 2 + 0.5, 0.5, f.hz * 2 + 0.5]} />
        <meshStandardMaterial color="#2f3138" roughness={1} />
      </mesh>
    </group>
  )
}

function Tree({ x, z, s = 1 }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.26, 1.8, 6]} />
        <meshStandardMaterial color="#6b4226" />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow>
        <sphereGeometry args={[1.15, 10, 8]} />
        <meshStandardMaterial color="#3f8f4a" roughness={1} />
      </mesh>
    </group>
  )
}

function Lamp({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 4.4, 6]} />
        <meshStandardMaterial color="#2a2d33" />
      </mesh>
      <mesh position={[0, 4.5, 0]}>
        <sphereGeometry args={[0.32, 8, 8]} />
        <meshBasicMaterial color="#ffd98a" />
      </mesh>
    </group>
  )
}

export default function City() {
  const groundTx = useMemo(makeGroundTexture, [])
  const lamps = useMemo(() => {
    const out = []
    for (const x of [-40, 0, 40]) for (const z of [-40, 0, 40]) out.push([x + 6.5, z + 6.5])
    return out
  }, [])

  return (
    <group>
      {/* chão */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[WORLD, WORLD]} />
        <meshStandardMaterial map={groundTx} roughness={1} />
      </mesh>

      {/* prédios de preenchimento */}
      {FILLERS.map((f, i) => <Filler key={i} f={f} />)}

      {/* fonte da Praça Central */}
      <group position={[FOUNTAIN.x, 0, FOUNTAIN.z]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[FOUNTAIN.r, FOUNTAIN.r + 0.3, 0.8, 18]} />
          <meshStandardMaterial color="#cfc3ab" />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[FOUNTAIN.r - 0.7, FOUNTAIN.r - 0.7, 0.25, 18]} />
          <meshStandardMaterial color="#4fa3d1" roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh position={[0, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.55, 1.6, 10]} />
          <meshStandardMaterial color="#cfc3ab" />
        </mesh>
        <mesh position={[0, 2.5, 0]} castShadow>
          <sphereGeometry args={[0.5, 10, 8]} />
          <meshStandardMaterial color="#4fa3d1" roughness={0.2} />
        </mesh>
      </group>

      {/* parque (quadra 20,-20) */}
      <Tree x={14} z={-26} s={1.2} />
      <Tree x={26} z={-14} s={1} />
      <Tree x={20} z={-20} s={1.4} />
      <Tree x={27} z={-27} s={0.9} />
      <Tree x={13} z={-13} s={1.1} />
      {/* árvores da praça */}
      <Tree x={-30} z={-30} s={1} />
      <Tree x={-8} z={-30} s={0.9} />

      {/* postes nos cruzamentos */}
      {lamps.map(([x, z], i) => <Lamp key={i} x={x} z={z} />)}

      {/* caixotes do porto */}
      {[[-66, -78], [-60, -79], [-63, -76], [30, -78], [34, -79]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.6, z]} rotation={[0, i * 0.6, 0]} castShadow>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial color="#a07644" />
        </mesh>
      ))}

      {/* poças de molho (GDD §4.4) */}
      {PUDDLES.map(([x, z], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]}>
          <circleGeometry args={[1.7, 16]} />
          <meshStandardMaterial color="#c2410c" transparent opacity={0.85} roughness={0.25} />
        </mesh>
      ))}
    </group>
  )
}
