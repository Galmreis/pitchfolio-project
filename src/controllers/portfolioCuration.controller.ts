import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { curationRequestSchema } from "@/validators/curation";

export class CurationError extends Error {
  constructor(public status: 400 | 404, message: string) { super(message); }
}

// Delegates to one SQL function so every visibility/highlight/order change commits or rolls back together.
export async function applyCuration(client: SupabaseClient<Database>, portfolioId: unknown, body: unknown) {
  const id = z.string().uuid().safeParse(portfolioId);
  if (!id.success) throw new CurationError(400, "Portfólio inválido.");
  const req = curationRequestSchema.safeParse(body);
  if (!req.success) throw new CurationError(400, req.error.issues[0]?.message ?? "Dados inválidos.");
  const { data, error } = await client.rpc("apply_portfolio_curation", { p_portfolio_id: id.data, p_items: req.data.items });
  if (error) {
    if (/NOT_FOUND/.test(error.message)) throw new CurationError(404, "Portfólio ou item não encontrado.");
    throw new CurationError(400, "Não foi possível salvar a curadoria.");
  }
  return { updated: data };
}
