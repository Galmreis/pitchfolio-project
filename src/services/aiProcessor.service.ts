import { EMPTY_ANSWERS, localStructure, type Portfolio, type RawAnswers } from "@/lib/portfolio";
import { ingestionSchema, portfolioSchema, type IngestionInput } from "@/validators/portfolio";

export function ingestionAnswers(input: IngestionInput): RawAnswers {
  const valid = ingestionSchema.parse(input);
  if (valid.method === "guided_questions") return valid.answers;
  // Path A accepts already parsed text, not arbitrary URLs or untrusted remote files.
  return { ...EMPTY_ANSWERS, name: valid.name, bio: valid.text.slice(0, 3000) };
}

export function processInput(input: IngestionInput) {
  const answers = ingestionAnswers(input);
  return { answers, portfolio: localStructure(answers) };
}

const editorial = new Set("eu sou de da do das dos e em com para por um uma o a os as que no na nos nas ao à minha meu foco focado focada profissional projeto impacto resultado habilidade objetivo desenvolvi desenvolvimento trabalhei trabalho executei implementei organizei experiência trajetória entreguei contribuí contribui atuação atuacao liderei otimizei aprendi aprendi foi foram tenho busco aprender aplicar criar construir melhorar promover este esta esse essa se mais como através durante".split(" "));
const words = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-z0-9]+/g) ?? [];

export function groundedPortfolio(candidate: unknown, answers: RawAnswers): Portfolio {
  const parsed = portfolioSchema.safeParse(candidate);
  const fallback = localStructure(answers);
  if (!parsed.success) return fallback;
  const source = new Set(words(Object.values(answers).join(" ")));
  const generated = words(JSON.stringify(parsed.data));
  // Conservative evidence gate: unfamiliar factual words reject the entire rewrite.
  // This prefers original wording over unverifiable claims; it is not a truth detector.
  const keys = new Set(words(Object.keys(parsed.data).join(" ")));
  if (generated.some((word) => !source.has(word) && !editorial.has(word) && !keys.has(word))) return fallback;
  return { ...parsed.data, name: fallback.name, role: fallback.role, skills: fallback.skills,
    journey: fallback.journey, metrics: fallback.metrics, linkedin: fallback.linkedin, github: fallback.github, email: fallback.email };
}