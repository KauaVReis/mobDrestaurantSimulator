// Estado em tempo real (mutável, fora do React) — posições e stamina lidas a cada frame
// pelo mundo 3D e amostradas pelo HUD/minimapa em baixa frequência.

import { PLAYER } from './constants'

export const world = {
  player: { x: 0, y: 0, z: 30, rot: 0, moving: false, sprinting: false },
  stamina: PLAYER.staminaMax,
  panting: false,
  pantingUntil: 0,
  kraken: { x: 40, z: 40, rot: 0, eating: false },
  cameraShake: 0,
}

export function resetWorld() {
  world.player.x = 0
  world.player.y = 0
  world.player.z = 30
  world.player.rot = Math.PI
  world.player.moving = false
  world.stamina = PLAYER.staminaMax
  world.panting = false
  world.pantingUntil = 0
  world.kraken = { x: 40, z: 40, rot: 0, eating: false }
}
