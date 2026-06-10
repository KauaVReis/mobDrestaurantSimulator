// MINIGAME #10 — "Sorvete Turbo" (GDD §6.2.10)
// Torres de sorvete derretendo: clique rápido para lamber as bolas antes que caiam.
import { useRef } from 'react'
import { useLoop, useForce, MgHUD, FloatFx, pushFx } from '../shared'
import { sfx } from '../../game/audio'

const FLAVORS = ['#f9a8d4', '#a7f3d0', '#fde68a', '#c4b5fd', '#fca5a5', '#93c5fd']

function newTower(params, i, n) {
  const scoops = []
  const count = 3 + Math.floor(Math.random() * 2)
  for (let j = 0; j < count; j++) {
    scoops.push({
      color: FLAVORS[Math.floor(Math.random() * FLAVORS.length)],
      striped: Math.random() < 0.12,
      hp: params.clicks,
    })
  }
  return {
    x: ((i + 1) / (n + 1)) * 100,
    scoops,
    melt: 100,
    meltRate: params.melt * (0.8 + Math.random() * 0.5),
    respawnT: 0,
  }
}

export default function Gelato({ params, onEnd, paused }) {
  const force = useForce()
  const st = useRef(null)
  if (!st.current) {
    st.current = {
      time: params.dur, score: 0, errors: 0, ended: false, fx: [],
      towers: Array.from({ length: params.towers }, (_, i) => newTower(params, i, params.towers)),
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
    w.towers.forEach((t, i) => {
      if (t.respawnT > 0) {
        t.respawnT -= dt
        if (t.respawnT <= 0) w.towers[i] = newTower(params, i, params.towers)
        return
      }
      if (t.scoops.length === 0) { t.respawnT = 0.9; return }
      t.melt -= t.meltRate * dt
      if (t.melt <= 0) {
        // a bola do topo derrete e cai
        const lost = t.scoops.shift()
        w.errors++
        pushFx(w.fx, t.x, 36, lost.striped ? 'a rara derreteu! 😱' : 'derreteu! 💧', '#93c5fd')
        sfx.miss()
        t.melt = 100
      }
    })
    force()
  })

  const lick = (t) => {
    if (paused || w.ended || t.respawnT > 0 || t.scoops.length === 0) return
    const top = t.scoops[0]
    top.hp--
    if (top.hp <= 0) {
      t.scoops.shift()
      const pts = top.striped ? 30 : 10
      w.score += pts
      pushFx(w.fx, t.x, 40, `+${pts}${top.striped ? ' RARA!' : ''}`, top.striped ? '#fbbf24' : '#86efac')
      top.striped ? sfx.perfect() : sfx.gulp()
      t.melt = 100
    } else {
      sfx.tick()
    }
    force()
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0b4f6c] to-[#1481a3] overflow-hidden select-none">
      <MgHUD score={w.score} time={w.time} totalTime={params.dur} />
      {/* torres */}
      {w.towers.map((t, i) => (
        <div key={i} className="absolute bottom-[12%]" style={{ left: `${t.x}%`, transform: 'translateX(-50%)' }}>
          {t.respawnT > 0 ? (
            <div className="text-4xl opacity-40 text-center">🍨<div className="text-xs text-white/60 font-bold">nova torre...</div></div>
          ) : (
            <button onMouseDown={() => lick(t)} className="block cursor-pointer group">
              {/* medidor de derretimento */}
              <div className="w-16 h-2.5 bg-black/40 rounded-full mb-2 overflow-hidden mx-auto ring-1 ring-black/40">
                <div className={`h-full rounded-full ${t.melt < 35 ? 'bg-red-400' : 'bg-cyan-300'}`} style={{ width: `${t.melt}%` }} />
              </div>
              {/* bolas (a do topo é a lambida) */}
              <div className="flex flex-col-reverse items-center">
                <div className="w-10 h-14 bg-[#d9a066] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
                {t.scoops.slice().reverse().map((sc, j) => {
                  const isTop = j === t.scoops.length - 1
                  return (
                    <div key={j}
                      className={`rounded-full -mb-2 transition-transform ${isTop ? 'group-active:scale-90 ring-4 ring-white/60' : ''}`}
                      style={{
                        width: `${52 - j * 0}px`, height: '44px',
                        background: sc.striped
                          ? `repeating-linear-gradient(45deg, ${sc.color}, ${sc.color} 6px, #fff 6px, #fff 10px)`
                          : sc.color,
                        boxShadow: sc.striped ? '0 0 12px #fbbf24' : 'inset 0 -6px 0 rgba(0,0,0,0.12)',
                      }}
                    />
                  )
                })}
              </div>
              {/* hp da bola do topo */}
              {t.scoops[0] && (
                <div className="text-center text-white/90 text-xs font-black mt-1 bg-black/30 rounded px-1">
                  {'👅'.repeat(Math.max(0, t.scoops[0].hp))}
                </div>
              )}
            </button>
          )}
        </div>
      ))}
      <FloatFx fx={w.fx} />
      <div className="absolute bottom-2 w-full text-center text-white/60 text-sm font-semibold">
        CLIQUE rápido na torre para lamber a bola do topo · listradas valem ×3 · barra azul = derretimento
      </div>
    </div>
  )
}
