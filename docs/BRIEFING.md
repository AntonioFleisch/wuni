# BRIEFING — partida do ciclo 3

> Handoff do ciclo anterior. **Sobrescrito a cada ciclo**, não acumula.
> Leia `AGENTS.md` e `docs/STATE.md` primeiro; em qualquer contradição, eles
> vencem. Escrito ao fechar o ciclo 2, em 2026-09-02.

## Onde paramos

Ciclo 2 entregou cinco specs, todas revisadas e aprovadas: **101** motor de
recomendação em TypeScript puro, **102** mensalidade como faixa, **103**
`db/seed/` e `server/`, **104** fronteira do perfil, **105** tokens e tema.

O repositório saiu de scaffold vazio para quatro camadas verificadas —
`lib/`, `db/`, `server/`, `components/` — com 73 testes, direção de
dependência checada pelo lint e o sistema visual portado. **Nenhuma página de
produto existe ainda.** O que está em `/` é amostra temporária dos tokens, e
sai com a landing.

`docs/tasks/` está vazio de specs. Próxima numeração: **201**.

## O que está travado

**Onde fica o banco.** O mantenedor adiou explicitamente, e sem isso não
andam a modelagem do esquema nem a ingestão do SiSU — que é a primeira fonte
real e a única que traz nota de corte. ORM e auth seguem adiados junto;
Clerk entrou como alternativa ao Auth.js.

Nada disso trava a próxima spec, e é por isso que ela é uma tela.

## O que fazer primeiro

Recomendo **201 = portar a tela de recomendações**.

É o único trabalho grande que anda sem as decisões pendentes: motor, dados,
perfil e tokens já existem, e `listarCursos()` já nasceu `async` justamente
para o banco entrar depois sem reescrever consumidor. É também o primeiro
momento desde o início da migração em que o produto volta a existir para o
usuário — e onde a decisão de _perfil pesa, não corta_ aparece na tela, na
seção colapsável das secundárias.

**Antes de escrever a 201, resolva duas coisas com o mantenedor:**

1. **De onde a tela lê o perfil nesta fase.** Só existe `localStorage`, e o
   parser da 104 já trata isso — mas ler `localStorage` obriga componente de
   cliente, o que muda o desenho da página inteira.
2. **Filtros em `searchParams` ou em estado de cliente.** Recomendo
   `searchParams`: a URL vira compartilhável, a página continua renderizando
   no servidor e o filtro sobrevive ao recarregar. Estado de cliente é mais
   simples de escrever e perde as três coisas.

## Carrego junto

- A verificação visual é **sempre** do mantenedor. Nenhum agente controla
  navegador, e nenhuma página se declara pronta sem essa passada.
- Se uma sessão Claude for executar de novo, **libere `npm` e `git` para
  ela**. Na 105 ela entregou sem conseguir rodar um portão, e coisa que
  deveria morrer na execução chegou à revisão.
- `app/page.tsx` é amostra temporária. Não trate como página de produto e não
  construa em cima dela.

## Como trabalhamos

- Claude planeja e revisa; o executor executa. **O papel vale mais que a
  ferramenta** — sessão Claude pode executar quando o mantenedor pede, e aí
  segue a disciplina do executor.
- **Quem executou não revisa.** A revisão é de outra sessão.
- **Spec entregue não se edita em silêncio.** Mudou depois do handoff? Avise,
  ou trate a diferença como correção — não reprove o que foi executado certo.
- Specs proporcionais ao diff. Critério de pronto separa o que o executor
  verifica do que fica para a revisão.
- Spec é apagada no commit da revisão, depois de colher o durável.
- Claude commita a documentação sozinho, sem pedir — mas **não** enquanto o
  executor estiver trabalhando, para não mover a base dele.
- Claude encerra a resposta com "tudo pronto para o codex" quando a spec está
  pronta para execução.
