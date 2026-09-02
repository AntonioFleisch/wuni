import type { Perfil } from "../recommendation";

export type AnoEscola = "1º ano" | "2º ano" | "3º ano" | "Concluinte";

export type RendaPerCapita =
  "ate-1-sm" | "de-1-a-2-sm" | "de-2-a-3-sm" | "de-3-a-5-sm" | "acima-5-sm";

export interface PerfilAluno extends Perfil {
  nome: string;
  anoEscola: AnoEscola;
  escolaPublica: boolean;
  mediaHistorico: number | null;
  rendaPerCapita: RendaPerCapita;
  ppi: boolean;
  pcd: boolean;
}

export type ResultadoPerfil =
  | { estado: "ausente" }
  | { estado: "invalido" }
  | {
      estado: "ok";
      perfil: PerfilAluno;
      camposCorrigidos: string[];
    };
