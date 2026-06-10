// Menu de pausa (GDD §11.3) — timer congelado
import { useState } from 'react'
import { useGame } from '../game/store'
import BigMap from './BigMap'

export default function Pause() {
  const paused = useGame((s) => s.paused)
  const togglePause = useGame((s) => s.togglePause)
  const startGame = useGame((s) => s.startGame)
  const backToMenu = useGame((s) => s.backToMenu)
  const muted = useGame((s) => s.muted)
  const toggleMute = useGame((s) => s.toggleMute)
  const [showMap, setShowMap] = useState(false)
  if (!paused) return null

  return (
    <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
      {showMap ? (
        <div className="flex flex-col items-center gap-3">
          <BigMap embedded />
          <button onClick={() => setShowMap(false)} className="px-5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black cursor-pointer">
            ← Voltar
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/95 rounded-3xl p-8 pixel-border text-center w-80">
          <div className="text-5xl mb-2">⏸️</div>
          <h2 className="text-2xl font-black text-white mb-1">PAUSA</h2>
          <p className="text-white/50 text-xs font-bold mb-5">O sino de Bellyport está suspenso...</p>
          <div className="flex flex-col gap-2.5">
            <button onClick={togglePause} className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black cursor-pointer">
              ▶ Continuar
            </button>
            <button onClick={() => setShowMap(true)} className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black cursor-pointer">
              🗺️ Ver Mapa
            </button>
            <button onClick={startGame} className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black cursor-pointer">
              🔄 Reiniciar Sessão
            </button>
            <button onClick={toggleMute} className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black cursor-pointer">
              {muted ? '🔇 Som: desligado' : '🔊 Som: ligado'}
            </button>
            <button onClick={backToMenu} className="px-4 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-400 text-white font-black cursor-pointer">
              🏠 Menu Principal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
