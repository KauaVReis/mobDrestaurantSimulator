// Dados centrais do jogo — derivados do GDD v1.0

export const SESSION_TIME = 300 // 5 minutos (GDD §10.1)

// Multiplicadores de dificuldade (GDD §7.2)
export const DIFF_MULT = { facil: 0.5, medio: 1.5, dificil: 3.0, extremo: 3.0 }
export const DIFF_LABEL = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil', extremo: 'Difícil Extremo' }
export const DIFF_COLOR = { facil: '#4ade80', medio: '#facc15', dificil: '#f87171', extremo: '#c084fc' }

// Combo Gourmet (GDD §5.5) — bônus aplicado por nº de restaurantes consecutivos
export function comboBonus(streak) {
  if (streak >= 5) return 0.5
  if (streak === 4) return 0.35
  if (streak === 3) return 0.2
  if (streak === 2) return 0.1
  return 0
}
export const COMBO_WINDOW = 10 // segundos entre saída e próxima entrada

// Classificação (GDD §7.3)
export function ratingFor(pct) {
  if (pct >= 0.9) return { stars: 3, label: 'Mestre Gourmet', bonus: 0.15, icon: '⭐⭐⭐' }
  if (pct >= 0.6) return { stars: 2, label: 'Chef Talentoso', bonus: 0.05, icon: '⭐⭐' }
  if (pct >= 0.3) return { stars: 1, label: 'Comensal Honesto', bonus: 0, icon: '⭐' }
  return { stars: 0, label: 'Desastre Culinário', bonus: 0, icon: '💀' }
}

// Bairros de Bellyport (GDD §4.1, §13.2)
export const BAIRROS = {
  praca: { nome: 'Praça Central', cor: '#e8dcc8', cor2: '#b8d4e8', chao: '#cfc3ab' },
  porto: { nome: 'Porto Gastronômico', cor: '#274b6d', cor2: '#c96f3b', chao: '#5b6a75' },
  nacoes: { nome: 'Rua das Nações', cor: '#d4544f', cor2: '#e8b33c', chao: '#a8907a' },
  beco: { nome: 'Beco dos Sabores', cor: '#3b2a52', cor2: '#39ff8e', chao: '#33293f' },
  gourmet: { nome: 'Avenida Gourmet', cor: '#e9e9ee', cor2: '#d4af37', chao: '#b9b9c2' },
  mercado: { nome: 'Mercado Municipal', cor: '#c1683c', cor2: '#e3c33f', chao: '#b08968' },
  universitaria: { nome: 'Zona Universitária', cor: '#7c5cd6', cor2: '#888888', chao: '#8d8d96' },
}

// Restaurantes do mapa base (GDD §8.1) — pos = centro do prédio [x, z], rot = direção da porta
// maxScore por dificuldade vem do Apêndice B (pontos brutos máximos)
export const RESTAURANTS = [
  {
    id: 'sushi', nome: 'Sushi Tsunami', bairro: 'porto', culinaria: 'Japonesa',
    minigame: 'sushi', diff: 'medio', pos: [-20, -53], rot: 0,
    cor: '#1d4ed8', corPlaca: '#7dd3fc', emoji: '🍣', maxScore: 250,
  },
  {
    id: 'burger', nome: 'Big Belly Burger', bairro: 'universitaria', culinaria: 'Americana',
    minigame: 'burger', diff: 'facil', pos: [60, 53], rot: Math.PI,
    cor: '#dc2626', corPlaca: '#fde047', emoji: '🍔', maxScore: 100,
  },
  {
    id: 'vovo', nome: 'Casa da Vovó Tempestade', bairro: 'mercado', culinaria: 'Caseira',
    minigame: 'sopa', diff: 'facil', pos: [-60, 53], rot: Math.PI,
    cor: '#b45309', corPlaca: '#fef3c7', emoji: '🍲', maxScore: 90,
  },
  {
    id: 'pizza', nome: 'Pizzaria Napolitane', bairro: 'nacoes', culinaria: 'Italiana',
    minigame: 'pizza', diff: 'medio', pos: [53, -20], rot: -Math.PI / 2,
    cor: '#16a34a', corPlaca: '#fca5a5', emoji: '🍕', maxScore: 220,
  },
  {
    id: 'ramen', nome: 'Ramen Tufão', bairro: 'porto', culinaria: 'Japonesa',
    minigame: 'ramen', diff: 'medio', pos: [20, -53], rot: 0,
    cor: '#9f1239', corPlaca: '#fdba74', emoji: '🍜', maxScore: 200,
  },
  {
    id: 'churrasco', nome: 'Churrasquinho do Touro', bairro: 'mercado', culinaria: 'Brasileira',
    minigame: 'churrasco', diff: 'dificil', pos: [-20, 53], rot: Math.PI,
    cor: '#7f1d1d', corPlaca: '#fb923c', emoji: '🍖', maxScore: 300,
  },
  {
    id: 'bakers', nome: 'Bakers in the Sky', bairro: 'gourmet', culinaria: 'Americana',
    minigame: 'donut', diff: 'facil', pos: [-53, -20], rot: Math.PI / 2,
    cor: '#db2777', corPlaca: '#f9a8d4', emoji: '🍩', maxScore: 110,
  },
  {
    id: 'cantina', nome: 'La Cantina Loca', bairro: 'nacoes', culinaria: 'Mexicana',
    minigame: 'taco', diff: 'medio', pos: [53, 20], rot: -Math.PI / 2,
    cor: '#ca8a04', corPlaca: '#86efac', emoji: '🌮', maxScore: 190,
  },
  {
    id: 'chateau', nome: 'Château Suisse', bairro: 'gourmet', culinaria: 'Suíça',
    minigame: 'fondue', diff: 'dificil', pos: [-53, 20], rot: Math.PI / 2,
    cor: '#a16207', corPlaca: '#fef9c3', emoji: '🫕', maxScore: 320,
  },
  {
    id: 'gelato', nome: 'Gelato Inferno', bairro: 'praca', culinaria: 'Italiana',
    minigame: 'gelato', diff: 'facil', pos: [-29, -20], rot: Math.PI / 2,
    cor: '#0891b2', corPlaca: '#a5f3fc', emoji: '🍦', maxScore: 120,
  },
  {
    id: 'secreto', nome: 'O Banquete das Sombras', bairro: 'beco', culinaria: 'Secreta',
    minigame: 'supremo', diff: 'extremo', pos: [60, -53], rot: 0,
    cor: '#1e1033', corPlaca: '#39ff8e', emoji: '🌑', maxScore: 3000, secreto: true,
  },
]

export const restaurantById = (id) => RESTAURANTS.find((r) => r.id === id)

// Bônus especiais (GDD §7.4)
export const BONUS = {
  primeiroDoDia: 50,
  velocista: 30,        // entrou e saiu em < 20s
  semErros: 100,
  ultimos30: 150,       // visitou com < 30s no timer
  humilhacaoKraken: 300, // pontuou mais que o Kraken no mesmo restaurante
  descobertaSecreta: 500,
}

// Penalidades / extensões de tempo (GDD §10.2)
export const TIME_FX = {
  abandono: -15,
  capturaNPC: -3,
  tresEstrelas: +5,
  bonusItem: +10,
}

// Atributos de MobDyck (GDD §3.1, §5.1)
export const PLAYER = {
  walkSpeed: 5.0,
  sprintSpeed: 8.0,
  staminaMax: 100,
  staminaDrain: 16,   // por segundo correndo
  staminaRegen: 14,   // por segundo andando
  pantingFactor: 0.6, // velocidade no modo "ofegante"
  pantingTime: 3,
  jumpVel: 7.5,
  gravity: -22,
  rollSpeed: 13,
  rollTime: 0.32,
  rollCost: 10,
  rollCooldown: 0.9,
}

export const VORACIDADE = { duration: 20, cooldown: 120 } // GDD §3.1

// ---------- Easter egg: Richard e o Carrinho de Lanches ----------
// Locais ocultos (becos, atrás de prédios); um é sorteado por rodada.
export const RICHARD_SPOTS = [
  [14, -14],   // atrás do Parque da Praça
  [60, -64],   // Beco dos Sabores — atrás do Banquete das Sombras
  [-60, 5],    // recuo na Avenida Gourmet
  [-30, -55],  // atrás dos contêineres do Porto
  [35, 60],    // esquina da Zona Universitária
]
export const RICHARD_PING = 1.5 // segundos de radar no minimapa

// ---------- Clima Dinâmico (15% de chance por rodada) ----------
export const WEATHER_CHANCE = 0.15
export const WEATHERS = {
  molho: {
    nome: 'Chuva de Molho',
    icon: '🌧️🍅',
    desc: 'Ruas escorregadias: você desliza ao correr, mas a esquiva alcança o DOBRO da distância!',
  },
  gelato: {
    nome: 'Nevasca de Gelato',
    icon: '❄️🍦',
    desc: 'Stamina drena mais rápido, mas dumplings restauram o DOBRO!',
  },
}

// ---------- Conquistas Gourmet (persistentes, recompensam moedas) ----------
export const ACHIEVEMENTS = [
  { id: 'primeira-vitoria', nome: 'Campeão de Bellyport', desc: 'Vença o Chef Kraken', moedas: 100, icon: '🏆' },
  { id: 'sem-erros-3-medios', nome: 'Precisão Gourmet', desc: 'Sem Erros em 3 minigames Médios na mesma sessão', moedas: 150, icon: '🎯' },
  { id: 'richard-45', nome: 'Faro de Lanche', desc: 'Encontre o Richard nos primeiros 45 segundos', moedas: 200, icon: '🌭' },
  { id: 'banquete', nome: 'Engole Tudo', desc: 'Complete o Desafio Supremo do Banquete das Sombras', moedas: 250, icon: '🌑' },
  { id: 'combo-5', nome: 'Maratona Gastronômica', desc: 'Alcance o Combo Gourmet ×5', moedas: 150, icon: '🔥' },
  { id: 'pontos-3000', nome: 'Pontuação Lendária', desc: 'Faça 3.000+ pontos em uma sessão', moedas: 200, icon: '💎' },
  { id: 'estrelas-5', nome: 'Constelação Culinária', desc: 'Consiga 5 classificações ⭐⭐⭐ em uma sessão', moedas: 150, icon: '⭐' },
  { id: 'devorador-total', nome: 'O Devorador de Bellyport', desc: 'Visite todos os 10 restaurantes base em uma sessão', moedas: 200, icon: '🐋' },
]

// Limites do mapa e colisões
export const MAP_BOUND = 88
// Ruas em x/z = -40, 0, 40 (largura 10); quadras de 30 centradas em ±60, ±20
export const ROAD_LINES = [-40, 0, 40]

// Metas de pontuação (Apêndice B, dia ~3)
export const METAS = { minima: 1200, boa: 2200, excelente: 3500 }
