"use client";

import { useSyncExternalStore } from "react";
import styles from "./ThemeToggle.module.css";

type Tema = "light" | "dark";

const CHAVE_TEMA = "wuni-theme";

/**
 * Descobre o tema vigente — nunca decide qual ele deveria ser.
 *
 * É o `getSnapshot` da fonte de verdade, que fica **fora do React**: o tema
 * mora no elemento raiz, e quem o coloca lá antes da hidratação é o script
 * anti-flash de `app/layout.tsx`. Por isso o botão lê o DOM em vez de guardar
 * um estado próprio, que nasceria errado e precisaria ser corrigido depois de
 * montar.
 *
 * Duas origens legítimas, e só duas:
 *
 * 1. `data-theme` estampado: o aluno já escolheu e o script anti-flash de
 *    `app/layout.tsx` estampou antes da primeira pintura. Basta ler.
 * 2. `data-theme` ausente: o aluno nunca escolheu, e quem decidiu foi o
 *    `@media (prefers-color-scheme: dark)` de `app/globals.css`. Lemos a
 *    resposta dele em `color-scheme` — por isso aquelas três declarações são
 *    dependência funcional deste botão, não enfeite: sem elas o valor
 *    computado não diz nada e o `aria-pressed` passa a mentir.
 *
 * Nada de `matchMedia`: ele refaria a pergunta que o CSS já respondeu, e a
 * preferência do sistema passaria a ser interpretada em dois lugares.
 */
function temaVigente(): Tema {
  const raiz = document.documentElement;
  const estampado = raiz.getAttribute("data-theme");
  if (estampado === "light" || estampado === "dark") {
    return estampado;
  }
  return getComputedStyle(raiz).colorScheme === "dark" ? "dark" : "light";
}

/** Avisa o React sempre que alguém trocar o `data-theme` do elemento raiz. */
function assinar(aoMudar: () => void): () => void {
  const observador = new MutationObserver(aoMudar);
  observador.observe(document.documentElement, {
    attributeFilter: ["data-theme"],
  });
  return () => observador.disconnect();
}

/**
 * No servidor não há elemento raiz para ler, e palpite não serve: o botão
 * renderiza sem `aria-pressed` até hidratar, para o leitor de tela não anunciar
 * um estado que pode ser o contrário do que a página mostra.
 */
function temaNoServidor(): null {
  return null;
}

export default function ThemeToggle() {
  const tema = useSyncExternalStore<Tema | null>(
    assinar,
    temaVigente,
    temaNoServidor,
  );

  function alternar() {
    const proximo: Tema = temaVigente() === "dark" ? "light" : "dark";

    // Estampar o atributo é o que grava a escolha e, pelo observador acima, o
    // que faz este botão se redesenhar. Não há estado a sincronizar à mão.
    document.documentElement.setAttribute("data-theme", proximo);

    try {
      localStorage.setItem(CHAVE_TEMA, proximo);
    } catch {
      // Navegação privativa lança ao gravar. A escolha vale para esta sessão.
    }
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={alternar}
      aria-pressed={tema === null ? undefined : tema === "dark"}
      aria-label="Alternar tema claro/escuro"
    >
      <svg
        className={styles.sun}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg
        className={styles.moon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
