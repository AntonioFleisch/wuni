import type {
  Curso,
  Ingresso,
  Modalidade,
  Perfil,
  TipoInstituicao,
  Turno,
} from "./types";

export interface Filtros {
  busca: string;
  tipo: TipoInstituicao[];
  modalidade: Modalidade[];
  turno: Turno[];
  ingresso: Ingresso[];
  mensalidadeMax: number;
  mecMin: number;
  somenteBolsas: boolean;
  somenteRegular: boolean;
}

export function matchesFilters(curso: Curso, filtros: Filtros): boolean {
  const busca = filtros.busca.trim().toLowerCase();
  if (busca) {
    const haystack =
      `${curso.curso} ${curso.instituicao} ${curso.cidade}`.toLowerCase();
    if (!haystack.includes(busca)) return false;
  }
  if (filtros.tipo.length && !filtros.tipo.includes(curso.tipo)) return false;
  if (
    filtros.modalidade.length &&
    !filtros.modalidade.includes(curso.modalidade)
  )
    return false;
  if (
    filtros.turno.length &&
    !curso.turnos.some((turno) => filtros.turno.includes(turno))
  ) {
    return false;
  }
  if (
    filtros.ingresso.length &&
    !curso.ingresso.some((ingresso) => filtros.ingresso.includes(ingresso))
  ) {
    return false;
  }
  if (
    curso.mensalidade !== null &&
    curso.mensalidade.min > filtros.mensalidadeMax
  )
    return false;
  if (curso.notaMEC < filtros.mecMin) return false;
  if (filtros.somenteBolsas && !curso.bolsas) return false;
  if (filtros.somenteRegular && curso.situacaoMEC !== "regular") return false;

  return true;
}

export function atendeRestricoes(curso: Curso, perfil: Perfil): boolean {
  // Interesse deliberadamente pesa no fit, mas não corta cursos adjacentes.
  return !(
    perfil.aceitaMorarFora === false &&
    perfil.cidadesAceita.length > 0 &&
    !perfil.cidadesAceita.includes(curso.cidade)
  );
}
