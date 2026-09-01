# STATE.md — estado atual do repositório

> Apêndice volátil do `AGENTS.md`. Descreve **o que existe agora**, não o que
> foi decidido. Tudo aqui tem prazo de validade.
>
> **Última verificação:** 2026-09-01, revisão da 103 sobre o commit
> `05884dc`.
> **Atualização:** quem muda a realidade atualiza este arquivo, na mesma
> tarefa. Ver _Manutenção_ no `AGENTS.md`.

## Marco atual

Migração para a arquitetura alvo **iniciada**. O scaffold do Next está
implementado; nenhuma página do produto foi portada ainda. `app/` contém
somente a página inicial padrão gerada pelo `create-next-app`.

O motor de recomendação já está portado para TypeScript puro em
`lib/recommendation/`, com Fit Score, chance, filtros, restrição factual de
localização, ordenação e partição por fit cobertos por 39 testes unitários.
Ainda não há página Next consumindo esse motor.

No modelo do motor, mensalidade é uma faixa `{ min, max } | null`: zero é
gratuito e `null` é dado desconhecido. O salário médio de egressos e seu
critério de ordenação foram removidos. O `budgetFit` agora é contínuo na
fronteira do orçamento e usa o pior caso aplicável da faixa.

Os arquivos estáticos continuam no repositório como fonte para as próximas
specs, mas não foram integrados ao App Router. `server/cursos.ts` já expõe a
fronteira assíncrona `listarCursos()` sobre o _seed_ em memória. Ainda não
existe API, banco de dados nem autenticação.

Concluídas e revisadas: **001** (marca "Wuni" e chave de tema da landing),
**002** (scaffold Next, TypeScript e ferramental — `1a75085`, `9c835f3`,
`5ade79e`, `ac0a8d6`, `0ba413c`), **101** (motor de recomendação em
TypeScript puro — `6f65c1f`, mais a correção da partição), **102**
(mensalidade como faixa, saída do salário de egressos e `budgetFit` contínuo
— `35ec681` a `fbdc3ab`), **103** (`db/seed/`, `server/cursos.ts`, fronteiras
no lint e Prettier no portão — `1b13474` a `05884dc`). Os 16 cursos do _seed_
foram conferidos campo a campo contra `js/data.js` na revisão, por script.

A partição da lista corta por **distância em pontos do maior fit**, padrão
15, e não por proporção: o Fit Score varia entre 64 e 93 contra a base atual,
então qualquer corte percentual do máximo cai abaixo do piso e deixa a seção
colapsável vazia. O porquê está em _Perfil pesa, não corta_, no `AGENTS.md`.

Próxima tarefa: **104** — `lib/perfil/` com o tipo do perfil completo e o
parser tolerante do que vem do `localStorage`, especificada em `docs/tasks/`.
É a fronteira que normaliza dado incompleto antes de o motor vê-lo, e que
vira o importador do primeiro login. Com ela pronta, a primeira tela passa a
ser portável assim que o CSS for confirmado.

### Estratégia de migração — decidida

**Reescrita de uma vez, não convivência incremental.** O front está
hospedado na Vercel e não há tráfego a preservar; nada precisa ficar no ar
durante a transição. As páginas atuais não convivem com o Next — são
substituídas.

Reescrita de uma vez descreve o resultado, não o tamanho da entrega: a
migração será quebrada em uma sequência de specs pequenas e revisáveis
(scaffold do Next, depois as páginas uma a uma, estilos e tema por último),
não numa tarefa única. Essa sequência é planejada **após o 001 ser executado
e revisado**.

Nome do produto: **Wuni**.

## Stack, hoje

- Next.js 16.3.4 com App Router, em `app/`
- React 19.2.8
- TypeScript 5.9.3 em modo `strict`
- ESLint 9.39.5 com `eslint-config-next` 16.3.4
- Prettier 3.9.6 com `eslint-config-prettier` 10.1.8
- Vitest 4.1.11
- npm com lockfile; `node_modules/` e artefatos do Next ignorados
- Fronteira de cursos em memória; sem API, banco ou autenticação
- HTML5, CSS3 e JavaScript vanilla (ES2020) legados ainda presentes
- Todo o estado do usuário legado continua em `localStorage`

## Árvore

```text
app/                    App Router; página padrão do scaffold
db/seed/                seed tipado dos 16 cursos e testes de invariantes
lib/recommendation/     motor TypeScript puro e seus testes unitários
server/                 casos de uso; listarCursos() em memória e seus testes
public/                 assets padrão do scaffold
index.html              landing institucional
perfil.html             formulário de perfil + teste vocacional
recomendacoes.html      lista filtrável com Fit Score
css/style.css           todo o CSS do site (33 KB)
js/data.js              base mockada: 16 cursos, cidades, áreas, quiz
js/storage.js           perfil no localStorage + média do ENEM
js/ui.js                helpers de chips de seleção múltipla
js/main.js              tema claro/escuro, menu mobile, animações
js/profile.js           página de perfil e teste vocacional
js/recommendations.js   Fit Score, chance de aprovação, filtros, ordenação
package.json            scripts e dependências npm
package-lock.json       lockfile da instalação
tsconfig.json           TypeScript strict e alias @/*
eslint.config.mjs       ESLint do Next integrado ao Prettier
.prettierrc.json        convenções de formatação
next.config.ts          configuração do Next
AGENTS.md               contexto durável
CLAUDE.md               ponteiro para AGENTS.md
docs/STATE.md           este arquivo
docs/tasks/             planos de tarefa
```

## Como rodar

```bash
npm ci
npm run dev   # depois: http://localhost:3000
```

Os arquivos legados ainda podem ser servidos separadamente com
`python3 -m http.server 8000` ou abertos por `file://`; isso serve apenas como
referência durante o porte e não é convivência incremental de produção.

## Verificação disponível

Todos os portões de qualidade do `AGENTS.md` são executáveis:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

O Vitest cobre o motor de recomendação, as invariantes do _seed_ e
`listarCursos()` em cinco arquivos, com 47 testes. A verificação visual
continua a cargo da revisão; a 103 não renderiza interface.

Os 16 warnings falsos positivos do legado foram eliminados ao ignorar `js/**`
no ESLint. Esses arquivos usam escopo global por ordem de `<script>`, não são
módulos, e serão removidos ao fim do porte.

O buraco do Prettier foi fechado: `npm run lint` executa ESLint e
`prettier --check .`; `.prettierignore` exclui o legado, Markdown e artefatos
de build. `lib/recommendation/score.ts`, único código que estava fora do
formato, foi reformatado sem alteração de lógica.

A direção de dependência também é verificada pelo ESLint. Foram testadas por
violações temporárias, tanto com alias quanto com caminho relativo, as quatro
zonas proibidas: `lib/` → `app/`, `components/`, `server/`, `db/`; `db/` →
`app/`, `components/`, `server/`; `server/` → `app/`, `components/`; e
`app/`/`components/` → `db/`. Todas falharam com a mensagem específica da
camada antes de os imports de prova serem removidos.

## Restrição do código atual

Esta restrição vale para o código legado. Nele não há módulos ES: todos os
`.js` rodam em escopo global e se enxergam por ordem de inclusão. Cada página
declara sua lista:

- `index.html` → `main.js`
- `perfil.html` → `data` → `storage` → `ui` → `main` → `profile`
- `recomendacoes.html` → `data` → `storage` → `ui` → `main` → `recommendations`

Um arquivo novo precisa entrar na lista de cada página que o usa, na posição
correta da ordem de dependência. `main.js` roda em todas as páginas e assume
que `#year`, `#nav-toggle` e `#main-nav` existem.

Chaves de `localStorage` em uso: `wuni_profile` (perfil), `wuni-theme` (tema).
Os separadores são inconsistentes — sublinhado num, hífen no outro — e isso
fica como está. Renomear `wuni_profile` apaga o perfil de todo usuário que já
usou o site. A chave sobrevive à migração: o `AGENTS.md` prevê importar o
perfil do `localStorage` no primeiro login.

## O que é real e o que é maquete

Funciona de verdade: formulário de perfil, teste vocacional, cálculo de Fit
Score, classificação de chance, filtros, ordenação, tema claro/escuro.

São **maquetes estáticas em `index.html`**, sem nenhuma implementação por
trás: Plano A/B/C, comparador, simulador financeiro, calendário inteligente e
plano de preparação. A landing promete mais do que o produto entrega. Não
assuma que existe código para esses recursos.

Base de dados: os 16 cursos hardcoded em `js/data.js`, sendo 11 de
Administração, foram copiados para o _seed_ tipado em `db/seed/cursos.ts`.
Cobre 5 cidades e continua ilustrativa, não representativa. O legado mantém a
mensalidade numérica; o _seed_ usa faixas degeneradas e não inclui salário.

## Bugs conhecidos

Mapeados. **Não corrija oportunisticamente** — cada um vira um plano em
`docs/tasks/`, para a correção ser revisada.

Permanecem no legado ou precisam ser resolvidos na migração:

1. `js/recommendations.js:184` descarta todo curso fora de
   `profile.interesses`, além de o Fit Score já penalizar isso com peso.
   Filtro duplo: o usuário nunca vê cursos adjacentes ao que declarou, e o
   ramo `courseMatch = 0.25` vira código morto. É defeito de **regra de
   negócio**. **Decidido em 2026-09-01** — ver _Perfil pesa, não corta_, no
   `AGENTS.md`. A 101 corrigiu o código novo: interesse pesa no Fit Score e
   não filtra. O legado continua com o defeito até ser removido, e não deve
   ser corrigido lá.
2. **`budgetFit` é descontínuo, e a favor do mais caro.** Com orçamento de
   10.000, mensalidade 10.000 pontua 0,70 e mensalidade 10.500 pontua 0,95:
   os dois ramos da função não se encontram, e estourar o orçamento em 5%
   vale mais do que caber nele. São 4,5 pontos de Fit Score, já que orçamento
   pesa 15%. Encontrado na revisão da 101, em 2026-09-01. O mantenedor
   autorizou a correção no código novo — ver _Limites_, no `AGENTS.md` —, e
   a 102 a implementou em `lib/recommendation/`. O legado continua com o
   defeito e morre com ele.
3. `wireChipToggle` é chamado dentro de `buildChipSelect` e também
   diretamente em `js/profile.js`. Nos usos atuais os caminhos não se cruzam,
   mas um container que passe pelos dois ganha listeners duplicados e o
   toggle se anula.

Resolvidos: chave de tema da landing e marca inconsistente, ambos na
tarefa 001 (`7c5329f`, `6ff81bf`).

## Decisões pendentes — não decida sozinho

Se uma tarefa depender de uma delas, pare e pergunte ao mantenedor:

- **CSS:** confirmação da proposta do `AGENTS.md` (tokens em `globals.css` +
  CSS Modules, sem Tailwind). Trava o porte de qualquer página.
- **ORM e auth:** adiados pelo mantenedor em 2026-09-01 — nenhuma spec do
  ciclo 2 depende deles. Em auth, Clerk entrou como alternativa ao Auth.js.
- **Origem dos dados de cursos:** curadoria manual no banco ou ingestão de
  bases oficiais (Censo INEP, notas de corte SiSU, cadastro e-MEC). Muda o
  esquema e obriga a tratar licença e atribuição das fontes.
- **Escopo do primeiro marco:** qual das maquetes da landing vira produto
  primeiro.

## Ambiente dos agentes

Codex CLI, conforme `~/.codex/config.toml`:

- `sandbox_mode = "workspace-write"` — escreve no diretório do projeto
- `network_access = true` — **consegue** rodar `npm install`. O limite do
  `AGENTS.md` sobre dependências é regra, não impedimento técnico
- `approval_policy = "on-request"`
- Projeto marcado como `trust_level = "trusted"`
