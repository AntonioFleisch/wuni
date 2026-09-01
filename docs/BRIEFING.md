# BRIEFING — partida do ciclo 2

> Handoff do ciclo anterior. **Sobrescrito a cada ciclo**, não acumula.
> Leia `AGENTS.md` e `docs/STATE.md` primeiro; em qualquer contradição, eles
> vencem. Escrito ao fechar o ciclo 1, no commit `ecb9564`.

## Onde paramos

Ciclo 1 entregou duas specs, ambas revisadas e aprovadas:

- **001** — marca normalizada para "Wuni" e chave de tema da landing
  corrigida. Eram o mesmo defeito: o erro de grafia estava na chave do
  `localStorage`.
- **002** — scaffold do Next 16 com App Router, TypeScript `strict`, ESLint,
  Prettier e Vitest.

O repositório deixou de ser site estático. Os quatro portões de qualidade
(`typecheck`, `lint`, `test`, `build`) são executáveis e passam. O site
legado continua no repositório como fonte para o porte; nenhuma página do
produto foi portada, e não há banco nem autenticação.

`docs/tasks/` está vazio de specs — só o README. Próxima numeração: **101**.

## O que está travado

**Confirmação de ORM, auth e CSS.** As três propostas estão no `AGENTS.md`
(Prisma, Auth.js com Google, tokens em `globals.css` com CSS Modules e sem
Tailwind) e seguem pendentes de decisão do mantenedor. Portar qualquer
página depende da de CSS.

## O que fazer primeiro

Recomendo **101 = portar o motor de recomendação** para `lib/recommendation/`
como TypeScript puro, com testes.

A razão é destravamento: o motor não depende de CSS, ORM nem auth, então é o
único trabalho de peso que anda sem as decisões pendentes. É também o código
de maior risco do produto — bug ali gera recomendação errada em silêncio — e
o `AGENTS.md` já exige teste unitário com casos de fronteira para ele. De
quebra, remove o teste de fumaça temporário do `lib/smoke.test.ts`.

**Antes de escrever a 101, resolva com o mantenedor o bug 1 do `STATE.md`**:
`js/recommendations.js:184` filtra por `profile.interesses` além de o Fit
Score já penalizar isso com peso, o que esconde cursos adjacentes do usuário
e mata o ramo `courseMatch = 0.25`. É decisão de regra de negócio, não de
código. Portar o motor sem resolver isso replica o defeito no código novo.

## Carrego junto

Pendência pequena, para entrar na 101 em vez de virar spec própria: os 16
warnings do lint são falsos positivos em `js/*.js` — o ESLint lê como módulos
o que é escopo global. `js/**` no `globalIgnores` do `eslint.config.mjs`
resolve. Detalhe e motivo no `STATE.md`.

## Como trabalhamos

- Claude planeja e revisa; Codex executa. Claude não implementa sem pedido.
- Specs proporcionais ao diff. Critério de pronto separa o que o Codex
  verifica do que fica para a revisão — ele não controla navegador.
- Spec é apagada no commit da revisão, depois de colher o durável.
- Claude commita a documentação sozinho, sem pedir — mas **não** enquanto o
  Codex estiver executando, para não mover a base de comparação dele.
- Claude encerra a resposta com "tudo pronto para o codex" quando a spec está
  pronta para execução.
