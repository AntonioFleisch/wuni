# 105 — Design tokens e tema claro/escuro no Next

## Objetivo

Portar o sistema visual — tokens, tema claro/escuro e a base tipográfica —
de `css/style.css` para o App Router, para que a primeira página possa ser
portada em seguida.

Nada de componente de produto entra aqui: nem cartão de recomendação, nem
cabeçalho, nem filtro. Só o alicerce e o mínimo para vê-lo funcionando.

O legado continua intacto e servindo o site antigo.

## Regras

### Os tokens são copiados, não redesenhados

O bloco de tokens e os dois blocos de tema escuro são **limite declarado** no
`AGENTS.md`. Copie valor por valor de `css/style.css` (linhas 1 a 106 na
versão atual): primitivas, tokens de papel, `--radius-*`, `--shadow-*`,
`--max-width` e `font-size`.

Se um valor no destino ficar diferente do legado, é defeito — mesmo que o
novo pareça melhor.

### O tema escuro continua declarado duas vezes

`@media (prefers-color-scheme: dark)` com `:root:not([data-theme="light"])`,
**e** `:root[data-theme="dark"]`. Os dois blocos têm o mesmo conteúdo, e essa
duplicação é deliberada: um atende quem nunca escolheu tema, o outro atende
quem escolheu.

**Não** troque isso por `light-dark()` para eliminar a duplicação. A função
existe e resolveria, mas quando o navegador não a suporta a declaração
inteira é inválida e o token some — falha dura, não degradação. O público é
adolescente em telefone Android que pode estar velho.

### Uma adição autorizada: `color-scheme`

O legado não declara `color-scheme`, então em tema escuro a barra de rolagem
e os controles nativos continuam claros. Acrescente:

- `:root { color-scheme: light; }`
- dentro do `@media`, em `:root:not([data-theme="light"])`, e também em
  `:root[data-theme="dark"]`: `color-scheme: dark;`

É a única adição autorizada ao bloco de tokens nesta tarefa.

### O que vem junto e o que fica para trás

Vai para `app/globals.css`, só isto:

- os três blocos de tokens
- o reset (`* { box-sizing }`, `html { scroll-behavior }`,
  `[hidden] { display: none !important }`)
- `body`, `h1..h4`, `p`
- `.container`, `.skip-link`, `.sr-only`

**Todo o resto de `css/style.css` fica de fora.** As classes de componente
(`.rec-card`, `.chip-toggle`, `.site-header` e companhia) viram CSS Modules
junto com a página que as usa, uma spec de cada vez. `globals.css` que
acumula componente vira o `style.css` de novo.

### Fontes

O legado carrega Inter e Sora do Google Fonts por `<link>`. No Next, use
`next/font/google` para as duas, expostas como variáveis CSS, e consumidas
pelas famílias em `body` e nos títulos — com a mesma pilha de _fallback_ do
legado.

Além de eliminar requisição a terceiro e o salto de layout, isso tira uma
conexão do navegador do aluno para um domínio de rastreamento. As famílias
tipográficas não mudam: continuam Inter e Sora.

### O script anti-flash, e por que ele é exceção

Sem ele, quem escolheu tema escuro vê um lampejo branco a cada navegação,
porque o HTML chega do servidor sem saber a preferência. O legado já resolve
isso com um script inline no `<head>` (ver `recomendacoes.html`), e o porte
faz o mesmo em `app/layout.tsx`.

Isso exige `dangerouslySetInnerHTML`, que as _Convenções_ do `AGENTS.md`
proíbem sem sanitização. **Está autorizado aqui, e só aqui**, sob três
condições que fazem parte do critério de pronto:

1. O conteúdo é uma **constante literal**, declarada no próprio arquivo.
2. **Nenhuma interpolação**: nada de template string com variável, nada de
   valor vindo de props, parâmetro de rota, cookie ou requisição.
3. O script faz só isto: lê `wuni-theme` do `localStorage`, e se for
   exatamente `"light"` ou `"dark"`, estampa `data-theme` no elemento raiz.
   Envolto em `try/catch`, porque `localStorage` lança em navegação privativa.

Como o script altera o elemento raiz antes de o React hidratar, o `<html>`
precisa de `suppressHydrationWarning`.

### O toggle não decide o tema inicial

**O toggle nunca recalcula qual deveria ser o tema.** Ele descobre qual é, e
alterna a partir dali. No legado essa decisão existe em dois lugares — o
script inline e o `main.js` — e duas cópias da mesma regra divergem.

Descobrir tem dois casos, porque o tema inicial tem duas origens legítimas:

1. **`data-theme` presente** — o aluno já escolheu, o script inline estampou.
   O toggle lê o atributo.
2. **`data-theme` ausente** — o aluno nunca escolheu, e quem decidiu foi o
   `@media (prefers-color-scheme: dark)`. O toggle lê o resultado dessa
   decisão em
   `getComputedStyle(document.documentElement).colorScheme`, que devolve
   `"dark"` ou `"light"`. Valor vazio ou desconhecido conta como `"light"`.

**Não use `matchMedia` para isso.** Ele recalcularia a mesma regra que o CSS
já resolveu, e aí a preferência do sistema passaria a ser interpretada em
dois lugares — exatamente o defeito que estamos evitando. `getComputedStyle`
lê a resposta; `matchMedia` faz a pergunta de novo.

Isso torna o `color-scheme` da seção anterior **dependência funcional do
toggle**, não enfeite: sem ele o valor computado não diz nada e o botão passa
a errar o estado. Registre isso num comentário curto, tanto no CSS quanto no
componente — quem for "limpar" um dos dois precisa esbarrar no outro.

Consequência: um aluno que nunca escolheu tema continua seguindo o sistema
operacional, inclusive quando ele muda. Nada é estampado até o primeiro
clique, e é assim que deve ser — estampar por conta própria congelaria uma
preferência que o aluno não expressou.

Consequência a respeitar: no servidor não há como saber o tema, então o botão
não pode renderizar `aria-pressed` com um palpite. Renderize sem o estado e
só o defina depois de montar, senão o React reclama de hidratação e, pior, o
leitor de tela anuncia o estado errado.

**O atributo é `aria-pressed`, não `aria-expanded`.** É botão de alternância,
não revelação de conteúdo. A chave do `localStorage` continua sendo
`wuni-theme`, com hífen — não é engano de digitação, é a chave que já está no
navegador dos usuários.

## Passos

1. **`app/globals.css`** — substitui o conteúdo gerado pelo `create-next-app`
   pelo porte descrito acima. Nenhum token do scaffold (`--background`,
   `--foreground`) sobrevive.
2. **`app/layout.tsx`** — `lang="pt-BR"`, `suppressHydrationWarning` no
   `<html>`, as duas fontes por `next/font/google`, o script anti-flash,
   `metadata` com título e descrição do produto em português (nada de "Create
   Next App"), o `skip-link` como primeiro elemento do `body` e um
   `<main id="main">` envolvendo `children`, para o link ter destino.
3. **`components/ThemeToggle.tsx`** — componente de cliente, com CSS Module
   próprio. Alterna o tema, grava em `wuni-theme` dentro de `try/catch`,
   mantém `aria-pressed` e um rótulo acessível em português.
4. **`app/page.tsx` e `app/page.module.css`** — substituem a página do
   scaffold por uma **amostra temporária do sistema visual**: cada token de
   papel como uma tira com seu nome e valor, as escalas de raio e sombra, os
   quatro níveis de título, um parágrafo, o `skip-link` e o toggle.

   Ela existe para a revisão poder olhar o tema nos dois modos e nas duas
   larguras — é o equivalente visual do teste de fumaça, e **sai quando a
   landing for portada**. Escreva isso num comentário no topo do arquivo.
5. **`docs/STATE.md`** na mesma tarefa: data, commit, árvore com
   `components/`, e o registro de que o sistema visual existe no Next.

Sem dependência nova: `next/font` já vem com o Next. **Não instale**
`next-themes` nem biblioteca de tema — são trinta linhas próprias, e a
decisão de adotar biblioteca não é de uma tarefa de porte.

## Critério de pronto

1. `npm run typecheck`, `npm run lint` (com Prettier), `npm run test`,
   `npm run build` — todos limpos.
2. **Os tokens batem com o legado.** Compare os valores de `app/globals.css`
   com as linhas 1 a 106 de `css/style.css` e confirme que nenhum difere,
   fora as três linhas de `color-scheme`. Diga no relatório como comparou.
3. `dangerouslySetInnerHTML` aparece **uma vez** em todo o repositório, com
   constante literal e sem interpolação. Confirme por busca.
4. Nenhuma classe de componente do legado (`.rec-card`, `.site-header`,
   `.chip-toggle`, `.badge`, `.tag`) aparece em `app/globals.css`.
5. `git diff --stat` não mostra alteração em `js/**`, `css/**`, `*.html`,
   `lib/`, `db/` nem `server/`.
6. `package.json` e `package-lock.json` intactos.

**Fica para a revisão, e é a maior parte desta tarefa:** abrir a página no
navegador em tema claro e escuro, e em largura de desktop e de telefone;
conferir contraste, ausência de lampejo ao recarregar com tema escuro salvo,
foco visível no `skip-link`, e o `aria-pressed` mudando junto com o tema.

Os três estados iniciais que a revisão vai percorrer, e que o componente
precisa acertar — vale conferi-los ao ler o próprio código:

1. `wuni-theme` ausente e sistema no escuro → página escura, `aria-pressed`
   verdadeiro, e o primeiro clique leva para o claro.
2. `wuni-theme` ausente e sistema no claro → página clara, `aria-pressed`
   falso, primeiro clique leva para o escuro.
3. `wuni-theme` salvo contrariando o sistema → o salvo vence, sem lampejo.
Você não controla navegador — **não invente substituto para isso e não
declare verificado o que não viu**. Relate o que deixou para a revisão.

## O que NÃO tocar

- `css/style.css`, `js/**`, `*.html`. O site antigo continua funcionando.
- Os valores dos tokens e dos dois blocos de tema. Copiar é o objetivo.
- `lib/`, `db/`, `server/` — esta tarefa não toca em lógica.
- `eslint.config.mjs`, `tsconfig.json`, `next.config.ts`.
