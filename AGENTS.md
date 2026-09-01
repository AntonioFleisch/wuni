# AGENTS.md

Fonte única de contexto para agentes trabalhando neste repositório.
Se algo aqui contradiz o que você inferiu do código, este arquivo vence —
e avise o mantenedor.

> **Leia `docs/STATE.md` antes de qualquer tarefa.** Este arquivo contém o que
> é **durável**: produto, arquitetura alvo, convenções, limites, papéis.
> O `STATE.md` contém o que é **volátil**: o que existe no repositório agora,
> bugs abertos, decisões pendentes. Os dois são obrigatórios.
>
> Separação deliberada: descrição de estado apodrece a cada commit e arrasta
> junto o contexto durável, que passa a ser lido com desconfiança. Isolando o
> volátil, este arquivo muda raramente e pode ser tratado como confiável.

> **Atenção.** A migração começou. O Next, o TypeScript e o ferramental já
> existem; o site estático legado continua no repositório como fonte para o
> porte, e ainda não há banco nem autenticação. Nenhuma página do produto foi
> portada. O `STATE.md` diz exatamente o que já existe — consulte-o antes de
> assumir que qualquer parte da *Arquitetura alvo* está construída.

## O produto

Plataforma de orientação universitária para o Brasil. Cruza o perfil do aluno
(desempenho no ENEM, orçamento, localização, preferências) com uma base de
cursos e instituições para responder: *quais faculdades fazem sentido para
este aluno e qual é o caminho até elas.*

Público: alunos de 2º/3º ano do ensino médio e vestibulandos; secundariamente
pais, escolas e cursinhos.

Estágio: MVP mínimo, prestes a ser reescrito.

## Arquitetura alvo — em construção

- **Framework:** Next.js (App Router) + TypeScript em modo `strict`
- **Banco:** PostgreSQL
- **Contas de usuário:** haverá autenticação. O perfil deixa de viver no
  `localStorage` e passa a ser do usuário, no servidor
- **Dados:** base própria de cursos e instituições no banco, não mais
  hardcoded. Os cursos mockados atuais viram *seed* inicial
- **Deploy:** Vercel
- **Estratégia:** reescrita de uma vez, sem convivência incremental. Não há
  tráfego a preservar, nada precisa ficar no ar durante a transição. Mas a
  entrega é fatiada em specs pequenas e revisáveis — scaffold, páginas uma a
  uma, estilos e tema por último —, nunca uma tarefa única

### Regra estrutural mais importante

O motor de recomendação vira **TypeScript puro, sem dependência de React,
de banco ou de rede**, isolado em `lib/recommendation/`. Recebe perfil e
lista de cursos como argumentos, devolve resultados. Nada de `document`,
nada de `fetch`, nada de import de componente ou de ORM.

É a regra de negócio central do produto e a única parte onde bug silencioso
produz recomendação errada sem ninguém perceber. Isolada, é testável em
milissegundos sem navegador e sem banco. **Nenhum plano deve acoplar o motor
a framework, ORM ou DOM.**

### Escolhas de implementação — proposta, pendente de revisão

Adote apenas depois que o mantenedor confirmar:

- **ORM:** Prisma. `schema.prisma` é arquivo único e legível, migrations
  determinísticas — ambos importam com dois agentes editando o mesmo esquema.
  Drizzle é a alternativa razoável, mais leve e SQL-first.
- **Auth:** Auth.js (NextAuth v5), Google OAuth como método principal.
  O público é adolescente; conta Google é o que eles já têm.
- **CSS:** portar os design tokens e o sistema de tema claro/escuro atuais
  para `globals.css`, e usar CSS Modules por componente. **Não** adotar
  Tailwind na migração — o sistema visual existente funciona, reescrevê-lo
  junto com tudo o mais é risco sem ganho.
- **Perfis existentes:** no primeiro login, oferecer importar o perfil que
  estiver no `localStorage` daquele navegador.

## Portões de qualidade

Executáveis desde a spec 002.

Uma tarefa só está pronta quando **todos** passam:

| Comando | Portão |
| --- | --- |
| `npm run typecheck` | `tsc --noEmit`, zero erros. TS `strict`, sem `any` novo, sem `@ts-ignore` |
| `npm run lint` | ESLint zero erros, Prettier aplicado. A partir do Next 16 o `build` não roda mais o linter — este portão é o único que cobre lint |
| `npm run test` | Vitest verde |
| `npm run build` | `next build` conclui |

Mais a verificação no navegador, em tema claro e escuro, em largura desktop
e mobile. **Essa parte é da revisão, não do Codex** — ele não controla
navegador (ver *Skills*). Todo plano deve separar o que o executor verifica
do que fica para o revisor, para não pedir a ele o que ele não alcança.

Onde teste é obrigatório e onde não é:

- **`lib/recommendation/` exige teste unitário.** Toda função exportada, com
  casos de fronteira: perfil sem interesses, orçamento zero, nota de corte
  ausente, ENEM incompleto, lista de cursos vazia. Mudar peso ou limiar sem
  teste correspondente é tarefa incompleta.
- **Camada de dados exige teste** nas queries que filtram ou ordenam cursos.
- **Componentes de UI não exigem** teste unitário. O custo não se paga agora.
- **E2E (Playwright)** entra depois, só nos fluxos críticos: cadastro,
  preencher perfil, ver recomendações. Não é portão até existir.

## Convenções

Valem hoje e devem sobreviver à migração.

**Idioma.** Identificadores de domínio em português (`curso`, `instituicao`,
`mensalidade`, `notaCorte`, `interesses`); infraestrutura e verbos em inglês
(`getProfile`, `calculateFit`, `renderCard`). Mantenha a divisão — inclusive
em colunas de banco e tipos TypeScript. Toda a UI é pt-BR.

**Código.** Indentação de 2 espaços, aspas duplas, ponto e vírgula, `const`
por padrão.

**Segurança de renderização.** `dangerouslySetInnerHTML` proibido sem
sanitização explícita. Passa a importar de verdade quando os dados de cursos
vierem do banco.

**CSS.** Design tokens em `:root`. O tema escuro é declarado **duas vezes**:
em `@media (prefers-color-scheme: dark)` e em `[data-theme="dark"]`. Ao
adicionar um token, adicione nos três blocos. Classes em kebab-case, nomeadas
por componente (`rec-card`, `chip-toggle`).

**Acessibilidade.** `skip-link`, `aria-expanded` no menu e no toggle de tema,
e o contraste dos tokens já existem. Devem chegar inteiros do outro lado da
migração. Não regrida.

**Commits.** Mensagens curtas em minúscula. Sem convenção de prefixo.

## Motor de recomendação

`calculateFit` soma sete fatores normalizados em 0–1, com pesos:
interesse no curso 30%, orçamento 15%, nota MEC 15%, compatibilidade acadêmica
15%, localização 10%, modalidade 10%, turno 5%.

`calculateChance` classifica pela razão `média ENEM / nota de corte`:
≥ 1.05 alta, ≥ 0.93 média, abaixo baixa. A escolha por faixas em vez de
percentual é deliberada — o produto evita falsa precisão do tipo "83% de
chance". Mantenha a postura, inclusive no texto da interface.

## Limites — não altere sem pedido explícito

- Bloco de design tokens e os dois blocos de tema escuro do CSS
- Copy, headline e posicionamento de marca em `index.html`
- Pesos do `calculateFit` e limiares do `calculateChance`
- Introdução de dependências ou etapa de build fora de um plano aprovado.
  O Codex tem acesso a rede e **consegue** rodar `npm install` — isto é regra,
  não impedimento técnico
- O modelo de dados do perfil, uma vez no banco: mudança exige migration
  explícita, nunca alteração direta de esquema
- Segredos, credenciais e `.env`: nunca commitados, nunca impressos em log

## Papéis

- **Claude Code** planeja e revisa. Escreve os planos em `docs/tasks/`.
  Não implementa, salvo pedido explícito do mantenedor.
- **Codex CLI** executa, seguindo o plano do arquivo de tarefa.

Um plano é a especificação completa da tarefa. Se estiver ambíguo ou
contradisser o código, pare e reporte — não improvise.

## Sessões

Este arquivo e o `STATE.md` **são** o mecanismo de continuidade entre
sessões. Se uma sessão nova não consegue retomar o trabalho lendo os dois, o
que falta se escreve neles — não se resolve mantendo sessão viva.

- **Codex: uma sessão por spec.** Lê o `AGENTS.md` e a spec, executa,
  reporta, encerra. Nunca atravessa duas specs — o risco não é contexto
  cheio, é lembrar de estrutura de árvore que mudou.
- **Claude Code: uma sessão por ciclo de spec** — escrever, aguardar
  execução, revisar. Entre specs diferentes, reset. A centena no nome do
  arquivo marca o ciclo (ver `docs/tasks/README.md`).
- **Resete agora** se um agente citar caminho ou comando que não existe,
  reabrir decisão já registrada aqui, ou precisar da mesma correção duas
  vezes.
- O Codex roda com `memories = true` no `~/.codex/config.toml`, então
  persiste memória por um canal fora destes documentos e fora da nossa
  revisão. Se ele agir com base em algo que não está escrito aqui, é o
  primeiro lugar para olhar.

## Decisões descartadas

Registradas para não serem reabertas a cada sessão. Alternativa recusada é
tão durável quanto a escolhida — sem isso, cada agente novo repropõe a mesma
coisa.

- **Tailwind na migração** — o sistema de tokens atual funciona; reescrevê-lo
  junto com o resto é risco sem ganho
- **Migração incremental**, com as páginas antigas convivendo — não há
  tráfego a preservar
- **Diretório `src/`** — `app/` e `lib/` na raiz, para bater com o
  `lib/recommendation/` especificado aqui
- **Fixar Next 15.5** para manter o `next lint` — começaria a migração já
  devendo uma atualização
- **Pasta de logs como camada de contexto** — `AGENTS.md`, `STATE.md`,
  `docs/tasks/` e o histórico do git já cobrem; um quarto lugar guardando
  estado passado seria lido como vigente

## Skills — quem usa o quê

Os dois agentes têm skills instaladas, algumas em comum. A divisão segue os
papéis: **Claude Code usa skill para especificar e inspecionar; Codex usa
skill para construir e verificar.** Onde a skill é a mesma, o produto é
diferente — de um lado a especificação escrita no plano, do outro o código.

### Codex — construir e verificar

**O Codex CLI não controla navegador.** Nenhuma tarefa pode ter verificação
visual no seu critério de pronto. Toda checagem que exija olhar a página
renderizada — layout, contraste, flash de tema, comportamento responsivo —
pertence à revisão, e o plano deve dizer isso explicitamente para o Codex não
improvisar um substituto.

| Skill / ferramenta | Quando | Por quê |
| --- | --- | --- |
| `node_repl` (MCP) | Enquanto não houver Vitest, **se disponível no CLI** | Executa a lógica do motor e confere saídas sem navegador. Ponte para o período pré-migração. Confirme que responde antes de um plano depender dele |
| `frontend-design` | Implementando componentes | Direção visual ao escrever o código, dentro do que o plano especificou |
| `web_search` (`live`) | APIs de Next 15+, Prisma, Auth.js; formatos INEP/SiSU/e-MEC | Estas APIs mudaram recentemente. Confirmar a assinatura atual custa menos que depurar código escrito de memória |
| `commit-commands` | Ao fim da tarefa | Higiene de commit e PR |

**Não usar sem pedido:** `sites` (hospedagem própria — o deploy é Vercel),
`documents` / `pdf` / `spreadsheets` / `presentations` (irrelevantes aqui).

**Cuidado ao inventariar capacidades do Codex.** O `~/.codex/config.toml`
lista plugins do aplicativo desktop, que **não** estão todos disponíveis no
CLI — `browser` é o caso conhecido. Presença no `config.toml` não é prova de
capacidade. Antes de escrever um plano que dependa de uma ferramenta,
confirme que ela responde no CLI; na dúvida, mova a verificação para a
revisão.

### Claude Code — especificar e inspecionar

| Skill | Quando | Por quê |
| --- | --- | --- |
| **`code-review`** | Em diff com lógica: motor, queries, auth, componente novo. Diff trivial (renomeação, string, config) revisa direto | É o núcleo do papel de revisor, mas desproporcional em mudança mecânica. `/code-review ultra` é acionado só pelo mantenedor |
| **`security-review`** | **Obrigatória** em todo plano que toque auth, sessão, query ou `.env` | Contas de usuário e banco entram agora; é onde erro vira vazamento de dados de menores de idade |
| `ui-ux-pro-max` | Escrevendo plano de tela | Cobre React/Next, paletas, tipografia e diretrizes de UX. O plano sai com a especificação pronta, e o Codex não improvisa design |
| `ckm-design-system` | Plano de portar os tokens para o Next | Arquitetura de tokens em camadas. Ponto de maior risco visual da migração |
| `dataviz` | Antes de especificar qualquer gráfico | Fit Score, comparador e simulador financeiro são visualização. Carregar antes de escrever a spec, não depois |
| `frontend-design` | Definindo direção estética no plano | Evita que a interface nova caia no visual genérico |
| `symdex-code-search` | Mapeando o código antes de planejar | Localiza definições e chamadas sem varrer arquivo por arquivo |
| `simplify` | Depois que um recurso assenta | Passada de qualidade — reuso, simplificação. Não caça bugs; isso é `code-review` |
| `graphify` | Antes de modelar o esquema do banco | Mapeia o domínio (aluno, curso, instituição, processo seletivo, chance) em grafo, expondo relação que o esquema precisa suportar |
| `claude-api` | Só se entrar recurso com LLM | Ex.: teste vocacional interpretado por modelo. Não usar antes disso |

**Agentes** (`Explore`, `Plan`, `general-purpose`): só a pedido explícito do
mantenedor. Não são acionados por conta própria.

### Regra de sobreposição

`frontend-design`, `design`, `figma`, `context-engineering`, `skill-creator`
e `claude-md-management` estão instaladas nos dois lados. Quando a decisão de
design já está no plano, o Codex **implementa**, não a reabre. Divergiu do
plano? Pare e reporte — não redecida.

## Manutenção deste arquivo

- **`docs/STATE.md` é atualizado na mesma tarefa** que muda algo que ele
  descreve — estrutura, bug conhecido, portão de qualidade —, junto com a
  data e o commit no topo. Erro ali é corrigido na revisão. Não é passo
  separado.
- **`AGENTS.md` é atualizado apenas pelo Claude Code**, por instrução do
  mantenedor. O Codex não edita este arquivo; se algo aqui estiver errado,
  reporte em vez de corrigir.
- **A spec é apagada quando a revisão passa**, no mesmo commit da revisão,
  pelo Claude Code. Antes de apagar, o que for durável nela — uma decisão
  tomada, uma restrição descoberta, uma armadilha que vale lembrar — migra
  para o `AGENTS.md` ou para o `STATE.md`. Só então some.

  O conteúdo não se perde: `git log -- docs/tasks/NNN-*.md` devolve a spec
  inteira, e o `STATE.md` guarda o número e os commits em *Concluídas*.
  Apagar serve para que `docs/tasks/` signifique exatamente uma coisa —
  **trabalho ainda não feito**. Spec concluída que fica visível vira
  instrução obsoleta lida como vigente, e é assim que um agente reconstrói a
  arquitetura antiga por engano.
- Fato que muda a cada commit vai para o `STATE.md`. Fato que vale por meses
  vai para cá. Na dúvida, `STATE.md`.
