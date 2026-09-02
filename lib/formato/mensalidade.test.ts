import { describe, expect, it } from "vitest";

import { formatarMensalidade } from "./mensalidade";

describe("formatarMensalidade", () => {
  it("mantém mensalidade desconhecida distinta de gratuita", () => {
    expect(formatarMensalidade(null)).toBe("Não informada");
    expect(formatarMensalidade(null)).not.toBe("Gratuita");
  });

  it("identifica uma faixa gratuita", () => {
    expect(formatarMensalidade({ min: 0, max: 0 })).toBe("Gratuita");
  });

  it("formata uma mensalidade de valor único sem centavos", () => {
    expect(formatarMensalidade({ min: 1250, max: 1250 })).toBe(
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(1250),
    );
  });

  it("formata os dois extremos de uma faixa", () => {
    const formatador = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });

    expect(formatarMensalidade({ min: 800, max: 1500 })).toBe(
      `${formatador.format(800)} – ${formatador.format(1500)}`,
    );
  });
});
