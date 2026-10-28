import { EMPTY_ANSWERS, localStructure, type Portfolio, type RawAnswers } from "@/lib/portfolio";
import { createDeck, ingestionSchema, portfolioSchema, type IngestionInput } from "@/validators/portfolio";

export function ingestionAnswers(input: IngestionInput): RawAnswers {
  const valid = ingestionSchema.parse(input);
  if (valid.method === "guided_questions") return valid.answers;
  // Path A accepts already parsed text, not arbitrary URLs or untrusted remote files.
  return { ...EMPTY_ANSWERS, name: valid.name, bio: valid.text.slice(0, 3000) };
}

export function processInput(input: IngestionInput) {
  const answers = ingestionAnswers(input);
  const portfolio = localStructure(answers);
  const deck = createDeck(portfolio);
  return { answers, portfolio, deck };
}

export function generatePortfolioAndDeck(answers: RawAnswers) {
  const portfolio = localStructure(answers);
  const deck = createDeck(portfolio);
  return { portfolio, deck };
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const nums = (s: string) => s.match(/\d+(?:[.,]\d+)*/g) ?? [];
// Mid-sentence capitalized words indicate proper nouns (e.g., employers, institutions, tools).
const properNouns = (s: string) =>
  Array.from(s.matchAll(/(?:^|[.!?]\s+|\n+)(\S+)|\b([A-ZÀ-Ý][A-Za-zÀ-ÿ0-9]{1,})\b/g))
    .map((m) => m[2])
    .filter((w): w is string => Boolean(w))
    .map(norm);

export function groundedPortfolio(candidate: unknown, answers: RawAnswers): Portfolio {
  const parsed = portfolioSchema.safeParse(candidate);
  const fallback = localStructure(answers);
  if (!parsed.success) return fallback;
  const rawJoined = Object.values(answers).join(" ");
  const sourceWords = new Set(norm(rawJoined).match(/[a-z0-9]+/g) ?? []);
  const sourceNums = new Set(nums(rawJoined));

  const generatedText = [
    parsed.data.headline,
    parsed.data.bio,
    parsed.data.challenge,
    parsed.data.action,
    parsed.data.result,
    parsed.data.goal,
  ].join("\n");

  // Reject if AI invented any numbers or proper nouns (e.g., employers) not in the user's input.
  if (nums(generatedText).some((n) => !sourceNums.has(n))) return fallback;
  if (properNouns(generatedText).some((p) => !sourceWords.has(p))) return fallback;

  return {
    ...parsed.data,
    name: fallback.name,
    role: fallback.role,
    skills: fallback.skills.length ? fallback.skills : parsed.data.skills,
    journey: parsed.data.journey.length ? parsed.data.journey : fallback.journey,
    metrics: fallback.metrics,
    linkedin: fallback.linkedin,
    github: fallback.github,
    email: fallback.email,
  };
}