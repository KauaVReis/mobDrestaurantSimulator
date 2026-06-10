// "O Desafio Supremo" — restaurante secreto (GDD §6.3)
// 10 rodadas-relâmpago de 5s em ordem aleatória, dificuldade máxima. Base 3.000 pts.
import { useRef } from 'react'
import { useLoop, useForce, useKeyDown, MgHUD, FloatFx, pushFx } from '../shared'
import { sfx } from '../../game/audio'

const KEYS_POOL = ['q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'j', 'k', 'l']
const ARROWS = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright']
const ARROW_ICON = { arrowup: '↑', arrowdown: '↓', arrowleft: '←', arrowright: '→' }
const FOODS = ['🍣', '🍔', '🍲', '🍕', '🍜', '🍖', '🍩', '🌮', '🫕', '🍦']

function makeRound(n) {
  const types = ['key', 'mash', 'timing', 'seq']
  const type = types[Math.floor(Math.random() * types.length)]
  const r = { type, food: FOODS[n % FOODS.length], done: false, t: 5 }
  if (type === 'key') r.key = KEYS_POOL[Math.floor(Math.random() * KEYS_POOL.length)]
  if (type === 'mash') { r.need = 12; r.got = 0 }
  if (type === 'timing') { r.pos = 0; r.dir = 1; r.zone = [42, 58] }
  if (type === 'seq') {
    r.seq = Array.from({ length: 4 }, () => ARROWS[Math.floor(Math.random() * 4)])
    r.idx = 0
  }
  return r
}

export default function Supremo({ params, onEnd, paused }) {
  const force = useForce()
  const st = useRef(null)
  if (!st.current) {
    st.current = {
      round: 0, total: 10, cur: makeRound(0), gap: 0,
      score: 0, errors: 0, ended: false, fx: [], time: params.dur,
    }
  }
  const w = st.current

  const closeRound = (pts, label, color) => {
    w.score += pts
    pushFx(w.fx, 50, 38, `${label} +${pts}`, color)
    pts >= 200 ? sfx.perfect() : pts > 0 ? sfx.gulp() : sfx.error()
    if (pts === 0) w.errors++
    w.cur.done = true
    w.gap = 0.7
  }

  useLoop((dt) => {
    if (paused || w.ended) return
    w.time -= dt
    if (w.gap > 0) {
      w.gap -= dt
      if (w.gap <= 0) {
        w.round++
        if (w.round >= w.total || w.time <= 0) {
          w.ended = true
          onEnd({ raw: w.score, max: params.max, errors: w.errors })
          return
        }
        w.cur = makeRound(w.round)
      }
      force()
      return
    }
    const r = w.cur
    r.t -= dt
    if (r.type === 'timing') {
      r.pos += r.dir * 95 * dt
      if (r.pos > 100) { r.pos = 100; r.dir = -1 }
      if (r.pos < 0) { r.pos = 0; r.dir = 1 }
    }
    if (r.t <= 0 && !r.done) closeRound(0, 'TEMPO ESGOTADO!', '#f87171')
    if (w.time <= 0 && !w.ended) {
      w.ended = true
      onEnd({ raw: w.score, max: params.max, errors: w.errors })
      return
    }
    force()
  })

  useKeyDown((k) => {
    if (paused || w.ended || w.gap > 0) return
    const r = w.cur
    if (r.done) return
    switch (r.type) {
      case 'key':
        if (k === r.key) closeRound(Math.round(120 + (r.t / 5) * 180), 'REFLEXO!', '#86efac')
        else if (KEYS_POOL.includes(k)) closeRound(0, 'TECLA ERRADA!', '#f87171')
        break
      case 'mash':
        if (k === ' ') {
          r.got++
          sfx.tick()
          if (r.got >= r.need) closeRound(Math.round(160 + (r.t / 5) * 140), 'DEVOROU!', '#86efac')
        }
        break
      case 'timing':
        if (k === ' ') {
          const inZone = r.pos >= r.zone[0] && r.pos <= r.zone[1]
          if (inZone) {
            const center = (r.zone[0] + r.zone[1]) / 2
            const closeness = 1 - Math.abs(r.pos - center) / ((r.zone[1] - r.zone[0]) / 2)
            closeRound(Math.round(180 + closeness * 120), 'NO PONTO!', '#fbbf24')
          } else {
            closeRound(0, 'FORA!', '#f87171')
          }
        }
        break
      case 'seq':
        if (ARROWS.includes(k)) {
          if (k === r.seq[r.idx]) {
            r.idx++
            sfx.tick()
            if (r.idx >= r.seq.length) closeRound(Math.round(160 + (r.t / 5) * 140), 'SEQUÊNCIA!', '#86efac')
          } else {
            r.idx = 0
            sfx.miss()
          }
        }
        break
      default:
        break
    }
  })

  const r = w.cur
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0d0518] to-[#1e1033] overflow-hidden select-none">
      <MgHUD score={w.score} time={w.time} totalTime={params.dur} />
      <div className="absolute top-12 w-full text-center z-10">
        <span className="text-[#39ff8e] font-black tracking-widest text-sm">O DESAFIO SUPREMO</span>
        <div className="text-white/70 font-bold text-xs mt-0.5">Rodada {Math.min(w.round + 1, w.total)} / {w.total}</div>
      </div>
      {w.gap <= 0 && !w.ended && (
        <div className="absolute inset-x-0 top-[26%] text-center">
          <div className="text-7xl mb-3">{r.food}</div>
          {/* tempo da rodada */}
          <div className="w-40 h-2 bg-white/10 rounded-full mx-auto mb-4 overflow-hidden">
            <div className="h-full bg-[#39ff8e] rounded-full" style={{ width: `${(r.t / 5) * 100}%` }} />
          </div>
          {r.type === 'key' && (
            <div className="pop-in">
              <div className="text-white/80 font-bold mb-2">APERTE AGORA:</div>
              <div className="inline-block w-24 h-24 bg-white text-[#1e1033] text-6xl font-black rounded-2xl leading-[96px] shadow-[0_0_30px_#39ff8e]">
                {r.key.toUpperCase()}
              </div>
            </div>
          )}
          {r.type === 'mash' && (
            <div className="pop-in">
              <div className="text-white/80 font-bold mb-2">ESMAGUE O ESPAÇO! {r.got}/{r.need}</div>
              <div className="w-64 h-7 bg-white/10 rounded-full mx-auto overflow-hidden ring-2 ring-white/20">
                <div className="h-full bg-gradient-to-r from-[#39ff8e] to-emerald-300" style={{ width: `${(r.got / r.need) * 100}%` }} />
              </div>
            </div>
          )}
          {r.type === 'timing' && (
            <div className="pop-in">
              <div className="text-white/80 font-bold mb-2">ESPAÇO na zona verde!</div>
              <div className="relative w-72 h-8 bg-white/10 rounded-full mx-auto ring-2 ring-white/20 overflow-hidden">
                <div className="absolute inset-y-0 bg-[#39ff8e]/50"
                  style={{ left: `${r.zone[0]}%`, width: `${r.zone[1] - r.zone[0]}%` }} />
                <div className="absolute inset-y-0 w-2 bg-white rounded" style={{ left: `${r.pos}%` }} />
              </div>
            </div>
          )}
          {r.type === 'seq' && (
            <div className="pop-in">
              <div className="text-white/80 font-bold mb-2">SEQUÊNCIA:</div>
              <div className="flex gap-2 justify-center">
                {r.seq.map((a, i) => (
                  <div key={i} className={`w-14 h-14 rounded-xl text-3xl font-black leading-[56px] ${i < r.idx ? 'bg-[#39ff8e] text-[#1e1033]' : 'bg-white/15 text-white'}`}>
                    {ARROW_ICON[a]}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {w.gap > 0 && (
        <div className="absolute inset-x-0 top-[40%] text-center text-5xl font-black text-white/90 pop-in">
          {w.round + 1 < w.total ? 'PRÓXIMO PRATO...' : 'BANQUETE COMPLETO!'}
        </div>
      )}
      <FloatFx fx={w.fx} />
      <div className="absolute bottom-2 w-full text-center text-white/50 text-sm font-semibold">
        10 pratos-relâmpago · 5 segundos cada · até 300 pts por prato
      </div>
    </div>
  )
}
