import { z } from "zod";

// React escapes plain text. Reject markup instead of mutating career facts.
const text = (max: number) => z.string().trim().max(max).refine((s) => !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s), "Use apenas texto, sem HTML.");
const link = text(500).refine((s) => {
  if (!s) return true;
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return ["https:", "http:"].includes(u.protocol) && !u.username && !u.password && u.hostname.includes(".") && !/[\s<>]/.test(s) && !/^[a-z]+:/i.test(s.replace(/^https?:\/\//i, ""));
  } catch { return false; }
}, "Informe um link HTTP ou HTTPS válido.");
const email = text(254).refine((s) => !s || z.string().email().safeParse(s).success, "E-mail inválido.");
export const themeSchema = z.enum(["moderno", "quente", "minimal"]);
export const inputMethodSchema = z.enum(["pdf_upload", "linkedin_text", "guided_questions"]);
export const portfolioSchema = z.object({
  name: text(120).min(1), role: text(200), headline: text(300), bio: text(3000),
  projectTitle: text(200), challenge: text(3000), action: text(3000), result: text(3000),
  metrics: z.array(text(200)).max(4), skills: z.array(text(120)).max(6),
  journey: z.array(text(500)).max(5), goal: text(1500), linkedin: link, github: link, email,
}).strict();
export const rawAnswersSchema = z.object({
  name: text(120).min(1), area: text(200), bio: text(3000), challenge: text(3000),
  action: text(3000), result: text(3000), skills: text(1000), linkedin: link, github: link, email, goal: text(1500),
}).strict();
export const slugSchema = z.string().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const draftSchema = z.object({
  portfolio: portfolioSchema, theme: themeSchema, slug: slugSchema.optional(),
  inputMethod: inputMethodSchema.default("guided_questions"), photoUrl: z.string().url().max(1000).optional(),
}).strict();
export const ingestionSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("guided_questions"), answers: rawAnswersSchema }).strict(),
  z.object({ method: z.enum(["pdf_upload", "linkedin_text"]), text: text(30000).min(20), name: text(120).min(1) }).strict(),
]);
export const authSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(6).max(128) });
export type PublishDraft = z.infer<typeof draftSchema>;
export type IngestionInput = z.infer<typeof ingestionSchema>;

export function createDeck(p: z.infer<typeof portfolioSchema>) {
  return {
    slide_1_who_i_am: { name: p.name, role: p.role, headline: p.headline, bio: p.bio },
    slide_2_what_i_did: { challenge: p.challenge, action: p.action, result: p.result },
    slide_3_skills: { skills: p.skills },
    slide_4_highlight: { title: p.projectTitle, metrics: p.metrics, journey: p.journey },
    slide_5_contact: { goal: p.goal, email: p.email, linkedin: p.linkedin, github: p.github },
  };
}