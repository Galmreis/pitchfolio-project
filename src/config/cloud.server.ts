import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Instantiate per request: no browser storage or cross-user session sharing.
export function createRequestCloudClient(bearer?: string) {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Serviço indisponível.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      ...(bearer ? { headers: { Authorization: `Bearer ${bearer}` } } : {}),
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}