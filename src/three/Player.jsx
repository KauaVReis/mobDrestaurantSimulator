// MobDyck jogável — movimento arcade, stamina, esquiva, pulo, câmera e interação (GDD §5.1–5.2, §12)
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import MobDyckModel from './MobDyckModel'
import { useGame } from '../game/store'
import { world } from '../game/world'
import { keys, consumePress, clearPresses } from '../game/input'
import { PLAYER, RESTAURANTS, DIFF_LABEL, MAP_BOUND } from '../game/constants'
import { resolveCollision, doorPos, PUDDLES, VENDOR_POS, SKATER_POS } from '../game/cityLayout'
import { sfx } from '../game/audio'

const DOORS = RESTAURANTS.map((r) => ({ r, door: doorPos(r) }))

export default function Player() {
  const group = useRef()
  const refs = {
    body: useRef(), mouth: useRef(),
    legL: useRef(), legR: useRef(),
    armL: useRef(), armR: useRef(),
  }
  const camera = useThree((s) => s.camera)

  const phys = useRef({
    vy: 0, y: 0, onGround: true,
    rollUntil: 0, rollDir: [0, 1], rollCdUntil: 0,
    zoom: 1, animT: 0, lastSkate: -99,
  })

  useEffect(() => {
    const onWheel = (e) => {
      const p = phys.current
      p.zoom = Math.min(1.45, Math.max(0.55, p.zoom + e.deltaY * 0.0008))
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    camera.position.set(world.player.x, 14, world.player.z + 14)
    return () => window.removeEventListener('wheel', onWheel)
  }, [camera])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const s = useGame.getState()
    const p = phys.current
    const pl = world.player
    const inMinigame = !!s.activeMinigame
    const blocked = !s.running || s.paused || inMinigame || s.mapOpen
    if (blocked) clearPresses() // não deixa E/Espaço/Q apertados no minigame vazarem para a cidade

    p.animT += dt

    const now = s.elapsed
    const frozen = now < s.buffs.frozenUntil

    // ---------- entrada de movimento ----------
    let mx = 0, mz = 0
    if (!blocked && !frozen) {
      if (keys['w'] || keys['arrowup']) mz -= 1
      if (keys['s'] || keys['arrowdown']) mz += 1
      if (keys['a'] || keys['arrowleft']) mx -= 1
      if (keys['d'] || keys['arrowright']) mx += 1
    }
    const moving = mx !== 0 || mz !== 0
    const len = moving ? Math.hypot(mx, mz) : 1
    mx /= len; mz /= len

    // ---------- stamina e sprint (GDD §5.1) ----------
    world.panting = now < world.pantingUntil
    const wantSprint = (keys['shift'] && moving && !world.panting && world.stamina > 0)
    if (wantSprint) {
      world.stamina = Math.max(0, world.stamina - PLAYER.staminaDrain * dt)
      if (world.stamina <= 0) world.pantingUntil = now + PLAYER.pantingTime
    } else {
      world.stamina = Math.min(PLAYER.staminaMax, world.stamina + PLAYER.staminaRegen * (moving ? 0.7 : 1.3) * dt)
    }

    // ---------- esquiva / roll ----------
    const isRolling = now < p.rollUntil
    if (!blocked && !frozen && !isRolling && now > p.rollCdUntil && (consumePress('control') || consumePress('c'))) {
      if (world.stamina >= PLAYER.rollCost) {
        world.stamina -= PLAYER.rollCost
        p.rollUntil = now + PLAYER.rollTime
        p.rollCdUntil = now + PLAYER.rollCooldown
        p.rollDir = moving ? [mx, mz] : [Math.sin(pl.rot), Math.cos(pl.rot)]
        sfx.roll()
      }
    }

    // ---------- pulo ----------
    if (!blocked && !frozen && p.onGround && consumePress(' ')) {
      p.vy = PLAYER.jumpVel
      p.onGround = false
      sfx.jump()
    }
    if (!p.onGround) {
      p.vy += PLAYER.gravity * dt
      p.y += p.vy * dt
      if (p.y <= 0) {
        p.y = 0; p.vy = 0; p.onGround = true
        if (refs.body.current) refs.body.current.scale.set(1.15, 0.82, 1.15)
      }
    }

    // ---------- velocidade ----------
    let speed = wantSprint ? PLAYER.sprintSpeed : PLAYER.walkSpeed
    if (world.panting) speed *= PLAYER.pantingFactor
    if (now < s.buffs.pepperUntil) speed *= 1.4
    if (now < s.buffs.skateUntil) speed *= 2
    if (now < s.buffs.slowUntil) speed *= 0.7

    let vx = moving ? mx * speed : 0
    let vz = moving ? mz * speed : 0
    if (now < p.rollUntil) {
      vx = p.rollDir[0] * PLAYER.rollSpeed
      vz = p.rollDir[1] * PLAYER.rollSpeed
    }

    // ---------- integração + colisão ----------
    if (vx || vz) {
      let nx = pl.x + vx * dt
      let nz = pl.z + vz * dt
      nx = Math.max(-MAP_BOUND, Math.min(MAP_BOUND, nx))
      nz = Math.max(-MAP_BOUND, Math.min(MAP_BOUND, nz))
      const [cx, cz] = resolveCollision(pl.x, pl.z, nx, nz)
      pl.x = cx; pl.z = cz
      const targetRot = Math.atan2(vx, vz)
      let d = targetRot - pl.rot
      while (d > Math.PI) d -= Math.PI * 2
      while (d < -Math.PI) d += Math.PI * 2
      pl.rot += d * Math.min(1, dt * 14)
    }
    pl.y = p.y
    pl.moving = moving || now < p.rollUntil
    pl.sprinting = wantSprint
    pl.rolling = now < p.rollUntil + 0.18 // i-frames

    // poças de molho
    if (!blocked) {
      for (const [px, pz] of PUDDLES) {
        if ((pl.x - px) ** 2 + (pl.z - pz) ** 2 < 1.7 ** 2) s.slowPuddle()
      }
    }

    // ---------- interação ----------
    if (!blocked) {
      let best = null, bestD = 9
      for (const { r, door } of DOORS) {
        const d2 = (pl.x - door[0]) ** 2 + (pl.z - door[1]) ** 2
        if (d2 < bestD) {
          const st = s.restaurants[r.id]
          const lockTxt = r.secreto && !s.secretUnlocked ? ' 🔒'
            : st.visited ? ' (já visitado)'
            : s.kraken.insideId === r.id ? ' (Kraken dentro!)'
            : st.abandoned ? ' (abandonado: bônus −50%)'
            : ''
          best = { key: `r:${r.id}`, type: 'restaurant', id: r.id, label: `Entrar: ${r.nome} — ${DIFF_LABEL[r.diff]}${lockTxt}` }
          bestD = d2
        }
      }
      const npcs = [
        { key: 'n:vendedor', type: 'npc', id: 'vendedor', pos: VENDOR_POS, label: 'Cachorro-quente (+40 stamina por −20 pts)' },
        { key: 'n:skatista', type: 'npc', id: 'skatista', pos: SKATER_POS, label: 'Carona com Zé Roda (velocidade ×2 por 5s)' },
        { key: 'n:papille', type: 'npc', id: 'papille', pos: s.papilleSpot, label: 'Conversar com Madame Papille' },
      ]
      for (const n of npcs) {
        const d2 = (pl.x - n.pos[0]) ** 2 + (pl.z - n.pos[1]) ** 2
        if (d2 < bestD && d2 < 7) { best = n; bestD = d2 }
      }
      s.setInteractTarget(best)

      if (consumePress('e') && best) {
        if (best.type === 'restaurant') s.tryEnterRestaurant(best.id)
        else if (best.id === 'skatista') {
          if (now - p.lastSkate > 20) { p.lastSkate = now; s.interactNPC('skatista') }
          else s.addToast('Zé Roda está descansando... aguarde um pouco', '🛹')
        } else s.interactNPC(best.id)
      }
      if (consumePress('q')) s.activateVoracity()
    } else {
      s.setInteractTarget(null)
    }

    // ---------- posiciona modelo ----------
    if (group.current) {
      group.current.position.set(pl.x, p.y, pl.z)
      group.current.rotation.y = pl.rot
      if (frozen) group.current.position.x += Math.sin(p.animT * 40) * 0.04
    }

    // animações
    const sp = pl.moving ? (wantSprint ? 13 : 9) : 0
    if (refs.legL.current && refs.legR.current) {
      const sw = pl.moving ? Math.sin(p.animT * sp) * 0.45 : 0
      refs.legL.current.rotation.x = sw
      refs.legR.current.rotation.x = -sw
    }
    if (refs.armL.current && refs.armR.current) {
      const sw = pl.moving ? Math.sin(p.animT * sp) * 0.5 : Math.sin(p.animT * 2) * 0.08
      refs.armL.current.rotation.x = -sw
      refs.armR.current.rotation.x = sw
    }
    if (refs.body.current) {
      const b = refs.body.current
      // squash & stretch suave de volta ao normal
      b.scale.x += (1 - b.scale.x) * dt * 8
      b.scale.y += (1 - b.scale.y) * dt * 8
      b.scale.z += (1 - b.scale.z) * dt * 8
      b.position.y = pl.moving ? Math.abs(Math.sin(p.animT * sp)) * 0.08 : Math.sin(p.animT * 2.2) * 0.04
      b.rotation.x = now < p.rollUntil ? ((p.rollUntil - now) / PLAYER.rollTime) * -Math.PI * 2 : 0
    }
    if (refs.mouth.current) {
      const open = world.panting ? 0.8 : pl.moving && wantSprint ? 0.6 : 0.45
      refs.mouth.current.scale.y = open + Math.sin(p.animT * 6) * 0.05
    }

    // ---------- câmera (GDD §12.1) ----------
    const zoom = p.zoom
    const shake = world.cameraShake
    if (shake > 0) world.cameraShake = Math.max(0, shake - dt * 2.5)
    const camTarget = new THREE.Vector3(
      pl.x + (Math.random() - 0.5) * shake,
      p.y * 0.5 + 11 * zoom + (Math.random() - 0.5) * shake,
      pl.z + 12.5 * zoom,
    )
    camera.position.lerp(camTarget, 1 - Math.pow(0.00002, dt))
    camera.lookAt(pl.x, p.y * 0.5 + 1.6, pl.z)
  })

  return (
    <group ref={group} position={[0, 0, 30]}>
      <MobDyckModel refs={refs} />
      <VoracityAura />
    </group>
  )
}

function VoracityAura() {
  const ref = useRef()
  useFrame(({ clock }) => {
    const s = useGame.getState()
    const active = s.elapsed < s.voracityUntil
    if (ref.current) {
      ref.current.visible = active
      if (active) {
        const t = clock.getElapsedTime()
        ref.current.scale.setScalar(1 + Math.sin(t * 8) * 0.08)
        ref.current.rotation.y = t * 2
      }
    }
  })
  return (
    <mesh ref={ref} position={[0, 1, 0]} visible={false}>
      <torusGeometry args={[1.3, 0.07, 8, 28]} />
      <meshBasicMaterial color="#ff8c1a" transparent opacity={0.85} toneMapped={false} />
    </mesh>
  )
}
