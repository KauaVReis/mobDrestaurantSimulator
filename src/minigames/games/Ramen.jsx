// MINIGAME #5 — "Ramen Furacão" (GDD §6.2.5)
// Gire o mouse em círculos ao redor da tigela para sorver o macarrão antes do tempo.
import { useRef } from 'react'
import { useLoop, useForce, useMousePct, useKeyDown, MgHUD, FloatFx, pushFx } from '../shared'
import { sfx } from '../../game/audio'

const TOPPINGS = ['🍳', '🥩', '🥬']

export default function Ramen({ params, onEnd, paused }) {
  const force = useForce()
  const areaRef = useRef(null)
  const mouse = useMousePct(areaRef)
  const st = useRef(null)
  if (!st.current) {
    st.current = {
      time: params.dur, remaining: 100, lastAngle: null, angVel: 0, idle: 0,
      score: 0, errors: 0, ended: false, fx: [], spin: 0,
      topping: null, nextTopping: 100 - 20, toppingsGot: 0,
      mega: false, megaT: 0, megaDone: false, megaAt: 35 + Math.random() * 30,
    }
  }
  const w = st.current

  const finish = (completed) => {
    w.ended = true
    let raw = w.score
    if (completed) {
      raw += params.base
      raw += Math.round((w.time / params.dur) * params.speedBonus)
    } else {
      raw += Math.round(params.base * (1 - w.remaining / 100) * 0.6)
    }
    onEnd({ raw, max: params.max, errors: w.errors })
  }

  useLoop((dt) => {
    if (paused || w.ended) return
    w.time -= dt
    if (w.time <= 0) { finish(false); return }

    // velocidade angular do mouse ao redor do centro da tigela (50, 56)
    const ang = Math.atan2(mouse.current.y - 56, mouse.current.x - 50)
    if (w.lastAngle !== null) {
      let d = ang - w.lastAngle
      while (d > Math.PI) d -= Math.PI * 2
      while (d < -Math.PI) d += Math.PI * 2
      w.angVel = w.angVel * 0.85 + (Math.abs(d) / Math.max(dt, 0.001)) * 0.15
    }
    w.lastAngle = ang
    w.spin += w.angVel * dt * 12

    const slurping = w.angVel > 2.2
    if (slurping) {
      w.idle = 0
      w.remaining -= Math.min(w.angVel, 16) * params.slurpRate * dt
    } else {
      w.idle += dt
      if (w.idle > 1) w.remaining += params.slip * dt // escorrega de volta (GDD)
    }
    w.remaining = Math.max(0, Math.min(100, w.remaining))

    // toppings em marcos de progresso
    if (w.remaining <= w.nextTopping && !w.topping && w.nextTopping > 15) {
      w.topping = { e: TOPPINGS[w.toppingsGot % 3], t: 1.6 }
      w.nextTopping -= 25
    }
    if (w.topping) {
      w.topping.t -= dt
      if (w.topping.t <= 0) {
        w.topping = null
        pushFx(w.fx, 70, 40, 'escapou...', '#fca5a5')
      }
    }

    // Mega Macarrão
    if (!w.megaDone && !w.mega && w.remaining < w.megaAt) {
      w.mega = true
      w.megaT = 2.4
      sfx.bell()
    }
    if (w.mega) {
      w.megaT -= dt
      if (w.angVel > 7) {
        w.megaProgress = (w.megaProgress || 0) + dt
        if (w.megaProgress > 1.1) {
          w.mega = false
          w.megaDone = true
          w.score += 35
          pushFx(w.fx, 50, 30, 'MEGA MACARRÃO +35!', '#fbbf24')
          sfx.perfect()
        }
      }
      if (w.megaT <= 0) { w.mega = false; w.megaDone = true }
    }

    if (w.remaining <= 0) { finish(true); return }
    force()
  })

  useKeyDown((k) => {
    if (k !== ' ' || paused || w.ended || !w.topping) return
    w.topping = null
    w.toppingsGot++
    w.score += 15
    pushFx(w.fx, 70, 40, '+15 topping!', '#86efac')
    sfx.gulp()
  })

  const pct = w.remaining
  return (
    <div ref={areaRef} className="absolute inset-0 bg-gradient-to-b from-[#5c1024] to-[#7e1c34] overflow-hidden select-none">
      <MgHUD score={w.score} time={w.time} totalTime={params.dur} />
      {/* barra de macarrão restante */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[60%] z-10">
        <div className="text-center text-white/80 text-xs font-bold mb-1">MACARRÃO RESTANTE</div>
        <div className="h-5 bg-black/40 rounded-full overflow-hidden ring-2 ring-black/40">
          <div className="h-full bg-gradient-to-r from-amber-300 to-orange-400 rounded-full transition-[width] duration-100"
            style={{ width: `${pct}%` }} />
        </div>
      </div>
      {/* tigela */}
      <div className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-64 h-64 rounded-full bg-[#2d1810] border-8 border-[#8a3324] flex items-center justify-center">
          <div className="absolute inset-4 rounded-full bg-[#c8842c] overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-7xl"
              style={{ transform: `rotate(${w.spin}rad)` }}>
              🍜
            </div>
          </div>
          {/* indicador de giro */}
          <div className="absolute -inset-3 rounded-full border-4 border-dashed border-white/30"
            style={{ transform: `rotate(${w.spin * 0.5}rad)` }} />
        </div>
      </div>
      {/* topping para fisgar */}
      {w.topping && (
        <div className="absolute left-[68%] top-[34%] text-5xl pop-in">
          {w.topping.e}
          <div className="text-xs font-black text-white text-center bg-black/50 rounded px-1 mt-1">ESPAÇO!</div>
        </div>
      )}
      {/* mega macarrão */}
      {w.mega && (
        <div className="absolute top-[24%] w-full text-center z-20">
          <div className="text-3xl font-black text-amber-300 title-glow">🌀 MEGA MACARRÃO — GIRE NO TALO!</div>
        </div>
      )}
      <div className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 text-2xl pointer-events-none"
        style={{ transform: `translate(${(mouse.current.x - 50) * 2.2}px, ${(mouse.current.y - 56) * 2.2}px)` }}>
        🥢
      </div>
      <FloatFx fx={w.fx} />
      <div className="absolute bottom-2 w-full text-center text-white/60 text-sm font-semibold">
        Gire o mouse em círculos ao redor da tigela · pare e o macarrão escorrega · ESPAÇO fisga toppings
      </div>
    </div>
  )
}
