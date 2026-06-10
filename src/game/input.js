// Captura global de teclado (GDD §5.1 — tabela de comandos PC)

export const keys = {}
const pressBuffer = new Set()

const GAME_KEYS = new Set([
  ' ', 'tab', 'shift', 'control', 'q', 'e', 'w', 'a', 's', 'd', 'c', 'm',
  'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
])

export function initInput() {
  window.addEventListener('keydown', (ev) => {
    const k = ev.key.toLowerCase()
    if (GAME_KEYS.has(k)) ev.preventDefault()
    if (!keys[k]) pressBuffer.add(k)
    keys[k] = true
  })
  window.addEventListener('keyup', (ev) => {
    keys[ev.key.toLowerCase()] = false
  })
  window.addEventListener('blur', () => {
    for (const k in keys) keys[k] = false
  })
}

// retorna true uma única vez por pressionamento (consumido)
export function consumePress(k) {
  if (pressBuffer.has(k)) {
    pressBuffer.delete(k)
    return true
  }
  return false
}

export function clearPresses() {
  pressBuffer.clear()
}

export function isDown(k) {
  return !!keys[k]
}
