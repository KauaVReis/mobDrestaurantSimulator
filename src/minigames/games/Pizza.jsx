// MINIGAME #4 — "Pizza Rítmica" (GDD §6.2.4)
// Notas descem por 4 trilhas (D F J K); acerte no ritmo. Combo multiplica até ×5.
import { useRef } from 'react'
import { useLoop, useForce, useKeyDown, MgHUD, FloatFx, pushFx } from '../shared'
import { sfx } from '../../game/audio'

const LANES = ['d', 'f', 'j', 'k']
const LANE_X = [23, 41, 59, 77]
const LANE_EMO = ['🍕', '🧀', '🍄', '🌶️']
const HIT_Y = 80

export default function Pizza({ params, onEnd, paused }) {
  const force = useForce()
  const st = useRef(null)
  if (!st.current) {
    const beat = 60 / params.bpm
    // gera a "música": padrão de notas determinístico-aleatório
    const notes = []
    let t = 1.6
    let id = 0
    while (t < params.dur - 1.5) {
      if (Math.random() < params.density) {
        const lane = Math.floor(Math.random() * 4)
        notes.push({ id: ++id, t, lane })
        if (params.doubles && Math.random() < 0.22) {
          notes.push({ id: ++id, t, lane: (lane + 1 + Math.floor(Math.random() * 3)) % 4 })
        }
      }
      t += beat
    }
    st.current = {
      time: params.dur, clock: 0, notes, score: 0, errors: 0, combo: 0, maxCombo: 0,
      ended: false, fx: [], hitFlash: [0, 0, 0, 0], judge: '', judgeT: 0,
    }
  }
  const w = st.current
  const fallTime = params.fallTime

  useLoop((dt) => {
    if (paused || w.ended) return
    w.time -= dt
    w.clock += dt
    w.judgeT = Math.max(0, w.judgeT - dt)
    for (let i = 0; i < 4; i++) w.hitFlash[i] = Math.max(0, w.hitFlash[i] - dt * 5)
    // misses
    for (const n of w.notes) {
      if (!n.hit && !n.missed && w.clock > n.t + 0.18) {
        n.missed = true
        w.errors++
        w.combo = 0
        w.judge = 'MISS'
        w.judgeT = 0.5
        sfx.miss()
      }
    }
    if (w.time <= 0) {
      w.ended = true
      onEnd({ raw: w.score, max: params.max, errors: w.errors })
      return
    }
    force()
  })

  useKeyDown((k) => {
    if (paused || w.ended) return
    const lane = LANES.indexOf(k)
    if (lane === -1) return
    w.hitFlash[lane] = 1
    // nota mais próxima nessa trilha
    let best = null, bestD = 1e9
    for (const n of w.notes) {
      if (n.lane !== lane || n.hit || n.missed) continue
      const d = Math.abs(w.clock - n.t)
      if (d < bestD) { bestD = d; best = n }
    }
    if (!best || bestD > 0.3) {
      w.combo = 0
      w.judge = 'VAZIO'
      w.judgeT = 0.4
      return
    }
    best.hit = true
    w.combo++
    w.maxCombo = Math.max(w.maxCombo, w.combo)
    const mult = Math.min(5, 1 + Math.floor(w.combo / 8)) // 1× → 5× (GDD)
    let base, label, color
    if (bestD < 0.08) { base = 3; label = 'PERFEITO!'; color = '#fbbf24'; sfx.perfect() }
    else if (bestD < 0.16) { base = 2; label = 'BOM'; color = '#86efac'; sfx.point() }
    else { base = 1; label = 'OK'; color = '#93c5fd'; sfx.gulp() }
    w.score += base * mult
    w.judge = `${label} ×${mult}`
    w.judgeT = 0.5
    pushFx(w.fx, LANE_X[lane], HIT_Y - 8, `+${base * mult}`, color)
  })

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#14401f] to-[#1e5c2e] overflow-hidden select-none">
      <MgHUD score={w.score} time={w.time} totalTime={params.dur} combo={Math.min(5, 1 + Math.floor(w.combo / 8))} />
      {/* trilhas */}
      {LANE_X.map((x, i) => (
        <div key={i} className="absolute top-[10%] bottom-[8%] w-[12%] bg-black/25 rounded-lg border-x-2 border-white/10"
          style={{ left: `${x - 6}%` }} />
      ))}
      {/* linha de acerto */}
      {LANE_X.map((x, i) => (
        <div key={i}
          className={`absolute w-[12%] h-[7%] rounded-xl border-4 flex items-center justify-center text-2xl font-black transition-colors ${w.hitFlash[i] > 0 ? 'border-amber-300 bg-amber-300/40 text-white' : 'border-white/50 bg-white/10 text-white/70'}`}
          style={{ left: `${x - 6}%`, top: `${HIT_Y - 3.5}%` }}>
          {LANES[i].toUpperCase()}
        </div>
      ))}
      {/* notas */}
      {w.notes.map((n) => {
        if (n.hit || n.missed) return null
        const prog = (w.clock - (n.t - fallTime)) / fallTime
        if (prog < 0 || prog > 1.12) return null
        const y = 8 + prog * (HIT_Y - 8)
        return (
          <div key={n.id} className="absolute text-4xl" style={{ left: `${LANE_X[n.lane]}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}>
            {LANE_EMO[n.lane]}
          </div>
        )
      })}
      {/* julgamento */}
      {w.judgeT > 0 && (
        <div className="absolute top-[38%] w-full text-center text-4xl font-black text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.6)] pop-in">
          {w.judge}
        </div>
      )}
      {/* Nonno Enzo conduzindo */}
      <div className="absolute left-3 bottom-10 text-6xl bob">👨‍🍳</div>
      <FloatFx fx={w.fx} />
      <div className="absolute bottom-2 w-full text-center text-white/60 text-sm font-semibold">
        D F J K no ritmo · combo aumenta o multiplicador até ×5
      </div>
    </div>
  )
}
