import type { Chance, Curso, NotasEnem, Perfil } from "./types";

export function enemMedia(enem: NotasEnem): number {
  const valores = [
    enem.linguagens,
    enem.humanas,
    enem.natureza,
    enem.matematica,
    enem.redacao,
  ];
  const soma = valores.reduce<number>(
    (acc, valor) => acc + (Number(valor) || 0),
    0,
  );

  return soma / valores.length;
}

export function calculateFit(curso: Curso, perfil: Perfil): number {
  const courseMatch =
    perfil.interesses.length === 0
      ? 0.6
      : perfil.interesses.includes(curso.curso)
        ? 1
        : 0.25;

  let budgetFit: number;
  if (curso.mensalidade === 0) {
    budgetFit = 1;
  } else if (curso.mensalidade <= perfil.orcamentoMensal) {
    const slack =
      perfil.orcamentoMensal > 0
        ? curso.mensalidade / perfil.orcamentoMensal
        : 1;
    budgetFit = Math.max(0.7, 1 - slack * 0.3);
  } else {
    const over =
      (curso.mensalidade - perfil.orcamentoMensal) /
      Math.max(perfil.orcamentoMensal, 1);
    budgetFit = Math.max(0, 1 - over);
  }

  const locationFit =
    perfil.aceitaMorarFora || perfil.cidadesAceita.length === 0
      ? 1
      : perfil.cidadesAceita.includes(curso.cidade)
        ? 1
        : 0.3;

  const modalidadeFit =
    perfil.modalidade.length === 0
      ? 1
      : perfil.modalidade.includes(curso.modalidade)
        ? 1
        : 0.2;

  const turnoFit =
    perfil.turno.length === 0
      ? 1
      : curso.turnos.some((turno) => perfil.turno.includes(turno))
        ? 1
        : 0.3;

  const qualityFit = curso.notaMEC / 5;
  const media = enemMedia(perfil.enem);
  const ratio = curso.notaCorte > 0 ? media / curso.notaCorte : 1;
  const academicFit = Math.min(1, Math.max(0, (ratio - 0.7) / 0.5));

  const weighted =
    courseMatch * 0.3 +
    budgetFit * 0.15 +
    locationFit * 0.1 +
    modalidadeFit * 0.1 +
    turnoFit * 0.05 +
    qualityFit * 0.15 +
    academicFit * 0.15;

  return Math.round(weighted * 100);
}

export function calculateChance(curso: Curso, perfil: Perfil): Chance {
  const media = enemMedia(perfil.enem);
  if (!curso.notaCorte) return "alta";

  const ratio = media / curso.notaCorte;
  if (ratio >= 1.05) return "alta";
  if (ratio >= 0.93) return "media";

  return "baixa";
}
