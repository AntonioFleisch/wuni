import type {
  CriterioOrdem,
  Filtros,
  Ingresso,
  Modalidade,
  TipoInstituicao,
  Turno,
} from "../recommendation";

type ParametrosBusca = Record<string, string | string[] | undefined>;

export const MENSALIDADE_TETO = 10000;
export const ORDEM_PADRAO: CriterioOrdem = "fit";

export const FILTROS_PADRAO: Filtros = {
  busca: "",
  tipo: [],
  modalidade: [],
  turno: [],
  ingresso: [],
  mensalidadeMax: MENSALIDADE_TETO,
  mecMin: 1,
  somenteBolsas: false,
  somenteRegular: false,
};

const TIPOS: readonly TipoInstituicao[] = ["publica", "privada"];
const MODALIDADES: readonly Modalidade[] = ["presencial", "hibrido", "EAD"];
const TURNOS: readonly Turno[] = [
  "matutino",
  "vespertino",
  "noturno",
  "integral",
  "EAD",
];
const INGRESSOS: readonly Ingresso[] = [
  "sisu",
  "vestibular_proprio",
  "enem_direto",
  "historico",
];
const ORDENS: readonly CriterioOrdem[] = [
  "fit",
  "mensalidade",
  "mec",
  "evasao",
];

function pertenceAUniao<T extends string>(
  valor: string,
  valoresAceitos: readonly T[],
): valor is T {
  return valoresAceitos.includes(valor as T);
}

function listaDaBusca(valor: string | string[] | undefined): string[] {
  if (Array.isArray(valor)) {
    return valor;
  }
  return typeof valor === "string" ? [valor] : [];
}

function listaDaUniao<T extends string>(
  valor: string | string[] | undefined,
  valoresAceitos: readonly T[],
): T[] {
  return listaDaBusca(valor).filter((item): item is T =>
    pertenceAUniao(item, valoresAceitos),
  );
}

function numeroDaBusca(
  valor: string | string[] | undefined,
  padrao: number,
  valido: (numero: number) => boolean,
): number {
  if (typeof valor !== "string" || valor.trim() === "") {
    return padrao;
  }

  const numero = Number(valor);
  return Number.isFinite(numero) && valido(numero) ? numero : padrao;
}

export function filtrosDaBusca(params: ParametrosBusca): {
  filtros: Filtros;
  ordem: CriterioOrdem;
} {
  const ordem =
    typeof params.ordem === "string" && pertenceAUniao(params.ordem, ORDENS)
      ? params.ordem
      : ORDEM_PADRAO;

  return {
    filtros: {
      busca: typeof params.busca === "string" ? params.busca : "",
      tipo: listaDaUniao(params.tipo, TIPOS),
      modalidade: listaDaUniao(params.modalidade, MODALIDADES),
      turno: listaDaUniao(params.turno, TURNOS),
      ingresso: listaDaUniao(params.ingresso, INGRESSOS),
      mensalidadeMax: numeroDaBusca(
        params.mensalidadeMax,
        MENSALIDADE_TETO,
        (numero) =>
          Number.isInteger(numero) && numero >= 0 && numero <= MENSALIDADE_TETO,
      ),
      mecMin: numeroDaBusca(
        params.mecMin,
        FILTROS_PADRAO.mecMin,
        (numero) => numero >= 1 && numero <= 5 && Number.isInteger(numero * 2),
      ),
      somenteBolsas: params.bolsas === "1",
      somenteRegular: params.regular === "1",
    },
    ordem,
  };
}

function adicionarLista(
  params: URLSearchParams,
  chave: string,
  valores: readonly string[],
): void {
  valores.forEach((valor) => params.append(chave, valor));
}

export function buscaDosFiltros(
  filtros: Filtros,
  ordem: CriterioOrdem,
): string {
  const params = new URLSearchParams();

  if (filtros.busca !== FILTROS_PADRAO.busca) {
    params.set("busca", filtros.busca);
  }
  adicionarLista(params, "tipo", filtros.tipo);
  adicionarLista(params, "modalidade", filtros.modalidade);
  adicionarLista(params, "turno", filtros.turno);
  adicionarLista(params, "ingresso", filtros.ingresso);
  if (filtros.mensalidadeMax !== FILTROS_PADRAO.mensalidadeMax) {
    params.set("mensalidadeMax", String(filtros.mensalidadeMax));
  }
  if (filtros.mecMin !== FILTROS_PADRAO.mecMin) {
    params.set("mecMin", String(filtros.mecMin));
  }
  if (filtros.somenteBolsas) {
    params.set("bolsas", "1");
  }
  if (filtros.somenteRegular) {
    params.set("regular", "1");
  }
  if (ordem !== ORDEM_PADRAO) {
    params.set("ordem", ordem);
  }

  return params.toString();
}
