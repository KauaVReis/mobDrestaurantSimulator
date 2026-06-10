// MINIGAME #6 — "Churrasco na Brasa" (GDD §6.2.6)
// Espetos cozinham; aperte a tecla do espeto na zona verde ("ao ponto").
import { useRef } from 'react'
import { useLoop, useForce, useKeyDown, MgHUD, FloatFx, pushFx } from '../shared'
import { sfx } from '../../game/audio'

const KEYS = ['1', '2', '3', '4', '5', '6']
const MEATS = ['🍖', '🍗', '🥩', '🌽', '🍤', '🧀']

function newSkewer(params) {
  const golden = Math.random() < 0.12
  return {
    cook: 0,
    rate: params.rate * (0.85 + Math.random() * 0.35),
    golden,
    emoji: golden ? '✨🍖' : MEATS[Math.floor(Math.random() * MEATS.length)],
    zoneStart: 52 + Math.random() * 10,
    zoneSize: golden ? params.zone * 0.6 : params.zone,
    dead: 0,
  }
}

export default function Churrasco({ params, onEnd, paused }) {
  const force = useForce()
  const st = useRef(null)
  if (!st.current) {
    st.current = {
      time: params.dur, score: 0, errors: 0, ended: false, fx: [],
      skewers: Array.from({ length: params.slots }, () => newSkewer(params)),
    }
  }
  const w = st.current

  useLoop((dt) => {
    if (paused || w.ended) return
    w.time -= dt
    if (w.time <= 0) {
      w.ended = true
      onEnd({ raw: w.score, max: params.max, errors: w.errors })
      return
    }
    w.skewers.forEach((sk, i) => {
      if (sk.dead > 0) {
        sk.dead -= dt
        if (sk.dead <= 0) w.skewers[i] = newSkewer(params)
        return
      }
      sk.cook += sk.rate * dt
      if (sk.cook >= 100) {
        // queimou sozinho
        w.errors++
        w.score = Math.max(0, w.score - 5)
        pushFx(w.fx, 12 + i * (76 / Math.max(1, params.slots - 1)), 30, 'QUEIMOU! −5', '#f87171')
        sfx.error()
        sk.dead = 0.8
      }
    })
    force()
  })

  useKeyDown((k) => {
    if (paused || w.ended) return
    const i = KEYS.indexOf(k)
    if (i === -1 || i >= params.slots) return
    const sk = w.skewers[i]
    if (!sk || sk.dead > 0) return
    const x = 12 + i * (76 / Math.max(1, params.slots - 1))
    const zEnd = sk.zoneStart + sk.zoneSize
    if (sk.cook >= sk.zoneStart && sk.cook <= zEnd) {
      const center = sk.zoneStart + sk.zoneSize / 2
      const closeness = 1 - Math.abs(sk.cook - center) / (sk.zoneSize / 2)
      let pts = Math.round(5 + closeness * 7)
      if (sk.golden) pts *= 3
      w.score += pts
      pushFx(w.fx, x, 30, closeness > 0.7 ? `AO PONTO! +${pts}` : `+${pts}`, sk.golden ? '#fbbf24' : '#86efac')
      closeness > 0.7 ? sfx.perfect() : sfx.gulp()
    } else if (sk.cook < sk.zoneStart) {
      w.errors++
      pushFx(w.fx, x, 30, 'cru!', '#93c5fd')
      sfx.miss()
    } else {
      w.errors++
      pushFx(w.fx, x, 30, 'passou!', '#f87171')
      sfx.miss()
    }
    sk.dead = 0.8
  })

  const slotW = 76 / Math.max(1, params.slots - 1)
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#3a1208] to-[#6b2410] overflow-hidden select-none">
      <MgHUD score={w.score} time={w.time} totalTime={params.dur} />
      {/* grelha */}
      <div className="absolute left-[4%] right-[4%] top-[22%] bottom-[18%] bg-[#1a0d06] rounded-2xl border-4 border-[#52301a]">
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-orange-600/60 to-transparent rounded-b-xl" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="absolute left-2 right-2 h-0.5 bg-[#52301a]" style={{ top: `${14 + i * 14}%` }} />
        ))}
      </div>
      {/* espetos */}
      {w.skewers.map((sk, i) => {
        const x = 12 + i * slotW
        const burned = sk.cook > sk.zoneStart + sk.zoneSize
        return (
          <div key={i} className="absolute" style={{ left: `${x}%`, top: '30%', transform: 'translateX(-50%)' }}>
            <div className={`text-5xl text-center transition-all ${sk.dead > 0 ? 'opacity-20 scale-75' : ''}`}
              style={{ filter: burned ? 'brightness(0.45) saturate(0.4)' : sk.cook > sk.zoneStart ? 'saturate(1.4)' : 'none' }}>
              {sk.emoji}
            </div>
            <div className="w-1 h-16 bg-[#8a6a4a] mx-auto" />
            {/* barra de cozimento */}
            <div className="relative w-20 h-4 bg-black/50 rounded-full mt-2 overflow-hidden ring-2 ring-black/40">
              <div className="absolute inset-y-0 bg-emerald-400/60"
                style={{ left: `${sk.zoneStart}%`, width: `${sk.zoneSize}%` }} />
              <div className="absolute inset-y-0 w-1 bg-white" style={{ left: `${Math.min(99, sk.cook)}%` }} />
            </div>
            <div className={`mt-1 mx-auto w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg ${sk.dead > 0 ? 'bg-white/10 text-white/30' : 'bg-white/90 text-orange-900'}`}>
              {KEYS[i]}
            </div>
          </div>
        )
      })}
      <FloatFx fx={w.fx} />
      <div className="absolute bottom-2 w-full text-center text-white/60 text-sm font-semibold">
        Aperte a tecla do espeto na ZONA VERDE · centro da zona = mais pontos · ✨ vale ×3
      </div>
    </div>
  )
}
