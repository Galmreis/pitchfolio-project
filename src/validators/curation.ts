import { z } from "zod";

// Client-safe schemas for imported portfolio sections and curation requests.
export const githubUsernameSchema = z.string().trim()
  .transform((v) => v.replace(/^https?:\/\/(www\.)?github\.com\//i, "").split(/[/?#]/)[0] ?? "")
  .pipe(z.string().regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, "Usuário do GitHub inválido."));

const httpsUrl = z.string().url().max(500).refine((u) => u.startsWith("https://"), "Use https.");
const isoDate = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/).transform((d) => (d.length === 7 ? `${d}-01` : d));

export const skillCategorySchema = z.enum(["hard_skill", "soft_skill", "tool", "language"]);
export const skillSourceSchema = z.enum(["github", "linkedin", "manual"]);

export const projectItemSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000),
  technologies: z.array(z.string().trim().min(1).max(60)).max(20),
  repository_url: httpsUrl.nullable(),
  deploy_url: httpsUrl.nullable(),
  stars: z.number().int().min(0),
  is_highlight: z.boolean(),
  is_visible: z.boolean(),
  display_order: z.number().int().min(0),
}).strict();

export const skillItemSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: skillCategorySchema,
  source: skillSourceSchema,
  is_visible: z.boolean(),
  display_order: z.number().int().min(0),
}).strict();

export const certificationItemSchema = z.object({
  title: z.string().trim().min(1).max(200),
  issuer: z.string().trim().max(160),
  issue_date: isoDate.nullable(),
  credential: z.string().trim().max(300).nullable(),
  is_visible: z.boolean(),
  display_order: z.number().int().min(0),
}).strict();

export const timelineItemSchema = z.object({
  role: z.string().trim().min(1).max(160),
  organization: z.string().trim().max(160),
  start_date: isoDate.nullable(),
  end_date: isoDate.nullable(),
  is_current: z.boolean(),
  description: z.string().trim().max(2000),
  is_visible: z.boolean(),
  display_order: z.number().int().min(0),
}).strict();

export const linkedinInputSchema = z.object({ text: z.string().trim().min(40).max(30000) }).strict();

const curationItemSchema = z.object({
  section: z.enum(["projects", "skills", "certifications", "timeline"]),
  id: z.string().uuid(),
  is_visible: z.boolean().optional(),
  is_highlight: z.boolean().optional(),
  display_order: z.number().int().min(0).max(10000).optional(),
}).strict().refine((i) => i.is_highlight === undefined || i.section === "projects", "Só projetos podem ser destaque.");

export const curationRequestSchema = z.object({
  items: z.array(curationItemSchema).min(1).max(300),
}).strict().refine((r) => r.items.filter((i) => i.is_highlight).length <= 1, "Escolha apenas um destaque.");

export type ProjectItem = z.infer<typeof projectItemSchema>;
export type SkillItem = z.infer<typeof skillItemSchema>;
export type CertificationItem = z.infer<typeof certificationItemSchema>;
export type TimelineItem = z.infer<typeof timelineItemSchema>;
export type CurationRequest = z.infer<typeof curationRequestSchema>;
