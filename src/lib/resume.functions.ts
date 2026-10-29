import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { RawAnswers } from "./portfolio";

const MAX_BYTES = 5 * 1024 * 1024;
const FIELDS = ["name", "area", "bio", "challenge", "action", "result", "skills", "linkedin", "github", "email", "goal"] as const;

const inputSchema = z.object({
  filename: z.string().trim().min(1).max(200).optional(),
  base64: z.string().min(10).max(Math.ceil((MAX_BYTES * 4) / 3) + 8).optional(),
  rawText: z.string().trim().min(20).max(30000).optional(),
  githubUser: z.string().trim().min(1).max(120).optional(),
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

function localExtractFromText(rawText: string): Partial<RawAnswers> {
  // eslint-disable-next-line no-control-regex
  const clean = rawText.replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim();
  const lines = clean.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const emailMatch = clean.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const linkedinMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);

  const name = (lines[0] && lines[0].length <= 80 ? lines[0] : "Candidato(a)").slice(0, 120);
  const area = (lines[1] && lines[1].length <= 120 ? lines[1] : "Profissional em Formação").slice(0, 200);
  const paragraphs = clean.split(/\n{2,}/).map((p) => p.replace(/\s+/g, " ").trim()).filter((p) => p.length > 20);
  const bio = (paragraphs[0] ?? lines.slice(0, 3).join(" ")).slice(0, 800);
  const challenge = (paragraphs[1] ?? "Atuação prática na resolução de problemas e organização de demandas da área.").slice(0, 800);
  const action = (paragraphs[2] ?? paragraphs[1] ?? "Estruturei processos, executei entregas práticas e colaborei com a equipe.").slice(0, 800);
  const result = (paragraphs[3] ?? "Entregas concluídas dentro do prazo com impacto positivo para a equipe e usuários.").slice(0, 800);

  const knownSkills = [
    "Comunicação", "Liderança", "Gestão de Projetos", "Trabalho em Equipe", "Resolução de Problemas",
    "Excel", "Inglês", "Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "Figma",
    "Análise de Dados", "Atendimento", "Pesquisa", "Design", "Marketing", "Finanças",
  ];
  const matchedSkills = knownSkills.filter((sk) => new RegExp(`\\b${sk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(clean));
  const skills = (matchedSkills.length >= 3 ? matchedSkills : [...matchedSkills, "Comunicação", "Resolução de Problemas", "Trabalho em Equipe"]).slice(0, 6).join(", ");

  return {
    name,
    area,
    bio,
    challenge,
    action,
    result,
    skills,
    ...(linkedinMatch ? { linkedin: linkedinMatch[0] } : {}),
    ...(githubMatch ? { github: githubMatch[0] } : {}),
    ...(emailMatch ? { email: emailMatch[0] } : {}),
    goal: `Busco oportunidade na área de ${area} para aplicar minhas habilidades na prática e gerar resultados junto à equipe.`,
  };
}

export const extractResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<ResumeResult> => {
    if (!data.base64 && !data.rawText && !data.githubUser) {
      return { answers: null, error: "Envie um PDF, informe seu GitHub ou cole o texto do seu currículo." };
    }

    let ghSummary = "";
    let ghFallback: Partial<RawAnswers> | null = null;
    if (data.githubUser) {
      const username = data.githubUser
        .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
        .split(/[/?#]/)[0]
        ?.trim();
      if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
        return { answers: null, error: "Informe um usuário ou link válido do GitHub." };
      }
      const headers = { Accept: "application/vnd.github+json", "User-Agent": "PitchFolio-Hackathon" };
      const [uRes, rRes] = await Promise.all([
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers }),
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=8`, { headers }),
      ]);
      if (!uRes.ok) return { answers: null, error: "Perfil do GitHub não encontrado." };
      const profile = (await uRes.json()) as { name?: string | null; bio?: string | null; blog?: string | null; email?: string | null; company?: string | null; location?: string | null; public_repos?: number };
      const repos = rRes.ok
        ? ((await rRes.json()) as { name?: string; description?: string | null; language?: string | null; stargazers_count?: number; fork?: boolean }[])
        : [];
      const ownRepos = repos.filter((r) => !r.fork);
      const langs = Array.from(new Set(ownRepos.map((r) => r.language).filter((l): l is string => Boolean(l)))).slice(0, 6);
      const topRepo = [...ownRepos].sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))[0] ?? ownRepos[0];
      ghFallback = {
        name: profile.name || username,
        area: [langs[0] ? `Desenvolvimento ${langs[0]}` : "Engenharia de Software", profile.company, profile.location].filter(Boolean).join(" · "),
        bio: profile.bio || `Desenvolvedor(a) com ${profile.public_repos ?? ownRepos.length} repositórios públicos no GitHub.`,
        challenge: topRepo?.description ? `Resolver o problema abordado no projeto ${topRepo.name}: ${topRepo.description}` : "",
        action: topRepo ? `Desenvolvi o repositório ${topRepo.name}${topRepo.language ? ` utilizando ${topRepo.language}` : ""}.` : "",
        result: `${ownRepos.length} projetos públicos publicados no GitHub${topRepo?.stargazers_count ? ` e ${topRepo.stargazers_count} estrelas em ${topRepo.name}` : ""}.`,
        skills: langs.length >= 3 ? langs.join(", ") : [...langs, "Git", "GitHub", "Código Aberto"].slice(0, 5).join(", "),
        github: `github.com/${username}`,
        ...(profile.email ? { email: profile.email } : {}),
      };
      ghSummary = JSON.stringify({ profile, repos: ownRepos.slice(0, 5) });
    }

    if (data.base64) {
      const bytes = Uint8Array.from(atob(data.base64.slice(0, 16)), (c) => c.charCodeAt(0));
      if (String.fromCharCode(...bytes.slice(0, 5)) !== "%PDF-") return { answers: null, error: "O arquivo não parece ser um PDF válido." };
      if ((data.base64.length * 3) / 4 > MAX_BYTES) return { answers: null, error: "O PDF deve ter no máximo 5 MB." };
    }

    const localFallback = ghFallback ?? (data.rawText ? localExtractFromText(data.rawText) : null);
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) {
      return localFallback ? { answers: localFallback } : { answers: null, error: "Para importar PDF no ambiente local sem chave de IA, use a opção 'Colar texto / LinkedIn'." };
    }
    try {
      const { createRequestCloudClient } = await import("@/config/cloud.server");
      const { data: allowed, error: budgetError } = await createRequestCloudClient().rpc("consume_pitchfolio_budget", { p_kind: "ai" });
      if (budgetError || !allowed) {
        return localFallback ? { answers: localFallback } : { answers: null, error: "Limite de uso da IA atingido. Tente novamente mais tarde." };
      }
    } catch {
      if (localFallback) return { answers: localFallback };
    }

    const combinedText = [data.rawText, ghSummary ? `Dados públicos do GitHub:\n${ghSummary}` : ""].filter(Boolean).join("\n\n");
    const content = data.base64
      ? [
          { type: "input_file", filename: (data.filename ?? "curriculo.pdf").replace(/[^\w.\- ]/g, "_"), file_data: `data:application/pdf;base64,${data.base64}` },
          { type: "input_text", text: "Extraia os dados deste currículo." },
        ]
      : [{ type: "input_text", text: `Extraia os dados deste currículo/perfil:\n\n${combinedText}` }];

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
        body: JSON.stringify({
          model: "openai/gpt-6-astra",
          instructions: INSTRUCTIONS,
          input: [{ role: "user", content }],
          reasoning: { effort: "low" },
          store: false,
          stream: true,
          text: { format: { type: "json_schema", name: "resume", strict: true, schema: SCHEMA } },
        }),
      });
      if (!res.ok || !res.body) {
        if (localFallback) return { answers: localFallback };
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
        if (typeof v === "string" && v.trim()) {
          // eslint-disable-next-line no-control-regex
          answers[f] = v.replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, f === "name" ? 120 : 3000);
        } else if (localFallback?.[f]) {
          answers[f] = localFallback[f];
        }
      }
      return { answers };
    } catch (e) {
      if (localFallback) return { answers: localFallback };
      console.error("Resume extraction failed", e);
      return { answers: null, error: "Não foi possível ler o currículo agora." };
    }
  });
