import { z } from "zod";
import {
  certificationItemSchema, linkedinInputSchema, skillCategorySchema, timelineItemSchema,
  type CertificationItem, type SkillItem, type TimelineItem,
} from "@/validators/curation";

// LinkedIn's API does not expose work history, so we read the user's own
// "Save to PDF" export (already converted to text) or pasted text instead.
export const LINKEDIN_SYSTEM_PROMPT = `Você extrai dados profissionais de um texto de perfil do LinkedIn ou currículo.
REGRAS ANTI-ALUCINAÇÃO (obrigatórias):
- Use SOMENTE informações escritas explicitamente no texto.
- NUNCA invente ou deduza datas, cargos, empresas, instituições, certificações ou habilidades.
- Data ausente ou incompleta => null (use AAAA-MM quando só houver mês e ano).
- Se não houver itens de uma seção, retorne lista vazia.
- Não traduza nomes próprios; mantenha como no texto.`;

const nullableStr = { type: ["string", "null"] };
const JSON_SCHEMA = {
  type: "object", additionalProperties: false, required: ["timeline", "certifications", "skills"],
  properties: {
    timeline: { type: "array", items: { type: "object", additionalProperties: false,
      required: ["role", "organization", "start_date", "end_date", "is_current", "description"],
      properties: { role: { type: "string" }, organization: { type: "string" }, start_date: nullableStr, end_date: nullableStr, is_current: { type: "boolean" }, description: { type: "string" } } } },
    certifications: { type: "array", items: { type: "object", additionalProperties: false,
      required: ["title", "issuer", "issue_date", "credential"],
      properties: { title: { type: "string" }, issuer: { type: "string" }, issue_date: nullableStr, credential: nullableStr } } },
    skills: { type: "array", items: { type: "object", additionalProperties: false, required: ["name", "category"],
      properties: { name: { type: "string" }, category: { type: "string", enum: skillCategorySchema.options } } } },
  },
} as const;

const aiOutputSchema = z.object({
  timeline: z.array(z.object({ role: z.string(), organization: z.string(), start_date: z.string().nullable(), end_date: z.string().nullable(), is_current: z.boolean(), description: z.string() })),
  certifications: z.array(z.object({ title: z.string(), issuer: z.string(), issue_date: z.string().nullable(), credential: z.string().nullable() })),
  skills: z.array(z.object({ name: z.string(), category: skillCategorySchema })),
});

export type LinkedinExtraction = { timeline: TimelineItem[]; certifications: CertificationItem[]; skills: SkillItem[] };

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();

// Second safety net after the prompt: drop any item whose key facts are not literally in the source.
export function groundExtraction(raw: unknown, source: string): LinkedinExtraction {
  const out = aiOutputSchema.parse(raw);
  const src = norm(source);
  const has = (v: string | null) => !v || src.includes(norm(v));
  const year = (d: string | null) => !d || src.includes(d.slice(0, 4));
  const timeline = out.timeline
    .filter((t) => has(t.role) && has(t.organization) && year(t.start_date) && year(t.end_date))
    .flatMap((t, i) => { const r = timelineItemSchema.safeParse({ ...t, is_visible: true, display_order: i }); return r.success ? [r.data] : []; });
  const certifications = out.certifications
    .filter((c) => has(c.title) && has(c.issuer) && year(c.issue_date))
    .flatMap((c, i) => { const r = certificationItemSchema.safeParse({ ...c, is_visible: i < 5, display_order: i }); return r.success ? [r.data] : []; });
  const seen = new Set<string>();
  const skills = out.skills
    .filter((s) => has(s.name) && !seen.has(norm(s.name)) && seen.add(norm(s.name)))
    .slice(0, 40)
    .map((s, i): SkillItem => ({ name: s.name.trim().slice(0, 80), category: s.category, source: "linkedin", is_visible: i < 8, display_order: i }));
  return { timeline, certifications, skills };
}

export async function extractLinkedinProfile(input: unknown): Promise<LinkedinExtraction> {
  const { text } = linkedinInputSchema.parse(input);
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("IA indisponível no momento.");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      instructions: LINKEDIN_SYSTEM_PROMPT,
      input: [{ role: "user", content: [{ type: "input_text", text }] }],
      reasoning: { effort: "low" },
      store: false,
      stream: true,
      text: { format: { type: "json_schema", name: "linkedin_profile", strict: true, schema: JSON_SCHEMA } },
    }),
  });
  if (res.status === 429) throw new Error("Muitas solicitações. Aguarde um pouco.");
  if (res.status === 402) throw new Error("Créditos de IA esgotados.");
  if (!res.ok || !res.body) { console.error("LinkedIn AI error", res.status, await res.text().catch(() => "")); throw new Error("Não foi possível ler o perfil agora."); }
  // Collect streamed output text deltas (SSE).
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "", content = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      try {
        const ev = JSON.parse(line.slice(5).trim()) as { type?: string; delta?: unknown };
        if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") content += ev.delta;
      } catch { /* keep-alive or partial line */ }
    }
  }
  return groundExtraction(JSON.parse(content) as unknown, text);
}
