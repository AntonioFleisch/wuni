# docs/tasks/

Planos de tarefa. Cada arquivo é a especificação completa de um trabalho a ser
executado pelo agente implementador.

## Nomenclatura

`NNN-slug.md` — número sequencial de três dígitos, slug em kebab-case.
Exemplo: `001-corrige-chave-tema-landing.md`.

O número nunca é reaproveitado. Um plano concluído permanece no repositório
como registro do que foi decidido e por quê.

## Formato

Todo plano tem estas cinco seções, nesta ordem:

```markdown
# NNN — Título

## Objetivo
O que muda e por quê, do ponto de vista do produto. Dois a quatro parágrafos
curtos. Quem lê precisa entender a motivação sem ter visto o código.

## Arquivos afetados
Lista explícita de caminhos, com uma linha dizendo o que acontece em cada um.
Se um arquivo novo for criado, diga onde ele entra na ordem de <script>.

## Passos
Sequência numerada e verificável. Cada passo é uma ação concreta, não uma
intenção. Inclua trechos de código quando a forma exata importar.

## Critério de pronto
Dividido em dois blocos, sempre.

**Bloco 1 — o que o executor verifica.** Comandos que ele consegue rodar e
cujo resultado ele consegue ler: grep, testes, typecheck, lint, build,
inspeção de diff. Mais os portões do AGENTS.md que já existirem no
repositório naquele momento.

**Bloco 2 — o que fica para a revisão.** Tudo que exija olhar a página
renderizada: layout, contraste, flash de tema, comportamento responsivo.
O Codex CLI não controla navegador. Listar isso explicitamente serve para
ele saber o que **não** precisa cobrir — sem essa separação, ele improvisa
um substituto e declara pronto o que não verificou.

## O que NÃO tocar
Arquivos, funções e decisões fora do escopo desta tarefa, com o motivo.
Sempre presente, mesmo que curto. Inclua sempre `docs/STATE.md`: ele é
atualizado depois que a revisão passa, nunca junto com a implementação.
```

## Regra de escrita

O plano é escrito para um agente que **não participou** da conversa que o
originou. Nada de implícito, nenhuma referência a diálogo anterior, nenhum
"como discutimos". Se um contexto é necessário para executar, ele está no
plano ou no `AGENTS.md`.

## Regra de execução

Se o plano estiver ambíguo, incompleto ou contradisser o estado real do
código, pare e reporte ao mantenedor. Não improvise para destravar.
