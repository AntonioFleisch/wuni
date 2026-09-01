# 101 — Portar o motor de recomendação para `lib/recommendation/`

## Objetivo

Levar Fit Score, chance de aprovação, filtros e ordenação de
`js/recommendations.js` para `lib/recommendation/` como TypeScript puro e
testado: sem DOM, sem React, sem rede, sem ORM. É a regra de negócio central
do produto e a única parte onde bug silencioso produz recomendação errada sem
ninguém perceber.

O porte também corrige, **no código novo**, um defeito de regra de negócio do
motor atual (ver *Regra de negócio decidida*), remove o teste de fumaça
temporário e cala os 16 warnings de lint do legado.

Nada de interface entra nesta tarefa: nenhuma página consome o motor ainda. O
legado `js/*.js` **não é alterado** — as páginas antigas continuam
funcionando como referência até serem portadas.

## Regra de negócio decidida

Decisão do mantenedor em 2026-09-01, e a razão de a 101 existir antes das
specs de tela. **Perfil pesa, não corta.**

- **`interesses` nunca filtra.** O motor atual descarta todo curso fora de
  `profile.interesses` *além* de o Fit Score já penalizar isso com 30% de
  peso. Filtro duplo: o aluno nunca vê cursos adjacentes ao que declarou, e o
  ramo `courseMatch = 0.25` é código morto. No código novo o interesse existe
  só como peso, e esse ramo volta a ser alcançável.
- **Fit baixo não some, é relegado.** Como nada mais é descartado por perfil,
  o motor expõe `partitionByFit`, que separa a lista em principais e
  secundárias por **distância em pontos do maior Fit Score da própria
  lista**, padrão 15. Onde e como exibir as secundárias — a aba colapsável —
  é decisão da spec de tela, não desta.

  O corte é por distância, e não por proporção do máximo, porque proporção
  não separa nada: os sete fatores dão ao Fit Score piso alto, e contra os 16
  cursos mockados ele varia entre 64 e 93 no perfil padrão. Metade do maior
  daria 46,5 e deixaria a seção colapsável sempre vazia. Com 15 pontos, o
  perfil padrão relega os cinco cursos fora da área declarada e mantém as
  onze Administrações. Não substitua por percentual.
- **Uma única exceção fica sendo corte:** `aceitaMorarFora === false` com
  `cidadesAceita` não-vazia. Não poder mudar de cidade é restrição factual,
  não preferência; um peso de 10% não seguraria isso. Fica isolada em
  `atendeRestricoes`, para ser a única linha a mudar se a decisão mudar.

## Passos

Todos os arquivos novos ficam em `lib/recommendation/`. Nomes de domínio em
português, verbos e infraestrutura em inglês, conforme `AGENTS.md`.

### 1. `types.ts`

Tipos do domínio. Os nomes de campo de `Curso` são **idênticos** aos objetos
de `js/data.js` — aqueles dados viram o *seed* do banco, e divergir agora
cria trabalho de tradução depois. Isso inclui a estranheza de `Curso.curso`
ser o nome do curso.

```ts
export type Turno = "matutino" | "vespertino" | "noturno" | "integral" | "EAD";
export type Modalidade = "presencial" | "hibrido" | "EAD";
export type Ingresso = "sisu" | "vestibular_proprio" | "enem_direto" | "historico";
export type TipoInstituicao = "publica" | "privada";
export type CustoVida = "baixo" | "medio" | "alto";
export type SituacaoMEC = "regular" | "em_avaliacao";
export type Chance = "alta" | "media" | "baixa";

export interface Curso {
  id: string;
  curso: string; // nome do curso, p. ex. "Administração"
  instituicao: string;
  cidade: string;
  estado: string;
  tipo: TipoInstituicao;
  modalidade: Modalidade;
  duracaoSemestres: number;
  turnos: Turno[];
  ingresso: Ingresso[];
  notaCorte: number;
  mensalidade: number;
  bolsas: boolean;
  custoVidaCidade: CustoVida;
  notaMEC: number;
  taxaEvasao: number;
  salarioMedioEgressos: number;
  situacaoMEC: SituacaoMEC;
}

export interface NotasEnem {
  linguagens?: number;
  humanas?: number;
  natureza?: number;
  matematica?: number;
  redacao?: number;
}

export interface Perfil {
  enem: NotasEnem;
  orcamentoMensal: number;
  interesses: string[];
  cidadesAceita: string[];
  aceitaMorarFora: boolean;
  turno: Turno[];
  modalidade: Modalidade[];
}

export interface Recomendacao {
  curso: Curso;
  fit: number; // inteiro 0–100
  chance: Chance;
}
```

Duas observações que valem para todo o resto da tarefa:

- `Perfil` é **o recorte que o motor consome**, não o perfil inteiro do
  aluno. `nome`, `anoEscola`, `ppi`, `pcd`, `rendaPerCapita` e afins não
  entram aqui — o motor não os usa. O perfil completo será tipado onde ele
  for persistido.
- Os campos de `Perfil` são **obrigatórios**, e só as notas do ENEM são
  opcionais. O legado se defende com `profile.interesses || []` porque lê de
  `localStorage`; aqui quem normaliza é a fronteira que carrega o perfil, não
  o motor. "Sem interesses" é `[]`, não `undefined`.
- `situacaoMEC` admite `"em_avaliacao"`, valor que a base mockada atual não
  contém, mas que a interface legada já renderiza.

### 2. `score.ts`

Três funções. **Copie a aritmética do legado sem ajustar nada** — pesos e
limiares são limite declarado no `AGENTS.md`. A referência é
`js/recommendations.js` (`calculateFit`, `calculateChance`) e
`js/storage.js` (`enemMedia`).

- `enemMedia(enem: NotasEnem): number` — soma as cinco notas, tratando
  ausente como `0`, e **divide sempre por 5**. Preserve isso: nota faltando
  puxa a média para baixo em vez de ser ignorada. É o comportamento atual;
  mudá-lo é decisão de produto e não pertence a um porte.
- `calculateFit(curso: Curso, perfil: Perfil): number` — sete fatores
  normalizados em 0–1, combinados com os pesos abaixo e devolvidos como
  inteiro via `Math.round(weighted * 100)`:

  | fator | peso | regra |
  | --- | --- | --- |
  | `courseMatch` | 30% | sem interesses → `0.6`; interesse contém `curso.curso` → `1`; senão → `0.25` |
  | `budgetFit` | 15% | `mensalidade === 0` → `1`; dentro do orçamento → `max(0.7, 1 - (mensalidade / orcamento) * 0.3)`, com `orcamento` zero tratado como folga `1`; acima do orçamento → `max(0, 1 - (mensalidade - orcamento) / max(orcamento, 1))` |
  | `qualityFit` | 15% | `notaMEC / 5` |
  | `academicFit` | 15% | `ratio = notaCorte > 0 ? enemMedia / notaCorte : 1`; depois `min(1, max(0, (ratio - 0.7) / 0.5))` |
  | `locationFit` | 10% | `aceitaMorarFora` ou sem cidades → `1`; cidade aceita → `1`; senão → `0.3` |
  | `modalidadeFit` | 10% | sem preferência → `1`; casa → `1`; senão → `0.2` |
  | `turnoFit` | 5% | sem preferência → `1`; algum turno do curso na preferência → `1`; senão → `0.3` |

- `calculateChance(curso: Curso, perfil: Perfil): Chance` — `notaCorte`
  ausente ou zero → `"alta"`. Senão, `enemMedia / notaCorte`: `>= 1.05`
  `"alta"`, `>= 0.93` `"media"`, abaixo `"baixa"`. A classificação é por
  faixa de propósito; não devolva percentual.

### 3. `filters.ts`

```ts
export interface Filtros {
  busca: string;
  tipo: TipoInstituicao[];
  modalidade: Modalidade[];
  turno: Turno[];
  ingresso: Ingresso[];
  mensalidadeMax: number;
  mecMin: number;
  somenteBolsas: boolean;
  somenteRegular: boolean;
}
```

- `matchesFilters(curso: Curso, filtros: Filtros): boolean` — porte de
  `courseMatchesFilters`, **sem as duas checagens finais**, que hoje vêm do
  perfil (`interesses` e `cidadesAceita`): filtro é escolha explícita do
  usuário na tela. `busca` casa contra `curso`, `instituicao` e `cidade`
  concatenados; normalize com `trim()` e `toLowerCase()` dentro da função,
  não confie no chamador. Array de filtro vazio não filtra. Curso gratuito
  passa por `mensalidadeMax` mesmo quando o limite é baixo — preserve a
  condição `mensalidade > 0 &&` do legado.
- `atendeRestricoes(curso: Curso, perfil: Perfil): boolean` — devolve `false`
  apenas quando `aceitaMorarFora === false`, `cidadesAceita` não está vazia e
  a cidade do curso não está nela. Todo o resto do perfil é peso. Comente na
  função que interesse **deliberadamente** não entra aqui, com uma linha do
  porquê — é o defeito que este porte corrige, e sem a nota alguém "conserta"
  de volta.

### 4. `recommend.ts`

- `recommend(cursos: Curso[], perfil: Perfil): Recomendacao[]` — aplica
  `atendeRestricoes`, pontua com `calculateFit` e `calculateChance`, devolve
  ordenado por `fit` decrescente. Não recebe `Filtros`: filtrar é passo do
  chamador.
- `sortRecommendations(recomendacoes: Recomendacao[], criterio: CriterioOrdem): Recomendacao[]`
  — devolve **array novo**, sem mutar a entrada. `CriterioOrdem` é
  `"fit" | "mensalidade" | "mec" | "evasao" | "salario"`; as regras estão em
  `sortCourses`, no legado (`fit` e `salario` decrescentes, `mensalidade` e
  `evasao` crescentes, `mec` decrescente). Desempate sempre por `curso.id`
  ascendente, para o resultado ser determinístico e testável.
- `partitionByFit(recomendacoes: Recomendacao[], distanciaMaxima = 15): { principais: Recomendacao[]; secundarias: Recomendacao[] }`
  — limiar é `maiorFit - distanciaMaxima`; entra em `principais` quem tem
  `fit >= limiar`. Calcule o maior fit percorrendo a lista, **sem assumir que
  ela chegou ordenada**. Lista vazia devolve as duas listas vazias, sem
  `-Infinity`. Preserve a ordem relativa de entrada dentro de cada lado.

`distanciaMaxima` é padrão provisório, não constante sagrada: deixe-o como
parâmetro com valor padrão, não como número solto no corpo da função.

### 5. `index.ts`

Reexporta os tipos e as funções públicas dos quatro módulos. É o único ponto
de importação para quem vier de fora de `lib/recommendation/`.

### 6. Testes

Um arquivo por módulo (`score.test.ts`, `filters.test.ts`,
`recommend.test.ts`), ao lado do código. **Toda função exportada precisa de
teste**, e estes casos de fronteira são obrigatórios:

- perfil com `interesses: []` → `courseMatch` de 0.6, e nenhum curso some
- perfil com interesse declarado → curso de outra área **continua na saída**,
  com fit menor. É o teste que trava o bug de volta; escreva-o explicitamente
  contra o cenário "aluno de Administração enxerga Design"
- `orcamentoMensal: 0` com curso pago, e com curso gratuito
- `notaCorte: 0` → `academicFit` de 0.6 e chance `"alta"`
- ENEM incompleto (um ou mais campos ausentes) e ENEM vazio (`{}`)
- `cursos: []` em `recommend`, `sortRecommendations` e `partitionByFit`
- `aceitaMorarFora: false` cortando, e `aceitaMorarFora: true` não cortando
- turnos: preferência vazia, casando e não casando
- fit é inteiro entre 0 e 100 em todos os casos acima
- `partitionByFit` com lista de um item só (o próprio item é o máximo, logo é
  principal), com fit exatamente no limiar (`maiorFit - distanciaMaxima`
  entra em `principais`), e com todos os itens dentro da distância —
  `secundarias` vazia é resultado legítimo, não falha
- `sortRecommendations` com dois cursos de mesmo valor no critério, provando
  o desempate por `id`

Monte os cursos e perfis dos testes como literais no próprio arquivo de
teste. **Não importe `js/data.js`** — o legado não é módulo ES e vai embora
ao fim do porte.

### 7. Remover o teste de fumaça

Apague `lib/smoke.test.ts`. Ele existia só para provar que o runner roda, e a
suíte do motor passa a provar isso.

### 8. Calar os warnings do legado no lint

Acrescente `js/**` ao `globalIgnores` de `eslint.config.mjs`, com um
comentário de uma linha dizendo que é legado em escopo global, não módulo, e
que sai ao fim do porte. Hoje o lint emite 16 warnings de "defined but never
used" ali, todos falsos positivos. Warning permanente treina todo mundo a
ignorar warning.

### 9. Atualizar `docs/STATE.md`

Na mesma tarefa, conforme *Manutenção* do `AGENTS.md`: data e commit no topo,
árvore (entra `lib/recommendation/`, sai `lib/smoke.test.ts`), pendência de
lint resolvida, bug 1 resolvido no código novo — mantendo o registro de que
o legado `js/recommendations.js` ainda o contém — e a próxima tarefa.

## Critério de pronto

Comandos que você roda e cujo resultado você lê:

1. `npm run typecheck` — zero erros. Sem `any` novo, sem `@ts-ignore`.
2. `npm run lint` — zero erros e **zero warnings**. O contador de warnings é
   parte do critério, não detalhe: era 16 e precisa ser 0.
3. `npm run test` — Vitest verde, com a suíte do motor rodando.
4. `npm run build` — conclui.
5. Busca por acoplamento proibido em `lib/recommendation/`: nenhuma
   ocorrência de `document`, `window`, `localStorage`, `fetch`, nem `import`
   de `react`, `next` ou qualquer pacote. O motor importa apenas os próprios
   módulos.
6. `lib/smoke.test.ts` não existe mais.
7. Nenhuma dependência nova: `package.json` e `package-lock.json` intactos.
8. `git diff --stat` não mostra alteração em `js/**`, `css/**` nem `*.html`.

**Fica para a revisão:** conferência linha a linha dos sete pesos e dos dois
limiares contra o legado, e leitura do diff. Nada renderiza nesta tarefa, e
não há verificação visual a fazer — não invente uma.

## O que NÃO tocar

- `js/**`, `css/**`, `index.html`, `perfil.html`, `recomendacoes.html`. O
  legado só será removido quando o porte terminar.
- Os sete pesos de `calculateFit` e os dois limiares de `calculateChance`.
  Copiar é o objetivo; melhorar não é.
- `CHANCE_META`, rótulos, emojis e nomes de classe CSS. São apresentação e
  **não entram** em `lib/recommendation/`.
- `app/`, `next.config.ts`, `tsconfig.json`, `package.json`.
