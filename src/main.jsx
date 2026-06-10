import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// registro oculto de erros de runtime (diagnóstico em testes headless)
const errlog = document.createElement('div')
errlog.id = 'errlog'
errlog.style.display = 'none'
document.body.appendChild(errlog)
window.addEventListener('error', (e) => {
  errlog.textContent += `[error] ${e.message} @ ${e.filename}:${e.lineno}\n`
})
window.addEventListener('unhandledrejection', (e) => {
  errlog.textContent += `[rejection] ${e.reason}\n`
})

createRoot(document.getElementById('root')).render(<App />)
