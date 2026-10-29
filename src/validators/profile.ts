import { z } from "zod";

/** Removes control chars and HTML brackets, trims whitespace. */
const cleanText = (max: number) =>
  // eslint-disable-next-line no-control-regex
  z.string().transform((v) => v.replace(/[\u0000-\u001f\u007f<>]/g, "").trim()).pipe(z.string().min(1, "Campo obrigatório.").max(max));

/**
 * Accepts E.164 (+5511987654321) or Brazilian formats like (11) 98765-4321
 * and normalizes everything to E.164, which is what the database enforces.
 */
export const phoneSchema = z.string().trim().max(25).transform((raw, ctx) => {
  const digits = raw.replace(/[^\d+]/g, "");
  let e164 = digits;
  if (!digits.startsWith("+")) {
    const local = digits.replace(/^0/, "");
    // BR: 2-digit area code + 8/9-digit number.
    if (/^[1-9]{2}9?\d{8}$/.test(local)) e164 = `+55${local}`;
    else if (/^55[1-9]{2}9?\d{8}$/.test(local)) e164 = `+${local}`;
  }
  if (!/^\+[1-9]\d{7,14}$/.test(e164)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Telefone inválido. Use +55 11 98765-4321." });
    return z.NEVER;
  }
  return e164;
});

/** Min 8 chars, upper, lower, digit and symbol. */
export const strongPasswordSchema = z.string().min(8, "Senha precisa de 8+ caracteres.").max(72)
  .regex(/[a-z]/, "Inclua uma letra minúscula.")
  .regex(/[A-Z]/, "Inclua uma letra maiúscula.")
  .regex(/\d/, "Inclua um número.")
  .regex(/[^A-Za-z0-9]/, "Inclua um símbolo.");

export const emailSchema = z.string().trim().toLowerCase().email("E-mail inválido.").max(254);

export const signupSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  first_name: cleanText(60),
  last_name: cleanText(60),
  phone_number: phoneSchema,
}).strict();

export const updateProfileSchema = z.object({
  first_name: cleanText(60).optional(),
  last_name: cleanText(60).optional(),
  phone_number: phoneSchema.optional(),
  email: emailSchema.optional(),
}).strict().refine((v) => Object.keys(v).length > 0, "Nada para atualizar.");

const normalizeUrl = (v: string) => (/^https?:\/\//i.test(v) ? v : `https://${v}`).replace(/^http:/i, "https:").replace(/\/+$/, "");

export const linkedinUrlSchema = z.string().trim().max(200).transform(normalizeUrl)
  .pipe(z.string().regex(/^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]{3,100}$/, "Use linkedin.com/in/seu-perfil."));
export const githubUrlSchema = z.string().trim().max(200).transform(normalizeUrl)
  .pipe(z.string().regex(/^https:\/\/(www\.)?github\.com\/[A-Za-z0-9-]{1,39}$/, "Use github.com/seu-usuario."));

/** null clears a link; undefined leaves it unchanged. */
export const integrationsSchema = z.object({
  linkedin_url: linkedinUrlSchema.nullable().optional(),
  github_url: githubUrlSchema.nullable().optional(),
  fetch_github: z.boolean().optional(),
}).strict();

export const AVATAR_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const avatarSchema = z.object({
  contentType: z.enum(AVATAR_MIME),
  base64: z.string().min(4).max(Math.ceil((5 * 1024 * 1024) / 3) * 4 + 4).regex(/^[A-Za-z0-9+/]+={0,2}$/),
}).strict();

export type SignupInput = z.infer<typeof signupSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type IntegrationsInput = z.infer<typeof integrationsSchema>;
