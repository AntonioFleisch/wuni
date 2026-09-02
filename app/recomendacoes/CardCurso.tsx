import { formatarMensalidade } from "@/lib/formato";
import type { Recomendacao } from "@/lib/recommendation";

import styles from "./recomendacoes.module.css";
import {
  CHANCE_META,
  CUSTO_VIDA_LABELS,
  INGRESSO_LABELS,
  TURNO_LABELS,
} from "./rotulos";

interface CardCursoProps {
  recomendacao: Recomendacao;
}

export default function CardCurso({ recomendacao }: CardCursoProps) {
  const { curso, fit, chance } = recomendacao;
  const chanceMeta = CHANCE_META[chance];
  const modalidadeLabel =
    curso.modalidade === "EAD"
      ? "EAD"
      : curso.modalidade === "hibrido"
        ? "Híbrido"
        : "Presencial";

  return (
    <article className={styles.recCard}>
      <div className={styles.recCardMain}>
        <div className={styles.recCardBadges}>
          <span
            className={`${styles.badge} ${
              curso.tipo === "publica"
                ? styles.badgePublic
                : styles.badgePrivate
            }`}
          >
            {curso.tipo === "publica" ? "Pública" : "Privada"}
          </span>
          <span className={`${styles.tag} ${styles[chanceMeta.tagClass]}`}>
            <span aria-hidden="true">{chanceMeta.emoji}</span>{" "}
            {chanceMeta.label}
          </span>
          {curso.bolsas ? (
            <span className={`${styles.badge} ${styles.badgeScholarship}`}>
              Bolsas disponíveis
            </span>
          ) : null}
          <span className={`${styles.badge} ${styles.badgeMec}`}>
            MEC: {curso.situacaoMEC === "regular" ? "Regular" : "Em avaliação"}
          </span>
        </div>

        <h3>{curso.curso}</h3>
        <p className={styles.recInstitution}>{curso.instituicao}</p>
        <p className={styles.recLocation}>
          {curso.cidade}/{curso.estado} ·{" "}
          {CUSTO_VIDA_LABELS[curso.custoVidaCidade]}
        </p>

        <div className={styles.recStats}>
          <div className={styles.recStat}>
            <span>Mensalidade</span>
            <b>{formatarMensalidade(curso.mensalidade)}</b>
          </div>
          <div className={styles.recStat}>
            <span>Duração</span>
            <b>{curso.duracaoSemestres / 2} anos</b>
          </div>
          <div className={styles.recStat}>
            <span>Nota MEC</span>
            <b>{curso.notaMEC.toFixed(1)}/5</b>
          </div>
          <div className={styles.recStat}>
            <span>Taxa de evasão</span>
            <b>{curso.taxaEvasao}%</b>
          </div>
          <div className={styles.recStat}>
            <span>Nota de corte</span>
            <b>{curso.notaCorte}</b>
          </div>
        </div>

        <div className={styles.recChipRows}>
          <div className={styles.recChipRow}>
            <span className={styles.label}>Turnos</span>
            {curso.turnos.map((turno) => (
              <span className={styles.recMiniChip} key={turno}>
                {TURNO_LABELS[turno]}
              </span>
            ))}
          </div>
          <div className={styles.recChipRow}>
            <span className={styles.label}>Ingresso</span>
            {curso.ingresso.map((ingresso) => (
              <span className={styles.recMiniChip} key={ingresso}>
                {INGRESSO_LABELS[ingresso]}
              </span>
            ))}
          </div>
          <div className={styles.recChipRow}>
            <span className={styles.label}>Modalidade</span>
            <span className={styles.recMiniChip}>{modalidadeLabel}</span>
          </div>
        </div>
      </div>

      <div className={styles.recCardSide}>
        <div className={styles.recFitscore}>
          <b>{fit}</b>
          <span>Fit Score</span>
        </div>
      </div>
    </article>
  );
}
