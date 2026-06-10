// Validação offline: rotas do Kraken até cada restaurante + sanidade do balanceamento
import { RESTAURANTS, DIFF_MULT, comboBonus, ratingFor } from '../src/game/constants.js'
import { roadPath, doorPos, COLLIDERS } from '../src/game/cityLayout.js'

let fail = 0

function pathLen(p) {
  let L = 0
  for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])
  return L
}

// segmento atravessa algum prédio? (amostragem)
function segHitsBuilding(a, b) {
  const steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.5)
  for (let i = 0; i <= steps; i++) {
    const x = a[0] + ((b[0] - a[0]) * i) / steps
    const z = a[1] + ((b[1] - a[1]) * i) / steps
    for (const c of COLLIDERS) {
      // margem -0.4: o último trecho encosta na fachada do próprio restaurante
      if (Math.abs(x - c.x) < c.hx - 0.4 && Math.abs(z - c.z) < c.hz - 0.4) return true
    }
  }
  return false
}

console.log('=== Rotas do Kraken (partida: 40,40) ===')
for (const r of RESTAURANTS) {
  const [dx, dz] = doorPos(r)
  const path = roadPath(40, 40, dx, dz)
  const L = pathLen(path)
  const last = path[path.length - 1]
  const reaches = Math.hypot(last[0] - dx, last[1] - dz) < 0.01
  let collides = false
  for (let i = 1; i < path.length - 1; i++) {
    if (segHitsBuilding(path[i - 1], path[i])) collides = true
  }
  const ok = reaches && !collides && isFinite(L) && L < 400
  if (!ok) fail++
  console.log(`${ok ? 'OK ' : 'ERR'} ${r.nome.padEnd(26)} porta(${dx.toFixed(1)},${dz.toFixed(1)}) dist=${L.toFixed(0)}m wp=${path.length}${collides ? ' [ATRAVESSA PRÉDIO]' : ''}${reaches ? '' : ' [NÃO CHEGA]'}`)
}

console.log('\n=== Rotas cruzadas (de cada porta para outra) ===')
const doors = RESTAURANTS.map((r) => ({ id: r.id, d: doorPos(r) }))
let cross = 0
for (const a of doors) {
  for (const b of doors) {
    if (a.id === b.id) continue
    const p = roadPath(a.d[0], a.d[1], b.d[0], b.d[1])
    const last = p[p.length - 1]
    if (Math.hypot(last[0] - b.d[0], last[1] - b.d[1]) > 0.01 || !isFinite(pathLen(p))) {
      console.log(`ERR ${a.id} → ${b.id}`)
      fail++
    } else cross++
  }
}
console.log(`${cross} rotas cruzadas OK`)

console.log('\n=== Balanceamento (GDD §7) ===')
const t = (c, msg) => { console.log(`${c ? 'OK ' : 'ERR'} ${msg}`); if (!c) fail++ }
t(comboBonus(1) === 0 && comboBonus(2) === 0.1 && comboBonus(3) === 0.2 && comboBonus(4) === 0.35 && comboBonus(5) === 0.5 && comboBonus(9) === 0.5, 'comboBonus: 0/10/20/35/50%')
t(ratingFor(0.95).stars === 3 && ratingFor(0.9).stars === 3, 'rating ⭐⭐⭐ em ≥90%')
t(ratingFor(0.6).stars === 2 && ratingFor(0.89).stars === 2, 'rating ⭐⭐ em 60–89%')
t(ratingFor(0.3).stars === 1 && ratingFor(0.29).stars === 0, 'rating ⭐ / 💀 nos limites')
t(DIFF_MULT.facil === 0.5 && DIFF_MULT.medio === 1.5 && DIFF_MULT.dificil === 3.0, 'multiplicadores 0.5/1.5/3.0')

// Kraken: pontuação média esperada por sessão (~visita 7-9 lugares)
const avg = RESTAURANTS.filter((r) => !r.secreto)
  .map((r) => r.maxScore * 0.625 * DIFF_MULT[r.diff])
const sum = avg.sort((a, b) => b - a).slice(0, 8).reduce((a, b) => a + b, 0)
console.log(`Kraken comendo os 8 melhores a 62.5%: ~${Math.round(sum)} pts (alvo do jogador)`)

console.log(fail === 0 ? '\nTUDO OK ✅' : `\n${fail} FALHAS ❌`)
process.exit(fail === 0 ? 0 : 1)
