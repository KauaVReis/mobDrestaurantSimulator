// Layout procedural-determinístico de Bellyport: quadras, prédios de preenchimento,
// colisores e a malha de ruas (usada pela IA do Chef Kraken). GDD §4.

import { RESTAURANTS, BAIRROS } from './constants'

// quadras de 30×30 centradas na grade ±60/±20; ruas de 10 de largura em x/z = -40, 0, 40
export const BLOCK_CENTERS = [-60, -20, 20, 60]
export const BLOCK_HALF = 15

const BLOCK_BAIRRO = {
  '-60,-60': 'porto', '-20,-60': 'porto', '20,-60': 'porto', '60,-60': 'beco',
  '-60,-20': 'gourmet', '-20,-20': 'praca', '20,-20': 'praca', '60,-20': 'nacoes',
  '-60,20': 'gourmet', '-20,20': 'mercado', '20,20': 'universitaria', '60,20': 'nacoes',
  '-60,60': 'mercado', '-20,60': 'mercado', '20,60': 'universitaria', '60,60': 'universitaria',
}

export function bairroOfBlock(bx, bz) {
  return BLOCK_BAIRRO[`${bx},${bz}`] || 'praca'
}

function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Restaurante: footprint 13 (largura) × 10 (profundidade), orientado por rot
export function restaurantAABB(r) {
  const w = 13, d = 10
  const horizontal = Math.abs(Math.sin(r.rot)) > 0.5 // porta voltada para ±x
  const hx = horizontal ? d / 2 : w / 2
  const hz = horizontal ? w / 2 : d / 2
  return { x: r.pos[0], z: r.pos[1], hx, hz }
}

export function doorPos(r) {
  const off = 5.8
  return [r.pos[0] + Math.sin(r.rot) * off, r.pos[1] + Math.cos(r.rot) * off]
}

function overlaps(a, b, pad = 1) {
  return Math.abs(a.x - b.x) < a.hx + b.hx + pad && Math.abs(a.z - b.z) < a.hz + b.hz + pad
}

// Prédios de preenchimento por quadra (determinístico)
export function buildFillers() {
  const fillers = []
  const rAABBs = RESTAURANTS.map(restaurantAABB)
  for (const bx of BLOCK_CENTERS) {
    for (const bz of BLOCK_CENTERS) {
      const bairro = bairroOfBlock(bx, bz)
      if (`${bx},${bz}` === '-20,-20') continue // Praça Central — aberta (fonte)
      if (`${bx},${bz}` === '20,-20') continue  // Parque da praça — árvores
      const rand = mulberry32((bx + 200) * 1000 + (bz + 200))
      const slots = [[-7.5, -7.5], [7.5, -7.5], [-7.5, 7.5], [7.5, 7.5]]
      for (const [ox, oz] of slots) {
        if (rand() < 0.18) continue // respiro urbano
        const w = 8 + rand() * 5
        const d = 8 + rand() * 5
        const h = bairro === 'gourmet' ? 14 + rand() * 14 : bairro === 'beco' ? 10 + rand() * 6 : 6 + rand() * 9
        const box = { x: bx + ox, z: bz + oz, hx: w / 2, hz: d / 2 }
        if (rAABBs.some((ra) => overlaps(box, ra, 1.5))) continue
        const pal = BAIRROS[bairro]
        const cor = rand() < 0.5 ? pal.cor : pal.cor2
        fillers.push({ ...box, h, cor, bairro, seed: rand() })
      }
    }
  }
  return fillers
}

export const FILLERS = buildFillers()

// Fonte da Praça Central
export const FOUNTAIN = { x: -14, z: -14, r: 3.2 }

// Colisores estáticos (AABB) — prédios + restaurantes
export const COLLIDERS = [
  ...FILLERS.map((f) => ({ x: f.x, z: f.z, hx: f.hx, hz: f.hz })),
  ...RESTAURANTS.map(restaurantAABB),
  { x: FOUNTAIN.x, z: FOUNTAIN.z, hx: FOUNTAIN.r, hz: FOUNTAIN.r },
]

const PLAYER_R = 0.55

export function resolveCollision(x, z, nx, nz) {
  // tenta mover em cada eixo separadamente (deslize ao longo das paredes)
  let rx = nx, rz = nz
  for (const c of COLLIDERS) {
    if (Math.abs(rx - c.x) < c.hx + PLAYER_R && Math.abs(z - c.z) < c.hz + PLAYER_R) {
      rx = c.x + Math.sign(rx - c.x || 1) * (c.hx + PLAYER_R)
    }
  }
  for (const c of COLLIDERS) {
    if (Math.abs(rx - c.x) < c.hx + PLAYER_R && Math.abs(rz - c.z) < c.hz + PLAYER_R) {
      rz = c.z + Math.sign(rz - c.z || 1) * (c.hz + PLAYER_R)
    }
  }
  return [rx, rz]
}

// ---------- Malha de ruas (IA do Kraken) ----------
const ROAD = [-40, 0, 40]
export const ROAD_NODES = []
for (const x of ROAD) for (const z of ROAD) ROAD_NODES.push([x, z])

function nodeIdx(x, z) {
  return ROAD.indexOf(x) * 3 + ROAD.indexOf(z)
}

function nearestRoadPoint(px, pz) {
  // ponto mais próximo sobre alguma linha de rua
  let best = null, bestD = Infinity
  for (const rx of ROAD) {
    const cz = Math.max(-40, Math.min(40, pz))
    const d = (px - rx) ** 2 + (pz - cz) ** 2
    if (d < bestD) { bestD = d; best = [rx, cz, 'v'] }
  }
  for (const rz of ROAD) {
    const cx = Math.max(-40, Math.min(40, px))
    const d = (px - cx) ** 2 + (pz - rz) ** 2
    if (d < bestD) { bestD = d; best = [cx, rz, 'h'] }
  }
  return best
}

// caminho por waypoints: posição atual → ruas → porta do alvo
export function roadPath(fromX, fromZ, toX, toZ) {
  const a = nearestRoadPoint(fromX, fromZ)
  const b = nearestRoadPoint(toX, toZ)
  const path = [[a[0], a[1]]]

  // nó de grade mais próximo de cada projeção
  const snapNode = (p) => {
    const nx = ROAD.reduce((m, v) => (Math.abs(v - p[0]) < Math.abs(m - p[0]) ? v : m), ROAD[0])
    const nz = ROAD.reduce((m, v) => (Math.abs(v - p[1]) < Math.abs(m - p[1]) ? v : m), ROAD[0])
    return [nx, nz]
  }
  const na = snapNode(a)
  const nb = snapNode(b)

  // BFS na grade 3×3
  const adj = (i) => {
    const xi = Math.floor(i / 3), zi = i % 3
    const out = []
    if (xi > 0) out.push(i - 3)
    if (xi < 2) out.push(i + 3)
    if (zi > 0) out.push(i - 1)
    if (zi < 2) out.push(i + 1)
    return out
  }
  const start = nodeIdx(na[0], na[1])
  const goal = nodeIdx(nb[0], nb[1])
  const prev = new Array(9).fill(-1)
  const seen = new Array(9).fill(false)
  const q = [start]
  seen[start] = true
  while (q.length) {
    const cur = q.shift()
    if (cur === goal) break
    for (const n of adj(cur)) {
      if (!seen[n]) { seen[n] = true; prev[n] = cur; q.push(n) }
    }
  }
  const nodeChain = []
  for (let at = goal; at !== -1; at = prev[at]) nodeChain.unshift(at)
  // ida pela linha da projeção até o primeiro nó
  for (const ni of nodeChain) {
    const x = ROAD[Math.floor(ni / 3)]
    const z = ROAD[ni % 3]
    path.push([x, z])
  }
  path.push([b[0], b[1]])
  path.push([toX, toZ])
  return path
}

// NPCs interativos — posições fixas / por sessão
export const VENDOR_POS = [-26, -9]
export const SKATER_POS = [30, 40]
export const PAPILLE_SPOTS = [[-20, -36], [36, 20], [-36, -20], [20, 36]]

// Poças de molho (GDD §4.4)
export const PUDDLES = [
  [-20, -40], [40, 18], [0, 36], [22, -40], [-40, -12],
]

// Coletáveis
export const PICKUPS = [
  { type: 'dumpling', pos: [-40, -20] }, { type: 'dumpling', pos: [-40, 22] },
  { type: 'dumpling', pos: [40, -22] }, { type: 'dumpling', pos: [40, 24] },
  { type: 'dumpling', pos: [12, 0] }, { type: 'dumpling', pos: [-16, 0] },
  { type: 'dumpling', pos: [0, 26] }, { type: 'dumpling', pos: [0, -28] },
  { type: 'dumpling', pos: [-62, -40] }, { type: 'dumpling', pos: [62, 40] },
  { type: 'pimenta', pos: [4, 4] }, { type: 'pimenta', pos: [-40, 40] }, { type: 'pimenta', pos: [40, -40] },
  { type: 'tempo', pos: [0, -82] }, { type: 'tempo', pos: [82, 0] },
  { type: 'chave', pos: [-82, -82] }, { type: 'chave', pos: [82, 82] }, { type: 'chave', pos: [-82, 82] },
]
