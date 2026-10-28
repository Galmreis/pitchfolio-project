import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { Portfolio, ThemeName } from "./portfolio";
import { z } from "zod";
import { slugSchema, portfolioSchema, themeSchema } from "@/validators/portfolio";

export const getPublicPortfolio = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: slugSchema }).strict().parse(input))
  .handler(async ({ data }) => {
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
      .select("slug, selected_theme, data")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!row) return null;
    const portfolio = portfolioSchema.safeParse(row.data);
    const theme = themeSchema.safeParse(row.selected_theme);
    if (!portfolio.success || !theme.success) return null;
    return { slug: row.slug, theme: theme.data, portfolio: portfolio.data };
  });
