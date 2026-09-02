"use client";

import { useMemo, useSyncExternalStore } from "react";

import type { CriterioOrdem, Curso, Filtros } from "@/lib/recommendation";
import {
  partitionByFit,
  recommend,
  sortRecommendations,
} from "@/lib/recommendation";
import { parsePerfilArmazenado, perfilVazio } from "@/lib/perfil";

import CardCurso from "./CardCurso";
import PainelFiltros from "./PainelFiltros";
import styles from "./recomendacoes.module.css";

const CHAVE_PERFIL = "wuni_profile";
const PERFIL_NAO_HIDRATADO = Symbol("perfil-nao-hidratado");

type SnapshotPerfil = string | null | typeof PERFIL_NAO_HIDRATADO;

interface ListaRecomendacoesProps {
  cursos: Curso[];
  filtros: Filtros;
  ordem: CriterioOrdem;
}

function lerPerfil(): string | null {
  return localStorage.getItem(CHAVE_PERFIL);
}

function assinarPerfil(aoMudar: () => void): () => void {
  function aoArmazenar(evento: StorageEvent) {
    if (
      evento.storageArea === localStorage &&
      (evento.key === CHAVE_PERFIL || evento.key === null)
    ) {
      aoMudar();
    }
  }

  window.addEventListener("storage", aoArmazenar);
  return () => window.removeEventListener("storage", aoArmazenar);
}

function perfilNoServidor(): typeof PERFIL_NAO_HIDRATADO {
  return PERFIL_NAO_HIDRATADO;
}

export default function ListaRecomendacoes({
  cursos,
  filtros,
  ordem,
}: ListaRecomendacoesProps) {
  const snapshotPerfil = useSyncExternalStore<SnapshotPerfil>(
    assinarPerfil,
    lerPerfil,
    perfilNoServidor,
  );

  const resultadoPerfil = useMemo(
    () =>
      snapshotPerfil === PERFIL_NAO_HIDRATADO
        ? null
        : parsePerfilArmazenado(snapshotPerfil),
    [snapshotPerfil],
  );

  const { principais, secundarias, contagens } = useMemo(() => {
    const perfilEfetivo =
      resultadoPerfil?.estado === "ok" ? resultadoPerfil.perfil : perfilVazio();
    const recomendacoes = recommend(cursos, perfilEfetivo);
    const particao = partitionByFit(recomendacoes);
    const principaisOrdenadas = sortRecommendations(particao.principais, ordem);
    const secundariasOrdenadas = sortRecommendations(
      particao.secundarias,
      ordem,
    );
    const totais = recomendacoes.reduce(
      (acumulado, recomendacao) => {
        acumulado[recomendacao.chance] += 1;
        return acumulado;
      },
      { baixa: 0, media: 0, alta: 0 },
    );

    return {
      principais: principaisOrdenadas,
      secundarias: secundariasOrdenadas,
      contagens: totais,
    };
  }, [cursos, ordem, resultadoPerfil]);

  const quantidade = principais.length + secundarias.length;
  let avisoPerfil: string | null = null;

  if (resultadoPerfil?.estado === "ausente") {
    avisoPerfil =
      "Você ainda não preencheu seu perfil. Estes resultados usam preferências neutras.";
  } else if (resultadoPerfil?.estado === "invalido") {
    avisoPerfil =
      "Não foi possível ler o perfil salvo neste navegador. Estes resultados usam preferências neutras.";
  } else if (resultadoPerfil?.estado === "ok") {
    const { nome, interesses } = resultadoPerfil.perfil;
    avisoPerfil = `Resultados baseados no perfil salvo neste navegador${
      nome ? ` de ${nome}` : ""
    }${
      interesses.length > 0 ? `. Interesses: ${interesses.join(", ")}.` : "."
    }`;
  }

  return (
    <>
      <div className={styles.summaryStrip}>
        <div className={`${styles.summaryPill} ${styles.pillRed}`}>
          <b>{contagens.baixa}</b>
          <span>
            <span aria-hidden="true">🎯</span> Faculdades dos sonhos
          </span>
        </div>
        <div className={`${styles.summaryPill} ${styles.pillYellow}`}>
          <b>{contagens.media}</b>
          <span>
            <span aria-hidden="true">⭐</span> Faculdades-alvo
          </span>
        </div>
        <div className={`${styles.summaryPill} ${styles.pillGreen}`}>
          <b>{contagens.alta}</b>
          <span>
            <span aria-hidden="true">✅</span> Opções seguras
          </span>
        </div>
      </div>

      <p className={styles.disclaimerNote}>
        Os dados de cursos, notas de corte, mensalidades e indicadores exibidos
        aqui são <strong>ilustrativos</strong>, usados para demonstrar o
        funcionamento do Wuni — não representam informações oficiais
        atualizadas.
      </p>

      <PainelFiltros filtros={filtros} ordem={ordem} quantidade={quantidade}>
        {avisoPerfil ? (
          <p className={styles.profileNotice}>{avisoPerfil}</p>
        ) : null}

        {quantidade === 0 ? (
          <div className={styles.emptyState}>
            Nenhuma opção encontrada com esses filtros. Tente ampliar a
            mensalidade máxima ou remover algum filtro.
          </div>
        ) : (
          <>
            <div className={styles.recGrid}>
              {principais.map((recomendacao) => (
                <CardCurso
                  recomendacao={recomendacao}
                  key={recomendacao.curso.id}
                />
              ))}
            </div>

            {secundarias.length > 0 ? (
              <details className={styles.secondarySection}>
                <summary className={styles.secondarySummary}>
                  {secundarias.length === 1
                    ? "1 opção com Fit Score mais distante do melhor da lista"
                    : `${secundarias.length} opções com Fit Score mais distante do melhor da lista`}
                </summary>
                <div className={styles.recGrid}>
                  {secundarias.map((recomendacao) => (
                    <CardCurso
                      recomendacao={recomendacao}
                      key={recomendacao.curso.id}
                    />
                  ))}
                </div>
              </details>
            ) : null}
          </>
        )}
      </PainelFiltros>
    </>
  );
}
