import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { RawAnswers } from "./portfolio";

const MAX_BYTES = 5 * 1024 * 1024;
const FIELDS = ["name", "area", "bio", "challenge", "action", "result", "skills", "linkedin", "github", "email", "goal"] as const;

const inputSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  base64: z.string().min(10).max(Math.ceil((MAX_BYTES * 4) / 3) + 8),
}).strict();

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [...FIELDS],
  properties: Object.fromEntries(FIELDS.map((f) => [f, { type: "string" }])),
};

const INSTRUCTIONS = `Você extrai dados de um currículo em PDF para preencher um formulário em português do Brasil.
Regras rígidas: copie apenas fatos presentes no documento; NUNCA invente números, empresas, links ou habilidades. Se algo não existir, retorne string vazia.
- name: nome completo. area: área de atuação ou curso (+ instituição, se houver).
- bio: resumo do perfil em 2-3 frases na primeira pessoa, baseado no documento.
- challenge/action/result: escolha a experiência ou projeto de maior impacto e descreva o desafio, o que a pessoa fez e os resultados (só números citados).
- skills: 3 a 6 habilidades separadas por vírgula.
- linkedin, github, email: exatamente como aparecem.
- goal: objetivo profissional, se citado.`;

export type ResumeResult = { answers: Partial<RawAnswers> | null; error?: string };

export const extractResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<ResumeResult> => {
    const bytes = Uint8Array.from(atob(data.base64.slice(0, 16)), (c) => c.charCodeAt(0));
    if (String.fromCharCode(...bytes.slice(0, 5)) !== "%PDF-") return { answers: null, error: "O arquivo não parece ser um PDF válido." };
    if ((data.base64.length * 3) / 4 > MAX_BYTES) return { answers: null, error: "O PDF deve ter no máximo 5 MB." };

    const { createRequestCloudClient } = await import("@/config/cloud.server");
    const { data: allowed, error: budgetError } = await createRequestCloudClient().rpc("consume_pitchfolio_budget", { p_kind: "ai" });
    if (budgetError || !allowed) return { answers: null, error: "Limite de uso da IA atingido. Tente novamente mais tarde." };
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { answers: null, error: "IA indisponível no momento." };

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
        body: JSON.stringify({
          model: "openai/gpt-6-astra",
          instructions: INSTRUCTIONS,
          input: [{
            role: "user",
            content: [
              { type: "input_file", filename: data.filename.replace(/[^\w.\- ]/g, "_"), file_data: `data:application/pdf;base64,${data.base64}` },
              { type: "input_text", text: "Extraia os dados deste currículo." },
            ],
          }],
          reasoning: { effort: "low" },
          store: false,
          stream: true,
          text: { format: { type: "json_schema", name: "resume", strict: true, schema: SCHEMA } },
        }),
      });
      if (!res.ok || !res.body) {
        console.error("Resume AI error", res.status, await res.text().catch(() => ""));
        if (res.status === 429) return { answers: null, error: "Muitas solicitações. Aguarde um pouco." };
        if (res.status === 402) return { answers: null, error: "Créditos de IA esgotados." };
        return { answers: null, error: "Não foi possível ler o currículo agora." };
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "", text = "";
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
            if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") text += ev.delta;
          } catch { /* ignore */ }
        }
      }
      const parsed = JSON.parse(text) as Record<string, unknown>;
      const answers: Partial<RawAnswers> = {};
      for (const f of FIELDS) {
        const v = parsed[f];
        if (typeof v === "string") answers[f] = v.replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, f === "name" ? 120 : 3000);
      }
      return { answers };
    } catch (e) {
      console.error("Resume extraction failed", e);
      return { answers: null, error: "Não foi possível ler o currículo agora." };
    }
  });
