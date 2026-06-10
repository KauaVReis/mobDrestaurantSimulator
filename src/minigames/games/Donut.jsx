// MINIGAME #7 — "Donut Voador" (GDD §6.2.7)
// Donuts voam como frisbees; alinhe a boca (mouse, eixo vertical) para capturá-los.
import { useRef } from 'react'
import { useLoop, useForce, useMousePct, MgHUD, FloatFx, pushFx } from '../shared'
import { sfx } from '../../game/audio'

const COLORS = [
  { e: '🍩', c: 'rosa' }, { e: '🟤', c: 'choco' }, { e: '🟡', c: 'mel' },
]

export default function Donut({ params, onEnd, paused }) {
  const force = useForce()
  const areaRef = useRef(null)
  const mouse = useMousePct(areaRef)
  const st = useRef(null)
  if (!st.current) {
    st.current = {
      time: params.dur, donuts: [], nextSpawn: 0.8, score: 0, errors: 0,
      ended: false, fx: [], id: 0, streak: [], stun: 0, giantSpawned: false,
    }
  }
  const w = st.current
  const MOUTH_X = 84

  useLoop((dt) => {
    if (paused || w.ended) return
    w.time -= dt
    w.stun = Math.max(0, w.stun - dt)
    if (w.time <= 0) {
      w.ended = true
      onEnd({ raw: w.score, max: params.max, errors: w.errors })
      return
    }
    w.nextSpawn -= dt
    if (w.nextSpawn <= 0) {
      w.nextSpawn = params.spawn * (0.8 + Math.random() * 0.4)
      const giant = !w.giantSpawned && w.time < params.dur * 0.65 && Math.random() < 0.18
      if (giant) w.giantSpawned = true
      const kind = COLORS[Math.floor(Math.random() * COLORS.length)]
      w.donuts.push({
        id: ++w.id, x: -6,
        baseY: 22 + Math.random() * 50,
        amp: params.arc * (4 + Math.random() * 14),
        freq: 1 + Math.random() * 2.5,
        speed: params.speed * (0.85 + Math.random() * 0.35),
        giant, kind, phase: Math.random() * Math.PI * 2,
      })
    }
    for (const d of w.donuts) {
      d.x += d.speed * dt
      d.y = d.baseY + Math.sin(d.x * 0.07 * d.freq + d.phase) * d.amp
      if (!d.done && d.x >= MOUTH_X - 3 && d.x <= MOUTH_X + 4) {
        const my = mouse.current.y
        if (w.stun <= 0 && Math.abs(d.y - my) < (d.giant ? 12 : 9)) {
          d.done = true
          if (d.giant) {
            w.score += 60
            pushFx(w.fx, MOUTH_X, d.y, 'DONUT GIGANTE +60!', '#fbbf24')
            sfx.bigFanfare()
          } else {
            w.score += params.pts
            pushFx(w.fx, MOUTH_X, d.y, `+${params.pts}`, '#86efac')
            sfx.gulp()
            // Trio Doce: 3 da mesma cor em sequência
            w.streak.push(d.kind.c)
            if (w.streak.length > 3) w.streak.shift()
            if (w.streak.length === 3 && w.streak.every((c) => c === w.streak[0])) {
              w.score += 30
              pushFx(w.fx, 50, 30, `TRIO DOCE ${d.kind.c.toUpperCase()}! +30`, '#f9a8d4')
              sfx.fanfare()
              w.streak = []
            }
          }
        }
      }
      if (!d.done && !d.passed && d.x > MOUTH_X + 4) {
        d.passed = true
        const my = mouse.current.y
        if (Math.abs(d.y - my) < 16) {
          // bateu na testa
          w.errors++
          w.stun = 1
          pushFx(w.fx, MOUTH_X, d.y, 'NA TESTA! 💫', '#f87171')
          sfx.boing()
        } else {
          w.errors++
          pushFx(w.fx, MOUTH_X + 4, d.y, 'passou...', '#fca5a5')
        }
      }
    }
    w.donuts = w.donuts.filter((d) => !d.done && d.x < 112)
    force()
  })

  return (
    <div ref={areaRef} className="absolute inset-0 bg-gradient-to-b from-[#5e2750] to-[#8e4475] overflow-hidden select-none cursor-none">
      <MgHUD score={w.score} time={w.time} totalTime={params.dur} />
      {/* nuvens da confeitaria no céu */}
      <div className="absolute top-[14%] left-[10%] text-4xl opacity-40">☁️</div>
      <div className="absolute top-[30%] left-[40%] text-5xl opacity-30">☁️</div>
      <div className="absolute top-[60%] left-[22%] text-4xl opacity-30">☁️</div>
      {/* cozinheiros lançadores */}
      <div className="absolute left-1 top-[20%] text-5xl">👨‍🍳</div>
      <div className="absolute left-1 top-[55%] text-5xl">👩‍🍳</div>
      {/* donuts (anel colorido indica o sabor para o Trio Doce) */}
      {w.donuts.map((d) => {
        const ringColor = d.kind.c === 'rosa' ? '#f9a8d4' : d.kind.c === 'choco' ? '#92400e' : '#fbbf24'
        return (
          <div key={d.id} className={`absolute ${d.giant ? 'text-7xl' : 'text-4xl'} ${d.done ? 'opacity-0' : ''}`}
            style={{
              left: `${d.x}%`, top: `${d.y}%`,
              transform: 'translate(-50%,-50%) rotate(' + d.x * 4 + 'deg)',
              filter: `drop-shadow(0 0 ${d.giant ? 12 : 6}px ${d.giant ? '#fbbf24' : ringColor})`,
            }}>
            🍩
          </div>
        )
      })}
      {/* boca de MobDyck */}
      <div className={`absolute text-7xl pointer-events-none ${w.stun > 0 ? 'opacity-50' : ''}`}
        style={{ left: `${MOUTH_X}%`, top: `${mouse.current.y}%`, transform: 'translate(-50%,-50%)' }}>
        {w.stun > 0 ? '😵' : '🐋'}
      </div>
      <FloatFx fx={w.fx} />
      <div className="absolute bottom-2 w-full text-center text-white/60 text-sm font-semibold">
        Mova o mouse (vertical) para abocanhar os donuts · 3 da mesma cor = TRIO DOCE · erro de perto = atordoado
      </div>
    </div>
  )
}
