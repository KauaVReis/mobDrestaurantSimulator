// Utilitários compartilhados dos minigames
import { useEffect, useReducer, useRef } from 'react'

// loop de jogo via requestAnimationFrame (dt em segundos, máx 50ms)
export function useLoop(cb) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    let id
    let last = performance.now()
    const frame = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      ref.current(dt)
      id = requestAnimationFrame(frame)
    }
    id = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(id)
  }, [])
}

export function useForce() {
  const [, force] = useReducer((c) => c + 1, 0)
  return force
}

// keydown sem repetição
export function useKeyDown(handler) {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    const fn = (e) => {
      if (e.repeat) return
      ref.current(e.key.toLowerCase(), e)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])
}

// rastreio do mouse em % da área do jogo
export function useMousePct(areaRef) {
  const pos = useRef({ x: 50, y: 50, down: false })
  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    const move = (e) => {
      const r = el.getBoundingClientRect()
      pos.current.x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))
      pos.current.y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100))
    }
    const down = () => { pos.current.down = true }
    const up = () => { pos.current.down = false }
    el.addEventListener('mousemove', move)
    el.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
    }
  }, [areaRef])
  return pos
}

// HUD interno do minigame (GDD §11.2)
export function MgHUD({ score, time, totalTime, combo }) {
  const pct = Math.max(0, Math.min(100, (time / totalTime) * 100))
  return (
    <div className="absolute top-2 left-0 right-0 px-4 flex items-center gap-3 z-20 pointer-events-none">
      <div className="text-3xl font-black text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.6)] tabular-nums">
        {Math.round(score)}
        <span className="text-sm font-bold text-white/70 ml-1">pts</span>
      </div>
      {combo > 1 && (
        <div className="text-amber-300 font-black text-xl drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">×{combo}</div>
      )}
      <div className="flex-1" />
      <div className="w-48 h-3 bg-black/40 rounded-full overflow-hidden ring-2 ring-black/30">
        <div
          className={`h-full rounded-full transition-[width] duration-150 ${pct < 25 ? 'bg-red-500' : 'bg-emerald-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// pontos flutuantes de feedback
export function FloatFx({ fx }) {
  return (
    <>
      {fx.map((f) => (
        <div
          key={f.id}
          className="absolute float-up font-black text-2xl pointer-events-none z-30 drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]"
          style={{ left: `${f.x}%`, top: `${f.y}%`, color: f.color || '#fff' }}
        >
          {f.text}
        </div>
      ))}
    </>
  )
}

let fxId = 0
export function pushFx(list, x, y, text, color) {
  list.push({ id: ++fxId, x, y, text, color })
  if (list.length > 12) list.shift()
}
