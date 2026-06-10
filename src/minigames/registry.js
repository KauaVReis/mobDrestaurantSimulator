// Registro dos minigames — parâmetros por dificuldade (tabelas do GDD §6.2)
// "max" = pontuação bruta de referência por dificuldade (Apêndice B)
import Sushi from './games/Sushi'
import Burger from './games/Burger'
import Sopa from './games/Sopa'
import Pizza from './games/Pizza'
import Ramen from './games/Ramen'
import Churrasco from './games/Churrasco'
import Donut from './games/Donut'
import Taco from './games/Taco'
import Fondue from './games/Fondue'
import Gelato from './games/Gelato'
import Supremo from './games/Supremo'

export const MINIGAMES = {
  sushi: {
    nome: 'Engolida Perfeita',
    component: Sushi,
    tutorial: 'A esteira passa — aperte ESPAÇO quando o sushi estiver na zona brilhante. Douradas ×3, apimentadas ×5!',
    params: {
      facil: { dur: 25, spawn: 2.4, speed: 14, window: 9, vmin: 6, vmax: 14, max: 80 },
      medio: { dur: 25, spawn: 1.6, speed: 22, window: 6, vmin: 6, vmax: 14, max: 250 },
      dificil: { dur: 25, spawn: 1.0, speed: 32, window: 4, vmin: 8, vmax: 18, max: 400 },
    },
  },
  burger: {
    nome: 'Montagem Maluca',
    component: Burger,
    tutorial: 'Ingredientes caem do teto — mova com A/D e capture NA ORDEM da receita. Cuidado com itens falsos!',
    params: {
      facil: { dur: 30, recipe: 5, spawn: 1.1, fall: 26, fakeChance: 0, pts: 15, max: 100 },
      medio: { dur: 28, recipe: 8, spawn: 0.9, fall: 36, fakeChance: 0.18, pts: 15, max: 250 },
      dificil: { dur: 26, recipe: 12, spawn: 0.7, fall: 48, fakeChance: 0.3, pts: 15, max: 400 },
    },
  },
  sopa: {
    nome: 'Sopa do Caos',
    component: Sopa,
    tutorial: 'Colheradas voam em arco — posicione a boca (mouse) no anel de pouso. Pegue as quentes ♨️, desvie dos ossos 🦴!',
    params: {
      facil: { dur: 26, waves: 4, spoonsPerWave: 3, waveGap: 4.5, flyTime: 2.2, pts: 8, max: 90 },
      medio: { dur: 28, waves: 6, spoonsPerWave: 5, waveGap: 3.6, flyTime: 1.7, pts: 8, max: 250 },
      dificil: { dur: 30, waves: 8, spoonsPerWave: 8, waveGap: 3.0, flyTime: 1.3, pts: 8, max: 500 },
    },
  },
  pizza: {
    nome: 'Pizza Rítmica',
    component: Pizza,
    tutorial: 'Notas descem por 4 trilhas — aperte D, F, J ou K quando chegarem na linha. Combo aumenta o multiplicador!',
    params: {
      facil: { dur: 30, bpm: 90, density: 0.5, doubles: false, fallTime: 1.7, max: 75 },
      medio: { dur: 30, bpm: 130, density: 0.75, doubles: true, fallTime: 1.4, max: 220 },
      dificil: { dur: 30, bpm: 175, density: 1.0, doubles: true, fallTime: 1.1, max: 450 },
    },
  },
  ramen: {
    nome: 'Ramen Furacão',
    component: Ramen,
    tutorial: 'GIRE o mouse em círculos ao redor da tigela para sorver o macarrão. Parou? Ele escorrega de volta! ESPAÇO fisga toppings.',
    params: {
      facil: { dur: 30, slurpRate: 0.85, slip: 3, base: 60, speedBonus: 35, max: 110 },
      medio: { dur: 22, slurpRate: 0.8, slip: 6, base: 80, speedBonus: 45, max: 200 },
      dificil: { dur: 15, slurpRate: 0.75, slip: 10, base: 120, speedBonus: 80, max: 350 },
    },
  },
  churrasco: {
    nome: 'Churrasco na Brasa',
    component: Churrasco,
    tutorial: 'Cada espeto cozinha sozinho — aperte a TECLA do espeto quando o ponteiro estiver na zona verde. Não deixe queimar!',
    params: {
      facil: { dur: 30, slots: 2, rate: 18, zone: 30, max: 80 },
      medio: { dur: 30, slots: 4, rate: 26, zone: 20, max: 220 },
      dificil: { dur: 30, slots: 6, rate: 34, zone: 11, max: 300 },
    },
  },
  donut: {
    nome: 'Donut Voador',
    component: Donut,
    tutorial: 'Donuts voam como frisbees — mova o mouse na VERTICAL para abocanhá-los. 3 da mesma cor = Trio Doce!',
    params: {
      facil: { dur: 25, spawn: 2.6, speed: 22, arc: 0.8, pts: 8, max: 110 },
      medio: { dur: 25, spawn: 1.7, speed: 30, arc: 1.1, pts: 8, max: 220 },
      dificil: { dur: 25, spawn: 1.2, speed: 40, arc: 1.5, pts: 9, max: 360 },
    },
  },
  taco: {
    nome: 'Taco Tempestade',
    component: Taco,
    tutorial: 'Memorize a sequência do taco e CLIQUE nos ingredientes voadores na ordem certa. Errou? O taco desmonta!',
    params: {
      facil: { dur: 30, seqLen: 3, memo: 3, concurrent: 2, speed: 12, pts: 13, max: 120 },
      medio: { dur: 30, seqLen: 5, memo: 2, concurrent: 4, speed: 17, pts: 13, max: 190 },
      dificil: { dur: 30, seqLen: 8, memo: 1, concurrent: 6, speed: 24, pts: 13, max: 320 },
    },
  },
  fondue: {
    nome: 'Fondue Frenético',
    component: Fondue,
    tutorial: 'Leve o garfo à panela e SEGURE o botão para mergulhar — solte na faixa verde. Demais = cai no fogo!',
    params: {
      facil: { dur: 30, swaySpeed: 0.8, swayAmp: 4, window: 0.5, perfect: 12, max: 110 },
      medio: { dur: 30, swaySpeed: 1.4, swayAmp: 8, window: 0.34, perfect: 22, max: 200 },
      dificil: { dur: 30, swaySpeed: 2.2, swayAmp: 13, window: 0.22, perfect: 32, max: 320 },
    },
  },
  gelato: {
    nome: 'Sorvete Turbo',
    component: Gelato,
    tutorial: 'As torres estão derretendo! CLIQUE rápido na torre para lamber a bola do topo. Priorize as que derretem rápido!',
    params: {
      facil: { dur: 25, towers: 2, melt: 16, clicks: 5, max: 120 },
      medio: { dur: 25, towers: 3, melt: 22, clicks: 5, max: 180 },
      dificil: { dur: 25, towers: 5, melt: 30, clicks: 6, max: 280 },
    },
  },
  supremo: {
    nome: 'O Desafio Supremo',
    component: Supremo,
    tutorial: 'TODOS os desafios de Bellyport em rodadas de 5 segundos. Reflexo, esmagada, timing e sequência. Boa sorte, devorador.',
    params: {
      facil: { dur: 60, max: 3000 },
      medio: { dur: 60, max: 3000 },
      dificil: { dur: 60, max: 3000 },
      extremo: { dur: 60, max: 3000 },
    },
  },
}

export function getMinigame(id, diff) {
  const mg = MINIGAMES[id]
  const params = mg.params[diff] || mg.params.dificil
  return { ...mg, params }
}
