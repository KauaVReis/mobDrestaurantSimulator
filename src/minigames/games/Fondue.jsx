// MINIGAME #9 — "Fondue Frenético" (GDD §6.2.9)
// Segure o mouse para mergulhar o pedaço no fondue; solte na janela verde da barra.
import { useRef } from 'react'
import { useLoop, useForce, useMousePct, MgHUD, FloatFx, pushFx } from '../shared'
import { sfx } from '../../game/audio'

const PIECES = ['🍞', '🥖', '🥦', '🍓', '🍐', '🥨']

function newPiece(params) {
  const golden = Math.random() < 0.15
  const target = 1 + Math.random() * 1.2
  return {
    emoji: golden ? '🥐' : PIECES[Math.floor(Math.random() * PIECES.length)],
    golden,
    target,                    // tempo ideal de mergulho (centro da janela)
    window: params.window,     // metade da janela (s)
    dip: 0,
    dipping: false,
    overAt: target + params.window + 0.5, // além disso, cai no fogo
  }
}

export default function Fondue({ params, onEnd, paused }) {
  const force = useForce()
  const areaRef = useRef(null)
  const mouse = useMousePct(areaRef)
  const st = useRef(null)
  if (!st.current) {
    st.current = {
      time: params.dur, piece: newPiece(params), score: 0, errors: 0,
      ended: false, fx: [], sway: 0, t: 0, wasDown: false,
    }
  }
  const w = st.current

  useLoop((dt) => {
    if (paused || w.ended) return
    w.time -= dt
    w.t += dt
    w.sway = Math.sin(w.t * params.swaySpeed) * params.swayAmp
    if (w.time <= 0) {
      w.ended = true
      onEnd({ raw: w.score, max: params.max, errors: w.errors })
      return
    }
    const potX = 50 + w.sway
    const overPot = Math.abs(mouse.current.x - potX) < 13 && mouse.current.y > 38 && mouse.current.y < 72
    const down = mouse.current.down

    if (down && overPot) {
      w.piece.dipping = true
      w.piece.dip += dt
      if (w.piece.dip > w.piece.overAt) {
        // caiu no fogo
        w.errors++
        w.score = Math.max(0, w.score - 15)
        pushFx(w.fx, potX, 50, 'CAIU NO FOGO! −15', '#f87171')
        sfx.error()
        w.piece = newPiece(params)
      }
    } else if (w.piece.dipping && (!down || !overPot)) {
      // soltou / saiu — avalia o mergulho
      const d = w.piece.dip
      const { target, window: win, golden } = w.piece
      if (d >= target - win && d <= target + win) {
        const closeness = 1 - Math.abs(d - target) / win
        let pts = closeness > 0.6 ? params.perfect : Math.round(params.perfect * 0.6)
        if (golden) pts += 18
        w.score += pts
        pushFx(w.fx, potX, 42, closeness > 0.6 ? `PERFEITO! +${pts}` : `+${pts}`, golden ? '#fbbf24' : '#86efac')
        closeness > 0.6 ? sfx.perfect() : sfx.gulp()
      } else if (d < target - win) {
        w.errors++
        w.score += Math.max(0, Math.round(params.perfect * 0.25))
        pushFx(w.fx, potX, 42, 'mal coberto...', '#fde68a')
        sfx.miss()
      } else {
        w.errors++
        pushFx(w.fx, potX, 42, 'encharcou!', '#f87171')
        sfx.miss()
      }
      w.piece = newPiece(params)
    }
    w.wasDown = down
    force()
  })

  const potX = 50 + w.sway
  const p = w.piece
  const dipPct = Math.min(1.3, p.dip / (p.target + p.window)) * 100
  return (
    <div ref={areaRef} className="absolute inset-0 bg-gradient-to-b from-[#3b2a1a] to-[#5c4226] overflow-hidden select-none">
      <MgHUD score={w.score} time={w.time} totalTime={params.dur} />
      {/* pedaço atual + barra de mergulho */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10 text-center">
        <div className="text-5xl">{p.emoji}{p.golden && <span className="text-2xl">✨</span>}</div>
        <div className="relative w-56 h-5 bg-black/50 rounded-full mt-2 overflow-hidden ring-2 ring-black/40">
          {/* janela ideal */}
          <div className="absolute inset-y-0 bg-emerald-400/60"
            style={{
              left: `${((p.target - p.window) / (p.target + p.window)) * 77}%`,
              width: `${((2 * p.window) / (p.target + p.window)) * 77}%`,
            }} />
          <div className="absolute inset-y-0 right-0 w-[14%] bg-red-500/50" />
          <div className="absolute inset-y-0 w-1.5 bg-white transition-[left] duration-75" style={{ left: `${Math.min(98, dipPct * 0.77)}%` }} />
        </div>
        <div className="text-white/70 text-xs font-bold mt-1">solte na faixa verde</div>
      </div>
      {/* fogo */}
      <div className="absolute left-1/2 top-[74%] -translate-x-1/2 text-5xl">🔥🔥🔥</div>
      {/* panela de fondue oscilando */}
      <div className="absolute top-[40%]" style={{ left: `${potX}%`, transform: 'translateX(-50%)' }}>
        <div className="w-52 h-32 bg-[#b45309] rounded-b-[60px] rounded-t-lg border-4 border-[#7c3a08] relative overflow-hidden">
          <div className="absolute inset-x-2 top-2 h-12 bg-[#fbbf24] rounded-[40%]">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_50%,#fff7,transparent_40%)]" />
          </div>
          {p.dipping && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-4xl">{p.emoji}</div>
          )}
        </div>
      </div>
      {/* garfo segue o mouse */}
      {!p.dipping && (
        <div className="absolute text-4xl pointer-events-none"
          style={{ left: `${mouse.current.x}%`, top: `${mouse.current.y}%`, transform: 'translate(-50%,-50%) rotate(45deg)' }}>
          🍴<span className="text-3xl">{p.emoji}</span>
        </div>
      )}
      <FloatFx fx={w.fx} />
      <div className="absolute bottom-2 w-full text-center text-white/60 text-sm font-semibold">
        Leve o garfo até a panela e SEGURE o botão para mergulhar · solte na faixa verde · panela oscila!
      </div>
    </div>
  )
}
