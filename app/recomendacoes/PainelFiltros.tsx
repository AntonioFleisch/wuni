"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import {
  buscaDosFiltros,
  FILTROS_PADRAO,
  MENSALIDADE_TETO,
  ORDEM_PADRAO,
} from "@/lib/filtros";
import type {
  CriterioOrdem,
  Filtros,
  Ingresso,
  Modalidade,
  TipoInstituicao,
  Turno,
} from "@/lib/recommendation";

import styles from "./recomendacoes.module.css";
import { INGRESSO_LABELS, TURNO_LABELS } from "./rotulos";

interface PainelFiltrosProps {
  filtros: Filtros;
  ordem: CriterioOrdem;
  quantidade: number;
  children: ReactNode;
}

interface EstadoPainel {
  filtros: Filtros;
  ordem: CriterioOrdem;
}

const TIPOS = [
  { valor: "publica", rotulo: "Pública" },
  { valor: "privada", rotulo: "Privada" },
] as const satisfies readonly {
  valor: TipoInstituicao;
  rotulo: string;
}[];

const MODALIDADES = [
  { valor: "presencial", rotulo: "Presencial" },
  { valor: "EAD", rotulo: "EAD" },
  { valor: "hibrido", rotulo: "Híbrido" },
] as const satisfies readonly { valor: Modalidade; rotulo: string }[];

const TURNOS = [
  "matutino",
  "vespertino",
  "noturno",
  "integral",
  "EAD",
] as const satisfies readonly Turno[];

const INGRESSOS = [
  "sisu",
  "vestibular_proprio",
  "enem_direto",
  "historico",
] as const satisfies readonly Ingresso[];

const ORDENS = [
  { valor: "fit", rotulo: "Fit Score (recomendado)" },
  { valor: "mensalidade", rotulo: "Menor mensalidade" },
  { valor: "mec", rotulo: "Maior nota MEC" },
  { valor: "evasao", rotulo: "Menor taxa de evasão" },
] as const satisfies readonly { valor: CriterioOrdem; rotulo: string }[];

const FORMATADOR_MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function copiarFiltros(filtros: Filtros): Filtros {
  return {
    ...filtros,
    tipo: [...filtros.tipo],
    modalidade: [...filtros.modalidade],
    turno: [...filtros.turno],
    ingresso: [...filtros.ingresso],
  };
}

function alternarValor<T extends string>(valores: T[], valor: T): T[] {
  return valores.includes(valor)
    ? valores.filter((item) => item !== valor)
    : [...valores, valor];
}

function classeChip(ativo: boolean): string {
  return `${styles.chipToggle}${ativo ? ` ${styles.active}` : ""}`;
}

export default function PainelFiltros({
  filtros,
  ordem,
  quantidade,
  children,
}: PainelFiltrosProps) {
  const router = useRouter();
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [estado, setEstado] = useState<EstadoPainel>(() => ({
    filtros: copiarFiltros(filtros),
    ordem,
  }));

  useEffect(
    () => () => {
      if (temporizador.current !== null) {
        clearTimeout(temporizador.current);
      }
    },
    [],
  );

  function cancelarAgendamento(): void {
    if (temporizador.current !== null) {
      clearTimeout(temporizador.current);
      temporizador.current = null;
    }
  }

  function navegar(proximo: EstadoPainel): void {
    const busca = buscaDosFiltros(proximo.filtros, proximo.ordem);
    const destino = busca ? `/recomendacoes?${busca}` : "/recomendacoes";
    router.replace(destino, { scroll: false });
  }

  function atualizarAgora(proximo: EstadoPainel): void {
    cancelarAgendamento();
    setEstado(proximo);
    navegar(proximo);
  }

  function atualizarDepois(proximo: EstadoPainel): void {
    cancelarAgendamento();
    setEstado(proximo);
    temporizador.current = setTimeout(() => {
      temporizador.current = null;
      navegar(proximo);
    }, 300);
  }

  function atualizarFiltros(
    proximosFiltros: Filtros,
    adiarNavegacao = false,
  ): void {
    const proximo = { filtros: proximosFiltros, ordem: estado.ordem };
    if (adiarNavegacao) {
      atualizarDepois(proximo);
    } else {
      atualizarAgora(proximo);
    }
  }

  function limpar(): void {
    cancelarAgendamento();
    setEstado({
      filtros: copiarFiltros(FILTROS_PADRAO),
      ordem: ORDEM_PADRAO,
    });
    router.replace("/recomendacoes", { scroll: false });
  }

  const filtrosAtuais = estado.filtros;
  const mensalidadeLabel =
    filtrosAtuais.mensalidadeMax === MENSALIDADE_TETO
      ? "Sem limite"
      : FORMATADOR_MOEDA.format(filtrosAtuais.mensalidadeMax);

  return (
    <div className={styles.recLayout}>
      <aside
        className={styles.filterPanel}
        aria-label="Filtros de recomendações"
      >
        <div className={styles.filterPanelHead}>
          <h2>Filtros</h2>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
            onClick={limpar}
          >
            Limpar
          </button>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="search-input">Curso, instituição ou cidade</label>
          <input
            type="text"
            id="search-input"
            placeholder="Ex: Administração, FGV, São Paulo..."
            value={filtrosAtuais.busca}
            onChange={(event) =>
              atualizarFiltros(
                { ...filtrosAtuais, busca: event.currentTarget.value },
                true,
              )
            }
          />
        </div>

        <hr className={styles.filterDivider} />

        <div
          className={styles.filterGroup}
          role="group"
          aria-labelledby="filter-tipo-label"
        >
          <label id="filter-tipo-label">Tipo de instituição</label>
          <div className={styles.chipSelect}>
            {TIPOS.map(({ valor, rotulo }) => {
              const ativo = filtrosAtuais.tipo.includes(valor);
              return (
                <button
                  key={valor}
                  type="button"
                  className={classeChip(ativo)}
                  aria-pressed={ativo}
                  onClick={() =>
                    atualizarFiltros({
                      ...filtrosAtuais,
                      tipo: alternarValor(filtrosAtuais.tipo, valor),
                    })
                  }
                >
                  {rotulo}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={styles.filterGroup}
          role="group"
          aria-labelledby="filter-modalidade-label"
        >
          <label id="filter-modalidade-label">Modalidade</label>
          <div className={styles.chipSelect}>
            {MODALIDADES.map(({ valor, rotulo }) => {
              const ativo = filtrosAtuais.modalidade.includes(valor);
              return (
                <button
                  key={valor}
                  type="button"
                  className={classeChip(ativo)}
                  aria-pressed={ativo}
                  onClick={() =>
                    atualizarFiltros({
                      ...filtrosAtuais,
                      modalidade: alternarValor(
                        filtrosAtuais.modalidade,
                        valor,
                      ),
                    })
                  }
                >
                  {rotulo}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={styles.filterGroup}
          role="group"
          aria-labelledby="filter-turno-label"
        >
          <label id="filter-turno-label">Turnos ofertados</label>
          <div className={styles.chipSelect}>
            {TURNOS.map((turno) => {
              const ativo = filtrosAtuais.turno.includes(turno);
              return (
                <button
                  key={turno}
                  type="button"
                  className={classeChip(ativo)}
                  aria-pressed={ativo}
                  onClick={() =>
                    atualizarFiltros({
                      ...filtrosAtuais,
                      turno: alternarValor(filtrosAtuais.turno, turno),
                    })
                  }
                >
                  {TURNO_LABELS[turno]}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={styles.filterGroup}
          role="group"
          aria-labelledby="filter-ingresso-label"
        >
          <label id="filter-ingresso-label">Forma de ingresso</label>
          <div className={styles.chipSelect}>
            {INGRESSOS.map((ingresso) => {
              const ativo = filtrosAtuais.ingresso.includes(ingresso);
              return (
                <button
                  key={ingresso}
                  type="button"
                  className={classeChip(ativo)}
                  aria-pressed={ativo}
                  onClick={() =>
                    atualizarFiltros({
                      ...filtrosAtuais,
                      ingresso: alternarValor(filtrosAtuais.ingresso, ingresso),
                    })
                  }
                >
                  {ingresso === "historico"
                    ? "Histórico/seriado"
                    : INGRESSO_LABELS[ingresso]}
                </button>
              );
            })}
          </div>
        </div>

        <hr className={styles.filterDivider} />

        <div className={styles.filterGroup}>
          <div className={styles.rangeField}>
            <div className={styles.rangeFieldHead}>
              <label htmlFor="filter-mensalidade">Mensalidade máxima</label>
              <span>{mensalidadeLabel}</span>
            </div>
            <input
              type="range"
              id="filter-mensalidade"
              min="0"
              max={MENSALIDADE_TETO}
              step="100"
              value={filtrosAtuais.mensalidadeMax}
              aria-describedby="mensalidade-help"
              onChange={(event) =>
                atualizarFiltros(
                  {
                    ...filtrosAtuais,
                    mensalidadeMax: Number(event.currentTarget.value),
                  },
                  true,
                )
              }
            />
            <span className={styles.fieldHelp} id="mensalidade-help">
              Cursos gratuitos e cursos sem preço informado sempre aparecem
            </span>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.rangeField}>
            <div className={styles.rangeFieldHead}>
              <label htmlFor="filter-mec">Nota mínima de qualidade (MEC)</label>
              <span>{filtrosAtuais.mecMin.toFixed(1)}</span>
            </div>
            <input
              type="range"
              id="filter-mec"
              min="1"
              max="5"
              step="0.5"
              value={filtrosAtuais.mecMin}
              onChange={(event) =>
                atualizarFiltros(
                  {
                    ...filtrosAtuais,
                    mecMin: Number(event.currentTarget.value),
                  },
                  true,
                )
              }
            />
          </div>
        </div>

        <hr className={styles.filterDivider} />

        <label className={styles.toggleRow}>
          <span className={styles.toggleLabel}>
            Somente com bolsas disponíveis
          </span>
          <span className={styles.switch}>
            <input
              type="checkbox"
              checked={filtrosAtuais.somenteBolsas}
              onChange={(event) =>
                atualizarFiltros({
                  ...filtrosAtuais,
                  somenteBolsas: event.currentTarget.checked,
                })
              }
            />
            <span className={styles.switchTrack} aria-hidden="true" />
          </span>
        </label>

        <label className={styles.toggleRow}>
          <span className={styles.toggleLabel}>
            Somente cursos regulares no MEC
          </span>
          <span className={styles.switch}>
            <input
              type="checkbox"
              checked={filtrosAtuais.somenteRegular}
              onChange={(event) =>
                atualizarFiltros({
                  ...filtrosAtuais,
                  somenteRegular: event.currentTarget.checked,
                })
              }
            />
            <span className={styles.switchTrack} aria-hidden="true" />
          </span>
        </label>
      </aside>

      <div className={styles.resultsColumn}>
        <div className={styles.resultsHead}>
          <p className={styles.resultsCount} aria-live="polite">
            <strong>{quantidade}</strong> opções encontradas
          </p>
          <div className={styles.resultsSort}>
            <label htmlFor="sort-select">Ordenar por</label>
            <select
              id="sort-select"
              value={estado.ordem}
              onChange={(event) =>
                atualizarAgora({
                  filtros: filtrosAtuais,
                  ordem: event.currentTarget.value as CriterioOrdem,
                })
              }
            >
              {ORDENS.map(({ valor, rotulo }) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </select>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
