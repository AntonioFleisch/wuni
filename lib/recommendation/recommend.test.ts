import { describe, expect, it } from "vitest";

import { partitionByFit, recommend, sortRecommendations } from "./recommend";
import type { Curso, Perfil, Recomendacao } from "./types";

const cursoAdministracao: Curso = {
  id: "adm",
  curso: "Administração",
  instituicao: "Universidade A",
  cidade: "São Paulo",
  estado: "SP",
  tipo: "privada",
  modalidade: "presencial",
  duracaoSemestres: 8,
  turnos: ["matutino"],
  ingresso: ["vestibular_proprio"],
  notaCorte: 600,
  mensalidade: 1000,
  bolsas: true,
  custoVidaCidade: "alto",
  notaMEC: 4,
  taxaEvasao: 10,
  salarioMedioEgressos: 5000,
  situacaoMEC: "regular",
};

const cursoDesign: Curso = {
  ...cursoAdministracao,
  id: "design",
  curso: "Design",
  instituicao: "Universidade D",
};

const perfilBase: Perfil = {
  enem: {
    linguagens: 600,
    humanas: 600,
    natureza: 600,
    matematica: 600,
    redacao: 600,
  },
  orcamentoMensal: 2000,
  interesses: ["Administração"],
  cidadesAceita: ["São Paulo"],
  aceitaMorarFora: true,
  turno: [],
  modalidade: [],
};

function buildRecomendacao(
  id: string,
  fit: number,
  overrides: Partial<Curso> = {},
): Recomendacao {
  return {
    curso: { ...cursoAdministracao, id, ...overrides },
    fit,
    chance: "media",
  };
}

describe("recommend", () => {
  it("devolve lista vazia quando não há cursos", () => {
    expect(recommend([], perfilBase)).toEqual([]);
  });

  it("mantém Design para aluno de Administração e apenas reduz seu fit", () => {
    const resultado = recommend([cursoDesign, cursoAdministracao], perfilBase);

    expect(resultado.map(({ curso }) => curso.curso)).toEqual([
      "Administração",
      "Design",
    ]);
    expect(resultado[0].fit).toBeGreaterThan(resultado[1].fit);
    resultado.forEach(({ fit }) => {
      expect(Number.isInteger(fit)).toBe(true);
      expect(fit).toBeGreaterThanOrEqual(0);
      expect(fit).toBeLessThanOrEqual(100);
    });
  });

  it("não remove cursos quando o perfil não tem interesses", () => {
    const resultado = recommend([cursoAdministracao, cursoDesign], {
      ...perfilBase,
      interesses: [],
    });

    expect(resultado).toHaveLength(2);
    expect(resultado[0].fit).toBe(resultado[1].fit);
  });

  it("corta outra cidade somente quando o aluno não aceita morar fora", () => {
    const cursoCampinas = { ...cursoDesign, cidade: "Campinas" };

    expect(
      recommend([cursoAdministracao, cursoCampinas], {
        ...perfilBase,
        aceitaMorarFora: false,
      }).map(({ curso }) => curso.id),
    ).toEqual(["adm"]);
    expect(
      recommend([cursoAdministracao, cursoCampinas], {
        ...perfilBase,
        aceitaMorarFora: true,
      }),
    ).toHaveLength(2);
  });
});

describe("sortRecommendations", () => {
  const recomendacoes = [
    buildRecomendacao("b", 60, {
      mensalidade: 500,
      notaMEC: 3,
      taxaEvasao: 5,
      salarioMedioEgressos: 4000,
    }),
    buildRecomendacao("a", 80, {
      mensalidade: 1000,
      notaMEC: 5,
      taxaEvasao: 15,
      salarioMedioEgressos: 6000,
    }),
  ];

  it.each([
    ["fit", ["a", "b"]],
    ["mensalidade", ["b", "a"]],
    ["mec", ["a", "b"]],
    ["evasao", ["b", "a"]],
    ["salario", ["a", "b"]],
  ] as const)("ordena por %s", (criterio, idsEsperados) => {
    expect(
      sortRecommendations(recomendacoes, criterio).map(({ curso }) => curso.id),
    ).toEqual(idsEsperados);
  });

  it("devolve array novo sem mutar a entrada", () => {
    const entrada = [...recomendacoes];
    const resultado = sortRecommendations(entrada, "fit");

    expect(resultado).not.toBe(entrada);
    expect(entrada.map(({ curso }) => curso.id)).toEqual(["b", "a"]);
  });

  it("desempata sempre pelo id ascendente", () => {
    const empatadas = [buildRecomendacao("b", 70), buildRecomendacao("a", 70)];

    expect(
      sortRecommendations(empatadas, "fit").map(({ curso }) => curso.id),
    ).toEqual(["a", "b"]);
    expect(sortRecommendations([], "fit")).toEqual([]);
  });
});

describe("partitionByFit", () => {
  it("devolve as duas listas vazias para entrada vazia", () => {
    expect(partitionByFit([])).toEqual({ principais: [], secundarias: [] });
  });

  it("mantém um item único entre os principais", () => {
    const unica = buildRecomendacao("unica", 40);

    expect(partitionByFit([unica])).toEqual({
      principais: [unica],
      secundarias: [],
    });
  });

  it("calcula o maior fit sem assumir ordem e inclui empate no limiar", () => {
    const baixa = buildRecomendacao("baixa", 49);
    const limiarA = buildRecomendacao("limiar-a", 50);
    const maior = buildRecomendacao("maior", 100);
    const limiarB = buildRecomendacao("limiar-b", 50);

    expect(partitionByFit([baixa, limiarA, maior, limiarB])).toEqual({
      principais: [limiarA, maior, limiarB],
      secundarias: [baixa],
    });
  });

  it("aceita um ratio explícito", () => {
    const maior = buildRecomendacao("maior", 80);
    const intermediaria = buildRecomendacao("intermediaria", 50);

    expect(partitionByFit([maior, intermediaria], 0.75)).toEqual({
      principais: [maior],
      secundarias: [intermediaria],
    });
  });
});
