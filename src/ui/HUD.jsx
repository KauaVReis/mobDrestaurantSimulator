// HUD principal (GDD §11.1): timer central, placares, stamina, minimapa, combo, buffs
import { useEffect, useReducer } from 'react'
import { useGame } from '../game/store'
import { world } from '../game/world'
import { RESTAURANTS, COMBO_WINDOW, comboBonus, SESSION_TIME } from '../game/constants'

function fmtPts(n) { return Math.round(n).toLocaleString('pt-BR') }

function usePoll(ms = 110) {
  const [, force] = useReducer((c) => c + 1, 0)
  useEffect(() => {
    const id = setInterval(force, ms)
    return () => clearInterval(id)
  }, [ms])
}

function fmt(t) {
  const s = Math.max(0, Math.ceil(t))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function TimerClock() {
  const timeLeft = useGame((s) => s.timeLeft)
  const pct = Math.max(0, timeLeft / SESSION_TIME)
  const critical = timeLeft < 30
  const warning = timeLeft >= 60 && timeLeft <= 120
  const R = 30
  const C = 2 * Math.PI * R
  return (
    <div className={`flex flex-col items-center ${warning ? 'shake' : ''}`}>
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
          <circle cx="36" cy="36" r={R} fill="rgba(10,14,28,0.75)" stroke="rgba(255,255,255,0.18)" strokeWidth="7" />
          <circle
            cx="36" cy="36" r={R} fill="none"
            stroke={critical ? '#ef4444' : timeLeft < 90 ? '#f59e0b' : '#34d399'}
            strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${C * pct} ${C}`}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center font-black text-lg tabular-nums ${critical ? 'timer-critical' : 'text-white'}`}>
          {fmt(timeLeft)}
        </div>
      </div>
    </div>
  )
}

function StaminaBar() {
  usePoll(100)
  const pct = (world.stamina / 100) * 100
  const full = pct >= 100 && !world.panting
  return (
    <div className="w-44 mt-1">
      <div className={`h-2.5 bg-black/50 rounded-full overflow-hidden ring-1 ring-white/20${full ? ' stamina-full' : ''}`}>
        <div
          className={`h-full rounded-full transition-[width] duration-100 ${world.panting ? 'bg-red-400' : pct < 30 ? 'bg-amber-400' : 'bg-lime-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {world.panting && <div className="text-center text-red-300 text-[10px] font-black mt-0.5">OFEGANTE!</div>}
    </div>
  )
}

function Scores() {
  const score = useGame((s) => s.score)
  const kraken = useGame((s) => s.kraken.score)
  const records = useGame((s) => s.records)
  const recordToBeat = records.length
    ? Math.round(records.slice(0, 3).reduce((a, r) => a + r.score, 0) / Math.min(3, records.length))
    : null
  return (
    <>
      <div className="absolute top-3 left-3 bg-black/55 rounded-2xl px-4 py-2 pixel-border">
        <div className="text-[10px] font-black text-sky-300 tracking-wider">🐋 MOBDYCK</div>
        <div className="text-3xl font-black text-white tabular-nums leading-7">{fmtPts(score)}</div>
        {recordToBeat !== null && (
          <div className="text-[10px] font-bold text-white/50">recorde a bater: {fmtPts(recordToBeat)}</div>
        )}
      </div>
      <div className="absolute top-3 right-3 bg-black/55 rounded-2xl px-4 py-2 pixel-border text-right">
        <div className="text-[10px] font-black text-purple-300 tracking-wider">CHEF KRAKEN 🦑</div>
        <div className={`text-3xl font-black tabular-nums leading-7 ${kraken > score ? 'text-purple-300' : 'text-white'}`}>{fmtPts(kraken)}</div>
        <div className="text-[10px] font-bold text-white/50">{kraken > score ? 'ele está na frente!' : 'você lidera'}</div>
      </div>
    </>
  )
}

function ComboIndicator() {
  usePoll(120)
  const s = useGame.getState()
  const streak = useGame((st) => st.streak)
  const lastExitAt = useGame((st) => st.lastExitAt)
  if (s.activeMinigame) return null
  const windowLeft = lastExitAt !== null ? COMBO_WINDOW - (s.elapsed - lastExitAt) : null
  if (!streak || streak < 1 || windowLeft === null || windowLeft <= 0) return null
  const nextBonus = Math.round(comboBonus(Math.min(5, streak + 1)) * 100)
  
  const colors = [
    { text: 'text-amber-300', bg: 'bg-amber-400', fx: '' },
    { text: 'text-orange-400', bg: 'bg-orange-500', fx: '' },
    { text: 'text-red-400', bg: 'bg-red-500', fx: 'shake' },
    { text: 'text-pink-400', bg: 'bg-pink-500', fx: 'bob' },
    { text: 'text-purple-400', bg: 'bg-purple-500', fx: 'spin-slow drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]' },
  ]
  const theme = colors[Math.min(streak - 1, 4)] || colors[0]

  return (
    <div className={`absolute bottom-4 left-3 bg-black/55 rounded-2xl px-4 py-2.5 pixel-border ${streak >= 5 ? 'bob' : ''}`}>
      <div className={`text-[10px] font-black tracking-wider ${theme.text}`}>
        COMBO GOURMET {streak >= 5 ? '🔥' : ''}
      </div>
      <div className="text-2xl font-black text-white flex items-center gap-2">
        <span className={theme.text}>×{streak}</span>
        <span className="text-sm text-white/50">próximo +{nextBonus}%</span>
      </div>
      <div className="h-1.5 w-36 bg-black/50 rounded-full mt-1 overflow-hidden">
        <div className={`h-full rounded-full ${theme.bg} ${streak >= 5 ? 'brightness-150' : ''}`} style={{ width: `${(windowLeft / COMBO_WINDOW) * 100}%` }} />
      </div>
      <div className="text-[10px] font-bold text-white/60 mt-0.5">entre em outro restaurante!</div>
    </div>
  )
}

function Buffs() {
  usePoll(150)
  const s = useGame.getState()
  const chaves = useGame((st) => st.chaves)
  const now = s.elapsed
  const items = []
  if (now < s.voracityUntil) {
    const rem = s.voracityUntil - now
    items.push({ icon: '🔥', label: `VORACIDADE ${Math.ceil(rem)}s`, c: 'text-orange-300', expiring: rem <= 3 })
  } else if (now < s.voracityCdUntil) {
    items.push({ icon: '⏳', label: `Q em ${Math.ceil(s.voracityCdUntil - now)}s`, c: 'text-white/40' })
  } else {
    items.push({ icon: '🔥', label: 'Q — Voracidade pronta!', c: 'text-orange-200' })
  }
  if (now < s.buffs.pepperUntil) {
    const rem = s.buffs.pepperUntil - now
    items.push({ icon: '🌶️', label: `+40% ${Math.ceil(rem)}s`, c: 'text-red-300', expiring: rem <= 3 })
  }
  if (now < s.buffs.skateUntil) {
    const rem = s.buffs.skateUntil - now
    items.push({ icon: '🛹', label: `×2 ${Math.ceil(rem)}s`, c: 'text-cyan-300', expiring: rem <= 3 })
  }
  if (now < s.buffs.slowUntil) items.push({ icon: '🫠', label: 'molho!', c: 'text-orange-200' })
  if (now < s.buffs.frozenUntil) items.push({ icon: '🕵️', label: 'INSPEÇÃO!', c: 'text-red-300' })
  if (chaves > 0 && !s.secretUnlocked) items.push({ icon: '🗝️', label: `${chaves}/3`, c: 'text-yellow-300' })
  if (s.secretUnlocked) items.push({ icon: '🌑', label: 'Banquete revelado', c: 'text-emerald-300' })
  return (
    <div className="flex flex-col gap-1 items-center mt-1.5">
      {items.map((it, i) => (
        <div key={i} className={`bg-black/55 rounded-full px-3 py-0.5 text-xs font-black ${it.c}${it.expiring ? ' buff-expiring' : ''}`}>
          {it.icon} {it.label}
        </div>
      ))}
    </div>
  )
}

function Minimap() {
  usePoll(120)
  const restaurants = useGame((s) => s.restaurants)
  const secretUnlocked = useGame((s) => s.secretUnlocked)
  const toPct = (v) => ((v + 100) / 200) * 100
  return (
    <div className="absolute bottom-4 right-3 w-44 h-44 bg-black/60 rounded-2xl pixel-border overflow-hidden">
      {/* ruas */}
      {[-40, 0, 40].map((r) => (
        <div key={`v${r}`} className="absolute bg-white/15" style={{ left: `${toPct(r) - 1.5}%`, top: '12%', width: '3%', height: '76%' }} />
      ))}
      {[-40, 0, 40].map((r) => (
        <div key={`h${r}`} className="absolute bg-white/15" style={{ top: `${toPct(r) - 1.5}%`, left: '12%', height: '3%', width: '76%' }} />
      ))}
      {/* restaurantes */}
      {RESTAURANTS.map((r) => {
        if (r.secreto && !secretUnlocked) return null
        const st = restaurants[r.id]
        const color = st.visited ? (st.rating?.stars >= 2 ? '#22c55e' : '#eab308') : st.krakenAte ? '#a855f7' : '#ef4444'
        const isSecret = r.secreto && secretUnlocked && !st.visited
        return (
          <div key={r.id} className={`absolute w-2.5 h-2.5 rounded-full ring-1 ring-black/60${isSecret ? ' animate-pulse' : ''}`}
            style={{
              left: `calc(${toPct(r.pos[0])}% - 5px)`, top: `calc(${toPct(r.pos[1])}% - 5px)`,
              background: color,
              ...(isSecret ? { animation: 'secret-ping 1s ease-in-out infinite' } : {}),
            }} />
        )
      })}
      {/* kraken */}
      <div className="absolute text-xs" style={{ left: `calc(${toPct(world.kraken.x)}% - 6px)`, top: `calc(${toPct(world.kraken.z)}% - 7px)` }}>🦑</div>
      {/* jogador */}
      <div className="absolute w-3 h-3 rounded-full bg-white ring-2 ring-sky-400"
        style={{ left: `calc(${toPct(world.player.x)}% - 6px)`, top: `calc(${toPct(world.player.z)}% - 6px)` }} />
      <div className="absolute bottom-0.5 right-1.5 text-[9px] font-black text-white/40">TAB = mapa</div>
    </div>
  )
}

function InteractPrompt() {
  const target = useGame((s) => s.interactTarget)
  const fading = useGame((s) => s.fading)
  if (!target || fading) return null
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/70 rounded-2xl px-5 py-2.5 pixel-border pop-in">
      <span className="inline-block bg-white text-slate-900 font-black rounded-lg px-2.5 py-0.5 mr-2">E</span>
      <span className="text-white font-bold">{target.label}</span>
    </div>
  )
}

function ControlsHint() {
  const elapsed = useGame((s) => s.elapsed)
  if (elapsed > 14) return null
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/55 rounded-xl px-4 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-white/75 text-xs font-bold">
      <span><span className="kbd">WASD</span> mover</span>
      <span><span className="kbd">SHIFT</span> correr</span>
      <span><span className="kbd">ESPAÇO</span> pular</span>
      <span><span className="kbd">CTRL</span> esquiva</span>
      <span><span className="kbd">E</span> interagir</span>
      <span><span className="kbd">Q</span> voracidade</span>
      <span><span className="kbd">TAB</span> mapa</span>
      <span><span className="kbd">ESC</span> pausa</span>
    </div>
  )
}

export default function HUD() {
  const timeLeft = useGame((s) => s.timeLeft)
  const frozen = useGame((s) => s.elapsed < s.buffs.frozenUntil)
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <TimerClock />
        <StaminaBar />
        <Buffs />
      </div>
      <Scores />
      <ComboIndicator />
      <Minimap />
      <InteractPrompt />
      <ControlsHint />
      {/* vinheta de urgência nos últimos 30s */}
      {timeLeft < 30 && <div className="urgency-vignette" />}
      {/* overlay de inspeção do Dr. Gastro */}
      {frozen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-red-900/25 inspection-overlay">
          <div className="text-5xl font-black text-red-400 tracking-wider" style={{ textShadow: '0 0 20px rgba(239,68,68,0.7)' }}>
            🕵️ SOB INSPEÇÃO!
          </div>
        </div>
      )}
    </div>
  )
}
