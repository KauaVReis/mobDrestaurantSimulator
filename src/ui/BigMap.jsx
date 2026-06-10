// Mapa completo de Bellyport (Tab) — GDD §5.1 "Ver Mapa"
import { useEffect, useReducer } from 'react'
import { useGame } from '../game/store'
import { world } from '../game/world'
import { RESTAURANTS, BAIRROS, DIFF_LABEL } from '../game/constants'

export default function BigMap({ embedded = false }) {
  const mapOpen = useGame((s) => s.mapOpen)
  if (!mapOpen && !embedded) return null
  return <MapBody embedded={embedded} />
}

function MapBody({ embedded }) {
  const [, force] = useReducer((c) => c + 1, 0)
  useEffect(() => {
    const id = setInterval(force, 200)
    return () => clearInterval(id)
  }, [])
  const restaurants = useGame((s) => s.restaurants)
  const secretUnlocked = useGame((s) => s.secretUnlocked)
  const hintRevealed = useGame((s) => s.hintRevealed)
  const bonusId = useGame((s) => s.bonusRestaurantId)
  const toPct = (v) => ((v + 100) / 200) * 100

  const inner = (
    <div className="relative w-[min(80vw,560px)] h-[min(80vw,560px)] max-h-[70vh] max-w-[70vh] bg-[#101626] rounded-2xl pixel-border overflow-hidden">
      {[-40, 0, 40].map((r) => (
        <div key={`v${r}`} className="absolute bg-white/12" style={{ left: `${toPct(r) - 1.2}%`, top: '10%', width: '2.4%', height: '80%' }} />
      ))}
      {[-40, 0, 40].map((r) => (
        <div key={`h${r}`} className="absolute bg-white/12" style={{ top: `${toPct(r) - 1.2}%`, left: '10%', height: '2.4%', width: '80%' }} />
      ))}
      {/* água do porto */}
      <div className="absolute inset-x-0 top-0 h-[5%] bg-sky-800/60" />
      {RESTAURANTS.map((r) => {
        if (r.secreto && !secretUnlocked) return null
        const st = restaurants[r.id]
        const color = st.visited ? (st.rating?.stars >= 2 ? '#22c55e' : '#eab308') : st.krakenAte ? '#a855f7' : '#ef4444'
        const isBonus = hintRevealed && bonusId === r.id
        return (
          <div key={r.id} className="absolute text-center" style={{ left: `${toPct(r.pos[0])}%`, top: `${toPct(r.pos[1])}%`, transform: 'translate(-50%,-50%)' }}>
            <div className={`text-xl leading-5 ${isBonus ? 'drop-shadow-[0_0_8px_#fbbf24]' : ''}`}>{r.emoji}</div>
            <div className="text-[9px] font-black whitespace-nowrap px-1 rounded" style={{ color, background: 'rgba(0,0,0,0.55)' }}>
              {r.nome.length > 18 ? r.nome.slice(0, 16) + '…' : r.nome}
              {isBonus && ' ★'}
            </div>
            <div className="text-[8px] font-bold text-white/50">{DIFF_LABEL[r.diff]}{st.visited ? ` · ${st.points}pts` : ''}</div>
          </div>
        )
      })}
      <div className="absolute text-lg" style={{ left: `${toPct(world.kraken.x)}%`, top: `${toPct(world.kraken.z)}%`, transform: 'translate(-50%,-50%)' }}>🦑</div>
      <div className="absolute text-lg" style={{ left: `${toPct(world.player.x)}%`, top: `${toPct(world.player.z)}%`, transform: 'translate(-50%,-50%)' }}>🐋</div>
    </div>
  )

  if (embedded) return inner
  return (
    <div className="absolute inset-0 z-[45] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
      <h2 className="text-2xl font-black text-white">🗺️ Bellyport</h2>
      {inner}
      <div className="flex gap-4 text-xs font-bold text-white/70">
        <span><span className="text-red-400">●</span> não visitado</span>
        <span><span className="text-green-400">●</span> visitado</span>
        <span><span className="text-yellow-400">●</span> pontuação baixa</span>
        <span><span className="text-purple-400">●</span> Kraken comeu</span>
      </div>
      <div className="text-white/50 text-sm font-bold">TAB para fechar — o timer continua correndo!</div>
    </div>
  )
}
