# 🐋 MobDyck Restaurant Simulator

> *"Nenhum restaurante é grande demais para a fome de MobDyck."*

Implementação jogável do **GDD v1.0** em **React + TailwindCSS + three.js** (@react-three/fiber), com estado em **zustand** e áudio procedural em **WebAudio** (zero assets externos).

## ▶️ Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
```

Build de produção: `npm run build` (sai em `dist/`, servível de qualquer pasta) · Preview: `npm run preview`
Validação offline (rotas do Kraken + balanceamento do GDD): `npm run validate`
Atalho de desenvolvimento: `http://localhost:5173/?autostart=1` pula o menu.

## 🎮 Controles (GDD §5.1)

| Ação | Tecla |
|---|---|
| Mover | WASD / Setas |
| Correr (gasta stamina) | SHIFT |
| Pular | ESPAÇO |
| Esquiva/Roll (i-frames contra o Dr. Gastro) | CTRL ou C |
| Interagir / Entrar | E |
| Modo Voracidade (×2 por 20s, cooldown 2min) | Q |
| Mapa completo | TAB |
| Pausa | ESC · Mudo: M |

## 🍽️ O que está implementado (do GDD)

- **Sessão de 5 minutos** com timer central estilizado, vibração entre 2:00–1:00, vermelho piscante <30s e bipes nos últimos 10s (§10.1)
- **Bellyport 3D** com 7 bairros com paletas próprias (§4.1/§13.2), ciclo dia/noite amarrado ao timer (§4.3), poças de molho, dumplings, pimentas, +10s e as 3 **Chaves Gastronômicas** (§4.4)
- **10 restaurantes + O Banquete das Sombras** (secreto, §6.3), cada um com fachada, placa, selo de dificuldade e bandeirinha de estado verde/amarela/vermelha (§5.3)
- **11 minigames completos** (§6.2): Engolida Perfeita, Montagem Maluca, Sopa do Caos, Pizza Rítmica, Ramen Furacão, Churrasco na Brasa, Donut Voador, Taco Tempestade, Fondue Frenético, Sorvete Turbo e O Desafio Supremo — com escalonamento por dificuldade das tabelas do GDD
- **Pontuação fiel ao §7**: brutos × dificuldade (×0.5/×1.5/×3.0) × Combo Gourmet (+10/20/35/50%) × bônus; classificação ⭐⭐⭐/⭐⭐/⭐/💀 com +15%/+5%/−5%; bônus especiais (Primeiro do Dia, Velocista, Sem Erros, Adrenalina, Humilhação do Kraken, Descoberta Secreta)
- **Chef Kraken com IA ativa** (§2.4/§9.2): roteiriza pelas ruas (grafo + BFS) priorizando valor/distância com "visão de chef" (disputa o que você mira), come restaurantes (você ganha só metade se ele chegou antes), rouba seu combo no toque e causa Game Over se terminar na frente
- **NPCs** (§3.3/§9.1): transeuntes, **Dr. Gastro** (inspeção de 3s, −3s, esquivável com roll, mais agressivo no fim), **Madame Papille** (revela o restaurante com bônus de +25%), **Vendedor de Cachorro-Quente** (stamina por pontos) e **Zé Roda** (carona ×2)
- **Mecânicas do §5**: stamina com modo ofegante, entrada com fade de porta, abandono (−15s, revisita com bônus −50%), combo quebrado por Kraken
- **HUD completo** (§11): placares MobDyck/Kraken, stamina, minimapa com bandeiras, combo com janela de 10s, buffs, "recorde a bater" (média das 3 melhores)
- **Telas**: menu animado, pausa (timer congela, mapa, reiniciar), resultado no formato do §10.3 com detalhamento, XP/moedas e dica de derrota; recordes locais (top 10 em localStorage)
- **Trilha procedural** que acelera de 110→165 BPM nos últimos 60s (§14.1) + ~25 efeitos sonoros sintetizados (§14.2)

## 📁 Estrutura

```
src/
├── game/        # store (zustand), constantes do GDD, layout da cidade, áudio, input, mundo
├── three/       # cena 3D: cidade, restaurantes, MobDyck, Kraken, NPCs, pickups, luz
├── minigames/   # shell + registry + 11 jogos
└── ui/          # HUD, minimapa, mapa, menu, pausa, resultados, toasts
```

## 🔭 Fora do escopo desta versão (GDD futuro)

Campanha de 5 dias, multiplayer local/online, modos Contrarrelógio/Sem Fim/Festival, progressão XP persistente entre builds, loja cosmética, conquistas completas, mobile touch e localização — o documento §15–§19 fica como roadmap.
