import { describe, expect, it } from "vitest";

import type { Filtros } from "../recommendation";
import {
  buscaDosFiltros,
  FILTROS_PADRAO,
  filtrosDaBusca,
  MENSALIDADE_TETO,
  ORDEM_PADRAO,
} from "./index";

type ParametrosBusca = Record<string, string | string[] | undefined>;

function comoParametrosDoNext(busca: string): ParametrosBusca {
  const resultado: ParametrosBusca = {};

  new URLSearchParams(busca).forEach((valor, chave) => {
    const atual = resultado[chave];
    if (atual === undefined) {
      resultado[chave] = valor;
    } else if (Array.isArray(atual)) {
      atual.push(valor);
    } else {
      resultado[chave] = [atual, valor];
    }
  });

  return resultado;
}

describe("filtrosDaBusca", () => {
  it("devolve os padrões para uma busca vazia", () => {
    expect(filtrosDaBusca({})).toEqual({
      filtros: FILTROS_PADRAO,
      ordem: ORDEM_PADRAO,
    });
  });

  it("descarta valor inválido de união sem derrubar os válidos da chave", () => {
    const resultado = filtrosDaBusca({
      turno: ["noturno", "madrugada", "EAD"],
    });

    expect(resultado.filtros.turno).toEqual(["noturno", "EAD"]);
  });

  it("converte uma chave repetida em lista", () => {
    const resultado = filtrosDaBusca({ tipo: ["publica", "privada"] });

    expect(resultado.filtros.tipo).toEqual(["publica", "privada"]);
  });

  it.each([
    ["não numérica", "barato"],
    ["negativa", "-1"],
    ["acima do teto", String(MENSALIDADE_TETO + 1)],
  ])("faz mensalidade %s cair no padrão", (_caso, mensalidadeMax) => {
    const resultado = filtrosDaBusca({ mensalidadeMax });

    expect(resultado.filtros.mensalidadeMax).toBe(MENSALIDADE_TETO);
  });

  it("faz o critério removido salario cair em fit", () => {
    expect(filtrosDaBusca({ ordem: "salario" }).ordem).toBe("fit");
  });
});

describe("buscaDosFiltros", () => {
  it("é vazia para filtros e ordem padrão", () => {
    expect(buscaDosFiltros(FILTROS_PADRAO, ORDEM_PADRAO)).toBe("");
  });

  it("faz ida e volta preservando um conjunto não trivial", () => {
    const filtros: Filtros = {
      busca: "engenharia de software",
      tipo: ["publica", "privada"],
      modalidade: ["presencial", "EAD"],
      turno: ["noturno", "EAD"],
      ingresso: ["sisu", "enem_direto"],
      mensalidadeMax: 3500,
      mecMin: 3.5,
      somenteBolsas: true,
      somenteRegular: true,
    };

    const busca = buscaDosFiltros(filtros, "evasao");

    expect(busca).toBe(
      "busca=engenharia+de+software&tipo=publica&tipo=privada&modalidade=presencial&modalidade=EAD&turno=noturno&turno=EAD&ingresso=sisu&ingresso=enem_direto&mensalidadeMax=3500&mecMin=3.5&bolsas=1&regular=1&ordem=evasao",
    );
    expect(filtrosDaBusca(comoParametrosDoNext(busca))).toEqual({
      filtros,
      ordem: "evasao",
    });
  });
});
