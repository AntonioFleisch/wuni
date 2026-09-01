# docs/tasks/

Planos de tarefa. `NNN-slug.md`, numeração sequencial, nunca reaproveitada.
Um plano concluído fica no repositório como registro.

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
