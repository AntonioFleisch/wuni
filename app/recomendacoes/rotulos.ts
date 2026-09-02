import type { Chance, CustoVida, Ingresso, Turno } from "@/lib/recommendation";

export const INGRESSO_LABELS = {
  sisu: "SiSU",
  vestibular_proprio: "Vestibular próprio",
  enem_direto: "ENEM (nota direta)",
  historico: "Histórico escolar/seriado",
} as const satisfies Record<Ingresso, string>;

export const TURNO_LABELS = {
  matutino: "Matutino",
  vespertino: "Vespertino",
  noturno: "Noturno",
  integral: "Integral",
  EAD: "EAD",
} as const satisfies Record<Turno, string>;

export const CUSTO_VIDA_LABELS = {
  baixo: "Custo de vida baixo",
  medio: "Custo de vida médio",
  alto: "Custo de vida alto",
} as const satisfies Record<CustoVida, string>;

type TagChanceClassName = "tagGreen" | "tagYellow" | "tagRed";
type PillChanceClassName = "pillGreen" | "pillYellow" | "pillRed";

interface ChanceMeta {
  emoji: string;
  label: string;
  tagClass: TagChanceClassName;
  pillClass: PillChanceClassName;
}

export const CHANCE_META = {
  alta: {
    emoji: "🟢",
    label: "Alta chance",
    tagClass: "tagGreen",
    pillClass: "pillGreen",
  },
  media: {
    emoji: "🟡",
    label: "Chance intermediária",
    tagClass: "tagYellow",
    pillClass: "pillYellow",
  },
  baixa: {
    emoji: "🔴",
    label: "Baixa chance",
    tagClass: "tagRed",
    pillClass: "pillRed",
  },
} as const satisfies Record<Chance, ChanceMeta>;
