// Áudio procedural via WebAudio — trilha (GDD §14.1) e SFX (GDD §14.2), sem assets externos.

let ctx = null
let master = null
let musicGain = null
let sfxGain = null
let muted = false

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : 0.85
    master.connect(ctx.destination)
    musicGain = ctx.createGain()
    musicGain.gain.value = 0.16
    musicGain.connect(master)
    sfxGain = ctx.createGain()
    sfxGain.gain.value = 0.32
    sfxGain.connect(master)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function setMuted(m) {
  muted = m
  if (master) master.gain.value = m ? 0 : 0.85
}

function tone({ f = 440, t = 0, dur = 0.15, type = 'square', vol = 0.5, slide = 0, out = null }) {
  if (!ensure()) return
  const now = ctx.currentTime + t
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(f, now)
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), now + dur)
  g.gain.setValueAtTime(vol, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + dur)
  o.connect(g)
  g.connect(out || sfxGain)
  o.start(now)
  o.stop(now + dur + 0.02)
}

function noise({ t = 0, dur = 0.08, vol = 0.2, hp = 4000 }) {
  if (!ensure()) return
  const now = ctx.currentTime + t
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur))
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  const flt = ctx.createBiquadFilter()
  flt.type = 'highpass'
  flt.frequency.value = hp
  const g = ctx.createGain()
  g.gain.setValueAtTime(vol, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + dur)
  src.connect(flt); flt.connect(g); g.connect(sfxGain)
  src.start(now)
}

export const sfx = {
  unlockAudio() { ensure() },
  gulp() { tone({ f: 520, dur: 0.12, type: 'sine', vol: 0.6, slide: -300 }); tone({ f: 760, t: 0.07, dur: 0.1, type: 'triangle', vol: 0.4, slide: 200 }) },
  point() { tone({ f: 660, dur: 0.08, type: 'square', vol: 0.3 }); tone({ f: 880, t: 0.07, dur: 0.1, type: 'square', vol: 0.3 }) },
  perfect() { [880, 1108, 1318].forEach((f, i) => tone({ f, t: i * 0.06, dur: 0.12, type: 'square', vol: 0.32 })) },
  miss() { tone({ f: 220, dur: 0.18, type: 'sawtooth', vol: 0.35, slide: -120 }) },
  error() { tone({ f: 160, dur: 0.25, type: 'square', vol: 0.4, slide: -80 }); noise({ dur: 0.1, vol: 0.12, hp: 1500 }) },
  bell() { tone({ f: 988, dur: 0.3, type: 'triangle', vol: 0.5 }); tone({ f: 1318, t: 0.12, dur: 0.4, type: 'triangle', vol: 0.4 }) },
  fanfare() { [523, 659, 784, 1046].forEach((f, i) => tone({ f, t: i * 0.11, dur: i === 3 ? 0.5 : 0.13, type: 'square', vol: 0.4 })) },
  bigFanfare() {
    [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone({ f, t: i * 0.12, dur: i === 6 ? 0.7 : 0.13, type: 'square', vol: 0.42 }))
    noise({ t: 0.8, dur: 0.5, vol: 0.15, hp: 6000 })
  },
  tick() { tone({ f: 1200, dur: 0.04, type: 'square', vol: 0.35 }) },
  tickUrgent() { tone({ f: 900, dur: 0.09, type: 'square', vol: 0.5 }); tone({ f: 1800, dur: 0.04, type: 'sine', vol: 0.3 }) },
  pickup() { tone({ f: 1046, dur: 0.07, type: 'sine', vol: 0.45 }); tone({ f: 1568, t: 0.06, dur: 0.12, type: 'sine', vol: 0.35 }) },
  key() { [784, 988, 1175, 1568].forEach((f, i) => tone({ f, t: i * 0.08, dur: 0.15, type: 'triangle', vol: 0.4 })) },
  sting() { [392, 370, 349, 311].forEach((f, i) => tone({ f, t: i * 0.14, dur: 0.2, type: 'sawtooth', vol: 0.22 })) },
  whistle() { tone({ f: 2200, dur: 0.3, type: 'sine', vol: 0.4, slide: 600 }); tone({ f: 2600, t: 0.32, dur: 0.25, type: 'sine', vol: 0.35, slide: -500 }) },
  boing() { tone({ f: 300, dur: 0.3, type: 'sine', vol: 0.5, slide: 320 }) },
  combo(n) { for (let i = 0; i < Math.min(n, 5); i++) tone({ f: 660 + i * 130, t: i * 0.06, dur: 0.1, type: 'square', vol: 0.32 }) },
  roll() { noise({ dur: 0.16, vol: 0.18, hp: 800 }) },
  jump() { tone({ f: 360, dur: 0.14, type: 'sine', vol: 0.3, slide: 240 }) },
  door() { tone({ f: 440, dur: 0.08, type: 'triangle', vol: 0.4 }); tone({ f: 587, t: 0.09, dur: 0.16, type: 'triangle', vol: 0.4 }) },
  kraken() { [196, 233, 196, 155].forEach((f, i) => tone({ f, t: i * 0.16, dur: 0.22, type: 'sawtooth', vol: 0.25 })) },
  voracity() { [330, 415, 523, 659, 830].forEach((f, i) => tone({ f, t: i * 0.07, dur: 0.18, type: 'sawtooth', vol: 0.3 })) },
  hover() { tone({ f: 1400, dur: 0.04, type: 'sine', vol: 0.12 }) },
}

// ---------- Música procedural ----------
// Jazz-arcade alegre em pentatônica; BPM sobe de 110 → 165 nos últimos 60s (GDD §14.1)

const SCALE = [261.6, 293.7, 329.6, 392.0, 440.0, 523.2, 587.3, 659.2, 784.0] // C maj pentatônica estendida
const BASS = [65.4, 73.4, 82.4, 98.0] // C2 D2 E2 G2

let musicTimer = null
let step = 0
let bpm = 110
let intensity = 0 // 0 = normal, 1 = minigame, 2 = reta final
let melodySeed = 0

function rng() {
  melodySeed = (melodySeed * 1664525 + 1013904223) % 4294967296
  return melodySeed / 4294967296
}

function scheduleBar() {
  if (!ctx) return
  const stepDur = 60 / bpm / 2 // colcheias
  const t0 = ctx.currentTime + 0.05
  for (let i = 0; i < 8; i++) {
    const t = t0 + i * stepDur
    const sIdx = step + i
    // Baixo: fundação no tempo
    if (sIdx % 2 === 0) {
      const b = BASS[Math.floor(sIdx / 4) % BASS.length]
      tone({ f: b, t: t - ctx.currentTime, dur: stepDur * 0.9, type: 'triangle', vol: 0.5, out: musicGain })
    }
    // Hi-hat
    if (sIdx % 2 === 1 || intensity >= 1) noiseMusic(t - ctx.currentTime, stepDur * 0.3, intensity >= 2 ? 0.1 : 0.055)
    // Melodia
    const density = intensity >= 2 ? 0.85 : intensity === 1 ? 0.7 : 0.5
    if (rng() < density) {
      const n = SCALE[Math.floor(rng() * SCALE.length)]
      const oct = intensity >= 2 && rng() < 0.4 ? 2 : 1
      tone({ f: n * oct, t: t - ctx.currentTime, dur: stepDur * 0.85, type: 'square', vol: 0.22, out: musicGain })
    }
  }
  step += 8
}

export const music = {
  start(kind = 'city') {
    if (!ensure()) return
    intensity = kind === 'minigame' ? 1 : 0
    if (musicTimer) return
    step = 0
    const loop = () => {
      scheduleBar()
      const barMs = (60 / bpm / 2) * 8 * 1000
      musicTimer = setTimeout(loop, barMs - 30)
    }
    loop()
  },
  stop() {
    if (musicTimer) { clearTimeout(musicTimer); musicTimer = null }
  },
  setBpm(v) { bpm = v },
  setIntensity(v) { intensity = v },
}

function noiseMusic(t, dur, vol) {
  if (!ctx) return
  const now = ctx.currentTime + t
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur))
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  const flt = ctx.createBiquadFilter()
  flt.type = 'highpass'
  flt.frequency.value = 8000
  const g = ctx.createGain()
  g.gain.setValueAtTime(vol, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + dur)
  src.connect(flt); flt.connect(g); g.connect(musicGain)
  src.start(now)
}
