import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { validateUpload } from "@/validators/uploads";
import { avatarSchema, integrationsSchema, updateProfileSchema } from "@/validators/profile";

type Client = SupabaseClient<Database>;

export class ProfileError extends Error {
  constructor(public code: "NOT_FOUND" | "CONFLICT" | "INVALID" | "LIMIT" | "FAILED", message: string) { super(message); }
}

const PROFILE_COLUMNS = "first_name,last_name,email,phone_number,avatar_url,linkedin_url,github_url" as const;
export type ProfileDto = Pick<Database["public"]["Tables"]["profiles"]["Row"], "first_name" | "last_name" | "email" | "phone_number" | "avatar_url" | "linkedin_url" | "github_url">;

export async function getProfile(client: Client, userId: string): Promise<ProfileDto> {
  const { data, error } = await client.from("profiles").select(PROFILE_COLUMNS).eq("id", userId).maybeSingle();
  if (error) throw new ProfileError("FAILED", "Não foi possível carregar o perfil.");
  if (!data) throw new ProfileError("NOT_FOUND", "Perfil não encontrado.");
  return data;
}

/**
 * Personal data update. Email changes go through Auth (confirmation email);
 * the DB trigger then mirrors the confirmed email into profiles and portfolios.
 */
export async function updateProfile(client: Client, userId: string, input: unknown) {
  const { email, ...fields } = updateProfileSchema.parse(input);
  let emailPending = false;
  if (email) {
    const { error } = await client.auth.updateUser({ email });
    if (error) throw new ProfileError(/registered|exists/i.test(error.message) ? "CONFLICT" : "INVALID", "Não foi possível alterar o e-mail.");
    emailPending = true;
  }
  if (Object.keys(fields).length) {
    const { error } = await client.from("profiles").update(fields).eq("id", userId);
    if (error) throw new ProfileError("INVALID", "Dados do perfil inválidos.");
  }
  return { profile: await getProfile(client, userId), emailPending };
}

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Saves under avatars/<uid>/, then the profile trigger syncs it to the portfolios. */
export async function uploadAvatar(client: Client, userId: string, input: unknown) {
  const { contentType, base64 } = avatarSchema.parse(input);
  const file = validateUpload({ bucket: "avatars", filename: `avatar.${EXT[contentType]}`, contentType, base64 });
  const path = `${userId}/avatar.${EXT[contentType]}`;
  const { error } = await client.storage.from("avatars").upload(path, file.bytes, { contentType, upsert: true });
  if (error) throw new ProfileError(/budget|policy|row-level/i.test(error.message) ? "LIMIT" : "FAILED", "Não foi possível enviar a foto.");
  const avatarRef = `avatars/${path}`;
  const { error: updErr } = await client.from("profiles").update({ avatar_url: avatarRef }).eq("id", userId);
  if (updErr) throw new ProfileError("FAILED", "Foto enviada, mas o perfil não foi atualizado.");
  // Bucket is private: return a short-lived link for immediate display.
  const { data: signed } = await client.storage.from("avatars").createSignedUrl(path, 3600);
  return { avatar_url: avatarRef, preview_url: signed?.signedUrl ?? null };
}

export async function updateIntegrations(client: Client, userId: string, input: unknown) {
  const { fetch_github, ...links } = integrationsSchema.parse(input);
  const before = await getProfile(client, userId);
  const patch = Object.fromEntries(Object.entries(links).filter(([, v]) => v !== undefined));
  if (Object.keys(patch).length) {
    const { error } = await client.from("profiles").update(patch).eq("id", userId);
    if (error) throw new ProfileError("INVALID", "Links inválidos.");
  }
  const profile = await getProfile(client, userId);
  let github: Awaited<ReturnType<typeof import("@/services/githubIntegration.service").fetchGithubPortfolioData>> | null = null;
  // Only hit the GitHub API when a new link was saved and the caller asked for it.
  if (fetch_github && profile.github_url && profile.github_url !== before.github_url) {
    const { fetchGithubPortfolioData } = await import("@/services/githubIntegration.service");
    try { github = await fetchGithubPortfolioData(profile.github_url); } catch { github = null; }
  }
  return { profile, github };
}
