import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { DEMO_PERSONAS, buildPersonaPortfolio, type ThemeName } from "./portfolio";
import { z } from "zod";
import { createDeck, deckSchema, slugSchema, portfolioSchema, themeSchema } from "@/validators/portfolio";
import type { FiveSlideDeck } from "@/types/pitchfolio";

export const getPublicPortfolio = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: slugSchema }).strict().parse(input))
  .handler(async ({ data }) => {
    const demoPersona = DEMO_PERSONAS.find((p) => p.slug === data.slug);
    if (demoPersona) {
      const demoPortfolio = buildPersonaPortfolio(demoPersona);
      const { applySectionsToDeck, EMPTY_SECTIONS } = await import("@/services/portfolioSections.service");
      const demoSections = {
        ...EMPTY_SECTIONS,
        certifications:
          demoPersona.id === "ana"
            ? [
                { id: "cert-1", title: "Desenvolvimento Web Full-Stack", issuer: " Monitoria Acadêmica UFPE", issue_date: "2025-11-01", credential: null },
                { id: "cert-2", title: "Acessibilidade Digital (WCAG)", issuer: "Escola Virtual Gov", issue_date: "2026-02-01", credential: null },
              ]
            : demoPersona.id === "lucas"
              ? [
                  { id: "cert-3", title: "Gestão Ágil de Projetos e Indicadores", issuer: "FEJEMG · Movimento Empresa Júnior", issue_date: "2025-10-01", credential: null },
                  { id: "cert-4", title: "Modelagem Financeira em Excel", issuer: "SEBRAE Minas", issue_date: "2026-01-01", credential: null },
                ]
              : [
                  { id: "cert-5", title: "Design de Serviços Públicos e Linguagem Simples", issuer: "ENAP", issue_date: "2025-09-01", credential: null },
                  { id: "cert-6", title: "Pesquisa com Usuários e Prototipagem", issuer: "Laboratório de Design UFMG", issue_date: "2026-02-01", credential: null },
                ],
      };
      return {
        slug: demoPersona.slug,
        theme: demoPersona.theme,
        portfolio: demoPortfolio,
        deck: applySectionsToDeck(createDeck(demoPortfolio), demoSections),
        sections: demoSections,
      };
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

    const { loadVisibleSections, applySectionsToDeck } = await import("@/services/portfolioSections.service");
    const sections = await loadVisibleSections(sb, row.id);
    return { slug: row.slug, theme: theme.data, portfolio: portfolio.data, deck: applySectionsToDeck(deck, sections), sections };
  });
