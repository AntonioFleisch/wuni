# STATE.md — estado atual do repositório

> Apêndice volátil do `AGENTS.md`. Descreve **o que existe agora**, não o que
> foi decidido. Tudo aqui tem prazo de validade.
>
> **Última verificação:** 2026-08-31, contra o commit `d59fac4`.
> **Atualização:** quem muda a realidade atualiza este arquivo, na mesma
> tarefa. Ver *Manutenção* no `AGENTS.md`.

## Marco atual

Migração para a arquitetura alvo **ainda não iniciada**. Nenhuma tarefa de
implementação foi executada. Não existe `package.json`, `node_modules`,
TypeScript, Next.js, banco de dados nem autenticação neste repositório.

Próxima tarefa: **`docs/tasks/001-normaliza-marca-wuni.md`**, aguardando
execução.

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

Site estático. HTML5 + CSS3 + JavaScript vanilla (ES2020).

- Sem build, bundler, transpilador ou `package.json`
- Sem dependências npm
- Sem backend, API ou banco
- Única dependência externa: Google Fonts (Sora + Inter) via CDN
- Todo o estado do usuário vive em `localStorage`

## Árvore

```text
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
AGENTS.md               contexto durável
CLAUDE.md               ponteiro para AGENTS.md
docs/STATE.md           este arquivo
docs/tasks/             planos de tarefa
```

## Como rodar

```bash
python3 -m http.server 8000   # depois: http://localhost:8000
```

Abrir `index.html` com duplo clique também funciona — não há `fetch`, então
`file://` carrega tudo.

## Verificação disponível

Não há testes, linter, formatter, CI nem build. **Nenhum dos portões de
qualidade do `AGENTS.md` é executável ainda.**

A verificação hoje é abrir a página no navegador e conferir o comportamento,
em tema claro e escuro, em largura desktop e mobile.

## Restrição do código atual

Não há módulos ES. Todos os `.js` rodam em escopo global e se enxergam por
ordem de inclusão. Cada página declara sua lista:

- `index.html` → `main.js`
- `perfil.html` → `data` → `storage` → `ui` → `main` → `profile`
- `recomendacoes.html` → `data` → `storage` → `ui` → `main` → `recommendations`

Um arquivo novo precisa entrar na lista de cada página que o usa, na posição
correta da ordem de dependência. `main.js` roda em todas as páginas e assume
que `#year`, `#nav-toggle` e `#main-nav` existem.

Chaves de `localStorage` em uso: `wuni_profile` (perfil), `wuni-theme` (tema).

## O que é real e o que é maquete

Funciona de verdade: formulário de perfil, teste vocacional, cálculo de Fit
Score, classificação de chance, filtros, ordenação, tema claro/escuro.

São **maquetes estáticas em `index.html`**, sem nenhuma implementação por
trás: Plano A/B/C, comparador, simulador financeiro, calendário inteligente e
plano de preparação. A landing promete mais do que o produto entrega. Não
assuma que existe código para esses recursos.

Base de dados: 16 cursos hardcoded em `js/data.js`, sendo 11 de Administração.
Cobre 5 cidades. É ilustrativa, não uma amostra representativa.

## Bugs conhecidos

Mapeados. **Não corrija oportunisticamente** — cada um vira um plano em
`docs/tasks/`, para a correção ser revisada.

Carregam para a arquitetura nova; precisam ser resolvidos na migração:

1. `js/recommendations.js:184` descarta todo curso fora de
   `profile.interesses`, além de o Fit Score já penalizar isso com peso.
   Filtro duplo: o usuário nunca vê cursos adjacentes ao que declarou, e o
   ramo `courseMatch = 0.25` vira código morto. É defeito de **regra de
   negócio** — portar o motor sem decidir isso replica o bug no código novo.
2. `wireChipToggle` é chamado dentro de `buildChipSelect` e também
   diretamente em `js/profile.js`. Nos usos atuais os caminhos não se cruzam,
   mas um container que passe pelos dois ganha listeners duplicados e o
   toggle se anula.

Morrem com a migração; consertar agora pode ser trabalho jogado fora,
dependendo da estratégia adotada:

3. `index.html:16` lê a chave de tema `"Wunii-theme"`, mas `js/main.js:3`
   grava em `"wuni-theme"`. Na landing o tema salvo nunca é restaurado.
4. Marca inconsistente: `index.html` diz "Wunii"; `perfil.html`,
   `recomendacoes.html` e o README dizem "Wuni".

## Decisões pendentes — não decida sozinho

Se uma tarefa depender de uma delas, pare e pergunte ao mantenedor:

- **Confirmação das escolhas** de ORM, auth e CSS propostas no `AGENTS.md`.
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
