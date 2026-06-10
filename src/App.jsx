import { useEffect } from 'react'
import { useGame } from './game/store'
import { initInput } from './game/input'
import GameCanvas from './three/GameCanvas'
import HUD from './ui/HUD'
import Menu from './ui/Menu'
import Pause from './ui/Pause'
import Results from './ui/Results'
import Toasts from './ui/Toasts'
import BigMap from './ui/BigMap'
import MinigameOverlay from './minigames/MinigameOverlay'

export default function App() {
  const screen = useGame((s) => s.screen)
  const session = useGame((s) => s.session)
  const fading = useGame((s) => s.fading)

  useEffect(() => {
    initInput()
    // atalho de desenvolvimento: ?autostart=1 pula o menu
    if (new URLSearchParams(window.location.search).has('autostart')) {
      useGame.getState().startGame()
    }
  }, [])

  // relógio mestre da sessão (100ms) — continua durante minigames (GDD §10.1)
  useEffect(() => {
    const id = setInterval(() => useGame.getState().tick(0.1), 100)
    return () => clearInterval(id)
  }, [])

  // teclas globais
  useEffect(() => {
    const onKey = (e) => {
      const s = useGame.getState()
      const k = e.key.toLowerCase()
      if (k === 'm') s.toggleMute()
      if (s.screen !== 'playing') return
      if (k === 'escape') {
        if (s.mapOpen) s.toggleMap()
        else if (!s.activeMinigame) s.togglePause() // Esc do minigame é tratado pelo shell
      }
      if (k === 'tab') s.toggleMap()
      if (k === 'p' && !s.activeMinigame) s.togglePause()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="relative w-full h-full bg-[#0b1020] overflow-hidden">
      {screen === 'menu' && <Menu />}
      {screen === 'playing' && (
        <>
          <GameCanvas key={session} />
          <HUD />
          <Toasts />
          <MinigameOverlay />
          <BigMap />
          <Pause />
          {fading && <div className="absolute inset-0 z-[60] bg-black pop-in" />}
        </>
      )}
      {screen === 'results' && <Results />}
    </div>
  )
}
