import { createServerFn } from "@tanstack/react-start";
import {
  interviewInputSchema,
  type InterviewInput,
  type InterviewResult,
} from "@/validators/interview";

export function localInterviewQuestions(input: InterviewInput): InterviewResult {
  const title = input.projectTitle.trim() || "seu projeto principal";
  const mainSkill = input.skills[0]?.trim() || "as principais ferramentas";
  const role = input.role.trim() || "sua área de atuação";

  return {
    projectTitle: title,
    questions: [
      {
        phase: "Situação & Diagnóstico",
        question: `No projeto "${title}", como você identificou que o problema "${input.challenge.slice(0, 80).trim()}..." precisava ser priorizado e quais foram os primeiros passos para investigá-lo?`,
        intent: "Avaliar seu raciocínio analítico, senso de priorização e capacidade de entender o contexto do negócio antes de agir.",
        coachingTip: "Explique como você coletou dados ou ouviu as pessoas impactadas. Deixe claro o impacto do problema caso nada fosse feito.",
      },
      {
        phase: "Ação & Resolução de Problemas",
        question: `Durante o desenvolvimento prático usando ${mainSkill}, qual foi a decisão técnica ou o imprevisto mais difícil que você teve que contornar por conta própria?`,
        intent: "Verificar autonomia, resiliência e profundidade técnica na execução prática.",
        coachingTip: `Foque estritamente no seu papel direto. Em vez de dizer 'nós fizemos', explique 'eu analisei a opção X, escolhi ${mainSkill} e implementei a solução Y'.`,
      },
      {
        phase: "Resultado & Visão de Futuro",
        question: `Você destacou como resultado: "${input.result.slice(0, 80).trim()}...". Se você fosse apresentar esse projeto para o time executivo ou continuar evoluindo ele para ${role}, qual seria a próxima métrica a otimizar?`,
        intent: "Identificar maturidade profissional, orientação a impacto real e capacidade de aprendizado contínuo.",
        coachingTip: "Reconheça o impacto atingido, mas mostre autocrítica construtiva. Recrutadores valorizam quem enxerga o próximo gargalo a ser resolvido.",
      },
    ],
  };
}

const INTERVIEW_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["projectTitle", "questions"],
  properties: {
    projectTitle: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["phase", "question", "intent", "coachingTip"],
        properties: {
          phase: { type: "string" },
          question: { type: "string" },
          intent: { type: "string" },
          coachingTip: { type: "string" },
        },
      },
    },
  },
};

const INTERVIEW_INSTRUCTIONS = `Você é um Recrutador Sênior e Especialista em Entrevistas Comportamentais pelo Método STAR.
Com base nas informações do projeto acadêmico ou prático do candidato, gere exatamente 3 perguntas estratégicas e desafiadoras de entrevista de emprego.
Regras fundamentais:
- Uma pergunta para Situação & Diagnóstico (como identificou e analisou o problema).
- Uma pergunta para Ação & Resolução de Problemas (desafios práticos, decisões e uso de habilidades).
- Uma pergunta para Resultado & Visão de Futuro (impacto gerado, métricas e o que aprendeu/faria diferente).
- Para cada pergunta, explique 'intent' (o que o entrevistador realmente avalia) e 'coachingTip' (orientação prática para o candidato responder com clareza).
- Seja específico em relação aos dados do candidato (cite o nome do projeto e termos fornecidos). NUNCA invente fatos ou empresas que o candidato não mencionou.`;

export const generateInterviewQuestions = createServerFn({ method: "POST" })
  .inputValidator((input: InterviewInput) => interviewInputSchema.parse(input))
  .handler(async ({ data }): Promise<{ result: InterviewResult; ai: boolean }> => {
    const fallback = localInterviewQuestions(data);
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return { result: fallback, ai: false };

    try {
      const { createRequestCloudClient } = await import("@/config/cloud.server");
      const client = createRequestCloudClient();
      const { data: allowed, error: budgetError } = await client.rpc("consume_pitchfolio_budget", { p_kind: "ai" });
      if (budgetError || !allowed) return { result: fallback, ai: false };
    } catch {
      return { result: fallback, ai: false };
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
          instructions: INTERVIEW_INSTRUCTIONS,
          input: JSON.stringify(data),
          reasoning: { effort: "low" },
          store: false,
          stream: true,
          text: { format: { type: "json_schema", name: "interview_prep", strict: true, schema: INTERVIEW_SCHEMA } },
        }),
      });

      if (!res.ok || !res.body) {
        console.error("AI gateway error for interview prep", res.status);
        return { result: fallback, ai: false };
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
            /* ignore malformed lines */
          }
        }
      }

      const parsed: unknown = JSON.parse(text);
      if (
        parsed &&
        typeof parsed === "object" &&
        "questions" in parsed &&
        Array.isArray(parsed.questions) &&
        parsed.questions.length === 3
      ) {
        return {
          result: {
            projectTitle: data.projectTitle || fallback.projectTitle,
            questions: parsed.questions as InterviewResult["questions"],
          },
          ai: true,
        };
      }
      return { result: fallback, ai: false };
    } catch (err) {
      console.error("Error generating interview questions:", err);
      return { result: fallback, ai: false };
    }
  });
