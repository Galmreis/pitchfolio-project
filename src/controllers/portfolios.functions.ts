import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createDeck, deckSchema, draftSchema, portfolioSchema, slugSchema } from "@/validators/portfolio";
import { z } from "zod";
import type { FiveSlideDeck } from "@/types/pitchfolio";

export const publishPortfolioDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => draftSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { publishDraft } = await import("@/services/publish.server");
    return publishDraft(context.supabase, data, new URL(getRequest().url).origin);
  });

// Owners must have a separate read path for rows hidden from public sharing.
export const listOwnedPortfolios = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("portfolios")
      .select("id,slug,name,is_published,selected_theme,data").eq("user_id", context.userId);
    if (error) throw new Error("Não foi possível carregar seus portfólios.");
    return data;
  });

// Generates the five-slide pitch deck from portfolio data
export const generatePitchDeck = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => portfolioSchema.parse(input))
  .handler(async ({ data }): Promise<{ deck: FiveSlideDeck }> => {
    return { deck: createDeck(data) };
  });

// Retrieves the pitch deck of a published portfolio
export const getPortfolioDeck = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: slugSchema }).parse(input))
  .handler(async ({ data }): Promise<{ deck: FiveSlideDeck }> => {
    const { createRequestCloudClient } = await import("@/config/cloud.server");
    const client = createRequestCloudClient();
    const { data: row } = await client
      .from("portfolios")
      .select("id, data, is_published")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!row) throw new Error("Portfólio não encontrado.");
    const parsed = portfolioSchema.safeParse(row.data);
    if (!parsed.success) throw new Error("Dados do portfólio inválidos.");

    const { data: deckRow } = await client
      .from("pitch_decks")
      .select("slide_1_who_i_am, slide_2_what_i_did, slide_3_skills, slide_4_highlight, slide_5_contact")
      .eq("portfolio_id", row.id)
      .maybeSingle();

    const parsedDeck = deckSchema.safeParse(deckRow);
    const deck: FiveSlideDeck = parsedDeck.success ? parsedDeck.data : createDeck(parsed.data);
    return { deck };
  });