// Shell dos minigames: intro com tutorial-flash (GDD §5.2), jogo, cartão de resultado
// com classificação (GDD §7.3) e confirmação de abandono (GDD §5.4)
import { useEffect, useRef, useState } from 'react'
import { useGame } from '../game/store'
import { restaurantById, DIFF_LABEL, DIFF_COLOR, DIFF_MULT, ratingFor, comboBonus } from '../game/constants'
import { getMinigame } from './registry'

export default function MinigameOverlay() {
  const active = useGame((s) => s.activeMinigame)
  if (!active) return null
  return <Shell key={active.restaurantId} active={active} />
}

function Shell({ active }) {
  const completeMinigame = useGame((s) => s.completeMinigame)
  const abandonMinigame = useGame((s) => s.abandonMinigame)
  const r = restaurantById(active.restaurantId)
  const mg = getMinigame(r.minigame, r.diff)

  const [phase, setPhase] = useState('intro') // intro | play | done
  const [confirm, setConfirm] = useState(false)
  const [result, setResult] = useState(null)
  const endedRef = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setPhase((p) => (p === 'intro' ? 'play' : p)), 2200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (phase === 'play') setConfirm((c) => !c)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  const handleEnd = (res) => {
    if (endedRef.current) return
    endedRef.current = true
    setResult(res)
    setPhase('done')
    setTimeout(() => completeMinigame(res), 2600)
  }

  const Game = mg.component
  const rating = result ? ratingFor(Math.min(1, result.raw / result.max)) : null

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-[2px]">
      <div className="relative w-[min(94vw,1000px)] h-[min(86vh,640px)] rounded-2xl overflow-hidden pixel-border bg-slate-900">
        {/* faixa de título */}
        <div className="absolute top-0 inset-x-0 h-9 z-30 flex items-center justify-between px-3 bg-black/60">
          <div className="text-white font-black text-sm flex items-center gap-2">
            <span className="text-lg">{r.emoji}</span> {r.nome}
            <span className="text-white/40 font-semibold">— {mg.nome}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: DIFF_COLOR[r.diff], color: '#1a1a2e' }}>
              {DIFF_LABEL[r.diff]} ×{DIFF_MULT[r.diff]}
            </span>
            {active.streak >= 2 && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                COMBO ×{(1 + comboBonus(active.streak)).toFixed(2)}
              </span>
            )}
            <span className="text-white/40 text-xs font-bold">ESC sai</span>
          </div>
        </div>

        {/* área do jogo */}
        <div className="absolute inset-0 top-9">
          {phase !== 'intro' && (
            <Game params={mg.params} onEnd={handleEnd} paused={confirm || phase === 'done'} />
          )}

          {/* intro / tutorial flash */}
          {phase === 'intro' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10 bg-gradient-to-b from-slate-900 to-slate-800">
              <div className="text-7xl mb-4 bob">{r.emoji}</div>
              <h2 className="text-4xl font-black text-white mb-1 pop-in">{mg.nome}</h2>
              <div className="text-sm font-bold mb-5" style={{ color: DIFF_COLOR[r.diff] }}>
                {DIFF_LABEL[r.diff]} — multiplicador ×{DIFF_MULT[r.diff]}
              </div>
              <p className="text-white/85 text-lg font-semibold max-w-xl leading-snug">{mg.tutorial}</p>
              <div className="mt-6 text-amber-300 font-black animate-pulse">PREPARE O APETITE...</div>
            </div>
          )}

          {/* resultado */}
          {phase === 'done' && result && rating && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70">
              <div className="text-center pop-in">
                <div className="text-6xl mb-3 star-burst">{rating.icon}</div>
                <div className="text-3xl font-black text-white">{rating.label}</div>
                <div className="text-5xl font-black text-amber-300 mt-3 tabular-nums">
                  {result.raw} <span className="text-xl text-white/60">pts brutos</span>
                </div>
                <div className="text-white/70 font-bold mt-2 text-sm">
                  × {DIFF_MULT[r.diff]} ({DIFF_LABEL[r.diff]})
                  {active.streak >= 2 && ` × ${(1 + comboBonus(active.streak)).toFixed(2)} (combo)`}
                  {result.errors === 0 && result.raw > 0 && ' · SEM ERROS +100'}
                </div>
                {rating.stars === 3 && <div className="text-emerald-300 font-black mt-2">+5 segundos no timer!</div>}
                {rating.stars === 0 && <div className="text-red-400 font-black mt-2">−5% da pontuação acumulada...</div>}
              </div>
            </div>
          )}

          {/* confirmação de abandono */}
          {confirm && phase === 'play' && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75">
              <div className="bg-slate-800 rounded-2xl p-6 text-center pixel-border max-w-sm">
                <div className="text-3xl mb-2">🏃💨</div>
                <h3 className="text-xl font-black text-white mb-1">Abandonar o prato?</h3>
                <p className="text-white/70 text-sm font-semibold mb-4">
                  0 pontos desta visita, <span className="text-red-400 font-black">−15 segundos</span> e o combo quebra. Pode voltar depois com bônus −50%.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => abandonMinigame()}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-black cursor-pointer">
                    Abandonar
                  </button>
                  <button
                    onClick={() => setConfirm(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black cursor-pointer">
                    Continuar comendo!
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
