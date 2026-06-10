# 🐋 MobDyck Restaurant Simulator
## Game Design Document (GDD) — Versão 1.0

---

> *"Nenhum restaurante é grande demais para a fome de MobDyck."*

---

## Índice

1. [Visão Geral do Jogo](#1-visão-geral-do-jogo)
2. [Conceito e Narrativa](#2-conceito-e-narrativa)
3. [Personagens](#3-personagens)
4. [Mundo e Ambientação](#4-mundo-e-ambientação)
5. [Mecânicas Principais](#5-mecânicas-principais)
6. [Sistema de Minigames de Alimentação](#6-sistema-de-minigames-de-alimentação)
7. [Sistema de Pontuação e Dificuldade](#7-sistema-de-pontuação-e-dificuldade)
8. [Os Restaurantes](#8-os-restaurantes)
9. [NPCs e Inteligência Artificial](#9-npcs-e-inteligência-artificial)
10. [Timer e Progressão de Sessão](#10-timer-e-progressão-de-sessão)
11. [Interface do Usuário (HUD)](#11-interface-do-usuário-hud)
12. [Sistema de Câmera e Controles](#12-sistema-de-câmera-e-controles)
13. [Arte e Direção Visual](#13-arte-e-direção-visual)
14. [Trilha Sonora e Efeitos de Som](#14-trilha-sonora-e-efeitos-de-som)
15. [Progressão e Desbloqueáveis](#15-progressão-e-desbloqueáveis)
16. [Modos de Jogo](#16-modos-de-jogo)
17. [Arquitetura Técnica](#17-arquitetura-técnica)
18. [Pipeline de Desenvolvimento](#18-pipeline-de-desenvolvimento)
19. [Monetização e Modelo de Negócio](#19-monetização-e-modelo-de-negócio)
20. [Glossário](#20-glossário)

---

## 1. Visão Geral do Jogo

### 1.1 Ficha Técnica

| Campo | Informação |
|---|---|
| **Título** | MobDyck Restaurant Simulator |
| **Gênero** | Simulação / Arcade / Party Game 3D |
| **Engine** | Unity 2023 LTS (ou Unreal Engine 5) |
| **Plataformas-alvo** | PC (Windows/Mac/Linux), Console (PS5, Xbox Series X), Mobile (iOS/Android) |
| **Classificação Indicativa** | Livre (E for Everyone) |
| **Modo(s) de Jogo** | Single Player, Local Multiplayer (até 4 jogadores), Online |
| **Idiomas** | Português (BR), Inglês, Espanhol, Japonês |
| **Desenvolvedor** | Estúdio Independente / Indie |
| **Duração Média de Sessão** | 5–10 minutos (modo padrão) |

---

### 1.2 Pitch de Uma Linha

MobDyck Restaurant Simulator é um jogo de arcade 3D onde você controla MobDyck — um personagem voraz e caricato — que percorre uma cidade vibrante com **5 minutos** para entrar em todos os restaurantes disponíveis, completar minigames culinários e acumular a maior pontuação possível.

---

### 1.3 Proposta de Valor

O jogo combina três pilares de entretenimento:

**Exploração Urbana 3D** — Corra pela cidade, descubra atalhos, evite NPCs que atrapalham seu caminho e gerencie seu tempo como um atleta culinário.

**Minigames de Alimentação** — Cada restaurante oferece um desafio único e temático. De engolir sushi em sequência a montar hambúrgueres na pressa, cada minigame é rápido, divertido e rejogável.

**Gestão de Pontuação Estratégica** — Com três níveis de dificuldade por restaurante e um sistema de multiplicadores, o jogador sempre enfrenta a decisão de arriscar mais por pontos maiores ou garantir uma pontuação segura.

---

### 1.4 Público-Alvo

- **Principal:** Jogadores casuais e semi-casuais entre 10 e 30 anos
- **Secundário:** Fãs de party games e minigames (WarioWare, Overcooked, Untitled Goose Game)
- **Terciário:** Streamers e criadores de conteúdo (o jogo possui alto valor de entretenimento para audiência)

---

## 2. Conceito e Narrativa

### 2.1 Contexto do Mundo

A cidade de **Bellyport** é famosa por sua gastronomia diversificada. Todos os anos acontece o **Gran Festival Gourmet de Bellyport**, onde um campeão é coroado com o título de *"O Maior Devorador da Cidade"*. O prêmio? Uma reserva vitalícia e gratuita em todos os restaurantes de Bellyport.

### 2.2 O Protagonista e sua Motivação

**MobDyck** é um personagem lendário nas ruas de Bellyport — metade humano, metade força da natureza. Diz a lenda que ele foi criado por um ex-chef que misturou uma receita secreta com magia culinária antiga, dando vida a uma criatura cujo único propósito é devorar o que há de melhor no mundo gastronômico.

MobDyck não come por necessidade. Ele come por **amor**, por **arte** e por **competição**.

Neste ano, o Festival Gourmet de Bellyport tem uma regra nova: o campeão será aquele que, em **exatamente 5 minutos**, conseguir entrar em mais restaurantes e obter as maiores pontuações nos desafios culinários de cada um deles. Não há segunda chance — a corrida começa ao nascer do sol e termina ao soar do sino da praça central.

MobDyck treinou a vida toda para este momento.

### 2.3 Arco Narrativo do Modo Campanha

O modo Campanha é dividido em **5 "Dias do Festival"**, cada um com uma versão diferente (e maior) da cidade, mais restaurantes, NPCs mais agressivos e desafios mais elaborados.

| Dia | Título | Tema | Número de Restaurantes | Dificuldade Geral |
|---|---|---|---|---|
| 1 | O Despertar do Apetite | Introdução à cidade | 4 | Fácil |
| 2 | A Rota dos Sabores | Expansão do mapa | 7 | Fácil–Médio |
| 3 | A Grande Corrida | Centro gastronômico | 10 | Médio |
| 4 | O Banquete das Sombras | Bairro noturno | 12 | Médio–Difícil |
| 5 | O Festival Final | Cidade inteira | 16 | Difícil |

### 2.4 Rivalidade: O Antagonista — Chef Kraken

O principal antagonista do jogo é **Chef Kraken**, o atual campeão do festival. Ele é um NPC ativo no mapa que também compete pelos restaurantes — se ele entrar em um restaurante antes de MobDyck, o jogador perde acesso àquela pontuação máxima (recebe apenas metade). Chef Kraken é ágil, estratégico e usa NPCs como obstáculos deliberados.

Chef Kraken tem uma barra de pontuação visível no HUD, e o jogador vive a tensão de estar sempre em competição direta com ele.

---

## 3. Personagens

### 3.1 MobDyck (Jogador)

**Aparência:** MobDyck é um personagem 3D estilizado com proporções exageradas — uma barriga enorme, braços curtos mas ágeis, uma expressão permanentemente faminta e olhos que brilham sempre que vê comida. Ele usa um aventalzinho pequeno demais para seu corpo e um boné de chef levemente torto.

**Atributos Base (Início do Jogo):**

| Atributo | Valor Inicial | Máximo |
|---|---|---|
| Velocidade de Corrida | 5.0 m/s | 8.5 m/s |
| Velocidade de Comer | Padrão | +50% com upgrades |
| Capacidade de Stamina | 100 | 150 |
| Sorte (afeta drops de bônus) | 1 | 5 |

**Habilidades Especiais Desbloqueáveis:**

- **Faro Gourmet:** MobDyck detecta automaticamente o restaurante mais próximo com radar (desbloqueável no Dia 2)
- **Engolida Turbo:** Reduz o tempo de minigame em 10% (desbloqueável ao bater 5.000 pontos no Dia 1)
- **Barriga Elástica:** Permite acumular um bônus extra de combo ao completar minigames consecutivos sem pausa (desbloqueável no Dia 3)
- **Modo Voracidade:** Ativa um estado de 20 segundos onde todos os multiplicadores dobram (cooldown de 2 minutos)

---

### 3.2 Chef Kraken (Antagonista Principal)

**Aparência:** Alto, magro, vestindo um jaleco de chef todo branco imaculado com detalhes dourados. Seus cabelos são brancos e pontiagudos. Ele carrega sempre um garfo gigante como se fosse um cetro. Seus tentáculos — sim, ele tem tentáculos pequenos saindo das costas — ocasionalmente agarram itens de comida pelo mapa.

**Comportamento:** Chef Kraken percorre o mapa em rotas otimizadas. Ele tem "visão de chef" — consegue perceber quando MobDyck está próximo e prioriza os restaurantes que MobDyck está mirando. Isso cria um sistema dinâmico de perseguição e estratégia.

**Pontuação do Chef Kraken:** Sempre visível no canto superior da HUD. Se ao final dos 5 minutos MobDyck tiver menos pontos que o Chef Kraken, é Game Over (no modo Campanha).

---

### 3.3 NPCs Secundários (Transeuntes e Frequentadores)

Os NPCs da cidade de Bellyport são personagens de suporte que criam ambiente e dinâmica. Eles são divididos em categorias funcionais:

#### 3.3.1 NPCs Neutros (Transeuntes)
Andam pelas calçadas em rotas predefinidas com variação aleatória. Não interagem com MobDyck diretamente mas podem bloquear caminhos físicos.

- **Turistas com mapa:** Andam devagar, param no meio da calçada, tomam fotos
- **Entregadores de bicicleta:** Cruzam ruas rapidamente, podem ser usados para "surf" (mecânica de agarre)
- **Estudantes universitários:** Andam em grupos, difíceis de desviar
- **Idosos com carrinho de compras:** Lentos mas ocupam muito espaço físico

#### 3.3.2 NPCs Interativos (Positivos)
MobDyck pode interagir com eles para obter benefícios.

- **Vendedor de Cachorro-Quente da Rua:** Oferece um "petisco" que restaura stamina em troca de alguns pontos de pontuação extra
- **Crítica Gastronômica (Madame Papille):** Uma NPC que aparece aleatoriamente no mapa; conversar com ela (pressionando interação) revela dicas sobre qual restaurante tem bônus de pontuação naquela rodada
- **Skatista Radical (Zé Roda):** MobDyck pode "pegar carona" nele por 5 segundos, dobrando sua velocidade de deslocamento
- **Criança com Balão de Comida:** Ao estoura o balão (interação), revela a localização do restaurante secreto do mapa

#### 3.3.3 NPCs Obstáculo (Negativos)
Criados especificamente para atrapalhar a corrida de MobDyck.

- **Inspetor de Saúde Público (Dr. Gastro):** Para MobDyck para uma "inspeção" de 3 segundos. Pode ser evitado com uma esquiva (roll)
- **Fã Obcecado (Marlene):** Reconhece MobDyck e tenta tirar selfie — atrasa 2 segundos se capturado
- **Grupo de Manifestantes "Dieta Já":** Formam barricada humana que MobDyck precisa contornar
- **Caminhão de Mudança:** NPC-veículo que bloqueia aleatoriamente uma rua por 10–30 segundos
- **Pombos Gigantes (Páscoa de Bellyport):** Aparecem em eventos sazonais e reduzem a velocidade de corrida por 4 segundos ao atingirem MobDyck

#### 3.3.4 NPCs dentro dos Restaurantes
Cada restaurante tem seus próprios NPCs internos que afetam o minigame.

- **Garçons Apressados:** Se colidir com eles durante o minigame, penalidade de -50 pontos
- **Mesa de Críticos:** Uma mesa especial que, se MobDyck performar excepcionalmente no minigame, concede +200 bônus
- **Cozinheiro Nervoso:** Aparece em restaurantes de dificuldade alta — interfere no minigame em momentos aleatórios
- **Cliente Competitivo:** Um NPC que também realiza o minigame ao mesmo tempo; se o NPC terminar antes de MobDyck, parte do prêmio vai para ele

---

## 4. Mundo e Ambientação

### 4.1 Bellyport — A Cidade

Bellyport é uma cidade costeira fictícia com forte influência mediterrânea misturada com elementos urbanos modernos e toques caricatos. O skyline mistura prédios art nouveau com placas de néon de restaurantes, e o cheiro de comida (representado visualmente por partículas de vapor coloridas que saem das janelas dos restaurantes) é uma constante.

**Tamanho do Mapa:**
- Dia 1: 4 blocos × 4 blocos (~300m × 300m equivalente em jogo)
- Dia 5: 12 blocos × 10 blocos — mapa completo de Bellyport

**Biomas Urbanos:**

| Bairro | Estilo Visual | Tipo de Restaurante Dominante | NPCs Característicos |
|---|---|---|---|
| **Praça Central** | Clássico europeu, fontes, bancos | Cafés e bistrôs | Turistas, músicos de rua |
| **Porto Gastronômico** | Industrial chique, armazéns convertidos | Frutos do mar, sushi | Pescadores, trabalhadores portuários |
| **Rua das Nações** | Fachadas coloridas multiculturais | Culinária do mundo | Imigrantes, estudantes |
| **Beco dos Sabores** | Atalhos escuros, luzes de lanternas | Food trucks, petiscos secretos | Chefs misteriosos, gatos |
| **Avenida Gourmet** | Luxo moderno, vidros e aço | Alta gastronomia, restaurantes Michelin | Elite, guardas de segurança |
| **Mercado Municipal** | Toldos coloridos, caixarias | Culinária caseira, mercado | Feirantes, donas de casa |
| **Zona Universitária** | Grafitado, vibrante, colorido | Fast food, hamburguerias | Estudantes, skaters |

### 4.2 Estrutura Física dos Restaurantes

Cada restaurante no mapa é um edifício 3D distinto, com:

- **Fachada exterior** com placa luminosa, cardápio na vitrine e decoração temática
- **Porta de entrada** com animação de abertura ao aproximar
- **Interior único** com layout diferente por restaurante
- **Área de minigame** destacada visualmente (área brilhante no chão onde o minigame acontece)
- **Saída** sempre localizada no lado oposto da entrada para fluidez de movimento

### 4.3 Ciclo Dia/Noite

O jogo simula um ciclo visual rápido que reflete o tempo do timer:

- **0:00–1:30** (início) → Amanhecer, luz dourada suave, movimento baixo de NPCs
- **1:30–3:30** (meio do jogo) → Meio-dia, cidade a todo vapor, máximo de NPCs nas ruas
- **3:30–5:00** (final) → Fim de tarde, luz laranja, NPCs começam a entrar em restaurantes (bloqueando algumas entradas)

Esse ciclo cria urgência visual e mecânica — conforme o tempo passa, a cidade "fecha" gradualmente.

### 4.4 Elementos Interativos do Ambiente

Além dos NPCs, o mapa contém elementos físicos com os quais MobDyck pode interagir:

- **Atalhos de escadas rolantes** — Aceleradores de trajeto que conectam bairros diferentes verticalmente
- **Carrinhos de compras abandonados** — MobDyck pode empurrá-los para desbloquear rotas bloqueadas
- **Poças de molho no chão** — Reduzem velocidade de corrida em 30% por 2 segundos
- **Tapetes voadores culinários** — Power-up raro: transporta MobDyck diretamente para qualquer restaurante escolhido
- **Placas de cardápio luminosas** — Clicando/interagindo, MobDyck pode ver a dificuldade atual do minigame do restaurante sem precisar entrar
- **Dumplings flutuantes** — Coletáveis que restauram 15% de stamina ao tocar
- **Pimenta brilhante vermelha** — Power-up de velocidade: +40% por 8 segundos

---

## 5. Mecânicas Principais

### 5.1 Movimento e Locomoção

MobDyck se movimenta em um ambiente 3D com câmera em terceira pessoa. O sistema de movimento é projetado para ser **fluido, responsivo e divertido de controlar**, com foco em arcade rather than realismo.

**Comandos de Movimento:**

| Ação | PC (Teclado/Mouse) | Gamepad |
|---|---|---|
| Mover | WASD / Setas | Analógico Esquerdo |
| Correr (sprint) | Shift + Direcional | L3 (pressionar analógico) |
| Pulo | Espaço | A / Cross |
| Esquiva/Roll | Ctrl + Direcional | B / Circle |
| Interagir | E | X / Square |
| Usar Habilidade Especial | Q | LB / L1 |
| Ver Mapa | Tab | Select/View |
| Pausar | Esc | Start/Options |

**Sistema de Stamina:**
MobDyck possui uma barra de Stamina que é consumida ao correr. Ao caminhar, a stamina regenera passivamente. Se a stamina chegar a zero, MobDyck entra em modo "ofegante" — movimento reduzido em 40% por 3 segundos.

Estratégia: Gerenciar stamina é essencial. Correr o tempo todo pode deixar MobDyck lento na hora errada.

### 5.2 Mecânica de Entrada nos Restaurantes

Para entrar em um restaurante, MobDyck deve:

1. Se aproximar da porta (raio de 2 metros)
2. Pressionar o botão de Interação
3. Uma animação de 0.5 segundos mostra MobDyck empurrando a porta
4. O jogo faz uma transição suave (fade ou curtain wipe) para o interior
5. O minigame começa automaticamente após 1 segundo de apresentação

**Restrições de Entrada:**
- Cada restaurante só pode ser visitado **uma vez** por sessão
- Se Chef Kraken já estiver dentro do restaurante, MobDyck deve esperar 10 segundos ou ir para outro
- Alguns restaurantes têm **fila de espera** (NPCs na frente) que pode ser ignorada com o poder "Faro Gourmet" desbloqueado
- Restaurantes **lotados** (indicado por placa visual) reduzem o tempo disponível para o minigame em 20%

### 5.3 Mecânica de Saída dos Restaurantes

Após completar (ou abandonar) um minigame:
- MobDyck é ejetado pela porta de saída com uma animação de satisfação ou frustração
- Uma bola de pontos animada sobe da cabeça de MobDyck mostrando o ganho daquela visita
- O restaurante fica marcado com uma bandeirinha colorida no mapa (verde = visitado, amarelo = visitado mas com pontuação baixa, vermelho = não visitado)

### 5.4 Mecânica de Abandono de Minigame

MobDyck pode abandonar um minigame a qualquer momento pressionando o botão "Sair" (botão de menu). Nesse caso:
- Recebe 0 pontos daquela visita
- Gasta 15 segundos extras saindo (penalidade de tempo)
- O restaurante fica marcado como "abandonado" — pode ser visitado novamente naquela sessão, mas com bônus reduzido em 50%

### 5.5 Sistema de Combo de Restaurantes

Visitar múltiplos restaurantes consecutivamente sem pausa (menos de 10 segundos entre saídas e entradas) ativa o sistema de **Combo de Gourmet**:

- **2 restaurantes consecutivos:** +10% nos pontos do próximo restaurante
- **3 restaurantes consecutivos:** +20% nos pontos do próximo restaurante
- **4 restaurantes consecutivos:** +35% nos pontos do próximo restaurante
- **5 ou mais restaurantes consecutivos:** +50% nos pontos do próximo restaurante + "Crítica Entusiasmada" (dobra bônus da Mesa de Críticos)

O combo é quebrado se MobDyck:
- Parar por mais de 10 segundos sem entrar em restaurante
- For interceptado pelo Chef Kraken
- For capturado por NPC Obstáculo por mais de 5 segundos

---

## 6. Sistema de Minigames de Alimentação

Cada restaurante possui um minigame temático único. Os minigames foram projetados para serem compreensíveis em **2 segundos de tutorial** e domináveis com prática. Todos têm duração entre **15 e 45 segundos** dependendo da dificuldade.

### 6.1 Princípios de Design dos Minigames

Todos os minigames seguem estes princípios:

1. **Simplicidade de controles:** Máximo de 2 botões principais
2. **Legibilidade visual:** O jogador sabe o que fazer de imediato
3. **Escalabilidade de dificuldade:** O mesmo minigame fica mais intenso em dificuldades maiores
4. **Fator "Mais Uma Vez":** A falha não frustra — instiga tentar de novo
5. **Feedback satisfatório:** Sons, partículas e animações de recompensa ao acertar

---

### 6.2 Catálogo Completo de Minigames

#### MINIGAME #1 — "Engolida Perfeita" (Restaurante: Sushi Tsunami)

**Conceito:** Uma esteira de sushi passa em velocidade crescente. MobDyck deve pressionar o botão de comer no timing exato conforme cada peça de sushi passa pela zona de engolida (marcada por um círculo brilhante).

**Mecânica Detalhada:**
- A esteira tem 3 "pistas" paralelas (alto, médio, baixo)
- Cada peça de sushi tem um valor de pontos diferente (4–20 pontos)
- Peças douradas valem 3× o valor normal
- Peças vermelhas (apimentadas) valem 5× mas exigem timing perfeito (janela de 0.1 segundos)
- Comer uma peça fora do timing resulta em apenas 20% dos pontos

**Escalonamento por Dificuldade:**

| Dificuldade | Velocidade da Esteira | Peças por Minuto | Janela de Timing |
|---|---|---|---|
| Fácil | 1.0× | 8/min | 0.4 seg |
| Médio | 1.8× | 14/min | 0.25 seg |
| Difícil | 3.0× | 22/min | 0.1 seg |

**Pontuação máxima ideal:**
- Fácil: 80 pontos
- Médio: 200 pontos
- Difícil: 400 pontos

---

#### MINIGAME #2 — "Montagem Maluca" (Restaurante: Big Belly Burger)

**Conceito:** Ingredientes de hambúrguer caem do teto. MobDyck deve "abrir a boca" (posicionando o personagem) para capturar ingredientes na ordem correta mostrada na receita.

**Mecânica Detalhada:**
- A receita aparece no topo da tela: ex. Pão → Carne → Queijo → Alface → Tomate → Pão
- Ingredientes caem em posições aleatórias na área 3D
- MobDyck se movimenta lateralmente para pegar os ingredientes na ordem
- Pegar na ordem correta: pontos normais
- Pegar fora de ordem: ingrediente "devolvido" e 5 seg de penalidade
- "Ingrediente Especial" (Molho Secreto): aparece brevemente — capturar dá bônus de +100 pontos

**Escalonamento por Dificuldade:**

| Dificuldade | Velocidade de Queda | Número de Ingredientes | Ingredientes Falsos |
|---|---|---|---|
| Fácil | Lenta | 5 | 0 |
| Médio | Média | 8 | 2 |
| Difícil | Rápida | 12 | 5 |

---

#### MINIGAME #3 — "Sopa do Caos" (Restaurante: Casa da Vovó Tempestade)

**Conceito:** Uma tigela gigante de sopa está na frente de MobDyck. Colheres carregadas de sopa lançam-se em arco em sua direção. MobDyck deve inclinar a cabeça (usando o analógico ou mouse) para "pegar" o máximo de colheradas.

**Mecânica Detalhada:**
- Sistema de mira: o cursor representa a "boca aberta" de MobDyck
- Cada colherada tem uma trajetória de arco ligeiramente diferente
- Colheres com vaporzinho dourado = sopa quente (pontuação dobrada)
- Colheres com pedaço de osso = armadilha — desviar evita perda de 30 pontos
- Velocidade das colheradas aumenta a cada 10 pontos marcados

**Escalonamento por Dificuldade:**

| Dificuldade | Colheres por Onda | Ondas | Velocidade |
|---|---|---|---|
| Fácil | 3 | 4 | Lenta |
| Médio | 5 | 6 | Média |
| Difícil | 8 | 8 | Rápida + aleatória |

---

#### MINIGAME #4 — "Pizza Rítmica" (Restaurante: Pizzaria Napolitane)

**Conceito:** Um minigame de ritmo onde MobDyck deve apertar botões no ritmo de uma música italiana animada. Cada input correto representa uma mordida de pizza.

**Mecânica Detalhada:**
- Notas descem por 4 "trilhas" (correspondentes a 4 botões)
- Perfeito (Perfect Hit): 100% dos pontos + partículas douradas
- Bom (Good Hit): 70% dos pontos
- OK: 40% dos pontos
- Miss: 0 pontos e quebra o combo
- Sistema de Combo: cada hit consecutivo aumenta um multiplicador (1× → 2× → 3× → 4× → MAX 5×)

**Escalonamento por Dificuldade:**

| Dificuldade | BPM da Música | Padrões | Notas Especiais |
|---|---|---|---|
| Fácil | 90 BPM | Simples | Nenhuma |
| Médio | 130 BPM | Moderados | Notas duplas |
| Difícil | 175 BPM | Complexos | Holds, Flicks, Notas triplas |

---

#### MINIGAME #5 — "Ramen Furacão" (Restaurante: Ramen Tufão)

**Conceito:** Uma tigela de ramen está na frente de MobDyck. O jogador deve "sorver" o macarrão girando o analógico (ou rotacionando o mouse) o mais rápido possível para puxar os macarrões para a boca.

**Mecânica Detalhada:**
- Barra de "Macarrão Restante" vai de 100% a 0%
- Quanto mais rápido o jogador gira/move, mais rápido a barra cai
- Componentes extras na tigela (pedaços de carne, ovo) dão bônus ao serem "puxados" no momento certo
- "Mega Macarrão" — um macarrão superlongo que aparece aleatoriamente — requer uma rotação especial e vale 150 pontos
- Se parar o movimento por mais de 1 segundo, o macarrão "escorrega de volta" para a tigela

**Escalonamento por Dificuldade:**

| Dificuldade | Velocidade de Escorregamento | Tempo Total | Obstáculos |
|---|---|---|---|
| Fácil | Lenta | 30 seg | Nenhum |
| Médio | Média | 22 seg | Chopstick flutuante (-10 pts) |
| Difícil | Rápida | 15 seg | Ventilador (reverte direção) |

---

#### MINIGAME #6 — "Churrasco na Brasa" (Restaurante: Churrasquinho do Touro)

**Conceito:** MobDyck está diante de uma grelha com espetos. Deve virar os espetos no tempo certo para não queimar nem deixar cru — pressionando o botão no momento exato em que a indicação de "ponto perfeito" aparecer.

**Mecânica Detalhada:**
- Cada espeto tem uma barra de "cozimento" que vai de cru → ao ponto → queimado
- O jogador deve pressionar o botão quando a barra está na zona verde ("Ao Ponto")
- Quanto mais próximo do centro da zona verde, mais pontos
- Espetos dourados (corte nobre) — janela menor mas valem 3×
- Múltiplos espetos simultâneos exigem atenção dividida

**Escalonamento por Dificuldade:**

| Dificuldade | Espetos Simultâneos | Velocidade de Cozimento | Zona Verde |
|---|---|---|---|
| Fácil | 2 | Lenta | 30% da barra |
| Médio | 4 | Média | 20% da barra |
| Difícil | 6 | Rápida + assimétrica | 10% da barra |

---

#### MINIGAME #7 — "Donut Voador" (Restaurante: Bakers in the Sky)

**Conceito:** Donuts são lançados como frisbees pelos cozinheiros. MobDyck deve pular e capturar os donuts com a boca em pleno ar, como um basquete culinário.

**Mecânica Detalhada:**
- MobDyck está parado — apenas pula e inclina para pegar
- Os donuts têm arcos de voo diferentes (alto, médio, baixo, lateral)
- Combinações de cor dão bônus: 3 donuts da mesma cor = "Trio Doce" +50 pontos
- Donut gigante: raro, vale 200 pontos mas exige pulo duplo no timing certo
- Miss: o donut bate na testa de MobDyck e ele fica atordoado por 1 segundo

**Escalonamento por Dificuldade:**

| Dificuldade | Donuts por Rodada | Arcos | Velocidade |
|---|---|---|---|
| Fácil | 8 | Previsíveis | Lenta |
| Médio | 14 | Semi-aleatórios | Média |
| Difícil | 20 | Aleatórios + curvas | Rápida |

---

#### MINIGAME #8 — "Taco Tempestade" (Restaurante: La Cantina Loca)

**Conceito:** Tacos desmontados voam pela tela. MobDyck deve "montar na boca" — capturando os ingredientes certos na sequência indicada, como um Simon Says culinário.

**Mecânica Detalhada:**
- Uma sequência de ícones aparece no topo: Tortilha → Carne → Queijo → Guacamole → Pimenta
- Ingredientes voam de lados diferentes da tela
- MobDyck deve "mirar" e engolir na sequência exata
- Errar a sequência desmonta o taco na boca de MobDyck (animação cômica) e perde 25% do progresso
- "Taco Supremo": uma sequência de 8 ingredientes — completar sem erros dá 500 pontos

**Escalonamento por Dificuldade:**

| Dificuldade | Comprimento da Sequência | Ingredientes por Tela | Tempo para Memorizar |
|---|---|---|---|
| Fácil | 3 ingredientes | 2 ao mesmo tempo | 3 seg |
| Médio | 5 ingredientes | 4 ao mesmo tempo | 2 seg |
| Difícil | 8 ingredientes | 6 ao mesmo tempo | 1 seg |

---

#### MINIGAME #9 — "Fondue Frenético" (Restaurante: Château Suisse)

**Conceito:** MobDyck tem um garfo e deve mergulhar pedaços de comida no fondue sem deixar cair no fogo abaixo. Mecânica de equilíbrio + timing.

**Mecânica Detalhada:**
- Garfo controlado com dois analógicos (um para X, outro para Y) — mantê-lo estável é o desafio
- Pedaços diferentes exigem tempos de mergulho diferentes (indicado por barra)
- Mergulho curto demais = mal coberto (-30% pontos)
- Mergulho longo demais = caiu no fogo (-50 pontos)
- Pedaço de pão especial (marrom dourado) = pontuação máxima se mergulhado perfeitamente

---

#### MINIGAME #10 — "Sorvete Turbo" (Restaurante: Gelato Inferno)

**Conceito:** Torres de sorvete de múltiplas bolas estão derretendo. MobDyck deve lamber rapidamente (botão rápido mashing ou swipe) para comer todas antes que derretam completamente.

**Mecânica Detalhada:**
- Múltiplas torres (2 a 5) derretendo ao mesmo tempo
- Cada torre tem um "medidor de derretimento" — se chegar a 0, a bola cai e o jogador perde os pontos dela
- Bolas com sabores raros (listradas ou brilhantes) valem 3×
- Estratégia: priorizar torres que derretem mais rápido vs. towers com bolas mais valiosas
- Bola de "Sorvete Fantasma" (transparente) — invisível na maior parte, aparece brevemente: capturá-la vale 250 pontos

---

### 6.3 Restaurante Secreto — "O Banquete das Sombras"

Este restaurante só aparece quando o jogador coleta todos os itens de "Chave Gastronômica" escondidos no mapa (3 itens). Ele tem apenas um minigame:

**"O Desafio Supremo"** — Todos os 10 minigames anteriores comprimidos em sequências de 5 segundos cada, em ordem aleatória, com dificuldade máxima. Completar tudo dá 3.000 pontos base.

---

## 7. Sistema de Pontuação e Dificuldade

### 7.1 Fórmula Básica de Pontuação

A pontuação de cada restaurante é calculada da seguinte forma:

```
Pontuação Final = Pontos Brutos do Minigame × Multiplicador de Dificuldade × Multiplicador de Combo × Bônus Especiais
```

### 7.2 Multiplicadores por Dificuldade

| Nível | Multiplicador | Descrição |
|---|---|---|
| **Fácil** | × 0.5 | Debuff — o jogador recebe menos pontos para compensar a facilidade |
| **Médio** | × 1.5 | Padrão balanceado — base de 200 pontos esperados |
| **Difícil** | × 3.0 | Recompensa agressiva — alto risco, alto retorno |

**Importante:** O nível de dificuldade é definido pelo próprio restaurante (cada restaurante tem uma dificuldade fixa por dia), não pelo jogador. Ao longo da campanha, a proporção de restaurantes por dificuldade aumenta:

| Dia | Fácil | Médio | Difícil |
|---|---|---|---|
| 1 | 75% | 25% | 0% |
| 2 | 50% | 40% | 10% |
| 3 | 30% | 50% | 20% |
| 4 | 20% | 40% | 40% |
| 5 | 10% | 30% | 60% |

### 7.3 Classificação de Desempenho por Restaurante

Após cada minigame, o jogador recebe uma classificação:

| Classificação | Critério | Bônus Adicional |
|---|---|---|
| ⭐⭐⭐ Mestre Gourmet | ≥ 90% da pontuação máxima | +15% na pontuação final daquela visita |
| ⭐⭐ Chef Talentoso | 60–89% da pontuação máxima | +5% na pontuação final |
| ⭐ Comensal Honesto | 30–59% da pontuação máxima | Nenhum bônus |
| 💀 Desastre Culinário | < 30% da pontuação máxima | -5% na pontuação total acumulada |

### 7.4 Bônus Especiais de Pontuação

| Bônus | Condição | Valor |
|---|---|---|
| **Primeiro do Dia** | Primeiro restaurante visitado na sessão | +50 pts fixos |
| **Velocista** | Entrou e saiu do restaurante em menos de 20 seg | +30 pts |
| **Sem Erros** | Completou o minigame sem nenhuma penalidade | +100 pts |
| **Críticos Impressionados** | Sentou na mesa dos críticos e performou bem | +200 pts |
| **Streak Gourmet** | 3 restaurantes consecutivos com ⭐⭐⭐ | ×1.3 multiplicador em cascata |
| **Descoberta Secreta** | Entrou em restaurante escondido | +500 pts |
| **Últimos 30 Segundos** | Visitou restaurante com menos de 30 seg no timer | +150 pts (adrenalina) |
| **Humilhação do Kraken** | Pontuou mais que Chef Kraken no mesmo restaurante | +300 pts + animação especial |

### 7.5 Placares e Rankings

**Rankings Locais:** Histórico das 10 melhores pontuações do jogador por mapa/dia.

**Rankings Online:** Leaderboards globais divididos por:
- Pontuação total por sessão
- Maior pontuação em restaurante único
- Maior número de restaurantes visitados em 5 minutos
- Melhor sequência de Streak Gourmet

**Recordes Saudáveis:** O jogo exibe o "Recorde a Bater" no HUD durante a sessão — calculado como a média das melhores 3 pontuações do jogador.

---

## 8. Os Restaurantes

### 8.1 Lista Completa de Restaurantes — Mapa Base (Dia 3+)

| # | Nome | Bairro | Culinária | Minigame | Dificuldade | Capacidade |
|---|---|---|---|---|---|---|
| 1 | Sushi Tsunami | Porto Gastronômico | Japonesa | Engolida Perfeita | Médio | 4 mesas |
| 2 | Big Belly Burger | Zona Universitária | Americana | Montagem Maluca | Fácil | 8 mesas |
| 3 | Casa da Vovó Tempestade | Mercado Municipal | Caseira | Sopa do Caos | Fácil | 6 mesas |
| 4 | Pizzaria Napolitane | Rua das Nações | Italiana | Pizza Rítmica | Médio | 5 mesas |
| 5 | Ramen Tufão | Porto Gastronômico | Japonesa | Ramen Furacão | Médio | 3 mesas |
| 6 | Churrasquinho do Touro | Mercado Municipal | Brasileira | Churrasco na Brasa | Difícil | 4 mesas |
| 7 | Bakers in the Sky | Avenida Gourmet | Americana | Donut Voador | Fácil | 10 mesas |
| 8 | La Cantina Loca | Rua das Nações | Mexicana | Taco Tempestade | Médio | 5 mesas |
| 9 | Château Suisse | Avenida Gourmet | Suíça | Fondue Frenético | Difícil | 3 mesas |
| 10 | Gelato Inferno | Praça Central | Italiana | Sorvete Turbo | Fácil | 12 mesas |
| 11 | O Banquete das Sombras | Beco dos Sabores | Secreta | Desafio Supremo | Difícil Extremo | 1 mesa |
| 12 | Dim Sum Supremo | Rua das Nações | Chinesa | Panelinha Explosiva | Médio | 4 mesas |
| 13 | Pho Minh Dragon | Porto Gastronômico | Vietnamita | Caldo Infinito | Médio | 3 mesas |
| 14 | Paella Valencia | Rua das Nações | Espanhola | Arroz Explosivo | Difícil | 5 mesas |
| 15 | Crepe Fou Fou | Praça Central | Francesa | Virada Perfeita | Fácil | 8 mesas |
| 16 | BBQ Texano Último | Zona Universitária | Americana | Costela Caída | Difícil | 4 mesas |

### 8.2 Descrição Detalhada dos Restaurantes

#### Sushi Tsunami
**Estilo Visual:** Interior minimalista japonês com iluminação azul translúcida, bambus digitalizados e aquários nas paredes. A esteira de sushi é o elemento central e ocupa todo o comprimento do restaurante.

**Atmosfera:** Jazz japonês moderno, cheiro de gengibre (representado por partículas verdes), clientes NPCs com expressão séria e apreciativa.

**Donos:** Masato & Yuki — um casal de chefs que reagem ao desempenho de MobDyck com expressões exageradas. Se MobDyck for bem, eles dançam de alegria. Se for mal, Masato quebra o quadro da pontuação com o punho.

---

#### Big Belly Burger
**Estilo Visual:** Típico fast-food americano dos anos 90 com cores vibrantes (vermelho e amarelo), bancos de couro sintético, televisões com shows de culinária e piso quadriculado.

**Atmosfera:** Música pop energética, NPCs universitários gritando pedidos, cheiro de batata frita (partículas douradas flutuantes).

**Donos:** Billy e Tammy — dois irmãos exuberantes de chapéu de cozinheiro desproporcional. Eles jogam os ingredientes do hambúrguer pelo teto na abertura do minigame.

---

#### Pizzaria Napolitane
**Estilo Visual:** Trattoria italiana autêntica com tijolos aparentes, velas nas mesas, garrafas de vinho penduradas no teto e um forno a lenha enorme como peça central.

**Atmosfera:** Ópera italiana animada, NPCs com sotaque exagerado, aroma de manjericão (partículas verdes e brancas).

**Donos:** Nonno Enzo — um vovô italiano corpulento que conduz o minigame de ritmo como se fosse um concerto, gesticulando com toda a energia.

---

## 9. NPCs e Inteligência Artificial

### 9.1 Sistema de IA dos NPCs

Os NPCs de Bellyport são controlados por um sistema de IA em camadas:

**Camada 1 — Comportamento Base (Pathfinding):**
Todos os NPCs usam NavMesh para navegação. Eles percorrem rotas predefinidas com variação aleatória de ±20% na velocidade e ±15% no trajeto.

**Camada 2 — Comportamento Situacional:**
NPCs detectam MobDyck via raycast esférico de raio variável (2–6 metros dependendo do tipo de NPC). Ao detectar, alteram comportamento conforme seu tipo:
- Neutros: desviam levemente
- Obstáculo: se aproximam ou bloqueiam
- Interativos: acenam ou oferecem interação

**Camada 3 — Reatividade ao Estado do Jogo:**
Os NPCs respondem ao tempo restante e ao estado de MobDyck:
- Com menos de 60 segundos no timer, NPCs Obstáculo ficam mais agressivos
- Se MobDyck estiver em Modo Voracidade, NPCs Neutros fogem em pânico (efeito cômico)
- Se Chef Kraken estiver próximo de MobDyck, NPCs do Chef formam corredor de acesso para ele

### 9.2 Chef Kraken — IA Avançada

Chef Kraken é controlado por um sistema de IA mais sofisticado:

**Algoritmo de Rota:** Chef Kraken usa uma versão modificada do algoritmo de Traveling Salesman Problem para calcular a rota ótima entre restaurantes. Ele sempre prioriza os restaurantes de maior pontuação potencial que ainda não visitou.

**Adaptação ao Jogador:** O Chef Kraken observa os padrões do jogador ao longo da sessão:
- Se o jogador sempre vai para a esquerda primeiro, o Chef começa a ir para a esquerda também
- Se o jogador usa atalhos específicos repetidamente, o Chef começa a bloqueá-los via NPCs

**Dificuldade Adaptativa:** No modo Campanha, a dificuldade da IA do Chef Kraken se ajusta baseado no histórico do jogador:
- Se o jogador vence com margem > 30%, Chef Kraken fica mais rápido na próxima sessão
- Se o jogador perde por < 10%, Chef Kraken fica ligeiramente mais lento

### 9.3 Madame Papille — Sistema de Dicas

Madame Papille, a crítica gastronômica, é um NPC de alto valor estratégico. Ela aparece em 2–4 localizações aleatórias por sessão, sempre perto de algum restaurante. Ao interagir:

- Revela qual restaurante tem um bônus especial naquela rodada
- Alerta sobre restaurantes onde Chef Kraken planeja ir a seguir
- Pode revelar a localização do restaurante secreto (5% de chance)
- Em dias de festival avançados, fornece informação incorreta 20% do tempo (mecânica de blefe)

---

## 10. Timer e Progressão de Sessão

### 10.1 O Timer Principal

O timer de 5 minutos (300 segundos) é o coração do jogo. Ele é exibido com destaque no centro superior do HUD como um relógio analógico estilizado que "suenta" conforme o tempo passa.

**Comportamentos especiais do timer:**
- **Entre 2:00 e 1:00 restantes:** O relógio começa a vibrar levemente
- **Nos últimos 60 segundos:** Música acelera e fica mais intensa
- **Nos últimos 30 segundos:** Relógio fica vermelho e pisca
- **Nos últimos 10 segundos:** Contagem regressiva sonora a cada segundo com voz de NPC gritando

### 10.2 Extensões e Penalidades de Tempo

| Evento | Efeito no Timer |
|---|---|
| Coleta de "Temporizador de Bônus" (item raro) | +10 segundos |
| Ser capturado por NPC Obstáculo | -3 segundos |
| Abandonar minigame | -15 segundos |
| Completar minigame com classificação ⭐⭐⭐ | +5 segundos |
| Chef Kraken usar habilidade "Bloqueio de Rua" | Rua fechada por 8 segundos |
| Encontrar atalho secreto pela primeira vez | +8 segundos |

### 10.3 Resumo Pós-Sessão

Ao término dos 5 minutos, o jogo exibe uma tela de resumo detalhada:

```
╔═══════════════════════════════════════════════════════╗
║           FESTIVAL GOURMET DE BELLYPORT               ║
║                RESULTADO DA SESSÃO                    ║
╠═══════════════════════════════════════════════════════╣
║  Restaurantes Visitados: 8 / 12                       ║
║  Pontuação Total: 4.250 pts                           ║
║                                                       ║
║  DETALHAMENTO:                                        ║
║  • Sushi Tsunami (Médio):      380 pts  ⭐⭐⭐         ║
║  • Big Belly Burger (Fácil):   75 pts   ⭐⭐           ║
║  • Pizzaria Napolitane (Médio): 290 pts ⭐⭐⭐         ║
║  • ...                                                ║
║                                                       ║
║  CHEF KRAKEN: 3.900 pts                               ║
║  RESULTADO: VITÓRIA! (+350 de vantagem)               ║
╠═══════════════════════════════════════════════════════╣
║  🏆 RECORDES QUEBRADOS:                               ║
║  • Melhor Sessão Pessoal (anterior: 4.100)            ║
╠═══════════════════════════════════════════════════════╣
║  XP GANHO: +1.200  |  MOEDAS: +340                   ║
╚═══════════════════════════════════════════════════════╝
```

---

## 11. Interface do Usuário (HUD)

### 11.1 Elementos do HUD em Jogo

**HUD Principal (sempre visível):**
- Timer central (relógio estilizado)
- Pontuação de MobDyck (canto superior esquerdo)
- Pontuação do Chef Kraken (canto superior direito)
- Barra de Stamina (abaixo do timer)
- Mini-mapa (canto inferior direito) com indicadores dos restaurantes
- Indicador de Combo Gourmet (canto inferior esquerdo, aparece quando ativo)

**HUD Contextual (aparece em situações específicas):**
- Indicador de NPC próximo (ícone sobre o NPC com ação disponível)
- Preview de dificuldade ao se aproximar de restaurante (ícone flutuante)
- Barra de progresso do restaurante secreto (só aparece ao coletar a primeira Chave Gastronômica)
- Contador de Power-Up ativo (aparece embaixo da barra de stamina)

### 11.2 HUD Durante o Minigame

Durante um minigame, o HUD principal é minimizado e substituído pelo HUD do minigame:

- Pontuação em tempo real do minigame (grande, centralizado)
- Barra de progresso do minigame
- Contador de combo (quando aplicável)
- Tempo restante dentro do minigame (barra secundária menor)
- Dica de controles (aparece apenas por 3 segundos no início, some depois)

### 11.3 Menus

**Menu Principal:**
- Visual de Bellyport ao amanhecer como background animado
- MobDyck correndo no fundo como idle animation
- Botões: Jogar, Modos de Jogo, Galeria, Rankings, Configurações, Sair

**Menu de Pausa:**
- Translúcido sobre o gameplay congelado
- Timer pausado com indicação visual clara
- Opções: Continuar, Reiniciar Sessão, Ver Mapa, Configurações, Menu Principal

**Tela de Game Over (Modo Campanha):**
- Animação de Chef Kraken comemorando (com humor)
- Exibição da diferença de pontos
- Dica personalizada baseada no desempenho: "Tente visitar o Porto Gastronômico primeiro — os restaurantes lá têm maior multiplicador!"

---

## 12. Sistema de Câmera e Controles

### 12.1 Câmera em Jogo

**Modo Exploração (mapa aberto):**
- Câmera em terceira pessoa, atrás e acima de MobDyck
- Distância padrão: 5 metros
- Ângulo padrão: 30° abaixo do horizonte
- Zoom controlável pelo jogador: 3–8 metros
- Suavização (damping) para movimentos rápidos
- Colisão de câmera contra paredes e objetos

**Modo de Entrada no Restaurante:**
- Transição cinemática de 0.8 seg: câmera gira ao redor de MobDyck e aproxima
- Corte para câmera fixa do interior do restaurante

**Câmera nos Minigames:**
- Câmera fixa em posição específica por minigame
- Pequenas animações de "câmera viva" (shake suave, inclinações) para dinamismo
- Replay automático dos melhores momentos ao final de um minigame com 3 estrelas

### 12.2 Controles Mobile

Para versões mobile (iOS/Android):

- **Joystick virtual esquerdo:** Movimento de MobDyck
- **Botão de Sprint:** Canto inferior direito, pressionável
- **Botão de Ação/Interagir:** Canto inferior direito, grande e acessível
- **Toque duplo:** Esquiva/Roll
- **Swipe:** Usado em minigames de swiping (Ramen Furacão, Sorvete Turbo)
- **Minigames de botão mashing:** Botão grande centralizado para mobile

---

## 13. Arte e Direção Visual

### 13.1 Estilo Artístico Geral

MobDyck Restaurant Simulator adota um estilo **"Cartoon 3D Exagerado"** — próximo de jogos como Overcooked, A Hat in Time e Untitled Goose Game, mas com personalidade própria.

**Pilares Visuais:**
- Proporções exageradas: personagens com cabeças grandes, corpos expressivos
- Paleta de cores vibrantes e saturadas
- Linhas de contorno suaves (estilo cel-shading leve)
- Animações amplas e caricatas com squash & stretch

### 13.2 Paleta de Cores por Bairro

| Bairro | Cor Primária | Cor Secundária | Humor Visual |
|---|---|---|---|
| Praça Central | Bege claro, creme | Azul pastel, rosa | Aconchegante, turístico |
| Porto Gastronômico | Azul marinho, branco | Laranja enferrujado | Industrial marítimo |
| Rua das Nações | Multicolorido intenso | Dourado | Festivo, multicultural |
| Beco dos Sabores | Roxo escuro, preto | Neon verde, neon rosa | Misterioso, underground |
| Avenida Gourmet | Branco puro, prata | Dourado | Luxo, sofisticado |
| Mercado Municipal | Terracota, amarelo | Verde folha | Quente, caseiro |
| Zona Universitária | Colorido grafitado | Cinza concreto | Jovem, energético |

### 13.3 Design de MobDyck

**Versão Base:**
- Corpo rechonchudo oval
- Pernas curtas e ágeis
- Braços pequenos mas expressivos
- Boca enorme que ocupa quase toda a face quando aberta
- Olhos brilhantes com highlights sempre em formato de estrela quando vê comida
- Avental xadrez vermelho e branco pequeno demais
- Boné de chef branco levemente torto

**Variações Cosméticas Desbloqueáveis:**
- MobDyck Gourmet (terno + monóculo)
- MobDyck Ninja (roupa ninja com hashis como armas)
- MobDyck Chef (jaleco completo e chapéu alto)
- MobDyck Pirata (bandana, gancho no lugar de garfo)
- MobDyck Astronauta (capacete com janela de comida flutuante)
- MobDyck Rei (coroa, manto vermelho, cetro dourado)

### 13.4 Efeitos Visuais (VFX)

Cada ação importante tem partículas e efeitos visuais correspondentes:

| Ação | Efeito Visual |
|---|---|
| Engolir comida | Rastro dourado da comida à boca + estrelinhas |
| Pontuação alta | Explosão de confete colorido + número grande em pop |
| Sprint ativado | Rastro de fumaça + pegadas de velocidade |
| Modo Voracidade | Aura laranja brilhante ao redor de MobDyck + olhos brilhantes |
| Combo Gourmet | Anel dourado pulsante ao redor de MobDyck |
| Colisão com NPC obstáculo | Estrelas girando + sinal de "!" cômico |
| Entrar no restaurante | Porta brilha dourada, fragmentos de comida saem voando |
| Classificação ⭐⭐⭐ | Chuva de estrelas + MobDyck dança |

---

## 14. Trilha Sonora e Efeitos de Som

### 14.1 Música Principal

**Tema Overworld (Exploração da Cidade):**
Jazz fusion animado com percussão latina e melodia de flauta. Energético mas não cansativo. Versão acelera nos últimos 60 segundos do timer — o BPM aumenta gradualmente de 110 BPM para 165 BPM.

**Temas por Bairro:**
Cada bairro tem sua própria variação musical que funde com o tema principal:

| Bairro | Estilo Musical |
|---|---|
| Praça Central | Jazz clássico, café parisiense |
| Porto Gastronômico | Sea shanty moderno, percussão de caixotes |
| Rua das Nações | Worldbeat, instrumentos variados por trecho da rua |
| Beco dos Sabores | Lo-fi hip-hop com sintetizadores |
| Avenida Gourmet | Jazz de piano suave, elegante |
| Mercado Municipal | Samba, pandeiro, alegre |
| Zona Universitária | Pop-punk animado, guitarras |

**Temas dos Minigames:**
Cada minigame tem um tema próprio, sempre mais intenso e focado que o tema do bairro:

- Engolida Perfeita: J-pop eletrônico
- Montagem Maluca: Rockabilly americano
- Sopa do Caos: Valsa de acordeão caótica
- Pizza Rítmica: Pop italiano dos anos 80
- Ramen Furacão: Taiko drum eletrônico
- Churrasco na Brasa: Country rock brasileiro (sertanejo fusion)

### 14.2 Efeitos Sonoros

Cada ação tem um efeito de som cuidadosamente desenhado:

| Ação | Descrição do Som |
|---|---|
| Engolir comida corretamente | "Gulp" satisfatório + som musical ascendente |
| Erro/Miss | "Blop" cômico + som descendente |
| Sprint | Flatulência cômica de velocidade (humor) |
| Entrar em restaurante | Sino de porta, aroma visual correspondente |
| Combo ativado | Fanfara curta de 3 notas |
| Classificação 3 estrelas | Fanfara completa + aplausos dos NPCs |
| Chef Kraken aparece perto | Tema ameaçador de 4 notas |
| Timer < 60 segundos | Batida de coração acelerada sob a música |

### 14.3 Voice Acting

MobDyck tem linhas de voz gravadas para situações específicas:

- Ao ver comida: "FOOOOOD!" (em várias entonações)
- Ao completar minigame: exclamações de satisfação exageradas
- Ao errar: grunhidos frustrados cômicos
- Ao ver Chef Kraken: "Não desta vez, Kraken!" 
- Nos últimos 30 segundos: respiração ofegante dramática
- Ao bater recorde: grito de vitória épico

NPCs também têm linhas de voz variadas, criando um ambiente sonoro vivo.

---

## 15. Progressão e Desbloqueáveis

### 15.1 Sistema de XP e Níveis

MobDyck possui um sistema de progressão persistente baseado em XP (Experiência Gastronômica):

| Nível | XP Necessário | Recompensa |
|---|---|---|
| 1 | 0 | Personagem base |
| 2 | 500 | Skin "MobDyck Casual" |
| 3 | 1.200 | Habilidade: Faro Gourmet |
| 4 | 2.500 | Restaurante extra desbloqueado (Dim Sum Supremo) |
| 5 | 4.000 | Skin "MobDyck Chef" |
| 6 | 6.000 | Habilidade: Engolida Turbo |
| 7 | 9.000 | Mapa Dia 3 desbloqueado |
| 8 | 13.000 | Skin "MobDyck Gourmet" |
| 9 | 18.000 | Habilidade: Barriga Elástica |
| 10 | 25.000 | Acesso ao Modo Sem Fim |
| 15 | 60.000 | Skin "MobDyck Rei" |
| 20 | 150.000 | Skin "MobDyck Lendário" + Modo Festival |
| MAX (30) | 500.000 | Título: "O Devorador de Bellyport" |

### 15.2 Sistema de Conquistas

O jogo possui 60 conquistas divididas em 4 categorias:

**Categoria: Velocidade (15 conquistas)**
- "Relâmpago Culinário" — Visite 5 restaurantes em menos de 2 minutos
- "Sem Tempo a Perder" — Complete um minigame em menos de 10 segundos
- "Corredor de Comida" — Visite todos os restaurantes de um bairro sem parar
- "Últimos Segundos" — Marque pontos em restaurante com menos de 5 segundos no timer

**Categoria: Pontuação (15 conquistas)**
- "Primeira Estrela" — Consiga 3 estrelas em qualquer minigame
- "Perfeccionista" — Consiga 3 estrelas em todos os restaurantes do Dia 1
- "O Imbatível" — Vença Chef Kraken com 1.000 pontos de vantagem
- "Pontuação Lendária" — Consiga mais de 10.000 pontos em uma única sessão

**Categoria: Exploração (15 conquistas)**
- "Explorador de Sabores" — Visite todos os bairros em uma sessão
- "Caçador Secreto" — Encontre o restaurante secreto pela primeira vez
- "Amigo de Madame Papille" — Interaja com ela 10 vezes
- "Carona Culinária" — Use o Skatista Radical 5 vezes

**Categoria: Minigames (15 conquistas)**
- "Mestre do Sushi" — Consiga pontuação máxima em Engolida Perfeita
- "Rei da Pizzaria" — Complete Pizza Rítmica sem um único miss no Hard
- "Engole Tudo" — Complete o Desafio Supremo do restaurante secreto
- "Combo Eterno" — Mantenha combo ativo por mais de 3 minutos seguidos

### 15.3 Loja Cosmética

A loja oferece itens cosméticos que não afetam o gameplay:

**Skins de MobDyck:** 12 variações visuais
**Skins de Restaurante:** Redesigns visuais dos restaurantes (ex: Sushi Tsunami vira "Sushi Futurista 3000")
**Efeitos de Pontuação:** Diferentes animações de partículas ao marcar pontos
**Trilhas de Corrida:** Diferentes rastros visuais enquanto MobDyck corre
**Animações de Vitória:** Poses de celebração pós-sessão

---

## 16. Modos de Jogo

### 16.1 Modo Campanha (Solo)

Já detalhado nos capítulos anteriores. 5 Dias do Festival com narrativa e progressão contra Chef Kraken.

### 16.2 Modo Partida Rápida (Solo)

Sessão de 5 minutos em qualquer mapa desbloqueado, sem narrativa. Ideal para treino e bater recordes pessoais. A dificuldade pode ser configurada para "Caos Total" — todos os restaurantes no máximo de dificuldade.

### 16.3 Modo Contrarrelógio

Objetivo invertido: em vez de 5 minutos fixos, MobDyck deve visitar todos os restaurantes do mapa o mais rápido possível. O timer conta para cima. Rankings de tempo por mapa.

### 16.4 Modo Multiplayer Local (Até 4 Jogadores)

Até 4 jogadores na mesma tela, cada um controlando um MobDyck de cor diferente (vermelho, azul, verde, amarelo). Eles competem pelo mesmo mapa, podendo:
- Empurrar uns aos outros (colisão física)
- "Roubar" restaurantes (o primeiro a entrar bloqueia os outros por 8 segundos)
- Cooperar: se dois jogadores entrarem juntos no mesmo restaurante, o minigame tem dificuldade bônus mas dá o dobro de pontos para ambos

### 16.5 Modo Multiplayer Online

Até 8 jogadores divididos em:
- **Modo Competitivo:** Todos no mesmo mapa, maior pontuação ganha
- **Modo Cooperativo:** Time de 4 jogadores, soma de pontuações vs. Chef Kraken AI maximizada
- **Modo Torneio:** Sistema de bracket com 16 jogadores, eliminação por rodadas

### 16.6 Modo Sem Fim (Desbloqueável no Nível 10)

O mapa se expande infinitamente à medida que MobDyck avança. Novos restaurantes surgem proceduralmente, cada um mais difícil que o anterior. O objetivo é acumular pontos até um Game Over forçado (quando Chef Kraken "come" o último restaurante antes de MobDyck).

### 16.7 Modo Festival (Desbloqueável no Nível 20)

Evento especial semanal com regras únicas: novos restaurantes temporários, multiplicadores especiais e competição global em tempo real. Recompensas exclusivas são distribuídas ao top 1%, 5% e 10% dos jogadores ao final da semana.

---

## 17. Arquitetura Técnica

### 17.1 Engine e Plataformas

**Engine Recomendada:** Unity 2023 LTS com URP (Universal Render Pipeline)

Razões:
- Excelente suporte a cel-shading e estilos cartoon
- Pipeline otimizado para mobile
- Vasta biblioteca de assets e ferramentas
- Bom suporte a multiplayer com Unity Netcode

**Alternativa:** Unreal Engine 5 com Lumen e Nanite para versões de alta fidelidade em console.

### 17.2 Sistemas Técnicos Principais

**Sistema de Navegação (NavMesh):**
- NavMesh dinâmico que se atualiza ao longo da sessão
- Agentes com prioridades configuráveis por tipo de NPC
- Redes de waypoints para comportamentos de patrulha

**Sistema de Minigames (Modular):**
Cada minigame é um módulo independente:
```
MinigameBase (abstract)
├── MinigameSushi
├── MinigameBurger
├── MinigamePizza
├── MinigameRamen
└── ... (todos herdam de MinigameBase)
```
Interface padrão: `StartMinigame()`, `EndMinigame()`, `GetScore()`, `OnDifficultyChange()`

**Sistema de Eventos:**
Sistema publisher/subscriber para comunicação entre sistemas:
- `OnRestaurantEntered` → atualiza mapa, inicia minigame, para timer de combo
- `OnMinigameCompleted` → calcula pontuação, atualiza HUD, verifica conquistas
- `OnTimerExpired` → aciona tela de resultado
- `OnChefKrakenNear` → altera comportamento de NPCs, atualiza HUD

**Sistema de Pontuação:**
```
ScoreManager (Singleton)
├── currentScore: int
├── comboMultiplier: float
├── difficultyMultiplier: float
├── bonusPoints: Dictionary<BonusType, int>
├── CalculateFinalScore(): int
└── AddPoints(int base, Difficulty d, BonusType[] bonuses): void
```

### 17.3 Performance Targets

| Plataforma | Resolução Alvo | FPS Alvo | Nível de Detalhamento |
|---|---|---|---|
| PC High-End | 4K | 60–120 FPS | Ultra |
| PC Mid-Range | 1080p | 60 FPS | Alto |
| PS5 / Xbox Series X | 4K | 60 FPS | Ultra |
| Nintendo Switch | 720p (portátil) | 30 FPS | Médio |
| iOS (iPhone 13+) | 1080p | 60 FPS | Alto |
| Android (mid-range) | 720p | 30 FPS | Baixo–Médio |

### 17.4 Online Infrastructure

- **Servidor de Ranking:** Backend em cloud (AWS ou GCP) com leaderboards em tempo real
- **Multiplayer Online:** Relay servers da Unity Gaming Services para jogos com baixa latência
- **Telemetria:** Dados anônimos de gameplay para balanceamento (quais minigames têm maior taxa de abandono, quais restaurantes são mais ignorados, etc.)
- **Sistema de Update:** Patches via store updates; conteúdo sazonal via content delivery

---

## 18. Pipeline de Desenvolvimento

### 18.1 Fases do Projeto

**Fase 1 — Prototipagem (Meses 1–3):**
- Mecânica básica de movimento em 3D funcional
- 1 restaurante com 1 minigame funcional
- Timer básico
- HUD mínimo

**Fase 2 — Vertical Slice (Meses 4–6):**
- Cidade completa do Dia 1 (4 restaurantes)
- 4 minigames distintos e polidos
- Sistema de pontuação e dificuldade implementado
- Chef Kraken com IA básica
- 10 tipos de NPCs

**Fase 3 — Alpha (Meses 7–11):**
- Todos os 5 dias de campanha
- Todos os 10 minigames base
- Sistema de progressão e conquistas
- Multiplayer local funcional
- Trilha sonora completa

**Fase 4 — Beta (Meses 12–14):**
- Multiplayer online
- Balanceamento de pontuação baseado em dados
- Testes de performance em todas as plataformas
- Polimento de VFX e áudio
- Loja cosmética

**Fase 5 — Lançamento (Mês 15):**
- Versões para PC, Console e Mobile simultaneamente
- Servidor de ranking online ao vivo
- Primeiro evento de festival sazonal

**Fase 6 — Pós-Lançamento (Mês 16+):**
- DLC de novos bairros e restaurantes
- Personagens jogáveis alternativos
- Modo Versus expandido
- Colaborações temáticas (crossovers com culinária real)

### 18.2 Equipe Ideal

| Função | Quantidade |
|---|---|
| Game Designer Sênior | 1 |
| Programador Gameplay | 2 |
| Programador de Sistemas/Backend | 1 |
| Artista 3D (Personagens) | 1 |
| Artista 3D (Ambiente) | 2 |
| Artista de VFX | 1 |
| Animador | 1 |
| UI/UX Designer | 1 |
| Compositor Musical | 1 |
| Sound Designer | 1 |
| QA | 2 |
| Produtor | 1 |
| **Total** | **15** |

---

## 19. Monetização e Modelo de Negócio

### 19.1 Modelo Principal

**Preço Base:**
- PC (Steam): R$39,90 / USD 9.99
- Console: R$49,90 / USD 14.99
- Mobile: Gratuito (Free-to-Play com limitações)

### 19.2 Mobile F2P

**Modelo Mobile:**
- Sessões gratuitas: 5 por dia (recarrega com tempo)
- "Passe Ilimitado": R$19,90/mês para sessões ilimitadas
- Moedas cosméticas: compráveis com dinheiro real ou ganhas in-game
- **Zero Pay-to-Win:** Nenhum item comprado afeta pontuação ou gameplay

### 19.3 DLCs Planejados

| DLC | Conteúdo | Preço Estimado |
|---|---|---|
| "Sabores do Oriente" | 3 novos restaurantes asiáticos + bairro | R$14,90 |
| "Festival de Inverno" | Restaurantes temáticos de inverno + cosméticos sazonais | R$9,90 |
| "Chef Rivals" | 3 novos antagonistas jogáveis com mecânicas únicas | R$19,90 |
| "Megacity Bellyport" | Expansão do mapa com 2 novos bairros + 8 restaurantes | R$24,90 |

---

## 20. Glossário

| Termo | Definição |
|---|---|
| **Bellyport** | A cidade fictícia onde o jogo se passa |
| **Bônus de Adrenalina** | Pontos extras ganhos por visitar restaurante nos últimos 30 segundos |
| **Caos Total** | Dificuldade extra no Modo Partida Rápida |
| **Chef Kraken** | Antagonista principal e competidor de MobDyck |
| **Chave Gastronômica** | Item colecionável que desbloqueia o restaurante secreto |
| **Combo Gourmet** | Sistema de multiplicadores por restaurantes visitados consecutivamente |
| **Crítica Entusiasmada** | Estado especial ao atingir combo de 5 restaurantes |
| **Debuff de Dificuldade** | Redução de multiplicador em restaurantes de dificuldade Fácil (×0.5) |
| **Desafio Supremo** | Minigame do restaurante secreto |
| **Engolida Turbo** | Habilidade que reduz tempo do minigame em 10% |
| **Faro Gourmet** | Habilidade de radar para detectar restaurantes |
| **Gran Festival Gourmet** | Evento anual que define o contexto narrativo do jogo |
| **HUD** | Heads-Up Display — interface visível durante o gameplay |
| **Madame Papille** | NPC crítica gastronômica que fornece dicas |
| **Mesa de Críticos** | Mesa especial dentro dos restaurantes que concede bônus |
| **Minigame** | Desafio interativo dentro de cada restaurante |
| **MobDyck** | Personagem principal controlado pelo jogador |
| **Modo Voracidade** | Estado especial com multiplicadores dobrados por 20 segundos |
| **NavMesh** | Malha de navegação usada pelos NPCs para se deslocar pelo mapa |
| **NPC** | Non-Player Character — personagem controlado pela IA |
| **Petisco de Stamina** | Item que restaura a barra de energia de MobDyck |
| **Pontuação Bruta** | Pontos antes da aplicação dos multiplicadores |
| **Stamina** | Barra de energia que controla a duração do sprint |
| **Streak Gourmet** | Sequência de restaurantes com classificação máxima |
| **Timer** | Relógio de 5 minutos que define a duração de cada sessão |
| **XP** | Experiência Gastronômica — moeda de progressão do jogador |
| **Zona de Engolida** | Área marcada visualmente onde o input do minigame deve ocorrer |

---

## Apêndice A — Fluxo de Jogo Completo (Diagrama Narrativo)

```
INÍCIO DA SESSÃO
       │
       ▼
 Cinemática curta
 MobDyck acorda,
 cheira comida, sai
       │
       ▼
 Timer inicia: 5:00
 Mapa Aberto — Cidade de Bellyport
       │
       ├────────────────────────────────────┐
       ▼                                    │
 MobDyck se move                    Chef Kraken ativo
 pelo mapa                          no mapa (IA)
       │                                    │
       ▼                                    │
 Detecta restaurante ──────── (Kraken já entrou?)
       │                          │Sim          │Não
       │                          ▼             ▼
       │                   Esperar 10s    Entrar antes
       │                   ou ir embora   (bônus de chegada)
       ▼
 Entra no restaurante
       │
       ▼
 Tutorial flash (2 seg)
 Minigame inicia
       │
       ▼
 Executa minigame ◄──── Loop de gameplay ────┐
       │                                      │
       ▼                                      │
 Minigame encerra                             │
 (tempo ou conclusão)                         │
       │                                      │
       ▼                                      │
 Classificação exibida (⭐⭐⭐ / ⭐⭐ / ⭐ / 💀)
       │
       ▼
 Pontos calculados e adicionados
 Combo verificado
       │
       ▼
 Sai do restaurante ──────────────────────────┘
 (ou Timer chega a 0:00)
       │
       ▼
 TELA DE RESULTADO
 • Pontuação total
 • Restaurantes visitados
 • Comparação com Kraken
 • XP e moedas ganhas
 • Conquistas desbloqueadas
       │
       ▼
 Jogar Novamente / Menu / Próximo Dia
```

---

## Apêndice B — Tabela de Balanceamento de Pontuação (Referência de Design)

A tabela abaixo serve como referência para manter o balanceamento entre dificuldades e garantir que jogadores de todos os níveis tenham experiências satisfatórias.

| Restaurante | Dificuldade | Pts Mínimos | Pts Médios | Pts Máx | × Dif | Final Mín | Final Máx |
|---|---|---|---|---|---|---|---|
| Big Belly Burger | Fácil | 20 | 60 | 100 | 0.5 | 10 | 50 |
| Sushi Tsunami | Médio | 80 | 150 | 250 | 1.5 | 120 | 375 |
| Churrasquinho Touro | Difícil | 50 | 130 | 300 | 3.0 | 150 | 900 |
| Pizzaria Napolitane | Médio | 70 | 140 | 220 | 1.5 | 105 | 330 |
| Ramen Tufão | Médio | 60 | 130 | 200 | 1.5 | 90 | 300 |
| Gelato Inferno | Fácil | 30 | 70 | 120 | 0.5 | 15 | 60 |
| Château Suisse | Difícil | 60 | 150 | 320 | 3.0 | 180 | 960 |
| La Cantina Loca | Médio | 50 | 110 | 190 | 1.5 | 75 | 285 |
| Bakers in the Sky | Fácil | 25 | 65 | 110 | 0.5 | 12.5 | 55 |
| Casa da Vovó | Fácil | 20 | 55 | 90 | 0.5 | 10 | 45 |
| O Banquete Sombras | Difícil | 300 | 600 | 1200 | 3.0 | 900 | 3600 |

**Meta de Pontuação por Sessão (Modo Campanha):**

| Dia | Meta Mínima | Meta Boa | Meta Excelente |
|---|---|---|---|
| 1 | 500 | 900 | 1.500 |
| 2 | 1.200 | 2.000 | 3.200 |
| 3 | 2.500 | 4.000 | 6.000 |
| 4 | 4.000 | 7.000 | 10.000 |
| 5 | 7.500 | 12.000 | 18.000 |

---

## Apêndice C — Changelog do GDD

| Versão | Data | Alterações |
|---|---|---|
| 0.1 | Semana 1 | Conceito inicial, personagem e cidade esboçados |
| 0.2 | Semana 2 | Sistema de pontuação definido, multiplicadores balanceados |
| 0.3 | Semana 3 | 5 minigames criados e descritos |
| 0.4 | Semana 4 | Chef Kraken adicionado como antagonista ativo |
| 0.5 | Semana 5 | NPCs expandidos — 4 categorias definidas |
| 0.6 | Semana 6 | Todos os 10 minigames + restaurante secreto |
| 0.7 | Semana 7 | Sistema de progressão, conquistas e loja |
| 0.8 | Semana 8 | Modos de jogo expandidos (multiplayer, sem fim, festival) |
| 0.9 | Semana 9 | Direção de arte, trilha sonora, VFX descritos |
| 1.0 | Atual | Documento completo — aprovado para pré-produção |

---

*MobDyck Restaurant Simulator — Game Design Document v1.0*
*Todos os conceitos, personagens e sistemas descritos neste documento são propriedade intelectual do projeto.*
*"Que a fome de MobDyck inspire cada linha de código."* 🐋🍽️


Faça o jogo em React, TailwindCSS, threejs e tudo que precisar.