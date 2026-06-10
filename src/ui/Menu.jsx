// Menu principal (GDD §11.3)
import { useState } from 'react'
import { useGame } from '../game/store'
import { sfx } from '../game/audio'

const PARADE = ['🍣', '🍔', '🍲', '🍕', '🍜', '🍖', '🍩', '🌮', '🫕', '🍦']

export default function Menu() {
  const startGame = useGame((s) => s.startGame)
  const records = useGame((s) => s.records)
  const muted = useGame((s) => s.muted)
  const toggleMute = useGame((s) => s.toggleMute)
  const [modal, setModal] = useState(null) // 'help' | 'records' | null

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#1a2747] via-[#2d3f6b] to-[#7c4a2d] overflow-hidden flex flex-col items-center justify-center select-none">
      {/* skyline */}
      <div className="absolute bottom-0 inset-x-0 h-44 flex items-end justify-center gap-1 opacity-50">
        {Array.from({ length: 26 }).map((_, i) => (
          <div key={i} className="bg-[#101626] rounded-t"
            style={{ width: 38, height: 50 + ((i * 53) % 120) }}>
            <div className="grid grid-cols-2 gap-1 p-1.5">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className={`h-1.5 rounded-[1px] ${(i + j) % 3 ? 'bg-amber-200/80' : 'bg-slate-700'}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* desfile de comidas */}
      <div className="absolute top-10 flex gap-7 text-4xl opacity-60">
        {PARADE.map((e, i) => (
          <span key={i} className="bob" style={{ animationDelay: `${i * 0.2}s` }}>{e}</span>
        ))}
      </div>

      <div className="relative z-10 text-center px-4">
        <div className="text-8xl mb-2 bob">🐋</div>
        <h1 className="text-5xl md:text-6xl font-black text-amber-300 title-glow tracking-tight">
          MobDyck
        </h1>
        <h2 className="text-2xl md:text-3xl font-black text-white -mt-1">Restaurant Simulator</h2>
        <p className="text-white/70 font-semibold mt-3 max-w-md mx-auto text-sm">
          5 minutos. 10 restaurantes (e um segredo). Um rival faminto.<br />
          <em>"Nenhum restaurante é grande demais para a fome de MobDyck."</em>
        </p>

        <div className="flex flex-col items-center gap-2.5 mt-7">
          <button onClick={startGame} onMouseEnter={sfx.hover}
            className="px-10 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-2xl font-black cursor-pointer pixel-border hover:scale-105 transition-transform">
            🍽️ JOGAR
          </button>
          <div className="flex gap-2.5">
            <button onClick={() => setModal('help')} onMouseEnter={sfx.hover}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black cursor-pointer">
              📖 Como Jogar
            </button>
            <button onClick={() => setModal('records')} onMouseEnter={sfx.hover}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black cursor-pointer">
              🏆 Recordes
            </button>
            <button onClick={toggleMute} onMouseEnter={sfx.hover}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black cursor-pointer">
              {muted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>
        <div className="text-white/40 text-xs font-bold mt-6">Gran Festival Gourmet de Bellyport — Edição Anual</div>
      </div>

      {modal === 'help' && (
        <Modal onClose={() => setModal(null)} title="📖 Como Jogar">
          <div className="text-left text-sm space-y-2.5 text-white/85 font-semibold">
            <p>🎯 <b>Objetivo:</b> em 5 minutos, entre no máximo de restaurantes, vença os minigames e termine com mais pontos que o <b>Chef Kraken</b> 🦑.</p>
            <p>🎮 <b>Controles:</b> WASD/setas mover · SHIFT correr (gasta stamina) · ESPAÇO pular · CTRL esquiva · E interagir · Q Modo Voracidade (×2 por 20s) · TAB mapa · ESC pausa.</p>
            <p>🏪 <b>Dificuldade:</b> Fácil ×0.5 · Médio ×1.5 · Difícil ×3.0 — restaurantes difíceis valem MUITO mais.</p>
            <p>🔥 <b>Combo Gourmet:</b> encadeie restaurantes com menos de 10s entre eles: +10% → +20% → +35% → +50%.</p>
            <p>⭐ <b>Classificação:</b> ≥90% da pontuação máxima = ⭐⭐⭐ (+15% e +5s no timer). Menos de 30% = 💀 (−5% do total!).</p>
            <p>🦑 <b>Kraken:</b> se ele comer um restaurante antes de você, lá você ganha só metade. Se ele encostar em você, rouba seu combo.</p>
            <p>🗝️ <b>Segredo:</b> 3 Chaves Gastronômicas nos cantos do mapa abrem <b>O Banquete das Sombras</b> (3.000 pts base + 500 de bônus).</p>
            <p>💡 <b>NPCs:</b> Madame Papille 🧐 revela o restaurante com bônus · Zé Roda 🛹 dá carona ×2 · o vendedor 🌭 troca pontos por stamina · fuja do Dr. Gastro 🕵️!</p>
          </div>
        </Modal>
      )}
      {modal === 'records' && (
        <Modal onClose={() => setModal(null)} title="🏆 Recordes Locais">
          {records.length === 0 ? (
            <p className="text-white/60 font-bold">Nenhuma sessão ainda. A cidade espera pela sua fome!</p>
          ) : (
            <table className="w-full text-sm font-bold text-white/85">
              <thead>
                <tr className="text-white/45 text-xs">
                  <th className="text-left pb-1">#</th>
                  <th className="text-right pb-1">Pontos</th>
                  <th className="text-right pb-1">Restaurantes</th>
                  <th className="text-right pb-1">Data</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i} className={i === 0 ? 'text-amber-300' : ''}>
                    <td className="py-0.5">{i === 0 ? '👑' : i + 1}</td>
                    <td className="text-right tabular-nums">{r.score}</td>
                    <td className="text-right">{r.visitados}</td>
                    <td className="text-right text-white/50">{r.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}

      {/* versão beta */}
      <div className="absolute bottom-4 right-4 text-white/30 text-xs font-bold font-mono pointer-events-none">
        beta-v0.6.7
      </div>
    </div>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-3xl p-6 pixel-border max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-white">{title}</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white font-black text-xl cursor-pointer">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
