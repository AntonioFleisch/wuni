import type { Metadata } from "next";

import ThemeToggle from "@/components/ThemeToggle";
import { filtrosDaBusca } from "@/lib/filtros";
import { listarCursos } from "@/server/cursos";

import ListaRecomendacoes from "./ListaRecomendacoes";
import styles from "./recomendacoes.module.css";

export const metadata: Metadata = {
  title: "Recomendações — Wuni",
  description:
    "Veja e filtre as faculdades e cursos recomendados para o seu perfil no Wuni.",
};

type ParametrosBusca = Record<string, string | string[] | undefined>;

interface RecomendacoesPageProps {
  searchParams: Promise<ParametrosBusca>;
}

export default async function RecomendacoesPage({
  searchParams,
}: RecomendacoesPageProps) {
  const { filtros, ordem } = filtrosDaBusca(await searchParams);
  const cursos = await listarCursos(filtros);

  return (
    <>
      <div className={`container ${styles.themeToggleRow}`}>
        {/* Temporário: sai quando o cabeçalho do site chegar. */}
        <ThemeToggle />
      </div>

      <section className={styles.pageHero} aria-labelledby="page-title">
        <div className="container">
          <p className={styles.kicker}>Recomendações</p>
          <h1 id="page-title">Faculdades e cursos que combinam com você</h1>
          <p>
            Baseado no perfil salvo neste navegador. Ajuste os filtros abaixo
            para explorar outras opções.
          </p>
        </div>
      </section>

      <section className={styles.appShell} aria-label="Cursos recomendados">
        <div className="container">
          <ListaRecomendacoes cursos={cursos} filtros={filtros} ordem={ordem} />
        </div>
      </section>
    </>
  );
}
