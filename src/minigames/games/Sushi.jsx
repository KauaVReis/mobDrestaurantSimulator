// MINIGAME #1 — "Engolida Perfeita" (GDD §6.2.1)
// Esteira de sushi; ESPAÇO no timing exato na zona de engolida.
import { useRef } from 'react'
import { useLoop, useForce, useKeyDown, MgHUD, FloatFx, pushFx } from '../shared'
import { sfx } from '../../game/audio'

const SUSHIS = ['🍣', '🍤', '🍙', '🥟', '🍥']
const ZONE_X = 76 // % da largura

export default function Sushi({ params, onEnd, paused }) {
  const force = useForce()
  const st = useRef(null)
  if (!st.current) {
    st.current = {
      t: 0, time: params.dur, pieces: [], nextSpawn: 0.6, score: 0, errors: 0,
      ended: false, fx: [], flash: 0, id: 0,
    }
  }
  const w = st.current

  useLoop((dt) => {
    if (paused || w.ended) return
    w.t += dt
    w.time -= dt
    w.flash = Math.max(0, w.flash - dt * 3)
    if (w.time <= 0) {
      w.ended = true
      onEnd({ raw: w.score, max: params.max, errors: w.errors })
      return
    }
    w.nextSpawn -= dt
    if (w.nextSpawn <= 0) {
      w.nextSpawn = params.spawn * (0.85 + Math.random() * 0.3)
      const roll = Math.random()
      const tipo = roll < 0.08 ? 'spicy' : roll < 0.2 ? 'gold' : 'normal'
      const val = params.vmin + Math.floor(Math.random() * (params.vmax - params.vmin + 1))
      w.pieces.push({
        id: ++w.id, x: -8, tipo, val, lane: Math.floor(Math.random() * 3),
        emoji: tipo === 'spicy' ? '🌶️' : SUSHIS[Math.floor(Math.random() * SUSHIS.length)],
        eaten: false,
      })
    }
    for (const p of w.pieces) {
      p.x += params.speed * dt
      if (!p.eaten && !p.missed && p.x > ZONE_X + params.window * 2.2) {
        p.missed = true
        w.errors++
        pushFx(w.fx, p.x, 30 + p.lane * 16, 'perdeu!', '#f87171')
        sfx.miss()
      }
    }
    w.pieces = w.pieces.filter((p) => p.x < 115)
    force()
  })

  useKeyDown((k) => {
    if (k !== ' ' || paused || w.ended) return
    // peça mais próxima da zona ainda não comida
    let best = null, bestD = 1e9
    for (const p of w.pieces) {
      if (p.eaten || p.missed) continue
      const d = Math.abs(p.x - ZONE_X)
      if (d < bestD) { bestD = d; best = p }
    }
    const win = best?.tipo === 'spicy' ? params.window / 2 : params.window
    if (best && bestD <= win) {
      best.eaten = true
      const mult = best.tipo === 'gold' ? 3 : best.tipo === 'spicy' ? 5 : 1
      const pts = best.val * mult
      w.score += pts
      w.flash = 1
      pushFx(w.fx, ZONE_X, 26 + best.lane * 16, `+${pts}`, best.tipo === 'gold' ? '#fbbf24' : best.tipo === 'spicy' ? '#f87171' : '#86efac')
      if (mult > 1) sfx.perfect()
      else sfx.gulp()
    } else if (best && bestD <= win * 2.2) {
      best.eaten = true
      const pts = Math.max(1, Math.round(best.val * 0.2))
      w.score += pts
      pushFx(w.fx, ZONE_X, 26 + best.lane * 16, `+${pts} (fora do tempo)`, '#fde68a')
      sfx.point()
    } else {
      w.errors++
      pushFx(w.fx, ZONE_X, 58, 'vazio!', '#f87171')
      sfx.miss()
    }
  })

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0e2a47] to-[#163a5f] overflow-hidden select-none">
      <MgHUD score={w.score} time={w.time} totalTime={params.dur} />
      {/* esteira */}
      {[0, 1, 2].map((lane) => (
        <div key={lane} className="absolute left-0 right-0 h-[14%] bg-[#1d4868]/80 border-y-4 border-[#0b2034]"
          style={{ top: `${24 + lane * 16}%` }}>
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_38px,#0b2034_38px,#0b2034_42px)]" />
        </div>
      ))}
      {/* zona de engolida */}
      <div
        className={`absolute rounded-full border-4 transition-colors ${w.flash > 0 ? 'border-amber-300 bg-amber-300/30' : 'border-cyan-300/80 bg-cyan-300/10'}`}
        style={{ left: `${ZONE_X - 4.5}%`, top: '20%', width: '9%', height: '52%' }}
      />
      <div className="absolute text-center text-cyan-200 font-bold text-sm" style={{ left: `${ZONE_X - 7}%`, top: '74%', width: '14%' }}>
        ZONA DE ENGOLIDA
      </div>
      {/* MobDyck esperando */}
      <div className="absolute text-7xl" style={{ left: `${ZONE_X + 9}%`, top: '36%' }}>
        <span className={w.flash > 0 ? 'inline-block scale-125 transition-transform' : 'inline-block'}>🐋</span>
      </div>
      {/* peças */}
      {w.pieces.map((p) => !p.eaten && (
        <div key={p.id}
          className={`absolute text-4xl transition-opacity ${p.missed ? 'opacity-30' : ''}`}
          style={{ left: `${p.x}%`, top: `${25.5 + p.lane * 16}%` }}>
          <span className={p.tipo === 'gold' ? 'drop-shadow-[0_0_8px_#fbbf24]' : ''}>{p.emoji}</span>
          {p.tipo === 'gold' && <span className="absolute -top-2 -right-2 text-sm">✨</span>}
        </div>
      ))}
      <FloatFx fx={w.fx} />
      <div className="absolute bottom-2 w-full text-center text-white/60 text-sm font-semibold">
        ESPAÇO quando o sushi passar pela zona · dourado ×3 · 🌶️ ×5 (timing perfeito)
      </div>
    </div>
  )
}
