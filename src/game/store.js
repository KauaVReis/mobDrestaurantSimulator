import { create } from 'zustand'
import {
  SESSION_TIME, RESTAURANTS, restaurantById, DIFF_MULT, comboBonus, COMBO_WINDOW,
  ratingFor, BONUS, TIME_FX, VORACIDADE,
} from './constants'
import { sfx, music, setMuted } from './audio'
import { world, resetWorld } from './world'
import { PAPILLE_SPOTS } from './cityLayout'

let toastId = 0

function freshRestaurants() {
  const map = {}
  for (const r of RESTAURANTS) {
    map[r.id] = { visited: false, abandoned: false, krakenAte: false, krakenPts: 0, rating: null, points: 0 }
  }
  return map
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem('mobdyck-records') || '[]')
  } catch {
    return []
  }
}

function saveRecords(list) {
  try {
    localStorage.setItem('mobdyck-records', JSON.stringify(list.slice(0, 10)))
  } catch { /* sem storage */ }
}

export const useGame = create((set, get) => ({
  // ---------- estado ----------
  screen: 'menu',           // menu | playing | results
  session: 0,               // key de remontagem do mundo 3D
  paused: false,
  mapOpen: false,
  running: false,
  muted: false,

  timeLeft: SESSION_TIME,
  elapsed: 0,               // relógio mestre da sessão (segundos)

  score: 0,
  streak: 0,                // Combo Gourmet (GDD §5.5)
  lastExitAt: null,

  voracityUntil: 0,
  voracityCdUntil: 0,
  buffs: { pepperUntil: 0, skateUntil: 0, slowUntil: 0, frozenUntil: 0, frozenLabel: '' },

  restaurants: freshRestaurants(),
  chaves: 0,
  secretUnlocked: false,
  bonusRestaurantId: null,  // restaurante com bônus da rodada (Madame Papille revela)
  hintRevealed: false,

  kraken: { score: 0, targetId: null, insideId: null, finished: [] },

  activeMinigame: null,     // { restaurantId, enteredAt, streak }
  fading: false,
  interactTarget: null,     // { key, type, id, label } — prompt do HUD
  papilleSpot: [-20, -36],

  toasts: [],
  results: null,
  records: loadRecords(),
  stats: { visitados: 0, tresEstrelas: 0, semErros: 0, melhorVisita: 0 },

  // ---------- helpers ----------
  addToast(text, icon = '✨', dur = 3200) {
    const id = ++toastId
    set((s) => ({ toasts: [...s.toasts.slice(-4), { id, text, icon }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), dur)
  },

  toggleMute() {
    const m = !get().muted
    set({ muted: m })
    setMuted(m)
  },

  isVoracityActive() {
    return get().elapsed < get().voracityUntil
  },

  setInteractTarget(t) {
    const cur = get().interactTarget
    if ((cur?.key || null) !== (t?.key || null)) set({ interactTarget: t })
  },

  // ---------- fluxo de sessão ----------
  startGame() {
    sfx.unlockAudio()
    resetWorld()
    const nonSecret = RESTAURANTS.filter((r) => !r.secreto)
    const bonusR = nonSecret[Math.floor(Math.random() * nonSecret.length)]
    set({
      papilleSpot: PAPILLE_SPOTS[Math.floor(Math.random() * PAPILLE_SPOTS.length)],
      session: get().session + 1,
      screen: 'playing', paused: false, mapOpen: false, running: true,
      timeLeft: SESSION_TIME, elapsed: 0, score: 0, streak: 0, lastExitAt: null,
      voracityUntil: 0, voracityCdUntil: 0,
      buffs: { pepperUntil: 0, skateUntil: 0, slowUntil: 0, frozenUntil: 0, frozenLabel: '' },
      restaurants: freshRestaurants(), chaves: 0, secretUnlocked: false,
      bonusRestaurantId: bonusR.id, hintRevealed: false,
      kraken: { score: 0, targetId: null, insideId: null, finished: [] },
      activeMinigame: null, fading: false, results: null, interactTarget: null,
      stats: { visitados: 0, tresEstrelas: 0, semErros: 0, melhorVisita: 0 },
    })
    music.setBpm(110)
    music.setIntensity(0)
    music.start('city')
    sfx.bell()
    get().addToast('O Gran Festival Gourmet começou! 5 minutos — devore Bellyport!', '🔔', 4200)
  },

  tick(dt) {
    const s = get()
    if (!s.running || s.paused) return
    const prevTime = s.timeLeft
    const t = Math.max(0, s.timeLeft - dt)
    const elapsed = s.elapsed + dt

    // música acelera nos últimos 60s (GDD §10.1 / §14.1)
    if (t < 60) {
      music.setBpm(110 + (60 - t) * (55 / 60))
      music.setIntensity(2)
    }
    // contagem sonora nos últimos 10s
    if (t <= 10 && Math.ceil(t) !== Math.ceil(prevTime)) sfx.tickUrgent()

    set({ timeLeft: t, elapsed })
    if (t <= 0) get().endSession()
  },

  togglePause() {
    const s = get()
    if (s.screen !== 'playing' || s.activeMinigame) return
    set({ paused: !s.paused, mapOpen: false })
  },

  toggleMap() {
    const s = get()
    if (s.screen !== 'playing' || s.activeMinigame || s.paused) return
    set({ mapOpen: !s.mapOpen })
  },

  // ---------- restaurantes / minigames ----------
  tryEnterRestaurant(id) {
    const s = get()
    if (s.activeMinigame || !s.running || s.paused) return
    const r = restaurantById(id)
    const st = s.restaurants[id]
    if (!r || !st) return
    if (r.secreto && !s.secretUnlocked) {
      get().addToast('Portas seladas... Colete as 3 Chaves Gastronômicas!', '🔒')
      return
    }
    if (s.kraken.insideId === id) {
      get().addToast('Chef Kraken está lá dentro! Espere ou vá para outro.', '🦑')
      sfx.kraken()
      return
    }
    if (st.visited) {
      get().addToast('Você já devorou este restaurante nesta sessão!', '🚫')
      return
    }
    // Combo Gourmet: entrada em até 10s após a última saída mantém a sequência (GDD §5.5)
    let streak
    if (s.lastExitAt !== null && s.elapsed - s.lastExitAt <= COMBO_WINDOW) {
      streak = s.streak + 1
    } else {
      streak = 1
    }
    if (streak >= 2) sfx.combo(streak)
    sfx.door()
    music.setIntensity(1)
    set({ fading: true })
    setTimeout(() => {
      set({
        streak,
        activeMinigame: {
          restaurantId: id, enteredAt: get().elapsed, streak,
          krakenAteAtEntry: get().restaurants[id].krakenAte,
        },
        fading: false,
      })
    }, 450) // animação de empurrar a porta (GDD §5.2)
  },

  completeMinigame({ raw, max, errors }) {
    const s = get()
    const mg = s.activeMinigame
    if (!mg) return
    const r = restaurantById(mg.restaurantId)
    const st = s.restaurants[r.id]
    const pct = Math.min(1, Math.max(0, raw / max))
    const rating = ratingFor(pct)

    // Fórmula (GDD §7.1): brutos × dificuldade × combo × bônus
    let pts = raw * DIFF_MULT[r.diff]
    pts *= 1 + comboBonus(mg.streak)
    if (s.elapsed < s.voracityUntil) pts *= 2                      // Modo Voracidade
    if (s.bonusRestaurantId === r.id) pts *= 1.25                  // bônus da rodada (Papille)
    if (st.abandoned) pts *= 0.5                                   // re-visita após abandono (GDD §5.4)
    if (mg.krakenAteAtEntry) pts *= 0.5                            // Kraken chegou antes (GDD §2.4)
    pts *= 1 + rating.bonus                                        // bônus de classificação

    // Bônus especiais fixos (GDD §7.4)
    const ganhos = []
    const visitTime = s.elapsed - mg.enteredAt
    const anyVisited = Object.values(s.restaurants).some((x) => x.visited)
    let flat = 0
    if (!anyVisited) { flat += BONUS.primeiroDoDia; ganhos.push('Primeiro do Dia +50') }
    if (visitTime < 20) { flat += BONUS.velocista; ganhos.push('Velocista +30') }
    if (errors === 0 && raw > 0) { flat += BONUS.semErros; ganhos.push('Sem Erros +100') }
    if (s.timeLeft < 30) { flat += BONUS.ultimos30; ganhos.push('Adrenalina +150') }
    if (r.secreto) { flat += BONUS.descobertaSecreta; ganhos.push('Descoberta Secreta +500') }
    let total = Math.round(pts) + flat
    if (st.krakenAte && total > st.krakenPts) {
      total += BONUS.humilhacaoKraken
      ganhos.push('Humilhação do Kraken +300')
    }

    let newScore = s.score + total
    if (rating.stars === 0) newScore = Math.round(newScore * 0.95) // 💀 −5% acumulado (GDD §7.3)

    let timeLeft = s.timeLeft
    if (rating.stars === 3) timeLeft = timeLeft + TIME_FX.tresEstrelas // ⭐⭐⭐ +5s (GDD §10.2)

    const restaurants = {
      ...s.restaurants,
      [r.id]: { ...st, visited: true, abandoned: false, rating, points: total },
    }
    const stats = {
      visitados: s.stats.visitados + 1,
      tresEstrelas: s.stats.tresEstrelas + (rating.stars === 3 ? 1 : 0),
      semErros: s.stats.semErros + (errors === 0 ? 1 : 0),
      melhorVisita: Math.max(s.stats.melhorVisita, total),
    }

    if (rating.stars >= 2) sfx.fanfare()
    else if (rating.stars === 1) sfx.point()
    else sfx.miss()

    music.setIntensity(s.timeLeft < 60 ? 2 : 0)
    set({
      score: newScore, timeLeft, restaurants, stats,
      activeMinigame: null, lastExitAt: s.elapsed,
    })
    get().addToast(
      `${r.nome}: +${total} pts ${rating.icon}${ganhos.length ? ' · ' + ganhos.join(' · ') : ''}`,
      r.emoji, 4200,
    )

    // todos os restaurantes disponíveis visitados → encerra a sessão
    const all = RESTAURANTS.filter((x) => !x.secreto || get().secretUnlocked)
    if (all.every((x) => get().restaurants[x.id].visited)) {
      get().addToast('Bellyport inteira devorada! Encerrando o festival...', '🏆', 3000)
      setTimeout(() => get().endSession(), 2200)
    }
  },

  abandonMinigame() {
    const s = get()
    const mg = s.activeMinigame
    if (!mg) return
    const r = restaurantById(mg.restaurantId)
    set({
      timeLeft: Math.max(0.01, s.timeLeft + TIME_FX.abandono),
      restaurants: { ...s.restaurants, [r.id]: { ...s.restaurants[r.id], abandoned: true } },
      activeMinigame: null, streak: 0, lastExitAt: null,
    })
    music.setIntensity(0)
    sfx.error()
    get().addToast(`Abandonou ${r.nome}: −15s e 0 pontos. Pode voltar com bônus reduzido.`, '🏃', 3800)
  },

  // ---------- Kraken ----------
  krakenSetTarget(id) {
    set((s) => ({ kraken: { ...s.kraken, targetId: id } }))
  },
  krakenEnter(id) {
    set((s) => ({ kraken: { ...s.kraken, insideId: id, targetId: id } }))
  },
  krakenFinish(id, pts) {
    const s = get()
    const r = restaurantById(id)
    set({
      kraken: {
        ...s.kraken,
        score: s.kraken.score + pts,
        insideId: null,
        targetId: null,
        finished: [...s.kraken.finished, id],
      },
      restaurants: {
        ...s.restaurants,
        [id]: { ...s.restaurants[id], krakenAte: true, krakenPts: pts },
      },
    })
    if (!s.restaurants[id].visited) {
      get().addToast(`Chef Kraken devorou ${r.nome}! (+${pts} para ele)`, '🦑', 3500)
      sfx.kraken()
    }
  },
  krakenSteal() {
    const s = get()
    if (s.streak > 0) {
      set({ streak: 0, lastExitAt: null })
      get().addToast('Chef Kraken interceptou você! Combo Gourmet perdido!', '🦑')
      sfx.sting()
    }
  },

  // ---------- interações / itens ----------
  collectPickup(type) {
    const s = get()
    switch (type) {
      case 'dumpling':
        world.stamina = Math.min(100, world.stamina + 15)
        sfx.pickup()
        break
      case 'pimenta':
        set({ buffs: { ...s.buffs, pepperUntil: s.elapsed + 8 } })
        sfx.pickup()
        get().addToast('Pimenta Brilhante! +40% de velocidade por 8s', '🌶️')
        break
      case 'tempo':
        set({ timeLeft: s.timeLeft + TIME_FX.bonusItem })
        sfx.key()
        get().addToast('Temporizador de Bônus! +10 segundos', '⏰')
        break
      case 'chave': {
        const chaves = s.chaves + 1
        const unlocked = chaves >= 3
        set({ chaves, secretUnlocked: unlocked || s.secretUnlocked })
        sfx.key()
        if (unlocked && !s.secretUnlocked) {
          get().addToast('As 3 Chaves Gastronômicas! O Banquete das Sombras se revelou no Beco...', '🗝️', 5000)
        } else {
          get().addToast(`Chave Gastronômica ${chaves}/3 coletada!`, '🗝️')
        }
        break
      }
      default:
        break
    }
  },

  interactNPC(kind) {
    const s = get()
    switch (kind) {
      case 'papille': {
        const r = restaurantById(s.bonusRestaurantId)
        set({ hintRevealed: true })
        sfx.bell()
        get().addToast(`Madame Papille sussurra: "${r.nome} está com bônus de +25% hoje, querido..."`, '🧐', 5200)
        break
      }
      case 'vendedor':
        if (s.score >= 20) {
          world.stamina = Math.min(100, world.stamina + 40)
          set({ score: s.score - 20 })
          sfx.gulp()
          get().addToast('Cachorro-quente! +40 stamina por −20 pts', '🌭')
        } else {
          get().addToast('O vendedor quer 20 pontos pelo cachorro-quente...', '🌭')
        }
        break
      case 'skatista':
        set({ buffs: { ...s.buffs, skateUntil: s.elapsed + 5 } })
        sfx.boing()
        get().addToast('Carona com Zé Roda! Velocidade ×2 por 5s', '🛹')
        break
      default:
        break
    }
  },

  inspectorCatch() {
    const s = get()
    if (s.elapsed < s.buffs.frozenUntil) return
    set({
      buffs: { ...s.buffs, frozenUntil: s.elapsed + 3, frozenLabel: 'INSPEÇÃO!' },
      timeLeft: Math.max(0.01, s.timeLeft + TIME_FX.capturaNPC),
    })
    sfx.whistle()
    get().addToast('Dr. Gastro te parou para inspeção! 3s parado e −3s no timer', '🕵️', 3000)
  },

  slowPuddle() {
    const s = get()
    if (s.elapsed < s.buffs.slowUntil) return
    set({ buffs: { ...s.buffs, slowUntil: s.elapsed + 2 } })
  },

  activateVoracity() {
    const s = get()
    if (!s.running || s.paused || s.activeMinigame) return
    if (s.elapsed < s.voracityCdUntil) {
      get().addToast(`Modo Voracidade recarregando... ${Math.ceil(s.voracityCdUntil - s.elapsed)}s`, '⏳')
      return
    }
    set({ voracityUntil: s.elapsed + VORACIDADE.duration, voracityCdUntil: s.elapsed + VORACIDADE.cooldown })
    sfx.voracity()
    get().addToast('MODO VORACIDADE! Multiplicadores ×2 por 20 segundos!', '🔥', 3500)
  },

  // ---------- fim de sessão ----------
  endSession() {
    const s = get()
    if (!s.running) return
    music.stop()
    const victory = s.score >= s.kraken.score
    const breakdown = RESTAURANTS
      .filter((r) => s.restaurants[r.id].visited)
      .map((r) => ({
        nome: r.nome, diff: r.diff, emoji: r.emoji,
        pontos: s.restaurants[r.id].points,
        rating: s.restaurants[r.id].rating,
      }))
      .sort((a, b) => b.pontos - a.pontos)

    const records = loadRecords()
    const best = records[0]?.score ?? 0
    const isRecord = s.score > best
    const newRecords = [...records, { score: s.score, visitados: s.stats.visitados, data: new Date().toLocaleDateString('pt-BR') }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
    saveRecords(newRecords)

    if (victory) sfx.bigFanfare()
    else sfx.sting()

    set({
      running: false,
      screen: 'results',
      activeMinigame: null,
      results: {
        victory,
        score: s.score,
        krakenScore: s.kraken.score,
        visitados: s.stats.visitados,
        totalRestaurantes: RESTAURANTS.filter((r) => !r.secreto).length + (s.secretUnlocked ? 1 : 0),
        breakdown,
        isRecord,
        recordAnterior: best,
        xp: Math.round(s.score * 0.28),
        moedas: Math.round(s.score * 0.08),
        dica: victory
          ? null
          : 'Dica do Kraken: restaurantes Difíceis multiplicam por ×3 — Churrasquinho do Touro e Château Suisse valem ouro. E mantenha o Combo Gourmet vivo!',
      },
      records: newRecords,
    })
  },

  backToMenu() {
    music.stop()
    set({ screen: 'menu', running: false, paused: false, results: null, activeMinigame: null })
  },
}))
