import type { z } from "zod";
import type { createDeck, deckSchema, draftSchema, portfolioSchema, ingestionSchema } from "@/validators/portfolio";

export type PortfolioData = z.infer<typeof portfolioSchema>;
export type BrowserDraft = z.infer<typeof draftSchema>;
export type IngestionRequest = z.infer<typeof ingestionSchema>;
export type FiveSlideDeck = ReturnType<typeof createDeck>;
export type DeckSchemaType = z.infer<typeof deckSchema>;

export interface DeckSlideMetadata {
  index: number;
  key: keyof FiveSlideDeck;
  title: string;
  subtitle: string;
  pillar: "role_and_identity" | "potential_in_practice" | "skills" | "impact_metrics" | "career_goals";
}

export const DECK_SLIDES_METADATA: readonly DeckSlideMetadata[] = [
  {
    index: 1,
    key: "slide_1_who_i_am",
    title: "Quem sou eu",
    subtitle: "Onde sei trabalhar e posicionamento profissional",
    pillar: "role_and_identity",
  },
  {
    index: 2,
    key: "slide_2_what_i_did",
    title: "O que fiz na prática",
    subtitle: "Demonstração de potencial e resolução de problemas (Método STAR)",
    pillar: "potential_in_practice",
  },
  {
    index: 3,
    key: "slide_3_skills",
    title: "Habilidades",
    subtitle: "Competências técnicas e interpessoais que trago para o time",
    pillar: "skills",
  },
  {
    index: 4,
    key: "slide_4_highlight",
    title: "Destaques & Trajetória",
    subtitle: "Métricas de impacto e resultados comprovados",
    pillar: "impact_metrics",
  },
  {
    index: 5,
    key: "slide_5_contact",
    title: "Objetivo & Contato",
    subtitle: "Objetivos de carreira, onde quero chegar e canais de contato",
    pillar: "career_goals",
  },
] as const;