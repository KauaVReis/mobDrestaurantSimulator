# Plano de Implementação — Easter Egg do Richard (Boost 2x) & Radar Temporário

Este plano detalha a inclusão do NPC **Richard** e do seu carrinho de lanches como um easter egg em posições ocultas aleatórias de Bellyport a cada rodada. Ao interagir com ele, o jogador joga um minigame rápido para ganhar um boost de multiplicador **×2** no próximo restaurante visitado (acumulativo com o Modo Voracidade, resultando em até ×4).

Também está inclusa a mecânica de **Radar Temporário** no minimapa, que revela o Richard por um breve período sob condições específicas.

---

## Melhorias Adicionais Selecionadas

1. **Clima Dinâmico com Efeitos de Jogabilidade**:
   - Cada rodada tem 15% de chance de iniciar sob uma condição climática especial:
     - **Chuva de Molho**: Ruas escorregadias (o jogador desliza levemente ao correr, mas a esquiva/roll alcança o dobro da distância).
     - **Nevasca de Gelato**: Consome stamina um pouco mais rápido, mas dumplings restauram o dobro de stamina.
2. **Painel de Conquistas ("Menu de Conquistas Gourmet")**:
   - No menu principal, uma tela para listar conquistas locais persistentes (ex: "Sem Erros em 3 minigames Médios", "Encontre o Richard nos primeiros 45 segundos"), recompensando o jogador com moedas extras ao completá-las.
3. **Radar Temporário no Minimapa**:
   - Quando o Modo Voracidade ou a Pimenta são ativados, o minimapa faz uma pulsação visual rápida (ping) que revela a localização exata do Richard por exatamente **1,5 segundos**, sumindo logo em seguida para manter o aspecto de exploração do easter egg.

---

## Proposta de Implementação: Richard e o Carrinho de Lanches

### 1. Sistema de Posicionamento e Estado do Richard

Adicionaremos locais escondidos (becos, atrás de prédios) no layout da cidade. A cada `startGame`, uma dessas coordenadas é selecionada aleatoriamente para ser o spot de spawn do carrinho do Richard.

* **Locais ocultos do Richard (`RICHARD_SPOTS`)**:
  - Atrás do Parque da Praça: `[14, -14]`
  - No Beco dos Sabores (atrás do Banquete): `[60, -45]`
  - Recuo na Avenida Gourmet: `[-60, 5]`
  - Atrás de contêineres no Porto: `[-30, -55]`
  - Esquina da Zona Universitária: `[35, 60]`

* **Variáveis de Estado a Adicionar na Store ([store.js](file:///c:/Users/senai/Desktop/mobDrestaurantSimulator/src/game/store.js))**:
  - `richardSpot`: Coordenadas `[x, z]` selecionadas na inicialização da rodada.
  - `richardVisited`: Booleano para rastrear se ele já foi visitado na rodada atual.
  - `richardBoost`: Booleano indicando se o multiplicador ×2 está ativo para o próximo restaurante.
  - `richardPingTime`: Relógio ou timestamp de controle para indicar quando e por quanto tempo a posição do Richard ficará visível no minimapa (exatamente 1,5 segundos de exibição).

---

## Alterações Propostas por Componente

### [game]

#### [MODIFY] [constants.js](file:///c:/Users/senai/Desktop/mobDrestaurantSimulator/src/game/constants.js)
- Definir os pontos de spawn possíveis do Richard: `export const RICHARD_SPOTS = [...]`.

#### [MODIFY] [store.js](file:///c:/Users/senai/Desktop/mobDrestaurantSimulator/src/game/store.js)
- Em `startGame()`:
  - Definir `richardSpot` selecionando aleatoriamente um local de `RICHARD_SPOTS`.
  - Definir `richardVisited: false`, `richardBoost: false` e `richardPingTime: 0`.
- Em `activateVoracity()` e `collectPickup('pimenta')`:
  - Definir o estado de ping do radar temporário definindo o tempo restante de exibição de Richard como `1.5` segundos: `set({ richardPingTime: 1.5 })`.
- Em `tick(dt)`:
  - Decrementar `richardPingTime` até 0.
- Criar a ação `tryEnterRichard()` que inicia o minigame do Richard marcando `activeMinigame: { restaurantId: 'richard', enteredAt: get().elapsed, streak: 1 }`.
- Atualizar a ação `completeMinigame()`:
  - Se for o minigame do Richard e a meta de pontuação for alcançada, ativar o status `richardBoost: true`, marcar `richardVisited: true` e não somar pontos regulares.
  - Se for um restaurante e `richardBoost` estiver ativo, multiplicar a pontuação por `2` no cálculo final (acumulando multiplicativamente com outros multiplicadores, como o Modo Voracidade), exibir toast especial e desativar o boost (`richardBoost: false`).

---

### [three]

#### [MODIFY] [NPCs.jsx](file:///c:/Users/senai/Desktop/mobDrestaurantSimulator/src/three/NPCs.jsx)
- Importar `richardSpot` e `richardVisited` do estado do jogo.
- Criar o componente `<Richard />` que renderiza o Richard e seu carrinho de lanches na posição de spawn (se `!richardVisited`).
- O carrinho de lanches do Richard usará formas procedimentais (uma caixa de metal vermelha/amarela com letreiro escrito "RICHARD'S").

#### [MODIFY] [Player.jsx](file:///c:/Users/senai/Desktop/mobDrestaurantSimulator/src/three/Player.jsx)
- Adicionar o carrinho do Richard como colisor na física ou interativo.
- Adicionar a detecção de proximidade com o Richard: se o jogador se aproximar de `richardSpot` (e `!richardVisited`), exibir o prompt de interação: `"Comer Lanche do Richard (Desafio 2x Boost)"`.
- Executar `tryEnterRichard()` quando a tecla de interação `E` for pressionada.

---

### [minigames]

#### [NEW] [Richard.jsx](file:///c:/Users/senai/Desktop/mobDrestaurantSimulator/src/minigames/games/Richard.jsx)
- Criar o minigame **"O Lanche do Richard"**:
  - Mecânica: Uma torre de lanche cai em direção à boca do MobDyck. O jogador deve pressionar a barra de espaço para abocanhar as camadas exatamente no timing em que passam pela linha de mastigação verde.
  - Se o jogador comer pelo menos 8 camadas com sucesso em 15 segundos, ele vence o minigame, ativando o boost ×2.

#### [MODIFY] [registry.js](file:///c:/Users/senai/Desktop/mobDrestaurantSimulator/src/minigames/registry.js)
- Adicionar o minigame `richard` ao catálogo sob as especificações especiais (Fácil/Médio/Difícil com duração curta de 15 segundos).

#### [MODIFY] [MinigameOverlay.jsx](file:///c:/Users/senai/Desktop/mobDrestaurantSimulator/src/minigames/MinigameOverlay.jsx)
- Tratar o caso especial em que `active.restaurantId === 'richard'` (ele não exibe multiplicador de dificuldade normal nem combo gourmet na barra de título, e mostra um texto explicativo da recompensa na tela de introdução: `"Recompensa: Multiplicador ×2 no próximo restaurante visitado!"`).
- Na tela de resultados, em vez de pontos normais, mostrar `"VITÓRIA! Boost de ×2 Ativado!"` se o jogador pontuou acima da meta de 80%.

---

### [ui]

#### [MODIFY] [HUD.jsx](file:///c:/Users/senai/Desktop/mobDrestaurantSimulator/src/ui/HUD.jsx)
- Exibir um banner ou indicador dourado piscante estilizado: `🔥 ×2 BOOST DO RICHARD ATIVO!` na HUD enquanto `richardBoost` for verdadeiro.
- No componente de Minimapa (`Minimap` dentro de `HUD.jsx` ou componente dedicado):
  - Exibir o ícone do Richard temporariamente se `richardPingTime > 0`.

---

## Plano de Verificação

### Testes Manuais
1. Iniciar o jogo e procurar pelo carrinho do Richard em Bellyport.
2. Ativar a Pimenta ou o Modo Voracidade e validar que a localização de Richard aparece no minimapa por exatamente 1.5 segundos e depois some.
3. Interagir com o Richard e garantir que o minigame dele é iniciado com a tela de introdução explicativa.
4. Completar o minigame com sucesso e validar que o indicador `🔥 ×2 BOOST DO RICHARD ATIVO!` aparece na HUD.
5. Entrar em um restaurante e completar o minigame. Validar que os pontos finais são duplicados pelo boost, acumulando com o Modo Voracidade se ativado simultaneamente.
6. Garantir que o carrinho do Richard desaparece do mapa após ser visitado na mesma rodada.
