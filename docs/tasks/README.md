# docs/tasks/

Planos de tarefa pendentes. `NNN-slug.md`, número nunca reaproveitado.

**A centena identifica o ciclo, que é uma sessão de trabalho.** Ciclo 1 →
`001`, `002`, `003`. Ciclo 2 → `101`, `102`, `103`. Ciclo 3 → `201` em
diante. Ao abrir sessão nova, vá para a próxima centena mesmo que a anterior
tenha usado poucos números — eles são baratos, e o salto marca a fronteira.

Como a spec é apagada ao ser revisada, a centena vira o índice do histórico:
`git log -- "docs/tasks/1*.md"` devolve o ciclo 2 inteiro.

**Esta pasta contém apenas trabalho ainda não feito.** A spec é apagada
quando a revisão passa, no mesmo commit — depois que o que for durável nela
migrou para `AGENTS.md` ou `docs/STATE.md`. Recuperar uma spec concluída:
`git log -- docs/tasks/NNN-*.md`.

Por isso as specs não se referenciam entre si: cada uma é autossuficiente, e
uma referência a spec anterior ficaria pendurada.

## Formato

Quatro seções. **Proporcionais à tarefa** — uma troca de string não precisa de
duas páginas de contexto. Se a spec ficou maior que o diff que ela produz,
corte.

```markdown
# NNN — Título

## Objetivo
O que muda e por quê. Curto. Só o que o executor precisa para não errar.

## Passos
Ações concretas e verificáveis. Cite arquivos e âncoras de texto localizáveis
por busca, não números de linha — eles envelhecem entre o plano e a execução.
Inclua trecho de código só quando a forma exata importar.

**Especifique resultado, não encantamento.** Comando de ferramenta muda de
versão para versão, e o que você lembra dele pode estar desatualizado. Diga
qual portão precisa existir e o que ele deve provar; deixe a forma exata para
quem executa, que tem como consultar a versão instalada. Escrever
`"lint": "next lint"` numa spec é fixar de memória exatamente o que a spec
mandou não fixar de memória.

## Critério de pronto
Comandos que o executor roda e cujo resultado ele lê: testes, typecheck,
lint, build, grep, inspeção de diff.

Se algo exigir olhar a página renderizada — layout, contraste, flash de tema,
responsivo —, liste em "fica para a revisão". O Codex CLI não controla
navegador; sem isso escrito, ele improvisa um substituto e declara pronto o
que não verificou. É a única cerimônia do formato que não é opcional.

## O que NÃO tocar
Só o que corre risco real de ser alterado por engano. Se não há risco, omita
a seção.
```

## Regras

O plano é escrito para um agente que não participou da conversa que o
originou: nada implícito, nenhum "como discutimos".

Se o plano estiver ambíguo ou contradisser o código, pare e reporte. Não
improvise para destravar.

Atualize `docs/STATE.md` na mesma tarefa quando ela mudar algo que o arquivo
descreve — estrutura, bug conhecido, portão de qualidade. Erro ali é corrigido
na revisão; não vale um passo separado.
