import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { draftSchema } from "@/validators/portfolio";

export async function publishDraft(client: SupabaseClient<Database>, input: unknown, origin: string) {
  const draft = draftSchema.parse(input);
  const { data, error } = await client.rpc("publish_pitchfolio_draft", {
    p_data: draft.portfolio, p_theme: draft.theme, p_slug: draft.slug,
    p_input_method: draft.inputMethod, p_photo_url: draft.photoUrl,
  });
  const saved = data?.[0];
  if (error || !saved) throw new Error("Não foi possível publicar o portfólio.");
  const path = `/p/${saved.slug}`;
  const url = new URL(path, origin).href;
  return { id: saved.portfolio_id, slug: saved.slug, path, url, qrPayload: url };
}