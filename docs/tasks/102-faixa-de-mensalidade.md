# 102 — Mensalidade como faixa, e a saída do salário de egressos

## Objetivo

Preparar o motor para dado real. Hoje ele espera `mensalidade: number` e
`salarioMedioEgressos: number`, dois campos que a base de mais de mil cursos
não vai conseguir sustentar:

- **Mensalidade exata não existe em base oficial nenhuma.** Passa a ser
  faixa, e passa a admitir "não sei" — que é diferente de "gratuito", e essa
  diferença é a armadilha desta tarefa.
- **Salário médio de egressos não tem fonte.** Sai do modelo, com o critério
  de ordenação que dependia dele.

Tudo acontece dentro de `lib/recommendation/`. Nenhuma pasta nova, nenhuma
página, nenhum banco. Esta spec assume a 101 fechada — se `partitionByFit`
ainda cortar por proporção em vez de distância em pontos, **pare e reporte**:
você está no repositório errado, ou numa versão anterior à correção.

## Regras de negócio decididas

### Faixa, não valor

```ts
export interface FaixaMensalidade {
  min: number;
  max: number;
}
```

`Curso.mensalidade` passa a ser `FaixaMensalidade | null`, com três estados e
nenhuma ambiguidade entre eles:

| Estado | Representação | Significado |
| --- | --- | --- |
| Gratuito | `{ min: 0, max: 0 }` | curso público, sem mensalidade |
| Faixa conhecida | `{ min: 1200, max: 2800 }` | curado, varia por turno/bolsa/campus |
| Desconhecido | `null` | não temos o dado |

**`null` nunca pode virar zero.** Se a ingestão preencher preço ausente com
`0`, toda instituição privada sem dado curado vira "gratuita" na tela — o
erro mais caro que este modelo pode produzir. É por isso que o campo é
`| null` em vez de um número com zero significando duas coisas.

### `budgetFit` com faixa, e a descontinuidade que ele tem hoje

O `budgetFit` atual é **descontínuo, e a favor do mais caro**. Com orçamento
de 10.000: mensalidade 10.000 pontua 0,70, e mensalidade 10.500 pontua 0,95.
Os dois ramos não se encontram — dentro do orçamento a função termina em 0,7,
acima dela recomeça perto de 1,0 e decai. Estourar o orçamento em 5% vale
mais do que caber nele.

Portar isso para faixa multiplicaria o defeito: uma faixa inteiramente acima
do orçamento pontuaria melhor que uma que o cruza. **Corrija junto**, com uma
mudança mínima: o ramo de acima do orçamento passa a ser multiplicado por
0,7, que é exatamente onde o ramo de dentro termina. A função fica contínua e
monotonicamente decrescente, e continua chegando a zero no dobro do
orçamento, como hoje.

Avalie a faixa **pelo pior caso que ainda cabe**:

| Situação | Valor usado | Resultado |
| --- | --- | --- |
| `max === 0` (gratuito) | — | `1` |
| `null` (desconhecido) | — | `0.6` |
| `max <= orcamento` (faixa inteira cabe) | `max` | `1 - 0.3 * (max / orcamento)`, em `[0.7, 1]` |
| `min > orcamento` (nem o piso cabe) | `min` | `0.7 * max(0, 1 - (min - orcamento) / max(orcamento, 1))` |
| a faixa cruza o orçamento | — | `0.7`, que é a fronteira exata entre os dois ramos |

O `0.6` do desconhecido não é número novo: é o mesmo valor que
`courseMatch` já usa para "o aluno não declarou interesse". Falta de
informação não premia nem pune.

Com `orcamento` igual a zero, qualquer faixa paga cai no ramo de acima do
orçamento, com `max(orcamento, 1)` evitando divisão por zero — igual ao
comportamento atual.

**Os sete pesos não mudam.** Orçamento continua valendo 15%. O que muda é
como o fator de 0 a 1 é calculado.

### Salário de egressos

Sai de `Curso`, sai de `CriterioOrdem` e sai dos testes. Não deixe campo
vestigial nem `@deprecated`: o tipo é a especificação do que a ingestão
precisa entregar, e campo que ninguém preenche vira dívida silenciosa.

## Passos

### 1. `types.ts`

- Acrescente `FaixaMensalidade`.
- `Curso.mensalidade: FaixaMensalidade | null`.
- Remova `Curso.salarioMedioEgressos`.
- Exporte `FaixaMensalidade` pelo `index.ts`.

### 2. `score.ts` — `budgetFit`

Reescreva **apenas** o cálculo de `budgetFit`, conforme a tabela acima. Os
outros seis fatores, os pesos e o `Math.round(weighted * 100)` final ficam
intactos. `calculateChance` e `enemMedia` não são tocados.

Ao reescrever, some o `Math.max(0.7, ...)` do ramo de dentro do orçamento:
com `max <= orcamento`, `1 - 0.3 * (max / orcamento)` já não desce de 0,7. E
o `orcamentoMensal > 0 ? ... : 1` do mesmo ramo também sai, porque orçamento
zero nunca chega ali — com orçamento zero, faixa paga cai no ramo de acima.
Guarda que não guarda nada esconde a regra.

### 3. `filters.ts` — `matchesFilters`

O corte por `mensalidadeMax` passa a olhar o **piso** da faixa: descarta
quando `faixa.min > filtros.mensalidadeMax`. Gratuito continua passando
sempre. **Mensalidade `null` também passa**: filtro corta pelo que o usuário
escolheu, não pelo que falta na nossa base. Curso sem preço conhecido não
pode desaparecer da lista por causa de um limite de preço.

`atendeRestricoes` não muda.

### 4. `recommend.ts` — `sortRecommendations`

- Remova o critério `"salario"` de `CriterioOrdem` e do `switch`.
- `"mensalidade"` ordena por `faixa.min` crescente. Gratuito (`0`) vem
  primeiro; **`null` vai para o fim**, em qualquer direção de ordenação —
  desconhecido não compete por posição. O desempate por `curso.id` continua.

`recommend` e `partitionByFit` não mudam.

### 5. Testes

Atualize os três arquivos e cubra, além do que já existe:

- `budgetFit` **contínuo na fronteira**: com orçamento 1000, uma faixa
  `{1000, 1000}` e uma faixa `{1001, 1001}` precisam produzir fits em que a
  mais cara **não** ganha. É o teste que trava o defeito de volta; escreva-o
  contra esse cenário, com esse nome.
- faixa inteiramente abaixo, inteiramente acima, e cruzando o orçamento
- gratuito (`{0, 0}`) e desconhecido (`null`), com o desconhecido pontuando
  entre os dois
- orçamento zero com faixa paga, com faixa gratuita e com `null`
- `matchesFilters`: faixa com piso acima do limite corta; faixa com piso
  dentro e teto fora **não** corta; `null` não corta; gratuito não corta
- `sortRecommendations` por mensalidade com gratuito, faixa e `null` na mesma
  lista, provando a ordem e o `null` no fim
- nenhum teste sobrevive citando `salarioMedioEgressos`

### 6. `docs/STATE.md`

Na mesma tarefa: data e commit no topo, e o registro de que o modelo do motor
mudou — mensalidade como faixa com estado desconhecido, salário de egressos
removido, `budgetFit` corrigido. A base mockada de `js/data.js` continua com
o formato antigo; ela só é convertida quando o *seed* for criado, e isso não
é esta tarefa.

## Critério de pronto

1. `npm run typecheck` — zero erros. O compilador é o verificador principal
   aqui: trocar o tipo de `mensalidade` quebra tudo que o consumia, e é isso
   que queremos ver quebrar.
2. `npm run lint` — zero erros e zero warnings.
3. `npm run test` — Vitest verde.
4. `npm run build` — conclui.
5. Busca em `lib/` por `salarioMedioEgressos` e por `"salario"`: nenhuma
   ocorrência.
6. `git diff --stat` não mostra alteração fora de `lib/recommendation/` e
   `docs/STATE.md`.

**Fica para a revisão:** conferir a continuidade do `budgetFit` com números,
e ler o diff. Nada renderiza; não há verificação visual.

## O que NÃO tocar

- Os sete pesos do `calculateFit`, os limiares do `calculateChance`, a
  fórmula dos outros seis fatores.
- `partitionByFit`, `recommend`, `atendeRestricoes`, `enemMedia`.
- `js/**`, `css/**`, `*.html`. O legado continua com o modelo antigo e com o
  defeito do `budgetFit`; ele morre com os dois.
- `eslint.config.mjs`, `tsconfig.json`, `package.json`, `app/`.
- **Não crie `db/`, `server/` nem *seed*.** A estrutura de pastas e os dados
  reais são a próxima spec; esta só arruma o modelo para eles caberem.
