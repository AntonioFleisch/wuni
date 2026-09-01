# 002 — Scaffold do Next, TypeScript e ferramental

## Objetivo

Primeira tarefa da migração. Levanta a fundação: Next.js com App Router,
TypeScript em `strict`, ESLint, Prettier e Vitest, com os scripts npm que o
`AGENTS.md` define como portões de qualidade.

Hoje nenhum portão é executável — não há `package.json`. Depois desta tarefa
todos são, e as specs seguintes passam a ter verificação automatizada de
verdade em vez de inspeção manual.

**Escopo deliberadamente estreito.** Nada de banco, autenticação, migração de
página ou estilo. É só o esqueleto compilando e os comandos passando. As
páginas atuais serão portadas uma a uma nas specs seguintes; os estilos e o
tema, por último.

Não depende das decisões pendentes de ORM, auth e CSS — nenhuma delas afeta
um scaffold.

## Passos

### 1. Scaffold

Use a versão **estável atual** do Next com App Router e TypeScript. Não
assuma um número de versão a partir de memória: confirme a atual e os flags
de `create-next-app` antes de rodar (a skill `web_search` serve para isso).
Registre a versão instalada no `STATE.md` no passo 5.

Configuração:

- App Router, TypeScript, ESLint — sim
- **Tailwind — não.** Decisão registrada no `AGENTS.md`: o sistema de design
  tokens atual será portado para `globals.css`
- **Diretório `src/` — não.** Use `app/` e `lib/` na raiz, para os caminhos
  baterem com o `lib/recommendation/` que o `AGENTS.md` especifica
- Alias de import `@/*`

**Atenção ao `README.md`.** O `create-next-app` escreve um `README.md`
próprio e sobrescreveria o do projeto, que descreve o produto. Preserve o
arquivo atual — faça backup antes de rodar o scaffold e restaure depois, ou
gere em diretório temporário e mova só o que interessa. O `README.md` ao fim
da tarefa deve começar com `# Wuni`, como hoje.

### 2. TypeScript strict

`tsconfig.json` com `"strict": true`. Sem `any` e sem `@ts-ignore` no código
gerado.

### 3. Prettier e Vitest

Adicione Prettier e integre com o ESLint sem regras conflitantes.

Adicione Vitest. Crie um único teste de fumaça em `lib/`, que só prova que o
runner está ligado — marque no arquivo, em comentário, que ele é temporário e
será removido na spec que portar o motor de recomendação.

### 4. Scripts npm

O `package.json` deve expor exatamente estes nomes, que são os portões
definidos no `AGENTS.md`:

```json
"dev": "next dev",
"build": "next build",
"typecheck": "tsc --noEmit",
"lint": "next lint",
"test": "vitest run"
```

### 5. `.gitignore` e `STATE.md`

`.gitignore` cobrindo `node_modules/`, `.next/` e `.env*` — nenhum deles pode
ser commitado.

Atualize `docs/STATE.md`: a stack deixa de ser "site estático sem build", os
portões de qualidade passam a ser executáveis, a árvore ganha os arquivos
novos. Registre a versão do Next instalada. Atualize data e commit no topo.

## Critério de pronto

Os quatro portões passam, a partir de uma instalação limpa:

```bash
npm ci && npm run typecheck && npm run lint && npm run test && npm run build
```

Mais:

- `git status` limpo. `node_modules/` e `.next/` não aparecem como
  não rastreados — se aparecerem, o `.gitignore` está errado
- `head -1 README.md` retorna `# Wuni`
- `git diff` não mostra alteração em `index.html`, `perfil.html`,
  `recomendacoes.html`, `css/` ou `js/`
- `docs/STATE.md` atualizado

**Fica para a revisão:** confirmar que `npm run dev` serve a página inicial
padrão do Next sem erro no console do navegador.

## O que NÃO tocar

- `index.html`, `perfil.html`, `recomendacoes.html`, `css/style.css` e `js/`.
  Continuam intactos até serem portados nas specs seguintes; serão removidos
  na última delas, não agora.
- `README.md` além de preservá-lo — a reescrita para a stack nova vem depois.
- `AGENTS.md`.
- Banco, ORM, autenticação, variáveis de ambiente. Fora do escopo, e duas
  dessas decisões ainda estão em aberto.
