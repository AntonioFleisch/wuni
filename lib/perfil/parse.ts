import type { Modalidade, NotasEnem, Turno } from "../recommendation";

import type {
  AnoEscola,
  PerfilAluno,
  RendaPerCapita,
  ResultadoPerfil,
} from "./types";

export const ORCAMENTO_SEM_LIMITE = 10000;

const ANOS_ESCOLA: readonly AnoEscola[] = [
  "1º ano",
  "2º ano",
  "3º ano",
  "Concluinte",
];

const RENDAS_PER_CAPITA: readonly RendaPerCapita[] = [
  "ate-1-sm",
  "de-1-a-2-sm",
  "de-2-a-3-sm",
  "de-3-a-5-sm",
  "acima-5-sm",
];

const TURNOS: readonly Turno[] = [
  "matutino",
  "vespertino",
  "noturno",
  "integral",
  "EAD",
];

const MODALIDADES: readonly Modalidade[] = ["presencial", "hibrido", "EAD"];

const CAMPOS_ENEM = [
  "linguagens",
  "humanas",
  "natureza",
  "matematica",
  "redacao",
] as const satisfies readonly (keyof NotasEnem)[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pertenceAUniao<T extends string>(
  value: unknown,
  valores: readonly T[],
): value is T {
  return typeof value === "string" && valores.includes(value as T);
}

function normalizarListaStrings(value: unknown): {
  valor: string[];
  corrigido: boolean;
} {
  if (!Array.isArray(value)) {
    return { valor: [], corrigido: true };
  }

  const valor: string[] = [];
  let corrigido = false;

  value.forEach((item) => {
    if (typeof item !== "string") {
      corrigido = true;
      return;
    }

    const itemNormalizado = item.trim();
    if (itemNormalizado !== item) {
      corrigido = true;
    }
    valor.push(itemNormalizado);
  });

  return { valor, corrigido };
}

function normalizarListaUniao<T extends string>(
  value: unknown,
  valores: readonly T[],
): { valor: T[]; corrigido: boolean } {
  if (!Array.isArray(value)) {
    return { valor: [], corrigido: true };
  }

  const valor = value.filter((item): item is T =>
    pertenceAUniao(item, valores),
  );

  return { valor, corrigido: valor.length !== value.length };
}

function normalizarEnem(value: unknown, camposCorrigidos: string[]): NotasEnem {
  const origem = isRecord(value) ? value : {};
  const enem: NotasEnem = {};

  CAMPOS_ENEM.forEach((campo) => {
    const nota = origem[campo];
    if (typeof nota === "number" && nota >= 0 && nota <= 1000) {
      enem[campo] = nota;
      return;
    }

    camposCorrigidos.push(`enem.${campo}`);
  });

  return enem;
}

export function perfilVazio(): PerfilAluno {
  return {
    nome: "",
    anoEscola: "3º ano",
    escolaPublica: false,
    mediaHistorico: null,
    rendaPerCapita: "de-1-a-2-sm",
    ppi: false,
    pcd: false,
    enem: {},
    orcamentoMensal: ORCAMENTO_SEM_LIMITE,
    interesses: [],
    cidadesAceita: [],
    aceitaMorarFora: true,
    turno: [],
    modalidade: [],
  };
}

export function parsePerfilArmazenado(raw: string | null): ResultadoPerfil {
  if (raw === null || raw.trim() === "") {
    return { estado: "ausente" };
  }

  let armazenado: unknown;
  try {
    armazenado = JSON.parse(raw);
  } catch {
    return { estado: "invalido" };
  }

  if (!isRecord(armazenado)) {
    return { estado: "invalido" };
  }

  const perfil = perfilVazio();
  const camposCorrigidos: string[] = [];

  if (typeof armazenado.nome === "string") {
    perfil.nome = armazenado.nome.trim();
    if (perfil.nome !== armazenado.nome) {
      camposCorrigidos.push("nome");
    }
  } else {
    camposCorrigidos.push("nome");
  }

  if (pertenceAUniao(armazenado.anoEscola, ANOS_ESCOLA)) {
    perfil.anoEscola = armazenado.anoEscola;
  } else {
    camposCorrigidos.push("anoEscola");
  }

  if (typeof armazenado.escolaPublica === "boolean") {
    perfil.escolaPublica = armazenado.escolaPublica;
  } else {
    camposCorrigidos.push("escolaPublica");
  }

  if (
    typeof armazenado.mediaHistorico === "number" &&
    armazenado.mediaHistorico >= 0 &&
    armazenado.mediaHistorico <= 10
  ) {
    perfil.mediaHistorico = armazenado.mediaHistorico;
  } else {
    camposCorrigidos.push("mediaHistorico");
  }

  if (pertenceAUniao(armazenado.rendaPerCapita, RENDAS_PER_CAPITA)) {
    perfil.rendaPerCapita = armazenado.rendaPerCapita;
  } else {
    camposCorrigidos.push("rendaPerCapita");
  }

  if (typeof armazenado.ppi === "boolean") {
    perfil.ppi = armazenado.ppi;
  } else {
    camposCorrigidos.push("ppi");
  }

  if (typeof armazenado.pcd === "boolean") {
    perfil.pcd = armazenado.pcd;
  } else {
    camposCorrigidos.push("pcd");
  }

  if (
    typeof armazenado.orcamentoMensal === "number" &&
    armazenado.orcamentoMensal >= 0
  ) {
    perfil.orcamentoMensal = armazenado.orcamentoMensal;
  } else {
    camposCorrigidos.push("orcamentoMensal");
  }

  perfil.enem = normalizarEnem(armazenado.enem, camposCorrigidos);

  const interesses = normalizarListaStrings(armazenado.interesses);
  perfil.interesses = interesses.valor;
  if (interesses.corrigido) {
    camposCorrigidos.push("interesses");
  }

  const cidadesAceita = normalizarListaStrings(armazenado.cidadesAceita);
  perfil.cidadesAceita = cidadesAceita.valor;
  if (cidadesAceita.corrigido) {
    camposCorrigidos.push("cidadesAceita");
  }

  if (typeof armazenado.aceitaMorarFora === "boolean") {
    perfil.aceitaMorarFora = armazenado.aceitaMorarFora;
  } else {
    camposCorrigidos.push("aceitaMorarFora");
  }

  const turno = normalizarListaUniao(armazenado.turno, TURNOS);
  perfil.turno = turno.valor;
  if (turno.corrigido) {
    camposCorrigidos.push("turno");
  }

  const modalidade = normalizarListaUniao(armazenado.modalidade, MODALIDADES);
  perfil.modalidade = modalidade.valor;
  if (modalidade.corrigido) {
    camposCorrigidos.push("modalidade");
  }

  return { estado: "ok", perfil, camposCorrigidos };
}

export function serializarPerfil(perfil: PerfilAluno): string {
  return JSON.stringify(perfil);
}
