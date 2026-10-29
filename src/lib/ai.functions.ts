import { createServerFn } from "@tanstack/react-start";
import { localStructure, type Portfolio, type RawAnswers } from "./portfolio";
import { createDeck, rawAnswersSchema } from "@/validators/portfolio";
import { groundedPortfolio } from "@/services/aiProcessor.service";
import type { FiveSlideDeck } from "@/types/pitchfolio";

const strArr = { type: "array", items: { type: "string" } };
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "name", "role", "headline", "bio", "projectTitle", "challenge", "action",
    "result", "metrics", "skills", "journey", "goal",
  ],
  properties: {
    name: { type: "string" },
    role: { type: "string" },
    headline: { type: "string" },
    bio: { type: "string" },
    projectTitle: { type: "string" },
    challenge: { type: "string" },
    action: { type: "string" },
    result: { type: "string" },
    metrics: strArr,
    skills: strArr,
    journey: strArr,
    goal: { type: "string" },
  },
};

const INSTRUCTIONS = `Você é um especialista em carreira e recrutamento no Brasil. Reescreva as respostas de um(a) candidato(a) em português do Brasil como copy profissional para portfólio e pitch deck.
O pitch deck deve destacar com clareza: onde o candidato sabe trabalhar (área e perfil), seu potencial na prática (método STAR), suas habilidades essenciais e seus objetivos de carreira.
Regras: use verbos de impacto (liderei, desenvolvi, otimizei, entreguei); frases curtas e concretas; NÃO invente números, empresas ou fatos que não estejam nas respostas.
- headline: 1 frase de até 12 palavras posicionando onde sabe trabalhar.
- bio: 2-3 frases na primeira pessoa destacando perfil e áreas de atuação.
- projectTitle: título curto do projeto.
- challenge, action, result: 1-3 frases cada (método STAR) demonstrando o potencial na prática e resolução de problemas.
- metrics: 2-3 destaques curtos (até 5 palavras) extraídos do resultado; use números apenas se fornecidos.
- skills: 3 a 6 habilidades, nomes curtos, técnicas e interpessoais.
- journey: 3-4 marcos curtos da trajetória baseados nas respostas.
- goal: objetivo profissional em 1-2 frases demonstrando onde quer atuar e quais são seus objetivos.`;

export const structurePortfolio = createServerFn({ method: "POST" })
  .inputValidator((input: RawAnswers) => rawAnswersSchema.parse(input))
  .handler(async ({ data }): Promise<{ portfolio: Portfolio; deck: FiveSlideDeck; ai: boolean }> => {
    const fallback = localStructure(data);
    const fallbackDeck = createDeck(fallback);
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return { portfolio: fallback, deck: fallbackDeck, ai: false };
    try {
      const { createRequestCloudClient } = await import("@/config/cloud.server");
      const client = createRequestCloudClient();
      const { data: allowed, error: budgetError } = await client.rpc("consume_pitchfolio_budget", { p_kind: "ai" });
      if (budgetError || !allowed) return { portfolio: fallback, deck: fallbackDeck, ai: false };
    } catch {
      return { portfolio: fallback, deck: fallbackDeck, ai: false };
    }
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: "openai/gpt-6-astra",
          instructions: INSTRUCTIONS,
          input: JSON.stringify(data),
          reasoning: { effort: "low" },
          store: false,
          stream: true,
          text: { format: { type: "json_schema", name: "portfolio", strict: true, schema: SCHEMA } },
        }),
      });
      if (!res.ok || !res.body) {
        console.error("AI gateway error", res.status);
        return { portfolio: fallback, deck: fallbackDeck, ai: false };
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const ev: unknown = JSON.parse(payload);
            if (ev && typeof ev === "object" && "type" in ev && ev.type === "response.output_text.delta" && "delta" in ev && typeof ev.delta === "string") text += ev.delta;
          } catch {
            /* ignore */
          }
        }
      }
      const parsed: unknown = JSON.parse(text);
      const portfolio = groundedPortfolio(parsed, data);
      const deck = createDeck(portfolio);
      return {
        portfolio,
        deck,
        ai: true,
      };
    } catch (e) {
      console.error("AI structuring failed", e);
      return { portfolio: fallback, deck: fallbackDeck, ai: false };
    }
  });
