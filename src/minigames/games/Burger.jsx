// MINIGAME #2 — "Montagem Maluca" (GDD §6.2.2)
// Ingredientes caem; capture na ordem da receita movendo MobDyck com A/D ou setas.
import { useRef } from 'react'
import { useLoop, useForce, MgHUD, FloatFx, pushFx } from '../shared'
import { keys } from '../../game/input'
import { sfx } from '../../game/audio'

const ING = [
  { e: '🍞', n: 'Pão' }, { e: '🥩', n: 'Carne' }, { e: '🧀', n: 'Queijo' },
  { e: '🥬', n: 'Alface' }, { e: '🍅', n: 'Tomate' }, { e: '🧅', n: 'Cebola' },
  { e: '🥓', n: 'Bacon' }, { e: '🥒', n: 'Picles' },
]
const FAKES = ['🧦', '👟', '🧤', '🎩', '🐟']

function makeRecipe(n) {
  const r = [ING[0]]
  for (let i = 0; i < n - 2; i++) r.push(ING[1 + Math.floor(Math.random() * (ING.length - 1))])
  r.push(ING[0])
  return r
}

export default function Burger({ params, onEnd, paused }) {
  const force = useForce()
  const st = useRef(null)
  if (!st.current) {
    st.current = {
      time: params.dur, x: 50, items: [], nextSpawn: 0.4, score: 0, errors: 0,
      recipe: makeRecipe(params.recipe), idx: 0, stack: 0,
      ended: false, fx: [], id: 0, shake: 0, molhoSpawned: false,
    }
  }
  const w = st.current

  useLoop((dt) => {
    if (paused || w.ended) return
    w.time -= dt
    w.shake = Math.max(0, w.shake - dt * 4)
    if (w.time <= 0) {
      w.ended = true
      onEnd({ raw: w.score, max: params.max, errors: w.errors })
      return
    }
    // movimento
    const sp = 62
    if (keys['a'] || keys['arrowleft']) w.x -= sp * dt
    if (keys['d'] || keys['arrowright']) w.x += sp * dt
    w.x = Math.max(6, Math.min(94, w.x))

    // spawn
    w.nextSpawn -= dt
    if (w.nextSpawn <= 0) {
      w.nextSpawn = params.spawn * (0.8 + Math.random() * 0.4)
      const fake = Math.random() < params.fakeChance
      const molho = !w.molhoSpawned && w.time < params.dur * 0.6 && Math.random() < 0.1
      if (molho) w.molhoSpawned = true
      let item
      if (molho) item = { e: '🍯', n: 'Molho Secreto', molho: true }
      else if (fake) item = { e: FAKES[Math.floor(Math.random() * FAKES.length)], n: 'FALSO', fake: true }
      else {
        // 65% de chance de cair o ingrediente que falta
        item = Math.random() < 0.65 ? w.recipe[w.idx] : ING[Math.floor(Math.random() * ING.length)]
      }
      w.items.push({ id: ++w.id, x: 8 + Math.random() * 84, y: -6, ...item })
    }
    // queda + captura
    for (const it of w.items) {
      it.y += params.fall * dt
      if (!it.done && it.y > 78 && it.y < 92 && Math.abs(it.x - w.x) < 8) {
        it.done = true
        if (it.molho) {
          w.score += 100
          pushFx(w.fx, it.x, 78, '+100 MOLHO SECRETO!', '#fbbf24')
          sfx.perfect()
        } else if (it.fake) {
          w.errors++
          w.score = Math.max(0, w.score - 10)
          w.shake = 1
          pushFx(w.fx, it.x, 78, 'ECA! −10', '#f87171')
          sfx.error()
        } else if (it.n === w.recipe[w.idx].n) {
          w.idx++
          w.stack++
          w.score += params.pts
          pushFx(w.fx, it.x, 78, `+${params.pts}`, '#86efac')
          sfx.gulp()
          if (w.idx >= w.recipe.length) {
            w.score += 25
            pushFx(w.fx, 50, 50, 'BURGER COMPLETO! +25', '#fbbf24')
            sfx.fanfare()
            w.recipe = makeRecipe(params.recipe)
            w.idx = 0
            w.stack = 0
          }
        } else {
          w.errors++
          w.shake = 1
          pushFx(w.fx, it.x, 78, 'fora de ordem!', '#f87171')
          sfx.miss()
        }
      }
    }
    w.items = w.items.filter((it) => !it.done && it.y < 105)
    force()
  })

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#7a1f1f] to-[#b33939] overflow-hidden select-none">
      <MgHUD score={w.score} time={w.time} totalTime={params.dur} />
      {/* receita */}
      <div className="absolute top-12 left-0 right-0 flex justify-center gap-1 z-10">
        <div className="bg-black/45 rounded-xl px-3 py-1.5 flex gap-1.5 items-center">
          <span className="text-white/80 text-xs font-bold mr-1">RECEITA:</span>
          {w.recipe.map((r, i) => (
            <span key={i} className={`text-2xl ${i < w.idx ? 'opacity-30' : i === w.idx ? 'scale-125 drop-shadow-[0_0_6px_#fff]' : 'opacity-70'}`}>
              {r.e}
            </span>
          ))}
        </div>
      </div>
      {/* itens caindo */}
      {w.items.map((it) => (
        <div key={it.id} className="absolute text-4xl" style={{ left: `${it.x}%`, top: `${it.y}%`, transform: 'translateX(-50%)' }}>
          <span className={it.molho ? 'drop-shadow-[0_0_10px_#fbbf24]' : ''}>{it.e}</span>
        </div>
      ))}
      {/* MobDyck com a boca aberta */}
      <div className={`absolute text-7xl ${w.shake > 0 ? 'shake' : ''}`}
        style={{ left: `${w.x}%`, top: '78%', transform: 'translateX(-50%)' }}>
        <div className="relative">
          🐋
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👄</div>
          {w.stack > 0 && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-black text-amber-200 bg-black/40 rounded px-1">
              {w.stack} 🥪
            </div>
          )}
        </div>
      </div>
      <FloatFx fx={w.fx} />
      <div className="absolute bottom-2 w-full text-center text-white/60 text-sm font-semibold">
        A/D ou ←/→ para mover · capture na ordem da receita · 🍯 = +100
      </div>
    </div>
  )
}
