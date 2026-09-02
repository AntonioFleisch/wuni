# 104 — Perfil completo e o parser do que está no navegador

## Objetivo

Criar a fronteira que transforma o que existe no `localStorage` do aluno num
perfil válido, antes de o motor vê-lo.

O `AGENTS.md` decidiu que o motor **não se defende de dado incompleto** — os
campos do `Perfil` que ele consome são obrigatórios, e quem normaliza é a
borda. Essa borda não existe: hoje nada converte o `wuni_profile` gravado
pelo site antigo em algo que `calculateFit` aceite.

O mesmo parser é o **importador do primeiro login**, previsto no `AGENTS.md`:
quando houver contas, é ele que lê o perfil do navegador e oferece trazer
para a conta. Não é código descartável.

Continua sem tela e sem banco. Tudo em `lib/perfil/`.

## Regras

### Dois perfis, e o completo contém o do motor

`lib/recommendation/` já define `Perfil`: o recorte que pontua. O perfil
completo do aluno tem mais campos — nome, ano escolar, renda, cotas — que o
motor não usa e não deve conhecer.

```ts
export interface PerfilAluno extends Perfil {
  nome: string;
  anoEscola: AnoEscola;
  escolaPublica: boolean;
  mediaHistorico: number | null;
  rendaPerCapita: RendaPerCapita;
  ppi: boolean;
  pcd: boolean;
}
```

O `extends` não é enfeite: ele faz o compilador garantir que todo
`PerfilAluno` pode ser passado direto para `calculateFit`. Se o motor mudar o
recorte dele, isto quebra visivelmente em vez de divergir em silêncio.

`lib/perfil/` importa de `lib/recommendation/`. **O contrário é proibido** —
o motor não importa perfil, sob pena de ciclo e de perder o isolamento que a
regra estrutural do `AGENTS.md` protege.

Os valores das duas uniões saem do formulário legado, não de invenção
(`perfil.html`):

```ts
export type AnoEscola = "1º ano" | "2º ano" | "3º ano" | "Concluinte";
export type RendaPerCapita =
  | "ate-1-sm" | "de-1-a-2-sm" | "de-2-a-3-sm"
  | "de-3-a-5-sm" | "acima-5-sm";
```

### O parser recebe texto, não lê o navegador

```ts
export function parsePerfilArmazenado(raw: string | null): ResultadoPerfil;
```

**`lib/` não toca em `localStorage`, `window` nem `document`** — é a mesma
regra que vale para o motor. Quem lê a chave `wuni_profile` é a tela, depois;
esta função recebe o texto já lido. É também o que a torna testável sem
navegador.

### O resultado distingue três situações

```ts
export type ResultadoPerfil =
  | { estado: "ausente" }
  | { estado: "invalido" }
  | { estado: "ok"; perfil: PerfilAluno; camposCorrigidos: string[] };
```

- **`ausente`** — `raw` é `null` ou string vazia. Não havia perfil.
- **`invalido`** — o texto não é JSON, ou é JSON que não resulta num objeto
  (número, string, `null`, array). Havia algo, e não dá para aproveitar.
- **`ok`** — devolve perfil normalizado e a lista de campos que precisaram de
  correção, pelo nome do campo.

Distinguir `ausente` de `invalido` importa: o importador do primeiro login
precisa saber se **havia** um perfil naquele navegador. Devolver o perfil
padrão nos dois casos, como o legado faz, apaga essa diferença.

`camposCorrigidos` existe para a tela poder dizer o que foi ajustado em vez
de sobrescrever escolha do aluno caladamente. Coerção silenciosa é o começo
de "o site mudou meu orçamento sozinho".

### Normalização, campo a campo

Base: `perfilVazio()`, exportado, devolvendo um perfil neutro novo a cada
chamada. **Não** copie o `DEFAULT_PROFILE` do legado — ele contém dado
fictício ("Aluno exemplo", notas de ENEM inventadas), e dado fictício que
entra por padrão é indistinguível de dado real do aluno.

| Campo | Regra | Padrão quando ausente ou inválido |
| --- | --- | --- |
| `nome` | string, com `trim()` | `""` |
| `anoEscola` | tem que estar na união | `"3º ano"` |
| `escolaPublica`, `ppi`, `pcd` | booleano de verdade, não valor truthy | `false` |
| `mediaHistorico` | número de 0 a 10 | `null` |
| `rendaPerCapita` | tem que estar na união | `"de-1-a-2-sm"` |
| `orcamentoMensal` | número `>= 0` | `ORCAMENTO_SEM_LIMITE` |
| `enem.*` | número de 0 a 1000, por nota | nota omitida |
| `interesses`, `cidadesAceita` | array; descarta o que não for string; `trim()` | `[]` |
| `turno`, `modalidade` | array; **descarta o que não estiver na união** do motor | `[]` |
| `aceitaMorarFora` | booleano de verdade | **`true`** |

Campo desconhecido no JSON armazenado é ignorado sem erro: perfil gravado por
versão antiga do site precisa continuar sendo aproveitável.

**Ausência legítima não é correção.** `camposCorrigidos` só registra campo
que o parser **substituiu**. Os dois campos cujo tipo já admite "não
informado" — `mediaHistorico`, que é `number | null`, e cada nota do ENEM,
que é opcional — entram na lista apenas quando estão **presentes e
inválidos**, nunca quando estão ausentes ou `null`.

Não é sutileza de tipo: o formulário legado grava `mediaHistorico: null`
toda vez que o aluno deixa a média em branco, e aluno de 2º ano costuma não
ter nota de ENEM. Reportar isso como correção faria a tela de importação
dizer que consertou seis campos num perfil onde nada foi consertado, e a
lista deixaria de significar alguma coisa exatamente no caso mais comum.

Os demais campos são obrigatórios e têm padrão de verdade: ausência ali é
substituição, e o aluno tem o direito de saber. `interesses: []` ausente vira
"não declarou interesse nenhum", que muda o `courseMatch` — é correção e
entra na lista.

Três linhas dessa tabela são decisões, não detalhes:

**`aceitaMorarFora` ausente vira `true`, não `false`.** É o único campo do
perfil que ainda **corta** cursos, junto com `cidadesAceita`. Se um campo
faltando ligasse o corte, dado incompleto esconderia faculdades do aluno sem
ele ter pedido. Falta de informação não pode ativar restrição.

**`orcamentoMensal` ausente vira `ORCAMENTO_SEM_LIMITE`, uma constante
exportada valendo `10000`** — o mesmo valor que o filtro do site legado
mostra como "Sem limite", e acima da mensalidade mais cara da base. Zero
seria a pior escolha possível: colocaria todo curso pago acima do orçamento e
derrubaria o `budgetFit` de quase tudo, por causa de um campo em branco.
Constante nomeada e não número solto porque, quando a base passar de mil
cursos, 10.000 deixa de significar "sem limite" e isso vira decisão de novo.

**Nota de ENEM fora de 0–1000 é descartada, não corrigida para o limite.**
Descartada, ela conta como zero na média — que é o comportamento documentado
de `enemMedia`. Puxar para 1000 inventaria desempenho que o aluno não teve.

### `serializarPerfil`

```ts
export function serializarPerfil(perfil: PerfilAluno): string;
```

O par do parser, para quando a tela de perfil for portada e precisar gravar.
Existe agora porque torna possível o teste de ida e volta.

## Passos

1. `lib/perfil/types.ts` — `PerfilAluno`, `AnoEscola`, `RendaPerCapita`,
   `ResultadoPerfil`.
2. `lib/perfil/parse.ts` — `perfilVazio`, `parsePerfilArmazenado`,
   `serializarPerfil`, `ORCAMENTO_SEM_LIMITE`.
3. `lib/perfil/index.ts` — reexporta o que é público.
4. `lib/perfil/parse.test.ts`.
5. `docs/STATE.md` na mesma tarefa: data, commit, árvore e o registro de que
   a fronteira do perfil existe.

Nada em `app/`, `server/` ou `db/`. Nenhuma dependência nova — validação é
código à mão, **não instale Zod nem equivalente**; isso é decisão de
arquitetura e não entra por conveniência de uma tarefa.

## Testes

Além de uma cobertura por função exportada:

- `raw` `null`, `""` e só espaços → `ausente`
- `"{"`, `"[]"`, `"42"`, `'"texto"'`, `"null"` → `invalido`
- objeto vazio `"{}"` → `ok`, com perfil neutro e os campos **obrigatórios**
  listados em `camposCorrigidos` — sem `mediaHistorico` e sem as cinco
  `enem.*`, que estavam legitimamente ausentes
- perfil como o formulário legado grava com a média em branco
  (`mediaHistorico: null`, resto preenchido) → `camposCorrigidos` **vazio**
- o `DEFAULT_PROFILE` do legado, copiado como literal para o teste, atravessa
  o parser sem nenhuma correção e sai idêntico no que importa
- `aceitaMorarFora` ausente sai `true`; `false` explícito sobrevive como
  `false`
- `orcamentoMensal` ausente sai `ORCAMENTO_SEM_LIMITE`; `0` explícito
  sobrevive como `0` — é escolha do aluno, não falta de dado
- notas de ENEM: válida sobrevive; `-1`, `1001`, `"700"` e `null` são
  descartadas e aparecem em `camposCorrigidos`
- `turno: ["matutino", "madrugada"]` mantém só `"matutino"` e registra a
  correção; `modalidade` idem
- `interesses: ["Design", 42, null, "  Direito  "]` vira
  `["Design", "Direito"]`
- campo desconhecido no JSON não vira erro nem entra no perfil
- ida e volta: `parsePerfilArmazenado(serializarPerfil(p))` devolve `ok` com
  perfil igual a `p` e `camposCorrigidos` vazio
- o resultado de `perfilVazio()` é aceito por `calculateFit` sem erro de
  tipo — prova de que `PerfilAluno` serve ao motor

## Critério de pronto

1. `npm run typecheck`, `npm run lint` (com Prettier), `npm run test`,
   `npm run build` — todos limpos.
2. Busca em `lib/perfil/`: nenhuma ocorrência de `localStorage`, `window`,
   `document` ou `fetch`.
3. Nenhum import de `lib/recommendation/` para `lib/perfil/` — a seta é só na
   outra direção. O lint não pega isso, porque as duas estão em `lib/`;
   confirme por busca.
4. `package.json` e `package-lock.json` intactos.
5. `git diff --stat` mostra alteração só em `lib/perfil/` e `docs/STATE.md`.

**Fica para a revisão:** ler o diff e conferir a tabela de normalização campo
a campo. Nada renderiza.

## O que NÃO tocar

- `lib/recommendation/` inteiro, inclusive `types.ts`. Se `PerfilAluno`
  não conseguir estender `Perfil`, **pare e reporte** — é divergência de
  modelo, não coisa para ajustar no motor por conta própria.
- `js/**`, `css/**`, `*.html`. O perfil legado continua sendo gravado como
  está; a chave `wuni_profile` não muda de nome nem de formato.
- `db/`, `server/`, `app/`, `eslint.config.mjs`, `package.json`.
