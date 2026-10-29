import { ZodError } from "zod";
import { createRequestCloudClient } from "@/config/cloud.server";
import { signupSchema } from "@/validators/profile";

export type SignupResult = { status: number; body: Record<string, unknown> };

/**
 * Registers a user. Name and phone go into auth metadata so the
 * create_pitchfolio_profile trigger writes the profile in the same transaction.
 */
export async function signup(input: unknown, origin: string): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { status: 400, body: { error: "Dados inválidos.", fields: fieldErrors(parsed.error) } };
  const { email, password, first_name, last_name, phone_number } = parsed.data;
  const client = createRequestCloudClient();
  const { data, error } = await client.auth.signUp({
    email, password,
    options: { emailRedirectTo: origin, data: { first_name, last_name, phone_number, full_name: `${first_name} ${last_name}` } },
  });
  if (error) {
    const msg = error.message.toLowerCase();
    if (error.code === "user_already_exists" || msg.includes("already")) return { status: 409, body: { error: "Este e-mail já está cadastrado." } };
    if (error.code === "weak_password" || msg.includes("password")) return { status: 422, body: { error: "Senha fraca. Use uma senha mais forte." } };
    if (error.status === 429) return { status: 429, body: { error: "Muitas tentativas. Tente mais tarde." } };
    return { status: 400, body: { error: "Não foi possível criar a conta." } };
  }
  // Supabase hides duplicates when confirmation is on: an empty identities list means the email exists.
  if (data.user && data.user.identities?.length === 0) return { status: 409, body: { error: "Este e-mail já está cadastrado." } };
  return { status: 201, body: { user_id: data.user?.id ?? null, confirmation_required: !data.session } };
}

function fieldErrors(error: ZodError) {
  return Object.fromEntries(error.issues.map((i) => [i.path.join("."), i.message]));
}
