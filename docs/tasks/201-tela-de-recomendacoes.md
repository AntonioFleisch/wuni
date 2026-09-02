# 201 — Tela de recomendações

## Objetivo

Portar `recomendacoes.html` + `js/recommendations.js` para o App Router, em
`/recomendacoes`. É a primeira página de produto no Next e a primeira vez que o
motor de `lib/recommendation/` aparece para o usuário — inclusive a decisão
*perfil pesa, não corta*, que na tela vira a **seção colapsável das
secundárias**.

Três decisões já tomadas pelo mantenedor. Não as reabra:

1. **Os filtros vivem na URL** (`searchParams`), e a filtragem passa por
   `listarCursos(filtros)` — a mesma fronteira que vira consulta ao banco
   depois. A URL fica compartilhável e sobrevive ao recarregar.
2. **O perfil é lido do `localStorage` por uma ilha de cliente.** A página é
   Server Component; o ranking acontece no navegador porque é lá que o perfil
   existe hoje.
3. **Cabeçalho e rodapé do site não entram nesta spec.** Eles carregam marca e
   navegação para páginas que ainda não existem, e vêm com a landing.

O motor, o parser do perfil e a fronteira de cursos já estão prontos. Esta
tarefa é interface: ler filtro da URL, buscar cursos, ler perfil, chamar o
motor, desenhar.

## Passos

### 1. `lib/filtros/` — filtros da URL, puro e testado

Módulo novo, sem React e sem navegador. Converte o que o Next entrega em
`searchParams` — `Record<string, string | string[] | undefined>` — no `Filtros`
que `matchesFilters` já consome, mais o critério de ordenação.

Exporte de `lib/filtros/index.ts`:

- `filtrosDaBusca(params)` → `{ filtros: Filtros; ordem: CriterioOrdem }`
- `buscaDosFiltros(filtros, ordem)` → *query string* contendo **apenas** o que
  difere do padrão, para que a tela sem filtro seja `/recomendacoes` limpo
- `FILTROS_PADRAO`, `ORDEM_PADRAO`, `MENSALIDADE_TETO`

Parâmetros aceitos, todos em português como o resto do domínio:

| Parâmetro | Valores | Padrão |
| --- | --- | --- |
| `busca` | texto livre | `""` |
| `tipo` | `publica`, `privada` | vazio |
| `modalidade` | `presencial`, `hibrido`, `EAD` | vazio |
| `turno` | `matutino`, `vespertino`, `noturno`, `integral`, `EAD` | vazio |
| `ingresso` | `sisu`, `vestibular_proprio`, `enem_direto`, `historico` | vazio |
| `mensalidadeMax` | inteiro de 0 a `MENSALIDADE_TETO` | `MENSALIDADE_TETO` |
| `mecMin` | 1 a 5, passo 0,5 | `1` |
| `bolsas` | `1` liga | desligado |
| `regular` | `1` liga | desligado |
| `ordem` | `fit`, `mensalidade`, `mec`, `evasao` | `fit` |

Duas regras que valem em todo o módulo:

- **Valor que não reconheço não vira restrição.** Membro inválido de união é
  descartado, número fora de faixa ou não numérico cai no padrão, parâmetro
  desconhecido é ignorado. URL adulterada mostra cursos demais, nunca de menos
  — é a mesma postura de *falta de informação não ativa restrição*, no
  `AGENTS.md`.
- **Lista é chave repetida** (`?turno=noturno&turno=EAD`), que é o formato que
  o `Record` do Next já entrega. Vírgula **não** é separador.

`MENSALIDADE_TETO` vale 10000 e é constante deste módulo. Não reutilize
`ORCAMENTO_SEM_LIMITE` de `lib/perfil/`: hoje os dois valem o mesmo número por
coincidência, e amarrá-los faz o teto do filtro mudar sozinho no dia em que o
"sem limite" do orçamento mudar.

Testes em `lib/filtros/url.test.ts`, obrigatórios: entrada vazia devolve o
padrão; valor inválido de união é descartado sem derrubar os válidos da mesma
chave; chave repetida vira lista; `mensalidadeMax` não numérico, negativo e
acima do teto caem no padrão; `ordem=salario` — critério que não existe mais —
cai em `fit`; `buscaDosFiltros(FILTROS_PADRAO, ORDEM_PADRAO)` é vazia; ida e
volta pelos dois lados preserva um conjunto de filtros não trivial.

### 2. `lib/formato/` — mensalidade e moeda

Também puro e testado. `formatarMensalidade(faixa: FaixaMensalidade | null)`
devolve o texto da tela, em quatro casos:

- `null` → `"Não informada"`
- `{ min: 0, max: 0 }` → `"Gratuita"`
- `min === max` → o valor formatado
- `min !== max` → `"R$ X – R$ Y"`

Moeda em `pt-BR`, `BRL`, sem centavos. **`null` nunca vira zero e nunca vira
"Gratuita"** — é o erro mais caro que este modelo produz, conforme *Motor de
recomendação* no `AGENTS.md`, e existe teste para ele.

### 3. A rota — `app/recomendacoes/page.tsx`

Server Component. Ele lê `searchParams`, chama `filtrosDaBusca`, chama
`listarCursos(filtros)` e entrega `cursos`, `filtros` e `ordem` para os
componentes de cliente.

A assinatura de `searchParams` mudou entre versões do Next — **confira como a
versão instalada entrega o valor** antes de escrever a função; não a escreva de
memória.

Exporte `metadata` com título e descrição equivalentes aos do `<head>` de
`recomendacoes.html`.

Estrutura visível, na ordem do legado: hero (kicker "Recomendações", `h1`,
subtítulo), tira de resumo, nota de dados ilustrativos, e o *layout* de duas
colunas com painel de filtros à esquerda e resultados à direita.

Inclua um `<ThemeToggle />` no topo da página, para a revisão conseguir olhar
os dois temas enquanto não há cabeçalho. Um comentário curto deve dizer que ele
sai quando o cabeçalho chegar.

### 4. A ilha do perfil — `app/recomendacoes/ListaRecomendacoes.tsx`

`"use client"`. Recebe `cursos` e `ordem` por prop e é quem lê o perfil.

**Leitura do perfil, sem estado espelhado.** Use `useSyncExternalStore` no
mesmo desenho de `components/ThemeToggle.tsx`: `getSnapshot` devolve
`localStorage.getItem("wuni_profile")`, `subscribe` escuta o evento `storage`
(outra aba mexeu) e `getServerSnapshot` devolve **uma constante-sentinela de
módulo**, nunca `null`. A sentinela é o que separa "ainda não hidratou" de "não
há perfil salvo" — sem ela, o servidor renderiza o aviso de perfil ausente para
todo mundo. Ler o `localStorage` dentro de `useEffect` e guardar com
`useState` cai no `react-hooks/set-state-in-effect`, que já reprovou essa
mesma tentativa na 105.

Passe o texto lido para `parsePerfilArmazenado`. O perfil efetivo é o do estado
`ok`; nos demais estados, `perfilVazio()`.

Cálculo, nesta ordem, memoizado:

```ts
const recomendacoes = recommend(cursos, perfilEfetivo);
const { principais, secundarias } = partitionByFit(recomendacoes);
// sortRecommendations(...) em cada uma das duas listas, com a `ordem` da URL
```

Ordenar **dentro** de cada seção, e não antes de particionar: a partição é por
distância de fit e a ordenação é escolha do usuário; misturar as duas faz o
critério escolhido mover cursos entre as seções.

Aviso acima da lista, um por estado, sem link para `/perfil` — essa rota não
existe e link quebrado é pior que ausência:

- **pré-hidratação:** nenhum aviso. O servidor e a primeira renderização do
  cliente mostram a mesma coisa.
- **ausente:** "Você ainda não preencheu seu perfil. Estes resultados usam
  preferências neutras."
- **inválido:** "Não foi possível ler o perfil salvo neste navegador. Estes
  resultados usam preferências neutras."
- **ok:** uma linha dizendo que os resultados vêm do perfil salvo neste
  navegador, com o nome quando houver e os interesses quando houver.

`camposCorrigidos` **não** aparece nesta tela. Quem trata disso é a tela de
perfil; aqui seria ruído sobre um dado que o usuário não pode corrigir daqui.

Tira de resumo, contando sobre todas as recomendações (principais mais
secundárias): `baixa` → "🎯 Faculdades dos sonhos", `media` → "⭐
Faculdades-alvo", `alta` → "✅ Opções seguras". Emoji é decoração:
`aria-hidden`, com o texto carregando o significado.

Contagem de resultados acima da lista, no formato do legado: **N** opções
encontradas.

**Seção das secundárias:** um `<details>` nativo, fechado por padrão, com
`<summary>` dizendo quantas são e por que estão ali (fit mais distante do
melhor da lista). Nativo porque não precisa de estado em React nem de
`aria-expanded` escrito à mão. Se `secundarias` estiver vazia, a seção inteira
não é renderizada.

Estado vazio quando não sobra nenhum curso, com o texto do legado.

### 5. O card — `app/recomendacoes/CardCurso.tsx`

Recebe uma `Recomendacao`. Conteúdo idêntico ao `renderCard` do legado, com
três diferenças obrigatórias:

- **Sem salário médio de egressos** — saiu do modelo na 102, não volta como
  estatística nem como critério de ordenação.
- **Mensalidade pela `formatarMensalidade`** do passo 2, nunca por aritmética
  local.
- **JSX, não `innerHTML`.** O legado monta o card com `innerHTML` em quatro
  lugares; nada disso atravessa. `dangerouslySetInnerHTML` continua proibido —
  a única ocorrência autorizada no repositório é o script anti-flash de
  `app/layout.tsx`.

Os rótulos em pt-BR de turno, ingresso e custo de vida vêm de `js/data.js`
(`TURNO_LABELS`, `INGRESSO_LABELS`, `CUSTO_VIDA_LABELS`), copiados como mapas
tipados em `app/recomendacoes/rotulos.ts`. Chance segue o mapa `CHANCE_META` do
legado (cor, emoji e texto).

### 6. O painel de filtros — `app/recomendacoes/PainelFiltros.tsx`

`"use client"`. Recebe `filtros` e `ordem` por prop — o servidor já leu a URL —
e **escreve** na URL com `buscaDosFiltros` e `router.replace`, sem rolar a
página.

Controles, todos presentes no legado: campo de busca, quatro grupos de *chips*
(tipo, modalidade, turno, ingresso), dois *sliders* (mensalidade máxima, nota
MEC mínima), duas chaves (somente com bolsas, somente regulares no MEC), o
seletor de ordenação e o botão "Limpar".

- **Busca e *sliders* precisam responder na hora e navegar depois.** Estado
  local iniciado a partir da prop, e um `setTimeout` de ~300 ms guardado em
  `useRef` — limpo a cada novo toque e ao desmontar — que chama o
  `router.replace`. Estado local inicializado por prop é legítimo; **espelhar
  prop em estado dentro de `useEffect` não é**, pela mesma regra de lint citada
  no passo 4.
- **Chips são botões de alternância:** `aria-pressed` refletindo o estado, não
  só a classe `active` do legado. É melhoria deliberada sobre o original, na
  linha do que o `AGENTS.md` pede em *Acessibilidade*.
- **Ordenação sem a opção "salário"** — o dado não existe mais.
- O rótulo do *slider* de mensalidade mostra "Sem limite" no teto, e o texto de
  ajuda passa a dizer que cursos gratuitos **e cursos sem preço informado**
  sempre aparecem — é o que `matchesFilters` faz com `mensalidade: null`.
- "Limpar" leva a `/recomendacoes` sem *query*.

Não porte `js/ui.js`: o `wireChipToggle` é do legado e carrega o bug 3 do
`docs/STATE.md`.

### 7. Estilos — `app/recomendacoes/recomendacoes.module.css`

**Um módulo para a rota**, importado pelos quatro arquivos acima. A convenção é
CSS Module por componente; aqui os quatro são uma tela só, e separá-los
duplicaria as regras de *layout* que atravessam os três. É escolha desta spec,
não improviso.

Porte de `css/style.css` as regras das classes usadas por esta tela — os blocos
`.page-hero`, `.app-shell`, `.summary-strip`, `.summary-pill`,
`.disclaimer-note`, `.rec-layout`, `.filter-panel`, `.filter-group`,
`.filter-divider`, `.chip-select`, `.chip-toggle`, `.range-field`,
`.toggle-row`, `.switch`, `.switch-track`, `.results-head`, `.results-count`,
`.results-sort`, `.rec-grid`, `.rec-card` e seus filhos, `.badge`, `.tag`,
`.rec-mini-chip`, `.rec-fitscore`, `.empty-state`, `.btn`, `.btn-ghost`,
`.btn-sm`, `.kicker` — mais as *media queries* de 960 px e 640 px que os
acompanham.

- Valores copiados, não reinterpretados, como a 105 fez com os tokens.
- **Nomes em camelCase**, por ser CSS Module (`styles.recCard`).
- **Só tokens que já existem.** Se faltar um, pare e reporte: token novo é
  decisão de sistema visual, não de tela.
- `.container` é global e já está em `app/globals.css` — use como classe
  literal, não a duplique no módulo.
- **Nada entra em `app/globals.css`.** Classe de componente lá dentro é
  exatamente o que faz ele virar o `style.css` de novo.
- Os estilos de botão ficam neste módulo. Não crie componente de botão
  compartilhado agora.

### 8. Documentação

Não edite `docs/STATE.md` nem `AGENTS.md` nesta tarefa. A atualização do
`STATE.md` é do revisor, no commit da revisão — antes disso ele descreveria um
estado que ainda pode ser revertido.

## Critério de pronto

### O que você verifica, lendo saída de comando

- `npm run typecheck`, `npm run lint`, `npm run test` e `npm run build`, todos
  limpos. Sem `any` novo, sem `@ts-ignore`, sem `eslint-disable`.
- Os testes novos de `lib/filtros/` e `lib/formato/` passam, e a contagem total
  do Vitest é maior que os 73 atuais.
- A saída do `build` lista a rota `/recomendacoes`.
- Busca no diff: nenhum `dangerouslySetInnerHTML` novo — a única ocorrência no
  repositório continua sendo a de `app/layout.tsx` —, nenhum `innerHTML`,
  nenhuma menção a salário de egressos no código novo.
- `git diff` mostra `app/globals.css`, `app/page.tsx`, `lib/recommendation/`,
  `lib/perfil/`, `db/` e `server/` **inalterados**. Se algum deles precisou
  mudar, pare e reporte em vez de mudar.
- Nenhuma dependência nova: `package.json` e o *lockfile* inalterados.

### O que fica para a revisão, no navegador

O Codex CLI não controla navegador. Nada abaixo entra no seu critério de
pronto, e nada abaixo deve ser substituído por um teste que finge cobri-lo.

- Layout em largura de desktop e de telefone, nos dois temas, com contraste dos
  *badges*, *tags* e do Fit Score.
- Filtro na URL: recarregar mantém o estado, e colar a URL em outra aba
  reproduz a mesma lista.
- A seção das secundárias nasce fechada, abre e fecha.
- Com um perfil real salvo em `wuni_profile`, o Fit Score, a chance e o aviso
  mudam depois da hidratação — e não há lampejo de tema ao recarregar.
- Foco visível em todos os controles do painel, e navegação por teclado nos
  *chips*.

## O que NÃO tocar

- **`lib/recommendation/`.** Pesos, limiares, partição e assinaturas ficam como
  estão. Se a tela precisar de algo que o motor não expõe, pare e reporte — o
  motor só muda por spec própria.
- **`ORCAMENTO_SEM_LIMITE`**, de `lib/perfil/`. Não o reutilize como teto do
  filtro de mensalidade, mesmo valendo o mesmo número: são duas grandezas
  diferentes, e uni-las faz uma mudar a outra sem ninguém pedir.
- **`mensalidade: null`.** Não vira `0`, não vira "Gratuita", não é filtrado
  para fora. Preço desconhecido exibido como gratuito é o erro mais caro deste
  modelo.
- **`wuni_profile`.** Só leitura. Não regrave, não apague ao encontrar perfil
  inválido, não renomeie a chave — renomear apaga o perfil de todo usuário que
  já usou o site.
- **`app/globals.css`** — nenhuma classe de componente, nenhum token novo.
- **`app/page.tsx`**, a amostra do sistema visual. Ela sai com a landing, não
  aqui.
- **O legado** — `recomendacoes.html`, `js/**`, `css/style.css`. É fonte de
  leitura para o porte. Não conserte nada lá, inclusive os bugs conhecidos do
  `docs/STATE.md`: eles morrem junto com os arquivos.
- **Não crie `app/api/`**, nem componente compartilhado de cabeçalho, rodapé ou
  botão. Ambos vêm com a landing.
- **Nenhuma dependência nova** — nem para *query string*, nem para classes
  condicionais, nem para *slider*. Dependência fora de plano aprovado é limite
  do `AGENTS.md`.
