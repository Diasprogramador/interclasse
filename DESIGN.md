# DESIGN.md — Arena Escolar

## 1. Objective
Criar um painel de gestão de interclasse para coordenação, professores e representantes de turma. A tela principal deve responder rapidamente: o que está acontecendo agora, quais jogos vêm a seguir, quem lidera e que ação administrativa precisa ser tomada.

## 2. Product Context
- Produto: sistema interno para organizar jogos, equipes, modalidades, tabela e avisos.
- Público: coordenação escolar, professores de educação física e alunos representantes.
- Uso dominante: consulta rápida em notebook; consulta de placares e agenda em celular.
- Estado principal: campeonato em andamento, com rodada ativa e resultados recentes.

## 3. Visual Foundations
- Direção: **placar noturno escolar** — atmosfera esportiva energética com acabamento institucional.
- Cores: `--canvas #08110F`, `--surface #111C19`, `--surface-2 #17241F`, `--line #293932`, `--text #F4F6EE`, `--muted #8FA099`, `--green #B8E34B`, `--yellow #F3C84B`, `--red #EE5A4E`, `--blue #4E8CD8`.
- Tipografia: títulos em `Arial Narrow, Bahnschrift Condensed, sans-serif`; interface em `Aptos, Segoe UI, sans-serif`; dados em `Cascadia Code, Consolas, monospace`.
- Geometria: cantos de 10–14px, divisórias finas, sombras discretas; cartões são instrumentos de leitura, não decoração.
- Assinatura: faixa diagonal de placar em verde-limão atravessando a partida principal e ecoando as fitas do brasão.

## 4. Accessibility
- Texto comum com contraste mínimo AA.
- Estados de foco visíveis em verde-limão.
- Alvos de toque com pelo menos 44px no mobile.
- Informações esportivas nunca dependem apenas da cor: sempre incluem texto, ícone ou placar.
- Animações desativadas com `prefers-reduced-motion`.

## 5. Voice & Tone
- Direta, jovem e organizada.
- Vocabulário reconhecível: “Rodada”, “Turma”, “Placar”, “Modalidade”, “Classificação”.
- Ações com verbos claros: “Novo jogo”, “Registrar placar”, “Ver tabela”.
- Sem linguagem corporativa ou promocional.

## 6. Implementation Practices
- Componentes React pequenos e dados de demonstração centralizados.
- CSS com tokens; responsividade em 1180px, 860px e 560px.
- Ícones em SVG via Lucide, sem emojis decorativos.
- Estados interativos completos: hover, focus, active, modal e feedback de salvamento.

## 7. Anti-Patterns
- Não usar gradiente roxo/azul genérico.
- Não criar uma grade de cartões idênticos sem hierarquia.
- Não exagerar em sombras, glassmorphism ou brilhos neon.
- Não transformar toda ação em botão preenchido.
- Não esconder informações essenciais atrás de hover.

## 8. Decision-Making
Priorizar velocidade de leitura e ações frequentes. A referência orienta a densidade e a hierarquia, enquanto as cores e formas vêm do universo visual da escola e das faixas do brasão.

## 9. Workflow
Validar primeiro o painel principal em desktop e mobile; depois substituir dados de demonstração por API, inserir a logo oficial em alta resolução e expandir as telas de equipes, calendário e regulamento.

## Estrutura do dashboard
1. Barra lateral: marca, painel, jogos, equipes, modalidades, classificação e configurações.
2. Cabeçalho: busca, fase atual, notificações e perfil.
3. Faixa de contexto: saudação, resumo da rodada e ação “Novo jogo”.
4. Partida em destaque: modalidade, tempo/status, equipes, placar e ação para registrar resultado.
5. Agenda da rodada: lista filtrável de próximos jogos.
6. Classificação: tabela compacta por pontos e saldo.
7. Coluna lateral: progresso do campeonato, avisos e artilharia.

## Decision Trace
1. **Tema escuro institucional** — melhora a leitura de placares e aproxima o sistema da referência; custa luminosidade em ambientes externos.
2. **Verde-limão como ação principal** — deriva do verde/amarelo do brasão e cria foco; exige uso contido para não parecer neon genérico.
3. **Brasão vetorial simplificado provisório** — mantém identidade mesmo sem arquivo-fonte; será menos fiel que a logo oficial.
4. **Dashboard denso em uma tela** — reduz navegação para o coordenador; exige reorganização rigorosa no mobile.
5. **Sem fotos de atletas** — evita imagens genéricas e mantém o foco nas turmas e nos dados do campeonato.

## Anti-slop self-check
Clean: hierarquia assimétrica, conteúdo escolar específico, sem hero genérico, sem emojis e sem grade repetitiva de benefícios.

## Extensão — Gestão do evento e mata-mata
- A marca passa a usar uma reprodução vetorial do brasão enviado, mantendo as faixas, o centro esportivo e as cores verde, amarelo, azul e vermelho.
- Os ícones animados seguem o vocabulário do vídeo fornecido: órbitas, pontos sequenciais, pulsos e sinais concêntricos dentro de módulos escuros compactos.
- O chaveamento usa a lógica visual da Libertadores: fase de grupos, oitavas, quartas e semifinais em ida e volta, placar agregado e final única.
- A home inclui pulso operacional, tarefas da rodada, prévia do mata-mata e mural oficial sem perder a prioridade do placar ao vivo.
- A Central do Evento reúne checklist, ocupação, quadras, responsáveis, comunicados e ocorrências.

### Decision Trace — extensão
1. **Chaveamento horizontal por fase** — permite acompanhar o caminho inteiro até a taça como em competições continentais; em telas pequenas exige rolagem horizontal intencional.
2. **Animações restritas aos indicadores** — traduz o vídeo de ícones sem transformar todo o dashboard em uma superfície inquieta; o movimento fica menos chamativo que o material de referência isolado.
3. **Logo vetorial redesenhada** — fica nítida em sidebar, PWA e telas retina; não substitui um arquivo oficial fornecido pela escola.
4. **Central operacional separada** — diferencia tarefas de organização das telas dos atletas; adiciona uma nova área de navegação para representantes.

## Redesign 2026 — International Sports Operations

### Grounding
Identidade: **Product UI Designer com direção editorial esportiva**. A interface deve parecer uma plataforma oficial de competição escolar, não uma casa de apostas nem um dashboard gamer.

### Visual Foundations v2
- Direção: **control room + matchday programme** — precisão operacional com momentos de energia esportiva.
- `--arena-paper #F2F3EE`: fundo principal claro e levemente mineral.
- `--arena-ink #101C19`: texto e superfícies de alto contraste.
- `--arena-forest #164E3B`: cor institucional principal.
- `--arena-signal #DFFF45`: sinal exclusivo para estado ao vivo e ação primária.
- `--arena-cobalt #3158D4`: dados, links e identificação esportiva.
- `--arena-coral #F05D4E`: alertas e ocorrências.
- Tipografia display: `Archivo 700/800`, compacta e atlética, apenas em títulos e placares.
- Tipografia de interface: `Manrope 400/500/600/700`, mais humana e internacional.
- Tipografia de dados: `Roboto Mono 500/700`, usada somente em horários, placares e métricas.
- Raio dominante: 14px em superfícies grandes, 10px em controles, pílula apenas para status.
- Grid desktop: rail de 88px + conteúdo fluido em 12 colunas; mobile com navegação inferior.

### Structural Description
1. Rail lateral: brasão, cinco destinos prioritários e perfil; textos aparecem como tooltip, não como coluna larga.
2. Cabeçalho editorial: fase da competição, data e ação contextual.
3. Hero operacional: jogo ao vivo ocupa o maior campo visual; placar e tempo são a primeira leitura.
4. Próximos jogos: timeline horizontal, não tabela genérica.
5. Performance: classificação e artilharia compartilham uma área tabular calma.
6. Contexto: comunicados e progresso do time aparecem como rail secundário.
7. Mobile: placar primeiro, agenda depois, navegação fixa inferior.

### Decision Trace — redesign
1. **Tema claro como padrão** — aproxima o produto de plataformas esportivas oficiais e melhora uso em quadras iluminadas; perde parte do impacto cinematográfico do tema escuro.
2. **Rail de ícones em vez de sidebar larga** — libera área para placares e dados; exige tooltips no desktop e rótulos na navegação móvel.
3. **Uma única superfície heroica** — concentra personalidade no jogo ao vivo e reduz o efeito “grade de cartões”; outras informações ficam deliberadamente mais silenciosas.
4. **Verde institucional profundo + amarelo-sinal** — preserva a escola sem repetir o verde-limão em toda a interface; o amarelo deve ocupar menos de 8% da tela.
5. **Dados com Roboto Mono** — melhora alinhamento de placares e horários; deve ser evitada em textos longos.
6. **Animação somente em estado ao vivo e transições** — comunica mudança real; reduz o espetáculo decorativo dos indicadores antigos.

### Anti-patterns v2
- Remover títulos condensados em caixa alta usados em excesso.
- Remover cartões repetidos com borda em todas as seções.
- Não usar preto esverdeado como fundo universal.
- Não usar brilho neon, linhas diagonais ou microanimações sem significado.
- Não replicar estética de betting/cassino.
