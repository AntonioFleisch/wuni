import { describe, expect, it } from "vitest";

import { CURSOS_SEED } from "./cursos";

describe("CURSOS_SEED", () => {
  it("não está vazio", () => {
    expect(CURSOS_SEED.length).toBeGreaterThan(0);
  });

  it("tem identificadores únicos", () => {
    const ids = CURSOS_SEED.map((curso) => curso.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("tem faixas de mensalidade coerentes", () => {
    for (const curso of CURSOS_SEED) {
      if (curso.mensalidade === null) continue;

      expect(curso.mensalidade.min).toBeGreaterThanOrEqual(0);
      expect(curso.mensalidade.max).toBeGreaterThanOrEqual(0);
      expect(curso.mensalidade.min).toBeLessThanOrEqual(curso.mensalidade.max);
    }
  });

  it("mantém indicadores numéricos dentro dos limites", () => {
    for (const curso of CURSOS_SEED) {
      expect(curso.notaMEC).toBeGreaterThanOrEqual(1);
      expect(curso.notaMEC).toBeLessThanOrEqual(5);
      expect(curso.taxaEvasao).toBeGreaterThanOrEqual(0);
      expect(curso.taxaEvasao).toBeLessThanOrEqual(100);
      expect(curso.notaCorte).toBeGreaterThanOrEqual(0);
    }
  });

  it("tem turnos e formas de ingresso", () => {
    for (const curso of CURSOS_SEED) {
      expect(curso.turnos.length).toBeGreaterThan(0);
      expect(curso.ingresso.length).toBeGreaterThan(0);
    }
  });
});
