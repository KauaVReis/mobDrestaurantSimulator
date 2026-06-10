// Tela de resultado da sessão (GDD §10.3) + Game Over com humor (GDD §11.3)
import { useGame } from '../game/store'
import { DIFF_LABEL, DIFF_COLOR } from '../game/constants'
import { sfx } from '../game/audio'

function fmtPts(n) { return Math.round(n).toLocaleString('pt-BR') }

export default function Results() {
  const results = useGame((s) => s.results)
  const startGame = useGame((s) => s.startGame)
  const backToMenu = useGame((s) => s.backToMenu)
  if (!results) return null
  const r = results

  return (
    <div className={`absolute inset-0 overflow-y-auto flex items-start md:items-center justify-center p-4 ${r.victory ? 'bg-gradient-to-b from-[#14301c] to-[#1f4a2c]' : 'bg-gradient-to-b from-[#301420] to-[#4a1f30]'}`}>
      <div className="bg-black/45 rounded-3xl pixel-border max-w-xl w-full p-6 my-4 text-center pop-in">
        <div className="text-xs font-black tracking-[0.3em] text-white/50">FESTIVAL GOURMET DE BELLYPORT</div>
        <h1 className="text-3xl font-black text-white mt-1">RESULTADO DA SESSÃO</h1>

        <div className={`text-6xl my-3 ${r.victory ? 'bob' : 'shake'}`}>{r.victory ? '🏆🐋' : '🦑😂'}</div>
        <div className={`text-4xl font-black ${r.victory ? 'text-amber-300 title-glow' : 'text-purple-300'}`}>
          {r.victory ? 'VITÓRIA!' : 'GAME OVER'}
        </div>
        <div className="text-white/80 font-bold mt-1">
          {r.victory
            ? `+${fmtPts(r.score - r.krakenScore)} de vantagem sobre o Chef Kraken`
            : `Chef Kraken venceu por ${fmtPts(r.krakenScore - r.score)} pontos e está dançando com os tentáculos...`}
        </div>

        {/* placar */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-sky-500/15 rounded-2xl p-3">
            <div className="text-xs font-black text-sky-300">🐋 MOBDYCK</div>
            <div className="text-4xl font-black text-white tabular-nums">{fmtPts(r.score)}</div>
          </div>
          <div className="bg-purple-500/15 rounded-2xl p-3">
            <div className="text-xs font-black text-purple-300">🦑 CHEF KRAKEN</div>
            <div className="text-4xl font-black text-white tabular-nums">{fmtPts(r.krakenScore)}</div>
          </div>
        </div>
        <div className="text-white/70 font-bold text-sm mt-2">
          Restaurantes visitados: {r.visitados} / {r.totalRestaurantes}
        </div>

        {/* detalhamento */}
        {r.breakdown.length > 0 && (
          <div className="mt-4 text-left bg-black/30 rounded-2xl p-3 max-h-44 overflow-y-auto">
            <div className="text-xs font-black text-white/50 mb-1.5">DETALHAMENTO</div>
            {r.breakdown.map((b, i) => (
              <div key={i} className="flex items-center justify-between text-sm font-bold text-white/85 py-0.5">
                <span>
                  {b.emoji} {b.nome}
                  <span className="ml-1.5 text-[10px] font-black px-1.5 rounded-full" style={{ background: DIFF_COLOR[b.diff], color: '#1a1a2e' }}>
                    {DIFF_LABEL[b.diff]}
                  </span>
                </span>
                <span className="tabular-nums">{b.rating?.icon} {fmtPts(b.pontos)}</span>
              </div>
            ))}
          </div>
        )}

        {/* recordes e recompensas */}
        {r.isRecord && (
          <div className="mt-3 text-amber-300 font-black star-burst">
            🏅 NOVO RECORDE PESSOAL! {r.recordAnterior > 0 && `(anterior: ${fmtPts(r.recordAnterior)})`}
          </div>
        )}
        <div className="flex justify-center gap-5 mt-3 text-white/85 font-black">
          <span>XP +{fmtPts(r.xp)}</span>
          <span>🪙 +{fmtPts(r.moedas)}</span>
        </div>
        {r.dica && (
          <div className="mt-3 text-xs text-white/60 font-semibold bg-white/5 rounded-xl p-2.5">💡 {r.dica}</div>
        )}

        <div className="flex gap-3 justify-center mt-6">
          <button onClick={startGame} onMouseEnter={sfx.hover}
            className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-lg cursor-pointer hover:scale-105 transition-transform">
            🔁 Jogar Novamente
          </button>
          <button onClick={backToMenu} onMouseEnter={sfx.hover}
            className="px-6 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-lg cursor-pointer">
            🏠 Menu
          </button>
        </div>
      </div>
    </div>
  )
}
