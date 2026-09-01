# 001 — Normaliza a marca para "Wuni" e conserta a restauração de tema na landing

## Objetivo

O produto se chama **Wuni**. O mantenedor decidiu o nome; não é mais uma
questão em aberto.

O arquivo `index.html` escreve "Wunii" (com dois "i") em 14 lugares. Todos os
outros arquivos do repositório — `perfil.html`, `recomendacoes.html`,
`README.md` — já escrevem "Wuni" corretamente. A landing é a única fora do
padrão, e é justamente a primeira página que qualquer visitante vê.

Só que isso não é um problema apenas de texto. Uma das 14 ocorrências é a
**chave do `localStorage` que guarda a preferência de tema**. Em
`index.html`, o script inline que roda antes da pintura da página lê a chave
`"Wunii-theme"`. Mas `js/main.js` — que roda em todas as páginas e é quem
efetivamente grava a preferência — usa `"wuni-theme"`. As duas nunca se
encontram.

O efeito visível: o usuário escolhe tema escuro, navega, volta para a
landing, e a landing pisca em claro antes de corrigir; se o sistema
operacional dele estiver em preferência clara, a landing volta ao tema claro
de vez, ignorando a escolha. As outras duas páginas não têm o problema
porque já leem `"wuni-theme"`.

Ou seja: o erro de grafia da marca **é** o bug do tema. Corrigir o nome
corrige os dois, e é por isso que são uma tarefa só.

Esta é também a primeira tarefa do fluxo de dois agentes neste repositório.
Ela é deliberadamente pequena e de baixo risco — serve para exercitar o
ciclo plano → execução → revisão antes de tarefas grandes.

**Autorização:** o `AGENTS.md` lista "copy, headline e posicionamento de
marca em `index.html`" como área que não se altera sem pedido explícito.
Esta tarefa **tem** esse pedido, e ele é estreito: trocar o token do nome,
nada além disso. Não reescreva frases, não ajuste headline, não mexa em
posicionamento.

## Arquivos afetados

- **`index.html`** — 14 ocorrências de "Wunii". Treze são texto visível de
  marca; uma (linha 16) é a chave do `localStorage`, e recebe tratamento
  diferente das outras. Ver *Passos*.

**É o único arquivo que esta tarefa altera.** Em particular, não edite
`docs/STATE.md` — ver *Depois da revisão*.

Nenhum outro arquivo muda. `css/style.css` não menciona a marca em lugar
nenhum (verificado). `README.md`, `perfil.html` e `recomendacoes.html` já
estão corretos.

## Passos

Os números de linha abaixo valem para o commit `d59fac4`. Confira o conteúdo
da linha antes de editar; se não bater, localize a ocorrência pelo texto.

### Passo 1 — a chave de tema (linha 16), que NÃO segue a mesma regra das outras

**Leia este passo inteiro antes de editar qualquer coisa.**

A tentação óbvia nesta tarefa é rodar um localizar-e-substituir global de
`Wunii` → `Wuni` no arquivo. **Isso não resolve o bug e ainda o disfarça.**
A linha 16 viraria:

```js
var t = localStorage.getItem("Wuni-theme");   // ERRADO
```

`"Wuni-theme"` continua diferente de `"wuni-theme"`, que é o que
`js/main.js` grava. O tema seguiria quebrado, agora com aparência de
consertado — e nenhuma inspeção de texto da marca pegaria isso.

A chave correta é **toda em minúsculas**. Altere a linha 16 de:

```js
var t = localStorage.getItem("Wunii-theme");
```

para:

```js
var t = localStorage.getItem("wuni-theme");
```

Confira que ficou idêntica à linha 16 de `perfil.html` e à linha 16 de
`recomendacoes.html`, que já estão certas. As três devem ser iguais.

Não há migração de dados a fazer. O caminho de escrita sempre esteve
correto (`js/main.js` sempre gravou em `"wuni-theme"`); apenas a leitura na
landing olhava para a chave errada. Quem já usou o site tem o valor certo
salvo, e ele passa a ser lido. **Não escreva código de migração** de chave.

### Passo 2 — as outras 13 ocorrências, texto visível de marca

Substitua `Wunii` por `Wuni` nas linhas abaixo. Todas são o nome do produto
em texto corrido ou em atributo. Preserve o resto da frase intacto.

| Linha | Onde |
| --- | --- |
| 6 | `<title>` |
| 7 | `<meta name="description">` |
| 30 | `<span class="brand-name">` do cabeçalho |
| 70 | `<strong>` no parágrafo de abertura do hero |
| 153 | parágrafo da seção "solução" |
| 186 | parágrafo "Princípio fundamental" |
| 198 | `<h2>` da seção "como funciona" |
| 236 | item 4 da tira de jornada do usuário |
| 258 | parágrafo do card "Chance de aprovação" |
| 336 | `<h2>` da seção "diferencial" |
| 354 | `<h4>` do card destacado na grade de comparação |
| 410 | `<span class="brand-name">` do rodapé |
| 422 | linha de copyright do rodapé |

### Passo 3 — preservar a codificação

`index.html` é UTF-8 e contém acentuação e aspas tipográficas (`—`, `“ ”`,
`ç`, `ã`). Ao editar, garanta que o arquivo continue UTF-8 e que nenhum
caractere acentuado tenha sido corrompido — um erro de codificação
transformaria "orientação" em "orientaÃ§Ã£o" ao longo de toda a página.
Abra o arquivo depois de editar e confira visualmente um trecho acentuado.

## Critério de pronto

Dividido em dois blocos. **Execute apenas o primeiro.** O segundo é do
revisor e exige navegador — não tente cumpri-lo, não improvise substituto e
não declare a tarefa concluída com base nele.

### Bloco 1 — o que você verifica antes de entregar

**1. Nenhuma ocorrência de "Wunii" restante.** Este comando, na raiz do
repositório, não retorna nenhuma linha:

```bash
grep -rn "Wunii" --include=*.html --include=*.css --include=*.js .
```

**2. Leitura e escrita do tema usam exatamente a mesma chave.** Este comando
deve mostrar quatro ocorrências, todas com o valor `wuni-theme`, idêntico,
todo em minúsculas:

```bash
grep -rn "wuni-theme\|Wunii-theme\|Wuni-theme" --include=*.html --include=*.js .
```

O resultado esperado é: `js/main.js` (a constante `THEME_KEY`, que é o
caminho de **escrita**) e os scripts inline de `index.html`, `perfil.html` e
`recomendacoes.html` (os três caminhos de **leitura**). Qualquer variação de
maiúscula entre eles significa que o bug continua. Nenhuma linha pode conter
`Wunii-theme` nem `Wuni-theme`.

**3. Portões de qualidade.** Rode os que existirem no repositório no momento
da tarefa, conforme o `AGENTS.md`. Hoje não há `package.json`, teste, linter
nem build — nesse caso, registre na entrega que nenhum portão automatizado
era executável, em vez de omitir o item.

**4. Codificação preservada.** `index.html` continua UTF-8, com a acentuação
íntegra (Passo 3).

**5. Diff mínimo.** O diff contém exclusivamente as 14 substituições em
`index.html`. Nenhum outro arquivo foi alterado — nem `docs/`, nem
`AGENTS.md`, nem `README.md`. Nenhuma frase além do nome mudou.

### Bloco 2 — o que fica para a revisão

Registrado aqui para você saber o que **não** precisa cobrir. Exige
navegador e observação do carregamento da página; será feito por quem revisa.

- Ausência de flash claro ao recarregar a landing com tema escuro salvo. O
  defeito corrigido acontece antes da pintura, então o estado final da
  página não o revela — só a observação do carregamento revela.
- Comportamento com o sistema operacional em preferência clara e tema
  escuro salvo: a landing deve respeitar a escolha salva, não a preferência
  do sistema.
- Conferência visual da marca em tema claro e escuro, em largura desktop e
  mobile.

## Depois da revisão — não faz parte desta tarefa

Quando a revisão passar, os bugs 3 e 4 do `docs/STATE.md` (chave de tema e
marca inconsistente) deixam de existir e o arquivo é atualizado.

**Isso é feito em um passo separado, depois da revisão, e não pelo Codex.**
Não edite o `docs/STATE.md` nesta tarefa. Se o documento afirmasse que os
bugs morreram junto com a implementação, ele estaria descrevendo como
verdade algo ainda não verificado — que é exatamente o que o `STATE.md`
existe para evitar.

## O que NÃO tocar

- **`PROFILE_KEY = "wuni_profile"` em `js/storage.js`.** É a chave onde o
  perfil do aluno está salvo. Alterá-la apaga o perfil de todo usuário
  existente. O sublinhado em vez de hífen é inconsistente com
  `wuni-theme`, e isso é intencional por ora — não "padronize".
- **O valor `"wuni-theme"` em `js/main.js`, `perfil.html` e
  `recomendacoes.html`.** Estes três já estão certos. É `index.html` que se
  alinha a eles, nunca o contrário. Mudar o valor nos três quebraria o tema
  salvo de todos os usuários.
- **Qualquer texto de `index.html` que não seja o nome da marca.** Sem
  reescrever frase, ajustar headline, melhorar copy ou mexer em
  posicionamento — mesmo que algo pareça melhorável.
- **`css/style.css`.** Não contém referência à marca. Não há nada a fazer.
- **Os outros bugs listados no `STATE.md`** — o filtro duplo de interesses
  em `js/recommendations.js` e os listeners duplicados de `wireChipToggle`.
  Cada um terá seu próprio plano. Não os conserte de passagem.
- **`AGENTS.md`.** O Codex não edita esse arquivo. Se algo nele estiver
  errado, reporte ao mantenedor.
- **Dependências, `package.json`, build.** Nada disso entra nesta tarefa.
