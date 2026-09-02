import { describe, expect, it } from "vitest";

import { calculateFit } from "../recommendation";
import type { Curso } from "../recommendation";
import {
  ORCAMENTO_SEM_LIMITE,
  parsePerfilArmazenado,
  perfilVazio,
  serializarPerfil,
} from "./parse";
import type { PerfilAluno, ResultadoPerfil } from "./types";

const DEFAULT_PROFILE: PerfilAluno = {
  nome: "Aluno exemplo",
  anoEscola: "3º ano",
  escolaPublica: false,
  enem: {
    linguagens: 680,
    humanas: 700,
    natureza: 620,
    matematica: 640,
    redacao: 780,
  },
  mediaHistorico: 8.2,
  rendaPerCapita: "de-3-a-5-sm",
  orcamentoMensal: 10000,
  ppi: false,
  pcd: false,
  interesses: ["Administração"],
  cidadesAceita: ["São Paulo"],
  aceitaMorarFora: true,
  turno: [],
  modalidade: ["presencial"],
};

const CURSO_BASE: Curso = {
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
  mensalidade: { min: 500, max: 500 },
  bolsas: true,
  custoVidaCidade: "alto",
  notaMEC: 5,
  taxaEvasao: 10,
  situacaoMEC: "regular",
};

function resultadoOk(raw: string): Extract<ResultadoPerfil, { estado: "ok" }> {
  const resultado = parsePerfilArmazenado(raw);
  expect(resultado.estado).toBe("ok");
  if (resultado.estado !== "ok") {
    throw new Error("resultado deveria ser ok");
  }
  return resultado;
}

function armazenarCom(
  alteracoes: Record<string, unknown>,
  perfil: PerfilAluno = DEFAULT_PROFILE,
): string {
  return JSON.stringify({ ...perfil, ...alteracoes });
}

describe("perfilVazio", () => {
  it("devolve um perfil neutro novo a cada chamada", () => {
    const primeiro = perfilVazio();
    const segundo = perfilVazio();

    expect(primeiro).toEqual({
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
    });
    expect(primeiro).not.toBe(segundo);
    expect(primeiro.enem).not.toBe(segundo.enem);
    expect(primeiro.interesses).not.toBe(segundo.interesses);
  });

  it("pode ser passado diretamente para calculateFit", () => {
    expect(calculateFit(CURSO_BASE, perfilVazio())).toEqual(expect.any(Number));
  });
});

describe("parsePerfilArmazenado", () => {
  it.each([null, "", "   "])("classifica %j como ausente", (raw) => {
    expect(parsePerfilArmazenado(raw)).toEqual({ estado: "ausente" });
  });

  it.each(["{", "[]", "42", '"texto"', "null"])(
    "classifica %s como inválido",
    (raw) => {
      expect(parsePerfilArmazenado(raw)).toEqual({ estado: "invalido" });
    },
  );

  it("normaliza um objeto vazio e lista os campos obrigatórios corrigidos", () => {
    expect(resultadoOk("{}")).toEqual({
      estado: "ok",
      perfil: perfilVazio(),
      camposCorrigidos: [
        "nome",
        "anoEscola",
        "escolaPublica",
        "rendaPerCapita",
        "ppi",
        "pcd",
        "orcamentoMensal",
        "interesses",
        "cidadesAceita",
        "aceitaMorarFora",
        "turno",
        "modalidade",
      ],
    });
  });

  it("preserva sem correções o perfil legado com média em branco", () => {
    const perfilMediaEmBranco = {
      ...DEFAULT_PROFILE,
      mediaHistorico: null,
    };

    expect(resultadoOk(JSON.stringify(perfilMediaEmBranco))).toEqual({
      estado: "ok",
      perfil: perfilMediaEmBranco,
      camposCorrigidos: [],
    });
  });

  it("preserva o DEFAULT_PROFILE do legado sem correções", () => {
    expect(resultadoOk(JSON.stringify(DEFAULT_PROFILE))).toEqual({
      estado: "ok",
      perfil: DEFAULT_PROFILE,
      camposCorrigidos: [],
    });
  });

  it("não ativa a restrição de mudança por ausência do campo", () => {
    const semAceite = { ...DEFAULT_PROFILE } as Record<string, unknown>;
    delete semAceite.aceitaMorarFora;

    const ausente = resultadoOk(JSON.stringify(semAceite));
    const falso = resultadoOk(armazenarCom({ aceitaMorarFora: false }));

    expect(ausente.perfil.aceitaMorarFora).toBe(true);
    expect(ausente.camposCorrigidos).toContain("aceitaMorarFora");
    expect(falso.perfil.aceitaMorarFora).toBe(false);
    expect(falso.camposCorrigidos).toEqual([]);
  });

  it("distingue orçamento ausente de zero explícito", () => {
    const semOrcamento = { ...DEFAULT_PROFILE } as Record<string, unknown>;
    delete semOrcamento.orcamentoMensal;

    const ausente = resultadoOk(JSON.stringify(semOrcamento));
    const zero = resultadoOk(armazenarCom({ orcamentoMensal: 0 }));

    expect(ausente.perfil.orcamentoMensal).toBe(ORCAMENTO_SEM_LIMITE);
    expect(ausente.camposCorrigidos).toContain("orcamentoMensal");
    expect(zero.perfil.orcamentoMensal).toBe(0);
    expect(zero.camposCorrigidos).toEqual([]);
  });

  it.each([-1, 1001, "700"])("descarta a nota de ENEM inválida %j", (nota) => {
    const resultado = resultadoOk(
      armazenarCom({
        enem: { ...DEFAULT_PROFILE.enem, linguagens: nota },
      }),
    );

    expect(resultado.perfil.enem.linguagens).toBeUndefined();
    expect(resultado.camposCorrigidos).toEqual(["enem.linguagens"]);
  });

  it("não registra notas ausentes ou nulas como correção", () => {
    const enemSemLinguagens = { ...DEFAULT_PROFILE.enem };
    delete enemSemLinguagens.linguagens;

    const ausente = resultadoOk(armazenarCom({ enem: enemSemLinguagens }));
    const nula = resultadoOk(
      armazenarCom({ enem: { ...DEFAULT_PROFILE.enem, linguagens: null } }),
    );

    expect(ausente.perfil.enem.linguagens).toBeUndefined();
    expect(ausente.camposCorrigidos).toEqual([]);
    expect(nula.perfil.enem.linguagens).toBeUndefined();
    expect(nula.camposCorrigidos).toEqual([]);
  });

  it("preserva notas válidas nos limites", () => {
    const resultado = resultadoOk(
      armazenarCom({
        enem: { ...DEFAULT_PROFILE.enem, linguagens: 0, redacao: 1000 },
      }),
    );

    expect(resultado.perfil.enem.linguagens).toBe(0);
    expect(resultado.perfil.enem.redacao).toBe(1000);
    expect(resultado.camposCorrigidos).toEqual([]);
  });

  it("filtra valores fora das uniões de turno e modalidade", () => {
    const resultado = resultadoOk(
      armazenarCom({
        turno: ["matutino", "madrugada"],
        modalidade: ["presencial", "remoto"],
      }),
    );

    expect(resultado.perfil.turno).toEqual(["matutino"]);
    expect(resultado.perfil.modalidade).toEqual(["presencial"]);
    expect(resultado.camposCorrigidos).toEqual(["turno", "modalidade"]);
  });

  it("descarta itens não textuais e apara interesses e cidades", () => {
    const resultado = resultadoOk(
      armazenarCom({
        interesses: ["Design", 42, null, "  Direito  "],
        cidadesAceita: ["  São Paulo ", false, "Campinas"],
      }),
    );

    expect(resultado.perfil.interesses).toEqual(["Design", "Direito"]);
    expect(resultado.perfil.cidadesAceita).toEqual(["São Paulo", "Campinas"]);
    expect(resultado.camposCorrigidos).toEqual(["interesses", "cidadesAceita"]);
  });

  it("apara o nome e rejeita valores truthy que não sejam booleanos", () => {
    const resultado = resultadoOk(
      armazenarCom({
        nome: "  Ana  ",
        escolaPublica: 1,
        ppi: "sim",
        pcd: null,
      }),
    );

    expect(resultado.perfil.nome).toBe("Ana");
    expect(resultado.perfil.escolaPublica).toBe(false);
    expect(resultado.perfil.ppi).toBe(false);
    expect(resultado.perfil.pcd).toBe(false);
    expect(resultado.camposCorrigidos).toEqual([
      "nome",
      "escolaPublica",
      "ppi",
      "pcd",
    ]);
  });

  it("aplica os padrões a uniões e números inválidos", () => {
    const resultado = resultadoOk(
      armazenarCom({
        anoEscola: "4º ano",
        mediaHistorico: 11,
        rendaPerCapita: "ignorada",
        orcamentoMensal: -1,
      }),
    );

    expect(resultado.perfil.anoEscola).toBe("3º ano");
    expect(resultado.perfil.mediaHistorico).toBeNull();
    expect(resultado.perfil.rendaPerCapita).toBe("de-1-a-2-sm");
    expect(resultado.perfil.orcamentoMensal).toBe(ORCAMENTO_SEM_LIMITE);
    expect(resultado.camposCorrigidos).toEqual([
      "anoEscola",
      "mediaHistorico",
      "rendaPerCapita",
      "orcamentoMensal",
    ]);
  });

  it("ignora campos desconhecidos", () => {
    const resultado = resultadoOk(
      armazenarCom({ campoDeVersaoAntiga: "ignorado" }),
    );

    expect(resultado.perfil).toEqual(DEFAULT_PROFILE);
    expect(resultado.perfil).not.toHaveProperty("campoDeVersaoAntiga");
    expect(resultado.camposCorrigidos).toEqual([]);
  });
});

describe("serializarPerfil", () => {
  it("faz ida e volta sem alterar um perfil válido", () => {
    expect(resultadoOk(serializarPerfil(DEFAULT_PROFILE))).toEqual({
      estado: "ok",
      perfil: DEFAULT_PROFILE,
      camposCorrigidos: [],
    });
  });
});
