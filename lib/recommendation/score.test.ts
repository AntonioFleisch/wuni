import { describe, expect, it } from "vitest";

import { calculateChance, calculateFit, enemMedia } from "./score";
import type { Curso, Perfil } from "./types";

const cursoBase: Curso = {
  id: "curso-base",
  curso: "Administração",
  instituicao: "Universidade Base",
  cidade: "São Paulo",
  estado: "SP",
  tipo: "privada",
  modalidade: "presencial",
  duracaoSemestres: 8,
  turnos: ["matutino"],
  ingresso: ["vestibular_proprio"],
  notaCorte: 600,
  mensalidade: 500,
  bolsas: true,
  custoVidaCidade: "alto",
  notaMEC: 5,
  taxaEvasao: 10,
  salarioMedioEgressos: 5000,
  situacaoMEC: "regular",
};

const perfilBase: Perfil = {
  enem: {
    linguagens: 600,
    humanas: 600,
    natureza: 600,
    matematica: 600,
    redacao: 600,
  },
  orcamentoMensal: 1000,
  interesses: [],
  cidadesAceita: ["São Paulo"],
  aceitaMorarFora: true,
  turno: [],
  modalidade: [],
};

describe("enemMedia", () => {
  it("divide a soma das cinco notas por cinco", () => {
    expect(enemMedia(perfilBase.enem)).toBe(600);
  });

  it("trata notas ausentes como zero", () => {
    expect(enemMedia({ linguagens: 500, redacao: 1000 })).toBe(300);
  });

  it("devolve zero para um ENEM vazio", () => {
    expect(enemMedia({})).toBe(0);
  });
});

describe("calculateFit", () => {
  it("usa courseMatch 0.6 quando não há interesses", () => {
    expect(calculateFit(cursoBase, perfilBase)).toBe(80);
  });

  it("aplica pesos diferentes a interesse compatível e incompatível", () => {
    const perfilComInteresse = { ...perfilBase, interesses: ["Administração"] };
    const perfilOutraArea = { ...perfilBase, interesses: ["Design"] };

    expect(calculateFit(cursoBase, perfilComInteresse)).toBe(92);
    expect(calculateFit(cursoBase, perfilOutraArea)).toBe(69);
  });

  it("trata orçamento zero para curso pago e gratuito", () => {
    const perfilSemOrcamento = { ...perfilBase, orcamentoMensal: 0 };
    const cursoGratuito = { ...cursoBase, mensalidade: 0 };

    expect(calculateFit(cursoBase, perfilSemOrcamento)).toBe(67);
    expect(calculateFit(cursoGratuito, perfilSemOrcamento)).toBe(82);
  });

  it("usa academicFit 0.6 quando a nota de corte é zero", () => {
    const cursoSemCorte = { ...cursoBase, notaCorte: 0 };

    expect(calculateFit(cursoSemCorte, perfilBase)).toBe(80);
  });

  it("distingue preferência de turno vazia, compatível e incompatível", () => {
    const perfilTurnoCompativel: Perfil = {
      ...perfilBase,
      turno: ["matutino"],
    };
    const perfilTurnoIncompativel: Perfil = {
      ...perfilBase,
      turno: ["noturno"],
    };

    expect(calculateFit(cursoBase, perfilBase)).toBe(80);
    expect(calculateFit(cursoBase, perfilTurnoCompativel)).toBe(80);
    expect(calculateFit(cursoBase, perfilTurnoIncompativel)).toBe(76);
  });

  it("sempre devolve um inteiro entre zero e cem nos casos de fronteira", () => {
    const casos: Array<[Curso, Perfil]> = [
      [cursoBase, perfilBase],
      [cursoBase, { ...perfilBase, enem: {} }],
      [cursoBase, { ...perfilBase, enem: { redacao: 700 } }],
      [cursoBase, { ...perfilBase, orcamentoMensal: 0 }],
      [
        { ...cursoBase, mensalidade: 0 },
        { ...perfilBase, orcamentoMensal: 0 },
      ],
      [{ ...cursoBase, notaCorte: 0 }, perfilBase],
    ];

    casos.forEach(([curso, perfil]) => {
      const fit = calculateFit(curso, perfil);
      expect(Number.isInteger(fit)).toBe(true);
      expect(fit).toBeGreaterThanOrEqual(0);
      expect(fit).toBeLessThanOrEqual(100);
    });
  });
});

describe("calculateChance", () => {
  it("classifica pelas faixas da razão entre média e nota de corte", () => {
    const perfil = {
      ...perfilBase,
      enem: {
        linguagens: 930,
        humanas: 930,
        natureza: 930,
        matematica: 930,
        redacao: 930,
      },
    };

    expect(calculateChance({ ...cursoBase, notaCorte: 885 }, perfil)).toBe(
      "alta",
    );
    expect(calculateChance({ ...cursoBase, notaCorte: 1000 }, perfil)).toBe(
      "media",
    );
    expect(calculateChance({ ...cursoBase, notaCorte: 1001 }, perfil)).toBe(
      "baixa",
    );
  });

  it("classifica nota de corte zero como alta", () => {
    expect(
      calculateChance(
        { ...cursoBase, notaCorte: 0 },
        { ...perfilBase, enem: {} },
      ),
    ).toBe("alta");
  });

  it("considera notas ausentes como zero", () => {
    expect(
      calculateChance(cursoBase, { ...perfilBase, enem: { redacao: 900 } }),
    ).toBe("baixa");
    expect(calculateChance(cursoBase, { ...perfilBase, enem: {} })).toBe(
      "baixa",
    );
  });
});
