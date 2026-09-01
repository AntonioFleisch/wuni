import { atendeRestricoes } from "./filters";
import { calculateChance, calculateFit } from "./score";
import type { Curso, Perfil, Recomendacao } from "./types";

export type CriterioOrdem =
  "fit" | "mensalidade" | "mec" | "evasao" | "salario";

export function recommend(cursos: Curso[], perfil: Perfil): Recomendacao[] {
  return cursos
    .filter((curso) => atendeRestricoes(curso, perfil))
    .map((curso) => ({
      curso,
      fit: calculateFit(curso, perfil),
      chance: calculateChance(curso, perfil),
    }))
    .sort((a, b) => b.fit - a.fit || a.curso.id.localeCompare(b.curso.id));
}

export function sortRecommendations(
  recomendacoes: Recomendacao[],
  criterio: CriterioOrdem,
): Recomendacao[] {
  return [...recomendacoes].sort((a, b) => {
    let diferenca: number;

    switch (criterio) {
      case "mensalidade":
        diferenca = a.curso.mensalidade - b.curso.mensalidade;
        break;
      case "mec":
        diferenca = b.curso.notaMEC - a.curso.notaMEC;
        break;
      case "evasao":
        diferenca = a.curso.taxaEvasao - b.curso.taxaEvasao;
        break;
      case "salario":
        diferenca = b.curso.salarioMedioEgressos - a.curso.salarioMedioEgressos;
        break;
      case "fit":
        diferenca = b.fit - a.fit;
        break;
    }

    return diferenca || a.curso.id.localeCompare(b.curso.id);
  });
}

export function partitionByFit(
  recomendacoes: Recomendacao[],
  ratio = 0.5,
): { principais: Recomendacao[]; secundarias: Recomendacao[] } {
  if (recomendacoes.length === 0) {
    return { principais: [], secundarias: [] };
  }

  const maiorFit = recomendacoes.reduce(
    (maior, recomendacao) => Math.max(maior, recomendacao.fit),
    0,
  );
  const limiar = maiorFit * ratio;
  const principais: Recomendacao[] = [];
  const secundarias: Recomendacao[] = [];

  recomendacoes.forEach((recomendacao) => {
    if (recomendacao.fit >= limiar) {
      principais.push(recomendacao);
    } else {
      secundarias.push(recomendacao);
    }
  });

  return { principais, secundarias };
}
