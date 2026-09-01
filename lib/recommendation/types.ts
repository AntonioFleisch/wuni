export type Turno = "matutino" | "vespertino" | "noturno" | "integral" | "EAD";

export type Modalidade = "presencial" | "hibrido" | "EAD";

export type Ingresso =
  "sisu" | "vestibular_proprio" | "enem_direto" | "historico";

export type TipoInstituicao = "publica" | "privada";

export type CustoVida = "baixo" | "medio" | "alto";

export type SituacaoMEC = "regular" | "em_avaliacao";

export type Chance = "alta" | "media" | "baixa";

export interface Curso {
  id: string;
  curso: string;
  instituicao: string;
  cidade: string;
  estado: string;
  tipo: TipoInstituicao;
  modalidade: Modalidade;
  duracaoSemestres: number;
  turnos: Turno[];
  ingresso: Ingresso[];
  notaCorte: number;
  mensalidade: number;
  bolsas: boolean;
  custoVidaCidade: CustoVida;
  notaMEC: number;
  taxaEvasao: number;
  salarioMedioEgressos: number;
  situacaoMEC: SituacaoMEC;
}

export interface NotasEnem {
  linguagens?: number;
  humanas?: number;
  natureza?: number;
  matematica?: number;
  redacao?: number;
}

export interface Perfil {
  enem: NotasEnem;
  orcamentoMensal: number;
  interesses: string[];
  cidadesAceita: string[];
  aceitaMorarFora: boolean;
  turno: Turno[];
  modalidade: Modalidade[];
}

export interface Recomendacao {
  curso: Curso;
  fit: number;
  chance: Chance;
}
