import { useGame } from '../game/store'

export default function Toasts() {
  const toasts = useGame((s) => s.toasts)
  return (
    <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 flex flex-col gap-1.5 items-center pointer-events-none w-[min(92vw,560px)]">
      {toasts.map((t) => (
        <div key={t.id} className="bg-black/75 text-white rounded-2xl px-4 py-2 pixel-border pop-in text-center text-sm font-bold">
          <span className="mr-1.5">{t.icon}</span>{t.text}
        </div>
      ))}
    </div>
  )
}
