"use client";

/*
 * AMOSTRA TEMPORÁRIA DO SISTEMA VISUAL — sai quando a landing for portada.
 *
 * Não é página de produto e não tem componente de produto dentro. Existe para
 * a revisão conseguir olhar tokens, tema e tipografia nos dois modos e nas
 * duas larguras: é o equivalente visual do teste de fumaça.
 *
 * É componente de cliente porque exibe o valor computado de cada token, que só
 * existe no navegador e muda junto com o tema.
 */

import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import styles from "./page.module.css";

const PAPEL = [
  "--accent",
  "--accent-fill",
  "--accent-tint",
  "--accent-tint-strong",
  "--success-text",
  "--warning-text",
  "--danger-text",
  "--ink-900",
  "--ink-700",
  "--ink-500",
  "--ink-300",
  "--bg-canvas",
  "--bg-alt",
  "--surface",
  "--border",
  "--header-bg",
] as const;

const TAGS = [
  "--tag-green-bg",
  "--tag-yellow-bg",
  "--tag-red-bg",
  "--tag-blue-bg",
  "--tag-blue-text",
  "--tag-orange-bg",
  "--tag-orange-text",
  "--tag-purple-bg",
  "--tag-purple-text",
] as const;

const RAIOS = ["--radius-lg", "--radius-md", "--radius-sm"] as const;
const SOMBRAS = ["--shadow-md", "--shadow-sm"] as const;

const LIDOS = [...PAPEL, ...TAGS, ...RAIOS, ...SOMBRAS];

/**
 * Lê o valor computado de cada token e relê quando `data-theme` muda, para o
 * texto não descrever o tema anterior depois de um clique no toggle.
 */
function useValores(): Record<string, string> {
  const [valores, setValores] = useState<Record<string, string>>({});

  useEffect(() => {
    const raiz = document.documentElement;

    const ler = () => {
      const estilo = getComputedStyle(raiz);
      const lidos: Record<string, string> = {};
      for (const nome of LIDOS) {
        lidos[nome] = estilo.getPropertyValue(nome).trim();
      }
      setValores(lidos);
    };

    ler();
    const observador = new MutationObserver(ler);
    observador.observe(raiz, { attributeFilter: ["data-theme"] });
    return () => observador.disconnect();
  }, []);

  return valores;
}

function Tira({ nome, valor }: { nome: string; valor: string | undefined }) {
  return (
    <div className={styles.tira}>
      <span className={styles.amostra} aria-hidden="true">
        <span className={styles.cor} style={{ background: `var(${nome})` }} />
      </span>
      <span className={styles.nome}>{nome}</span>
      <span className={styles.valor}>{valor ?? "—"}</span>
    </div>
  );
}

export default function Home() {
  const valores = useValores();

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.topo}>
        <h1>Sistema visual — amostra temporária</h1>
        <ThemeToggle />
      </header>

      <p>
        Página de fumaça da tarefa 105. Confere os design tokens portados de{" "}
        <code>css/style.css</code>, o tema claro/escuro e a base tipográfica.
        Nenhum componente de produto entra aqui, e a página some quando a
        landing for portada.
      </p>
      <p className={styles.nota}>
        O link de pular para o conteúdo vive no layout: pressione Tab a partir
        do topo da página para revelá-lo.
      </p>

      <section>
        <h2>Tokens de papel</h2>
        <div className={styles.grade}>
          {PAPEL.map((nome) => (
            <Tira key={nome} nome={nome} valor={valores[nome]} />
          ))}
        </div>
      </section>

      <section>
        <h2>Tokens de etiqueta</h2>
        <div className={styles.grade}>
          {TAGS.map((nome) => (
            <Tira key={nome} nome={nome} valor={valores[nome]} />
          ))}
        </div>
      </section>

      <section>
        <h2>Raios</h2>
        <div className={styles.grade}>
          {RAIOS.map((nome) => (
            <div key={nome} className={styles.tira}>
              <span
                className={styles.caixa}
                style={{ borderRadius: `var(${nome})` }}
                aria-hidden="true"
              />
              <span className={styles.nome}>{nome}</span>
              <span className={styles.valor}>{valores[nome] ?? "—"}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Sombras</h2>
        <div className={styles.grade}>
          {SOMBRAS.map((nome) => (
            <div key={nome} className={styles.tira}>
              <span
                className={styles.caixa}
                style={{ boxShadow: `var(${nome})` }}
                aria-hidden="true"
              />
              <span className={styles.nome}>{nome}</span>
              <span className={styles.valor}>{valores[nome] ?? "—"}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Tipografia</h2>
        <p className={styles.nota}>
          O primeiro nível é o título no topo desta página — um só h1 por
          documento.
        </p>
        <h2>h2 — Sora nos títulos</h2>
        <h3>h3 — Sora nos títulos</h3>
        <h4>h4 — Sora nos títulos</h4>
        <p>
          Parágrafo em Inter, na cor <code>--ink-700</code>. O texto corrido
          existe para conferir contraste, entrelinha e o peso da fonte nos dois
          temas, em largura de desktop e de telefone.
        </p>
      </section>
    </div>
  );
}
