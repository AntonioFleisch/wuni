import { CURSOS_SEED } from "../db/seed/cursos";
import { matchesFilters } from "../lib/recommendation";
import type { Curso, Filtros } from "../lib/recommendation";

// Hoje lê o seed em memória; amanhã consulta o banco pela mesma fronteira.
export async function listarCursos(filtros?: Filtros): Promise<Curso[]> {
  if (!filtros) return CURSOS_SEED;

  return CURSOS_SEED.filter((curso) => matchesFilters(curso, filtros));
}
