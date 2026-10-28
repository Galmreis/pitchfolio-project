import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { draftSchema } from "@/validators/portfolio";

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