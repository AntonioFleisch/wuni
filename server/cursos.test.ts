import { describe, expect, it } from "vitest";

import type { Filtros } from "../lib/recommendation";

import { listarCursos } from "./cursos";

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

describe("listarCursos", () => {
  it("devolve os 16 cursos sem filtros", async () => {
    await expect(listarCursos()).resolves.toHaveLength(16);
  });

  it("devolve menos cursos quando um filtro corta a lista", async () => {
    const cursos = await listarCursos({
      ...filtrosAbertos,
      tipo: ["publica"],
    });

    expect(cursos.length).toBeGreaterThan(0);
    expect(cursos.length).toBeLessThan(16);
    expect(cursos.every((curso) => curso.tipo === "publica")).toBe(true);
  });

  it("devolve lista vazia quando nenhum curso corresponde", async () => {
    await expect(
      listarCursos({
        ...filtrosAbertos,
        busca: "curso que não existe",
      }),
    ).resolves.toEqual([]);
  });
});
