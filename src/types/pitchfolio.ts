import type { z } from "zod";
import type { createDeck, draftSchema, portfolioSchema, ingestionSchema } from "@/validators/portfolio";

export type PortfolioData = z.infer<typeof portfolioSchema>;
export type BrowserDraft = z.infer<typeof draftSchema>;
export type IngestionRequest = z.infer<typeof ingestionSchema>;
export type FiveSlideDeck = ReturnType<typeof createDeck>;