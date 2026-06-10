// MINIGAME #8 — "Taco Tempestade" (GDD §6.2.8)
// Simon Says culinário: memorize a sequência e clique nos ingredientes na ordem.
import { useRef } from 'react'
import { useLoop, useForce, MgHUD, FloatFx, pushFx } from '../shared'
import { sfx } from '../../game/audio'

const POOL = ['🫓', '🥩', '🧀', '🥑', '🌶️', '🍅', '🌽', '🧅']

function makeSeq(n) {
  const seq = ['🫓']
  for (let i = 1; i < n; i++) seq.push(POOL[1 + Math.floor(Math.random() * (POOL.length - 1))])
  return seq
}

export default function Taco({ params, onEnd, paused }) {
  const force = useForce()
  const st = useRef(null)
  if (!st.current) {
    st.current = {
      time: params.dur, phase: 'memo', memoT: params.memo,
      seq: makeSeq(params.seqLen), idx: 0,
      bubbles: [], nextSpawn: 0, score: 0, errors: 0,
      ended: false, fx: [], id: 0,
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
    if (w.phase === 'memo') {
      w.memoT -= dt
      if (w.memoT <= 0) w.phase = 'play'
      force()
      return
    }
    // bolhas de ingredientes cruzando a tela
    w.nextSpawn -= dt
    if (w.nextSpawn <= 0 && w.bubbles.length < params.concurrent + 2) {
      w.nextSpawn = 0.55
      // garante que o ingrediente necessário esteja sempre em cena
      const needed = w.seq[w.idx]
      const hasNeeded = w.bubbles.some((b) => b.e === needed)
      const e = !hasNeeded && Math.random() < 0.6 ? needed : POOL[Math.floor(Math.random() * POOL.length)]
      const fromLeft = Math.random() < 0.5
      w.bubbles.push({
        id: ++w.id, e,
        x: fromLeft ? -8 : 108,
        y: 22 + Math.random() * 52,
        vx: (fromLeft ? 1 : -1) * (params.speed * (0.7 + Math.random() * 0.6)),
        wob: Math.random() * Math.PI * 2,
      })
    }
    for (const b of w.bubbles) {
      b.x += b.vx * dt
      b.wob += dt * 3
    }
    w.bubbles = w.bubbles.filter((b) => !b.done && b.x > -12 && b.x < 112)
    force()
  })

  const clickBubble = (b) => {
    if (paused || w.ended || w.phase !== 'play') return
    if (b.e === w.seq[w.idx]) {
      b.done = true
      w.idx++
      w.score += params.pts
      pushFx(w.fx, b.x, b.y, `+${params.pts}`, '#86efac')
      sfx.gulp()
      if (w.idx >= w.seq.length) {
        w.score += 30
        pushFx(w.fx, 50, 45, 'TACO COMPLETO! +30', '#fbbf24')
        sfx.fanfare()
        w.seq = makeSeq(params.seqLen)
        w.idx = 0
        w.phase = 'memo'
        w.memoT = params.memo
        w.bubbles = []
      }
    } else {
      w.errors++
      const back = Math.ceil(w.idx * 0.25)
      w.idx = Math.max(0, w.idx - back)
      pushFx(w.fx, b.x, b.y, 'taco desmontou! 💥', '#f87171')
      sfx.error()
    }
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#7a4a10] to-[#a8661c] overflow-hidden select-none">
      <MgHUD score={w.score} time={w.time} totalTime={params.dur} />
      {/* sequência */}
      <div className="absolute top-12 left-0 right-0 flex justify-center z-10">
        <div className="bg-black/45 rounded-xl px-3 py-1.5 flex gap-1.5 items-center">
          <span className="text-white/80 text-xs font-bold mr-1">TACO:</span>
          {w.seq.map((e, i) => (
            <span key={i} className={`text-2xl transition-all ${w.phase === 'memo'
              ? ''
              : i < w.idx ? 'opacity-30' : i === w.idx ? 'scale-125 drop-shadow-[0_0_6px_#fff]' : 'opacity-25 blur-[3px]'}`}>
              {e}
            </span>
          ))}
        </div>
      </div>
      {w.phase === 'memo' && (
        <div className="absolute top-[42%] w-full text-center z-20">
          <div className="text-4xl font-black text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.5)] pop-in">MEMORIZE!</div>
          <div className="text-6xl font-black text-amber-300 mt-2">{Math.ceil(w.memoT)}</div>
        </div>
      )}
      {/* bolhas */}
      {w.phase === 'play' && w.bubbles.map((b) => (
        <button key={b.id}
          onMouseDown={() => clickBubble(b)}
          className="absolute w-16 h-16 rounded-full bg-white/15 hover:bg-white/30 ring-2 ring-white/30 text-4xl flex items-center justify-center cursor-pointer transition-colors"
          style={{ left: `${b.x}%`, top: `${b.y + Math.sin(b.wob) * 3}%`, transform: 'translate(-50%,-50%)' }}>
          {b.e}
        </button>
      ))}
      <FloatFx fx={w.fx} />
      <div className="absolute bottom-2 w-full text-center text-white/60 text-sm font-semibold">
        Memorize a sequência e clique nos ingredientes NA ORDEM · errou = taco desmonta (−25% do progresso)
      </div>
    </div>
  )
}
