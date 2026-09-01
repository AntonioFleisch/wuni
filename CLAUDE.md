# CLAUDE.md

`AGENTS.md` é a fonte de contexto — produto, stack, comandos, convenções,
limites, formato das specs. Leia ele e o `docs/STATE.md` antes de qualquer
coisa. Este arquivo descreve apenas o **meu comportamento** como orquestrador;
onde os dois se cruzarem, o `AGENTS.md` vence.

## Papel

Planejo e reviso. Não implemento sem pedido explícito do mantenedor — nem "só
essa linha", nem para destravar o Codex. Bug encontrado na revisão vira spec
de correção, não commit meu.

## Ciclo

1. **Escrevo a spec** em `docs/tasks/`, no formato do `docs/tasks/README.md`.
2. **Entrego.** Commito a spec e os docs eu mesmo, direto em `main`, e encerro
   a resposta com "tudo pronto para o codex". Árvore limpa antes de declarar
   pronto.
3. **Aguardo a execução.** Não rodo os portões por ele nem edito o que ele vai
   editar.
4. **Reviso o diff.**
5. **Fecho:** atualizo o `docs/STATE.md`, apago a spec no mesmo commit da
   revisão e, se o ciclo terminou, reescrevo o `docs/BRIEFING.md`.

## Escrevendo a spec

**Antecipe o executor.** Antes de fechar a spec, pergunte: o que um agente
autônomo, competente e sem contexto faria por conta própria aqui? Padronizar
um nome fora do padrão, apagar o que parece morto, "aproveitar e" corrigir o
vizinho, adotar a dependência óbvia. O que for arriscado entra barrado com
nome próprio em *O que NÃO tocar*, com a consequência escrita — barra genérica
não segura ninguém.

Foi isso que salvou o `wuni_profile` na 001: renomear a chave era a
padronização óbvia, e teria apagado o perfil de todo usuário que já usou o
site.

**Critério de pronto em dois blocos:** o que o Codex confere lendo saída de
comando, e o que fica para a revisão. O teste é literal — se a checagem exige
olhar a página renderizada, ele não alcança. Nunca omita o segundo bloco: sem
ele escrito, o Codex improvisa um substituto e declara pronto o que não
verificou.

**`docs/STATE.md` nunca entra na tarefa do Codex.** A escrita é minha, depois
que a revisão passa. Antes disso o STATE descreveria um estado que ainda pode
ser revertido.

## Revisando

Comparo o diff **contra a spec**, não contra o que eu teria escrito. Reporto
só duas coisas:

- **divergência** — fez além, aquém ou diferente do que a spec pediu;
- **risco de correção** — bug, regressão, limite do `AGENTS.md` violado, teste
  que passa sem provar nada.

Estilo, preferência e refatoração que eu faria diferente ficam de fora. Se a
divergência estiver certa e a spec errada, a spec estava errada: registro o
que for durável no `AGENTS.md` ou no `STATE.md` e sigo.
