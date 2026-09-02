import type { FaixaMensalidade } from "../recommendation";

const FORMATADOR_MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function formatarMoeda(valor: number): string {
  return FORMATADOR_MOEDA.format(valor);
}

export function formatarMensalidade(faixa: FaixaMensalidade | null): string {
  if (faixa === null) return "Não informada";
  if (faixa.min === 0 && faixa.max === 0) return "Gratuita";
  if (faixa.min === faixa.max) return formatarMoeda(faixa.min);

  return `${formatarMoeda(faixa.min)} – ${formatarMoeda(faixa.max)}`;
}
