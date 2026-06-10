// Texturas geradas em canvas (placas de restaurante, xadrez do avental, janelas)
import * as THREE from 'three'

const cache = new Map()

export function signTexture(text, bg, fg, emoji) {
  const key = `sign:${text}:${bg}:${fg}`
  if (cache.has(key)) return cache.get(key)
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 128
  const g = c.getContext('2d')
  g.fillStyle = bg
  g.fillRect(0, 0, 512, 128)
  g.strokeStyle = fg
  g.lineWidth = 8
  g.strokeRect(6, 6, 500, 116)
  g.fillStyle = fg
  g.font = 'bold 44px "Segoe UI", sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  let size = 44
  while (g.measureText(`${emoji} ${text}`).width > 470 && size > 22) {
    size -= 2
    g.font = `bold ${size}px "Segoe UI", sans-serif`
  }
  g.fillText(`${emoji} ${text}`, 256, 68)
  const tx = new THREE.CanvasTexture(c)
  tx.anisotropy = 4
  cache.set(key, tx)
  return tx
}

export function checkerTexture(c1 = '#dc2626', c2 = '#ffffff', n = 6) {
  const key = `chk:${c1}:${c2}:${n}`
  if (cache.has(key)) return cache.get(key)
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const s = 64 / n
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      g.fillStyle = (i + j) % 2 ? c1 : c2
      g.fillRect(i * s, j * s, s, s)
    }
  }
  const tx = new THREE.CanvasTexture(c)
  tx.magFilter = THREE.NearestFilter
  cache.set(key, tx)
  return tx
}

export function windowsTexture(base, lit = false) {
  const key = `win:${base}:${lit}`
  if (cache.has(key)) return cache.get(key)
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  g.fillStyle = base
  g.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 5; j++) {
      const on = (i * 7 + j * 13) % 3 !== 0
      g.fillStyle = lit && on ? '#ffd97a' : 'rgba(20,30,50,0.55)'
      g.fillRect(12 + i * 28, 10 + j * 23, 18, 14)
    }
  }
  const tx = new THREE.CanvasTexture(c)
  cache.set(key, tx)
  return tx
}
