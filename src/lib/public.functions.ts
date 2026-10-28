import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { DEMO_ANSWERS, localStructure, type Portfolio, type ThemeName } from "./portfolio";
import { z } from "zod";
import { createDeck, deckSchema, slugSchema, portfolioSchema, themeSchema } from "@/validators/portfolio";
import type { FiveSlideDeck } from "@/types/pitchfolio";

export const getPublicPortfolio = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: slugSchema }).strict().parse(input))
  .handler(async ({ data }) => {
    if (data.slug === "ana-souza-demo") {
      const demoPortfolio: Portfolio = localStructure(DEMO_ANSWERS);
      return { slug: "ana-souza-demo", theme: "moderno" as ThemeName, portfolio: demoPortfolio, deck: createDeck(demoPortfolio) };
    }
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data: row } = await sb
      .from("portfolios")
      .select("id, slug, selected_theme, data")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!row) return null;
    const portfolio = portfolioSchema.safeParse(row.data);
    const theme = themeSchema.safeParse(row.selected_theme);
    if (!portfolio.success || !theme.success) return null;

    const { data: deckRow } = await sb
      .from("pitch_decks")
      .select("slide_1_who_i_am, slide_2_what_i_did, slide_3_skills, slide_4_highlight, slide_5_contact")
      .eq("portfolio_id", row.id)
      .maybeSingle();

    const parsedDeck = deckSchema.safeParse(deckRow);
    const deck: FiveSlideDeck = parsedDeck.success ? parsedDeck.data : createDeck(portfolio.data);

    return { slug: row.slug, theme: theme.data, portfolio: portfolio.data, deck };
  });
