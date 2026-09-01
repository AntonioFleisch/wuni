import { describe, expect, it } from "vitest";

import { atendeRestricoes, matchesFilters } from "./filters";
import type { Filtros } from "./filters";
import type { Curso, Perfil } from "./types";

const cursoBase: Curso = {
  id: "design-sp",
  curso: "Design",
  instituicao: "Belas Artes",
  cidade: "São Paulo",
  estado: "SP",
  tipo: "privada",
  modalidade: "presencial",
  duracaoSemestres: 8,
  turnos: ["noturno"],
  ingresso: ["vestibular_proprio", "enem_direto"],
  notaCorte: 550,
  mensalidade: 1800,
  bolsas: true,
  custoVidaCidade: "alto",
  notaMEC: 4,
  taxaEvasao: 18,
  salarioMedioEgressos: 3800,
  situacaoMEC: "regular",
};

const filtrosAbertos: Filtros = {
  busca: "",
  tipo: [],
  modalidade: [],
  turno: [],
  ingresso: [],
  mensalidadeMax: 10000,
  mecMin: 1,
  somenteBolsas: false,
  somenteRegular: false,
};

const perfilBase: Perfil = {
  enem: {},
  orcamentoMensal: 0,
  interesses: ["Administração"],
  cidadesAceita: ["São Paulo"],
  aceitaMorarFora: false,
  turno: [],
  modalidade: [],
};

describe("matchesFilters", () => {
  it("normaliza busca e pesquisa curso, instituição e cidade", () => {
    expect(
      matchesFilters(cursoBase, { ...filtrosAbertos, busca: "  DESIGN  " }),
    ).toBe(true);
    expect(
      matchesFilters(cursoBase, { ...filtrosAbertos, busca: "belas artes" }),
    ).toBe(true);
    expect(
      matchesFilters(cursoBase, { ...filtrosAbertos, busca: "são paulo" }),
    ).toBe(true);
    expect(
      matchesFilters(cursoBase, { ...filtrosAbertos, busca: "medicina" }),
    ).toBe(false);
  });

  it("não filtra quando os arrays estão vazios", () => {
    expect(matchesFilters(cursoBase, filtrosAbertos)).toBe(true);
  });

  it("aplica os filtros de tipo, modalidade, turno e ingresso", () => {
    expect(
      matchesFilters(cursoBase, { ...filtrosAbertos, tipo: ["publica"] }),
    ).toBe(false);
    expect(
      matchesFilters(cursoBase, { ...filtrosAbertos, modalidade: ["EAD"] }),
    ).toBe(false);
    expect(
      matchesFilters(cursoBase, { ...filtrosAbertos, turno: ["matutino"] }),
    ).toBe(false);
    expect(
      matchesFilters(cursoBase, { ...filtrosAbertos, turno: ["noturno"] }),
    ).toBe(true);
    expect(
      matchesFilters(cursoBase, { ...filtrosAbertos, ingresso: ["sisu"] }),
    ).toBe(false);
    expect(
      matchesFilters(cursoBase, {
        ...filtrosAbertos,
        ingresso: ["enem_direto"],
      }),
    ).toBe(true);
  });

  it("aplica limites e seletores booleanos", () => {
    expect(
      matchesFilters(cursoBase, { ...filtrosAbertos, mensalidadeMax: 1799 }),
    ).toBe(false);
    expect(matchesFilters(cursoBase, { ...filtrosAbertos, mecMin: 4.1 })).toBe(
      false,
    );
    expect(
      matchesFilters(
        { ...cursoBase, bolsas: false },
        { ...filtrosAbertos, somenteBolsas: true },
      ),
    ).toBe(false);
    expect(
      matchesFilters(
        { ...cursoBase, situacaoMEC: "em_avaliacao" },
        { ...filtrosAbertos, somenteRegular: true },
      ),
    ).toBe(false);
  });

  it("mantém curso gratuito mesmo com limite baixo de mensalidade", () => {
    expect(
      matchesFilters(
        { ...cursoBase, mensalidade: 0 },
        { ...filtrosAbertos, mensalidadeMax: 0 },
      ),
    ).toBe(true);
  });
});

describe("atendeRestricoes", () => {
  it("corta outra cidade quando o aluno não aceita morar fora", () => {
    expect(
      atendeRestricoes({ ...cursoBase, cidade: "Campinas" }, perfilBase),
    ).toBe(false);
  });

  it("não corta outra cidade quando o aluno aceita morar fora", () => {
    expect(
      atendeRestricoes(
        { ...cursoBase, cidade: "Campinas" },
        { ...perfilBase, aceitaMorarFora: true },
      ),
    ).toBe(true);
  });

  it("não corta por cidade quando a lista de cidades está vazia", () => {
    expect(
      atendeRestricoes(
        { ...cursoBase, cidade: "Campinas" },
        { ...perfilBase, cidadesAceita: [] },
      ),
    ).toBe(true);
  });

  it("não usa interesse como restrição", () => {
    expect(atendeRestricoes(cursoBase, perfilBase)).toBe(true);
  });
});
