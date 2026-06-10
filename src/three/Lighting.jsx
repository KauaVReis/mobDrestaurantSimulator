// Ciclo dia/noite acelerado refletindo o timer (GDD §4.3):
// 0–1:30 amanhecer · 1:30–3:30 meio-dia · 3:30–5:00 entardecer
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../game/store'
import { SESSION_TIME } from '../game/constants'

const SKY = {
  dawn: new THREE.Color('#ffd9a8'),
  noon: new THREE.Color('#8ecdf0'),
  dusk: new THREE.Color('#ff9a5c'),
  night: new THREE.Color('#3a2d5c'),
}
const SUN = {
  dawn: new THREE.Color('#ffd9a0'),
  noon: new THREE.Color('#fffaf0'),
  dusk: new THREE.Color('#ff9955'),
}

export default function Lighting() {
  const dirRef = useRef()
  const ambRef = useRef()
  const hemiRef = useRef()
  const scene = useThree((s) => s.scene)
  const skyColor = useRef(new THREE.Color())
  const sunColor = useRef(new THREE.Color())

  useFrame(() => {
    const s = useGame.getState()
    const p = Math.min(1, s.elapsed / SESSION_TIME) // 0 → 1 ao longo dos 5 min

    let sky, sun, sunI, ambI
    if (p < 0.3) {
      const k = p / 0.3
      sky = skyColor.current.copy(SKY.dawn).lerp(SKY.noon, k)
      sun = sunColor.current.copy(SUN.dawn).lerp(SUN.noon, k)
      sunI = 0.9 + k * 0.5
      ambI = 0.45 + k * 0.25
    } else if (p < 0.7) {
      sky = skyColor.current.copy(SKY.noon)
      sun = sunColor.current.copy(SUN.noon)
      sunI = 1.4
      ambI = 0.7
    } else {
      const k = (p - 0.7) / 0.3
      sky = skyColor.current.copy(SKY.dusk).lerp(SKY.night, k)
      sun = sunColor.current.copy(SUN.dusk)
      sunI = 1.1 - k * 0.65
      ambI = 0.62 - k * 0.3
    }

    // sol cruza o céu de leste a oeste
    const ang = Math.PI * (0.15 + p * 0.7)
    const sx = Math.cos(ang) * 90
    const sy = 35 + Math.sin(ang) * 55
    if (dirRef.current) {
      dirRef.current.position.set(sx, sy, 25)
      dirRef.current.intensity = sunI
      dirRef.current.color.copy(sun)
    }
    if (ambRef.current) ambRef.current.intensity = ambI
    if (hemiRef.current) hemiRef.current.intensity = 0.35
    scene.background = sky
    if (!scene.fog) scene.fog = new THREE.Fog(sky, 90, 220)
    else scene.fog.color.copy(sky)
  })

  return (
    <>
      <ambientLight ref={ambRef} intensity={0.6} />
      <hemisphereLight ref={hemiRef} args={['#bfd9ff', '#8a7a5c', 0.35]} />
      <directionalLight
        ref={dirRef}
        position={[60, 80, 25]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-110}
        shadow-camera-right={110}
        shadow-camera-top={110}
        shadow-camera-bottom={-110}
        shadow-camera-near={10}
        shadow-camera-far={300}
        shadow-bias={-0.0004}
      />
    </>
  )
}
