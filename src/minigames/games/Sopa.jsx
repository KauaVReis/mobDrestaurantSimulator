// MINIGAME #3 — "Sopa do Caos" (GDD §6.2.3)
// Colheradas voam em arco; posicione a boca (mouse) no ponto de pouso.
import { useRef } from 'react'
import { useLoop, useForce, useMousePct, MgHUD, FloatFx, pushFx } from '../shared'
import { sfx } from '../../game/audio'

export default function Sopa({ params, onEnd, paused }) {
  const force = useForce()
  const areaRef = useRef(null)
  const mouse = useMousePct(areaRef)
  const st = useRef(null)
  if (!st.current) {
    st.current = {
      time: params.dur, spoons: [], wave: 0, nextWave: 1, score: 0, errors: 0,
      ended: false, fx: [], id: 0,
    }
  }
  const w = st.current

  useLoop((dt) => {
    if (paused || w.ended) return
    w.time -= dt
    if (w.time <= 0 || (w.wave >= params.waves && w.spoons.length === 0)) {
      w.ended = true
      onEnd({ raw: w.score, max: params.max, errors: w.errors })
      return
    }
    w.nextWave -= dt
    if (w.nextWave <= 0 && w.wave < params.waves) {
      w.wave++
      w.nextWave = params.waveGap
      for (let i = 0; i < params.spoonsPerWave; i++) {
        const roll = Math.random()
        w.spoons.push({
          id: ++w.id,
          x: 12 + Math.random() * 76,
          delay: i * (params.waveGap * 0.55 / params.spoonsPerWave) + Math.random() * 0.3,
          fly: params.flyTime,
          tipo: roll < 0.12 ? 'osso' : roll < 0.3 ? 'quente' : 'normal',
          state: 'tele',
        })
      }
    }
    for (const sp of w.spoons) {
      if (sp.delay > 0) { sp.delay -= dt; continue }
      sp.fly -= dt
      if (sp.fly <= 0 && !sp.done) {
        sp.done = true
        const hit = Math.abs(mouse.current.x - sp.x) < 7.5
        if (sp.tipo === 'osso') {
          if (hit) {
            w.errors++
            w.score = Math.max(0, w.score - 25)
            pushFx(w.fx, sp.x, 70, '🦴 −25!', '#f87171')
            sfx.error()
          } else {
            w.score += 4
            pushFx(w.fx, sp.x, 70, 'desviou +4', '#93c5fd')
          }
        } else if (hit) {
          const pts = sp.tipo === 'quente' ? params.pts * 2 : params.pts
          w.score += pts
          pushFx(w.fx, sp.x, 70, `+${pts}`, sp.tipo === 'quente' ? '#fbbf24' : '#86efac')
          sp.tipo === 'quente' ? sfx.perfect() : sfx.gulp()
        } else {
          w.errors++
          pushFx(w.fx, sp.x, 70, 'splash!', '#f87171')
          sfx.miss()
        }
      }
    }
    w.spoons = w.spoons.filter((sp) => !sp.done || sp.fly > -0.4)
    force()
  })

  return (
    <div ref={areaRef} className="absolute inset-0 bg-gradient-to-b from-[#4a2c11] to-[#7a4a1e] overflow-hidden select-none cursor-none">
      <MgHUD score={w.score} time={w.time} totalTime={params.dur} />
      <div className="absolute top-12 w-full text-center text-amber-200/80 font-bold text-sm z-10">
        Onda {Math.min(w.wave, params.waves)}/{params.waves}
      </div>
      {/* tigela gigante */}
      <div className="absolute bottom-[-12%] left-1/2 -translate-x-1/2 w-[120%] h-[26%] bg-[#8a5a2a] rounded-t-[50%] border-t-8 border-[#5a3a18]">
        <div className="absolute inset-x-[10%] top-2 h-1/2 bg-[#d97706] rounded-t-[50%] opacity-80" />
      </div>
      {/* colheradas */}
      {w.spoons.map((sp) => {
        if (sp.delay > 0) return null
        const prog = 1 - sp.fly / params.flyTime // 0 → 1
        const y = sp.done ? 72 : 8 + prog * 64 - Math.sin(prog * Math.PI) * 22
        return (
          <div key={sp.id} className="absolute" style={{ left: `${sp.x}%`, top: `${y}%`, transform: 'translateX(-50%)' }}>
            {!sp.done && (
              <>
                <span className="text-3xl">{sp.tipo === 'osso' ? '🦴' : '🥄'}</span>
                {sp.tipo === 'quente' && <span className="absolute -top-3 left-2 text-base drop-shadow-[0_0_6px_#fbbf24]">♨️</span>}
              </>
            )}
          </div>
        )
      })}
      {/* marcadores de pouso */}
      {w.spoons.map((sp) => sp.delay <= 0 && !sp.done && (
        <div key={`m${sp.id}`}
          className={`absolute rounded-full border-4 ${sp.tipo === 'osso' ? 'border-red-400/70' : 'border-emerald-300/70'}`}
          style={{
            left: `${sp.x}%`, top: '72%', transform: 'translate(-50%,-50%)',
            width: `${22 * Math.max(0.25, sp.fly / params.flyTime) + 24}px`,
            height: `${22 * Math.max(0.25, sp.fly / params.flyTime) + 24}px`,
          }}
        />
      ))}
      {/* boca (cursor) */}
      <div className="absolute text-6xl pointer-events-none" style={{ left: `${mouse.current.x}%`, top: '70%', transform: 'translate(-50%,-50%)' }}>
        🐋
      </div>
      <FloatFx fx={w.fx} />
      <div className="absolute bottom-2 w-full text-center text-white/60 text-sm font-semibold">
        Mova o mouse para aparar as colheradas · ♨️ vale ×2 · desvie dos 🦴
      </div>
    </div>
  )
}
