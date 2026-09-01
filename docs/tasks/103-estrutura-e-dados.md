# 103 — `db/` e `server/`, com as fronteiras verificadas

## Objetivo

Fazer a estrutura de pastas do `AGENTS.md` existir de verdade, com dado
dentro dela e com a regra de dependência **verificada pelo lint**, não
prometida em prosa.

Ao fim desta tarefa o motor deixa de ser código que ninguém chama: existe uma
função que devolve cursos, no lugar certo, com a assinatura que vai
sobreviver à chegada do banco. Continua sem tela, sem banco e sem
autenticação.

Fecha junto um buraco descoberto na revisão da 102: **o portão de lint não
verifica Prettier**, apesar de o `AGENTS.md` dizer que verifica.

## Passos

### 1. Prettier passa a ser verificado

Hoje `npm run lint` roda só o ESLint, e o `eslint-config-prettier` apenas
desliga regras conflitantes — nada confere formatação. Prova disso:
`lib/recommendation/score.ts` está em `main` fora do formato e passou nos
quatro portões.

- Faça `npm run lint` **falhar** quando um arquivo versionado e não ignorado
  estiver fora do formato do Prettier. O script passa a rodar as duas coisas;
  a forma exata é com você, que tem como consultar a versão instalada.
- Crie `.prettierignore` cobrindo o que **não** deve ser formatado: o legado
  (`js/`, `css/`, `*.html`), todo `*.md` e os artefatos de build (`.next/`,
  `out/`, `build/`). O legado sai inteiro no fim do porte e formatá-lo agora
  só suja o diff; os documentos de contexto ficam de fora porque reflow de
  tabela e de lista atrapalha a leitura deles, que é o que importa.
- Formate o que sobrou fora do padrão. Deve ser só `score.ts`; se aparecer
  mais, formate também e diga quais no relatório.

### 2. A direção de dependência vira regra de ESLint

O `AGENTS.md` define a estrutura e a direção de mão única:

```text
app/ → server/ → db/ → lib/        e  app/ → components/ → lib/
```

Traduza isso em regra de importação restrita no `eslint.config.mjs`, por
zona. O que precisa passar a **falhar o lint**:

| Em | Importar de |
| --- | --- |
| `lib/**` | `app/`, `components/`, `server/`, `db/` |
| `db/**` | `app/`, `components/`, `server/` |
| `server/**` | `app/`, `components/` |
| `app/**` e `components/**` | `db/` |

A regra precisa pegar **as duas formas de escrever o mesmo import**: pelo
alias (`@/db/...`) e por caminho relativo (`../../db/...`). Uma regra que só
pega o alias dá falsa segurança.

Mensagem de erro útil, não genérica: diga qual camada não pode importar qual,
e que a direção está no `AGENTS.md`. Quem vai ler isso é um agente às três da
manhã, não você.

**Verificação obrigatória, e ela é o critério de pronto deste passo:** para
cada linha da tabela, adicione temporariamente um import proibido, rode
`npm run lint`, confirme que falha com a mensagem certa, e desfaça. Relate no
fim quais violações você testou. Regra de lint que ninguém tentou violar não
está verificada — está escrita.

### 3. `db/seed/cursos.ts`

Os 16 cursos de `js/data.js` convertidos para o tipo `Curso` de
`lib/recommendation/`, exportados como `CURSOS_SEED: Curso[]`.

- **Sem `as` e sem anotação frouxa.** O array é tipado como `Curso[]` e o
  compilador precisa validar cada linha. Se algum valor não couber numa das
  uniões (`Turno`, `Modalidade`, `Ingresso`, `SituacaoMEC`), **pare e
  reporte**: é divergência entre o modelo e o dado, e decidir qual está
  errado não é tarefa de execução.
- `mensalidade` vira faixa degenerada — `9800` vira `{ min: 9800, max: 9800 }`
  e curso público vira `{ min: 0, max: 0 }`. **Não invente faixas.** O dado
  mockado tem valor exato; faixa de verdade e `null` chegam com a ingestão
  real, e inventar amplitude agora seria fabricar informação que ninguém
  mediu.
- `salarioMedioEgressos` não existe mais no tipo: o campo simplesmente não é
  copiado.
- Este arquivo é *seed*, não base: comente no topo que ele existe para
  alimentar o banco e os testes enquanto a ingestão das fontes oficiais não
  existe, e que 11 dos 16 cursos são de Administração — a amostra é
  ilustrativa, não representativa.

Os rótulos de exibição (`TURNO_LABELS`, `INGRESSO_LABELS`,
`CUSTO_VIDA_LABELS`) e as listas auxiliares de `js/data.js` **não entram
aqui**. Eles são texto de interface e vêm com a primeira tela.

### 4. `db/seed/cursos.test.ts` — invariantes do dado

O compilador garante forma, não coerência. Estes testes garantem o resto, e
sobrevivem à troca do *seed* por ingestão real:

- `id` único em toda a lista
- `mensalidade` é `null` ou tem `min <= max`, com ambos `>= 0`
- `notaMEC` entre 1 e 5, `taxaEvasao` entre 0 e 100, `notaCorte >= 0`
- `turnos` e `ingresso` não vazios
- a lista não está vazia

O primeiro item da segunda linha é o que importa: `{ min: 5000, max: 100 }`
passa no compilador e produz Fit Score alto. Faixa incoerente é erro de dado,
e o lugar de barrá-lo é a fronteira que carrega os dados — nunca o motor, que
por regra não se defende de entrada inválida.

### 5. `server/cursos.ts`

```ts
export async function listarCursos(filtros?: Filtros): Promise<Curso[]>
```

- Sem `filtros`, devolve o *seed* inteiro. Com `filtros`, devolve o que passa
  em `matchesFilters`, importado de `lib/recommendation/`.
- **É `async` de propósito**, mesmo sendo síncrona hoje. Quando o banco
  entrar, só o corpo muda: assinatura, chamadores e telas ficam de pé. Função
  síncrona agora obrigaria a reescrever todo consumidor depois.
- Comente isso no arquivo, em uma linha: hoje lê o *seed* em memória, amanhã
  consulta o banco, e a fronteira é esta.
- **Não aplique `atendeRestricoes` nem pontue nada aqui.** Perfil não entra
  nesta camada; ela responde "quais cursos existem dado o que o usuário
  filtrou", e nada além disso.
- Teste: sem filtros devolve os 16; com um filtro que corta, devolve menos;
  com um filtro que não casa com nada, devolve lista vazia.

**Não adicione `server-only` agora.** O `AGENTS.md` exige o marcador em
`server/` e `db/`, e ele entra junto com o banco — hoje não há segredo nem
query, e o pacote seria dependência nova fora de plano aprovado.

### 6. `docs/STATE.md`

Na mesma tarefa: data e commit no topo, árvore com `db/` e `server/`, o
buraco do Prettier marcado como resolvido, e o registro de que a direção de
dependência passou a ser verificada pelo lint — com a lista de violações que
você testou.

## Critério de pronto

1. `npm run typecheck` — zero erros.
2. `npm run lint` — zero erros e zero warnings, **agora incluindo Prettier**.
3. `npm run test` — Vitest verde, com os testes novos de *seed* e de
   `listarCursos`.
4. `npm run build` — conclui.
5. As quatro linhas da tabela do passo 2 testadas por violação temporária,
   cada uma falhando o lint. Relate quais.
6. Nenhuma dependência nova: `package.json` só muda no script de lint;
   `package-lock.json` intacto.
7. `git diff --stat` não mostra alteração em `js/**`, `css/**`, `*.html` nem
   em `lib/recommendation/` — exceto a formatação de `score.ts`, que é o
   passo 1.
8. **`score.ts` mudou só de forma.** O conteúdo do arquivo com **todo espaço
   em branco removido** precisa ser idêntico antes e depois. Não use
   `git diff -w`: ele compara linha a linha, e o Prettier une duas linhas numa
   só — mudança de estrutura de linha, que nenhuma opção de espaço do `git
   diff` ignora. Compare o conteúdo já sem espaços, por exemplo com
   `git show HEAD:lib/recommendation/score.ts | tr -d '[:space:]'` contra o
   mesmo tratamento do arquivo novo; adapte ao shell que você estiver usando.
   A segunda prova é que os 39 testes continuam passando com os mesmos
   números — eles cravam valores de Fit Score, então mudança de lógica
   aparece ali.

**Fica para a revisão:** ler o diff e conferir os 16 cursos convertidos
contra `js/data.js`, campo a campo. Nada renderiza; não há verificação
visual.

## O que NÃO tocar

- A lógica de `lib/recommendation/`. `score.ts` só é reformatado, não
  alterado — como provar isso está no critério de pronto.
- `js/**`, `css/**`, `*.html`. O legado continua com o modelo antigo.
- `app/`, `tsconfig.json`, `next.config.ts`.
- **Não crie `lib/perfil/`.** O tipo do perfil completo e o parser do
  `localStorage` são a próxima spec; misturá-los aqui enterraria lógica de
  verdade embaixo de 300 linhas de dado convertido.
